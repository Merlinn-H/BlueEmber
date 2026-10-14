// GLSL ES 3.00 sources of the ember effect (brief 7.5). Colours are the design-system hex values as sRGB.
//   ash          #15110F -> #2A2421   (base, very low contrast)
//   crack edge   #2F4670  titane-profond
//   crack        #4C78A8  titane-chauffe
//   incandescent #9DB3C6  titane-pale
//   hot core     #F6EEE3  ivoire
// Every output is a valid premultiplied colour: glows are composited "over", never added.

export const VERT_FULLSCREEN = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/** Trail buffer: previous x exp(-dt/tau), then the brush segments and the click rings (peak hold). */
export const TRAIL_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uView;
uniform float uDecay;
uniform float uQuant;
uniform int uSegN;
uniform vec4 uSeg[8];
uniform vec2 uSegP[8];
uniform int uBurstN;
uniform vec4 uBurst[4];
in vec2 vUv;
out vec4 outV;
void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uView;
  float v = max(texture(uPrev, vUv).r * uDecay - uQuant, 0.0);
  float add = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uSegN) break;
    vec4 s = uSeg[i];
    vec2 ab = s.zw - s.xy;
    float l2 = dot(ab, ab);
    float t = l2 > 0.0001 ? clamp(dot(p - s.xy, ab) / l2, 0.0, 1.0) : 0.0;
    float d = length(p - (s.xy + ab * t));
    float r = uSegP[i].x;
    add = max(add, exp(-(d * d) / (r * r * 0.64)) * uSegP[i].y);
  }
  // The click ring leaves a faint afterglow (peak hold, never a filled disk); its bright band is added in the ember pass
  float ring = 0.0;
  for (int i = 0; i < 4; i++) {
    if (i >= uBurstN) break;
    vec4 b = uBurst[i];
    float d = (length(p - b.xy) - b.z) / 24.0;
    ring = max(ring, exp(-d * d) * b.w * 0.42);
  }
  outV = vec4(min(max(max(v, add), ring), 1.5), 0.0, 0.0, 1.0);
}`;

/** Procedural ember: ash (fbm) + cracks (Voronoi F2 - F1, domain warped) lit by the trail mask. */
export const EMBER_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTrail;
uniform sampler2D uFrag;
uniform sampler2D uCracks;
uniform vec2 uView;
uniform float uTime;
uniform float uIntensity;
uniform int uZoneN;
uniform vec4 uZone[8];
uniform vec2 uZoneP[8];
uniform float uFade;
uniform vec4 uFragRect;
uniform int uBurstN;
uniform vec4 uBurst[4];
uniform float uHeat;
uniform float uFlicker;
uniform float uCrackScale;
uniform float uCrackWidth;
uniform float uAshScale;
uniform float uErosion;
uniform float uHalo;
uniform float uCore;
uniform float uRim;
uniform float uRimPx;
uniform float uUseTex;
in vec2 vUv;
out vec4 outColor;

float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 h22(vec2 p) { vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
// Cellular noise: x = distance to the nearest feature point, y = to the second nearest
vec2 vor(vec2 x, float t) {
  vec2 n = floor(x), f = fract(x);
  float f1 = 8.0, f2 = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = 0.5 + 0.42 * sin(t * 0.35 + 6.2831853 * h22(n + g));
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
    }
  }
  return vec2(sqrt(f1), sqrt(f2));
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uView;
  float m = texture(uTrail, vUv).r;

  // Click "breath": a thin ring that sharpens the cracks as it passes
  float ring = 0.0;
  for (int i = 0; i < 4; i++) {
    if (i >= uBurstN) break;
    vec4 b = uBurst[i];
    float d = (length(p - b.xy) - b.z) / 22.0;
    ring += exp(-d * d) * b.w;
  }

  // Calm / soft zones: reduce the effect and cap the heat so text stays readable
  float reduce = 1.0;
  float cap = 9.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uZoneN) break;
    vec4 z = uZone[i];
    vec2 hs = z.zw * 0.5;
    vec2 q = abs(p - (z.xy + hs)) - hs;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    float w = 1.0 - smoothstep(0.0, uFade, d);
    reduce *= 1.0 - uZoneP[i].x * w;
    cap = min(cap, mix(9.0, uZoneP[i].y, w));
  }

  float I = (m + ring * 0.6) * uIntensity * reduce;

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (I > 0.01) {
    vec2 q0 = p / uCrackScale;
    // Heat haze: the revealed surface is displaced by a slow noise, up to uHeat px
    vec2 warp = vec2(fbm(q0 * 1.3 + uTime * 0.12), fbm(q0 * 1.3 + 9.7 - uTime * 0.10)) - 0.5;
    vec2 pp = p + warp * uHeat * 2.0 * clamp(I, 0.0, 1.0);
    vec2 s = pp / uCrackScale;
    // Strong domain warping: the cells are torn, so the cracks wander like fissures, not like glass
    vec2 w2 = (vec2(fbm(s * 1.15 + 3.1), fbm(s * 1.15 + 7.7)) - 0.5) * 1.1;

    float c1;
    float c2;
    float glow = 0.0;
    if (uUseTex > 0.5) {
      c1 = texture(uCracks, fract(s * 0.6)).r;
      c2 = texture(uCracks, fract(s * 1.7 + 0.37)).r;
    } else {
      vec2 v1 = vor(s + w2, uTime);
      float edge1 = v1.y - v1.x;
      float widthMod = 0.5 + 0.95 * vn(s * 3.2 + 5.0);
      c1 = 1.0 - smoothstep(0.0, uCrackWidth * widthMod, edge1);
      // Soft heat bloom around each fissure
      glow = 1.0 - smoothstep(0.0, uCrackWidth * 6.0, edge1);
      // Finer cracks, brightest right under the cursor
      vec2 v2 = vor(s * 2.6 + 11.3 + w2 * 1.4, uTime * 1.3);
      c2 = 1.0 - smoothstep(0.0, uCrackWidth * 0.6, v2.y - v2.x);
    }

    float flick = 1.0 + uFlicker * (2.0 * vn(s * 0.6 + vec2(uTime * 0.5, -uTime * 0.37)) - 1.0);
    // Burnt, ragged edge of the reveal
    float eros = fbm(p / 22.0 + uTime * 0.05);
    float a = smoothstep(0.11, 0.23, I + (eros - 0.5) * uErosion * 1.5);

    float cl = clamp(I, 0.0, 1.0);
    float heat = (c1 * (0.5 + 0.5 * cl) + glow * 0.3 * cl + c2 * smoothstep(0.55, 1.0, I)) * flick;
    heat += ring * c1 * 0.9;
    heat = min(heat, cap);

    vec3 ash = mix(vec3(0.0824, 0.0667, 0.0588), vec3(0.1647, 0.1412, 0.1294), fbm(pp / uAshScale));
    vec3 e = ash;
    e = mix(e, vec3(0.1843, 0.2745, 0.4392), smoothstep(0.04, 0.28, heat));
    e = mix(e, vec3(0.2980, 0.4706, 0.6588), smoothstep(0.26, 0.62, heat));
    e = mix(e, vec3(0.6157, 0.7020, 0.7765), smoothstep(0.62, 0.95, heat));
    e = mix(e, vec3(0.9647, 0.9333, 0.8902), smoothstep(0.95, 1.25, heat) * uCore);
    e += (h21(floor(p * 0.7) + floor(uTime * 12.0)) - 0.5) * 0.02;
    col = e * a;
    alpha = a;
  }

  // Blue halo right around the cursor (only where the trail is at its peak), rgba(76,120,168,.35)
  float halo = smoothstep(0.55, 1.05, m * uIntensity * reduce);
  float hA = 0.35 * uHalo * halo;
  col = col * (1.0 - hA) + vec3(0.2980, 0.4706, 0.6588) * hA;
  alpha = alpha * (1.0 - hA) + hA;

  // Rim light on the fragment: a thin titane-chauffe line following its contour, drawn behind it
  if (uFragRect.z > 0.0 && uRim > 0.0 && I > 0.02) {
    vec2 fp = (p - uFragRect.xy) / uFragRect.zw;
    if (fp.x > -0.2 && fp.x < 1.2 && fp.y > -0.2 && fp.y < 1.2) {
      vec2 r1 = vec2(uRimPx) / uFragRect.zw;
      float a0 = texture(uFrag, fp).a;
      float ringA = 0.0;
      for (int k = 0; k < 8; k++) {
        float ang = float(k) * 0.7853982;
        vec2 o = vec2(cos(ang), sin(ang));
        ringA += texture(uFrag, fp + o * r1).a + texture(uFrag, fp + o * r1 * 0.45).a;
      }
      ringA /= 16.0;
      float rimA = uRim * (1.0 - a0) * smoothstep(0.0, 0.45, ringA) * smoothstep(0.1, 0.6, I);
      col = col * (1.0 - rimA) + vec3(0.2980, 0.4706, 0.6588) * rimA;
      alpha = alpha * (1.0 - rimA) + rimA;
    }
  }

  outColor = vec4(col, alpha);
}`;

export const SPARK_VERT = `#version 300 es
in vec2 aPos;
in float aSize;
in float aAlpha;
in vec3 aColor;
uniform vec2 uView;
uniform float uPx;
out float vAlpha;
out vec3 vColor;
void main() {
  gl_Position = vec4(aPos.x / uView.x * 2.0 - 1.0, 1.0 - aPos.y / uView.y * 2.0, 0.0, 1.0);
  gl_PointSize = max(1.5, aSize * uPx);
  vAlpha = aAlpha;
  vColor = aColor;
}`;

export const SPARK_FRAG = `#version 300 es
precision mediump float;
in float vAlpha;
in vec3 vColor;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = 1.0 - smoothstep(0.0, 1.0, d);
  float k = a * a * vAlpha;
  outColor = vec4(vColor * k, k);
}`;
