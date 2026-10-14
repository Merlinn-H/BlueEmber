import { EMBER_FRAG, SPARK_FRAG, SPARK_VERT, TRAIL_FRAG, VERT_FULLSCREEN } from './shaders';
import { SPARK_CAPACITY, SPARK_STRIDE, type EmberRenderer, type FrameData, type RendererAssets } from './types';

// Raw WebGL2 renderer (no library: the effect JS budget is 30 KB gzip).
//  1. Trail buffer: two R16F targets in ping-pong at 1/4 of the viewport resolution (RGBA8 fallback).
//     Each frame: next = max(previous x exp(-dt/tau), brush segments) + click rings.
//  2. Ember pass: the procedural coal is drawn at `scale` x the canvas resolution, masked by the trail
//     (the wiped soot), the calm zones and the page intensity, with the warm glow and the fragment rim light.
//  3. Sparks: one draw call of GL points.

interface ProgramInfo {
  program: WebGLProgram;
  shaders: WebGLShader[];
  uniforms: Map<string, WebGLUniformLocation | null>;
}

interface Target {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

const yieldTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

export class WebGLRenderer implements EmberRenderer {
  readonly kind = 'webgl' as const;
  /** Called when the browser drops the GL context (GPU reset, too many contexts). */
  onContextLost: (() => void) | null = null;

  private readonly gl: WebGL2RenderingContext;
  private trail!: ProgramInfo;
  private ember!: ProgramInfo;
  private spark!: ProgramInfo;
  private emptyVao!: WebGLVertexArrayObject;
  private sparkVao!: WebGLVertexArrayObject;
  private sparkBuffer!: WebGLBuffer;
  private targets: Target[] = [];
  private current = 0;
  private fragmentTexture!: WebGLTexture;
  private cracksTexture!: WebGLTexture;
  private hasCracks = false;
  private halfFloat = true;
  private trailW = 0;
  private trailH = 0;
  private pxRatio = 1;

  static create(canvas: HTMLCanvasElement): WebGLRenderer | null {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      // 'default': the ember is a light half-resolution effect, it must not wake a discrete GPU
      powerPreference: 'default',
      preserveDrawingBuffer: false,
    });
    return gl ? new WebGLRenderer(canvas, gl) : null;
  }

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
  ) {
    this.gl = gl;
    canvas.addEventListener('webglcontextlost', this.handleLost, false);
  }

  private readonly handleLost = (event: Event) => {
    event.preventDefault();
    this.onContextLost?.();
  };

  async init(assets: RendererAssets): Promise<void> {
    const gl = this.gl;
    // Rendering to R16F needs one of these extensions; RGBA8 is the fallback
    this.halfFloat = gl.getExtension('EXT_color_buffer_float') !== null || gl.getExtension('EXT_color_buffer_half_float') !== null;
    await yieldTask();

    // Each phase is its own task: no single long task during startup
    this.trail = this.link(VERT_FULLSCREEN, TRAIL_FRAG);
    await yieldTask();
    this.ember = this.link(VERT_FULLSCREEN, EMBER_FRAG);
    await yieldTask();
    this.spark = this.link(SPARK_VERT, SPARK_FRAG);
    await yieldTask();

    // Compile without blocking the main thread when the browser allows it
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    if (parallel) {
      const ready = () =>
        [this.trail, this.ember, this.spark].every(
          (info) => gl.getProgramParameter(info.program, parallel.COMPLETION_STATUS_KHR) === true,
        );
      await new Promise<void>((resolve) => {
        const poll = () => (ready() ? resolve() : void setTimeout(poll, 4));
        poll();
      });
    }
    for (const info of [this.trail, this.ember, this.spark]) this.verify(info);
    await yieldTask();

    this.emptyVao = gl.createVertexArray();
    this.sparkVao = gl.createVertexArray();
    this.sparkBuffer = gl.createBuffer();
    gl.bindVertexArray(this.sparkVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sparkBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, SPARK_CAPACITY * SPARK_STRIDE * 4, gl.DYNAMIC_DRAW);
    const stride = SPARK_STRIDE * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, stride, 16);
    gl.bindVertexArray(null);

    this.fragmentTexture = this.makeTexture(assets.mask);
    this.hasCracks = assets.cracks !== null;
    this.cracksTexture = this.makeTexture(assets.cracks);

    // Sampler units never change
    gl.useProgram(this.trail.program);
    gl.uniform1i(this.u(this.trail, 'uPrev'), 0);
    gl.useProgram(this.ember.program);
    gl.uniform1i(this.u(this.ember, 'uTrail'), 0);
    gl.uniform1i(this.u(this.ember, 'uFrag'), 1);
    gl.uniform1i(this.u(this.ember, 'uCracks'), 2);
  }

  resize(width: number, height: number, dpr: number, scale: number): void {
    const w = Math.max(1, Math.round(width * dpr * scale));
    const h = Math.max(1, Math.round(height * dpr * scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.pxRatio = w / width;
    const tw = Math.max(2, Math.ceil(width / 4));
    const th = Math.max(2, Math.ceil(height / 4));
    if (tw !== this.trailW || th !== this.trailH || this.targets.length === 0) this.createTargets(tw, th);
  }

  render(frame: FrameData): void {
    const gl = this.gl;
    const p = frame.params;

    // --- 1. Trail pass -----------------------------------------------------------------------
    const source = this.targets[this.current];
    const target = this.targets[1 - this.current];
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, this.trailW, this.trailH);
    gl.disable(gl.BLEND);
    gl.useProgram(this.trail.program);
    gl.bindVertexArray(this.emptyVao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source.texture);
    gl.uniform2f(this.u(this.trail, 'uView'), frame.width, frame.height);
    gl.uniform1f(this.u(this.trail, 'uDecay'), frame.decay);
    gl.uniform1f(this.u(this.trail, 'uQuant'), this.halfFloat ? 0 : 1 / 255);
    gl.uniform1i(this.u(this.trail, 'uSegN'), frame.segmentCount);
    gl.uniform4fv(this.u(this.trail, 'uSeg'), frame.segments);
    gl.uniform2fv(this.u(this.trail, 'uSegP'), frame.segmentParams);
    gl.uniform1i(this.u(this.trail, 'uBurstN'), frame.burstCount);
    gl.uniform4fv(this.u(this.trail, 'uBurst'), frame.bursts);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.current = 1 - this.current;

    // --- 2. Ember pass (to the canvas) -------------------------------------------------------
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.ember.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.targets[this.current].texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fragmentTexture);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.cracksTexture);
    const e = this.ember;
    gl.uniform2f(this.u(e, 'uView'), frame.width, frame.height);
    gl.uniform1f(this.u(e, 'uTime'), frame.time);
    gl.uniform1f(this.u(e, 'uGlowCool'), frame.glowCool);
    gl.uniform1f(this.u(e, 'uIntensity'), frame.intensity);
    gl.uniform1i(this.u(e, 'uZoneN'), frame.zoneCount);
    gl.uniform4fv(this.u(e, 'uZone'), frame.zones);
    gl.uniform2fv(this.u(e, 'uZoneP'), frame.zoneParams);
    gl.uniform1f(this.u(e, 'uFade'), p.zones.fade);
    gl.uniform4fv(this.u(e, 'uFragRect'), frame.fragment);
    gl.uniform1i(this.u(e, 'uBurstN'), frame.burstCount);
    gl.uniform4fv(this.u(e, 'uBurst'), frame.bursts);
    gl.uniform1f(this.u(e, 'uHeat'), p.look.heat);
    gl.uniform1f(this.u(e, 'uFlicker'), p.look.flicker);
    gl.uniform1f(this.u(e, 'uCrackScale'), p.look.crackScale);
    gl.uniform1f(this.u(e, 'uCrackWidth'), p.look.crackWidth);
    gl.uniform1f(this.u(e, 'uAshScale'), p.look.ashScale);
    gl.uniform1f(this.u(e, 'uErosion'), p.brush.edgeNoise);
    gl.uniform1f(this.u(e, 'uHalo'), p.look.halo);
    gl.uniform1f(this.u(e, 'uCore'), p.look.core);
    gl.uniform1f(this.u(e, 'uCrust'), p.look.crust);
    gl.uniform1f(this.u(e, 'uGlow'), p.look.glow);
    gl.uniform1f(this.u(e, 'uWood'), p.look.wood);
    gl.uniform1f(this.u(e, 'uRelief'), p.look.relief);
    gl.uniform1f(this.u(e, 'uRim'), p.rim.opacity);
    gl.uniform1f(this.u(e, 'uRimPx'), p.rim.width);
    gl.uniform1f(this.u(e, 'uUseTex'), this.hasCracks ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // --- 3. Sparks ---------------------------------------------------------------------------
    if (frame.sparkCount > 0) {
      const count = Math.min(frame.sparkCount, SPARK_CAPACITY);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.spark.program);
      gl.bindVertexArray(this.sparkVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.sparkBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, frame.sparks, 0, count * SPARK_STRIDE);
      gl.uniform2f(this.u(this.spark, 'uView'), frame.width, frame.height);
      gl.uniform1f(this.u(this.spark, 'uPx'), this.pxRatio);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.bindVertexArray(null);
      gl.disable(gl.BLEND);
    }
  }

  clear(): void {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    for (const target of this.targets) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  destroy(): void {
    this.canvas.removeEventListener('webglcontextlost', this.handleLost, false);
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  // --- helpers -------------------------------------------------------------------------------
  private u(info: ProgramInfo, name: string): WebGLUniformLocation | null {
    let location = info.uniforms.get(name);
    if (location === undefined) {
      location = this.gl.getUniformLocation(info.program, name);
      info.uniforms.set(name, location);
    }
    return location;
  }

  private link(vertex: string, fragment: string): ProgramInfo {
    const gl = this.gl;
    const shaders = [this.compile(gl.VERTEX_SHADER, vertex), this.compile(gl.FRAGMENT_SHADER, fragment)];
    const program = gl.createProgram();
    for (const shader of shaders) gl.attachShader(program, shader);
    gl.bindAttribLocation(program, 0, 'aPos');
    gl.bindAttribLocation(program, 1, 'aSize');
    gl.bindAttribLocation(program, 2, 'aAlpha');
    gl.bindAttribLocation(program, 3, 'aColor');
    gl.linkProgram(program);
    return { program, shaders, uniforms: new Map() };
  }

  private compile(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('createShader failed');
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }

  /** Throws with the driver log when a program did not link. */
  private verify(info: ProgramInfo): void {
    const gl = this.gl;
    if (gl.getProgramParameter(info.program, gl.LINK_STATUS)) return;
    const logs = info.shaders.map((shader) => gl.getShaderInfoLog(shader)).filter(Boolean);
    throw new Error(`ember shader failed: ${gl.getProgramInfoLog(info.program) ?? ''} ${logs.join(' ')}`.trim());
  }

  private makeTexture(source: HTMLCanvasElement | HTMLImageElement | null): WebGLTexture {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    if (source) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  private createTargets(width: number, height: number): void {
    const gl = this.gl;
    for (const target of this.targets) {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    }
    this.targets = [];
    this.trailW = width;
    this.trailH = height;

    const build = (): Target => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texStorage2D(gl.TEXTURE_2D, 1, this.halfFloat ? gl.R16F : gl.RGBA8, width, height);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      return { texture, framebuffer };
    };

    let pair = [build(), build()];
    if (this.halfFloat && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      // Float render targets are not usable here: fall back to RGBA8
      for (const t of pair) {
        gl.deleteTexture(t.texture);
        gl.deleteFramebuffer(t.framebuffer);
      }
      this.halfFloat = false;
      pair = [build(), build()];
    }
    this.targets = pair;
    this.current = 0;
    this.clear();
  }
}
