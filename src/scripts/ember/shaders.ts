// GLSL ES 3.00 sources of the ember effect (brief 7.5). The page is charcoal (#0E0B0A) under a film of soot.
// Where the pointer wipes the soot away, red-hot coal shows through: a dark crust cut by glowing fissures.
//   crust        #160D0B -> #331D16   a little warmer and lighter than the soot, about 70 % opaque
//   fissure edge #4D1009              deep red (heat 0.06)
//   fissure      #C72610              red (heat 0.30)
//   hot          #F05A1C              flamme (heat 0.78)
//   amber        #F39A40              only at the hottest points
//   white hot    #F6E0C2              only at the very peak
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
    ring = max(ring, exp(-d * d) * b.w * 0.32);
  }
  outV = vec4(min(max(max(v, add), ring), 1.5), 0.0, 0.0, 1.0);
}`;

/**
 * Procedural pile of charcoal and wood under soot. The trail mask says how much soot has been wiped away; where it is
 * wiped, pieces show (Voronoi cells): faceted charcoal with a cool sheen, and charred wood with fibres, growth bands
 * and cracks across the grain. The gaps between the pieces (Voronoi F2 - F1, domain warped) glow red, then orange.
 */
export const EMBER_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTrail;
uniform sampler2D uFrag;
uniform sampler2D uCracks;
uniform vec2 uView;
uniform float uTime;
uniform float uGlowCool;
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
uniform float uCrust;
uniform float uGlow;
uniform float uWood;
uniform float uRelief;
uniform float uCool;
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
// Same, and also gives the integer cell of the nearest feature point and the vector from the pixel to it (cell units)
void vor3(vec2 x, float t, out vec2 f, out vec2 id, out vec2 toC) {
  vec2 n = floor(x), fr = fract(x);
  float f1 = 8.0, f2 = 8.0;
  vec2 bi = vec2(0.0);
  vec2 br = vec2(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = 0.5 + 0.42 * sin(t * 0.35 + 6.2831853 * h22(n + g));
      vec2 r = g + o - fr;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; bi = n + g; br = r; } else if (d < f2) { f2 = d; }
    }
  }
  f = vec2(sqrt(f1), sqrt(f2));
  id = bi;
  toC = br;
}

// The two Ambiance glows of the stage (src/components/Stage.astro), computed here too so that the pile lets them show
// through: a patch that replaced the glow with dark coal would leave a seam with the background around it.
// Returns the light the glows add on top of the charbon page, in the viewport (the 20 px parallax is ignored).
vec3 ambientGlow(vec2 p) {
  vec2 box = uView + 48.0; // the glow layers overflow the viewport by 24 px on every side
  // Cool glow, top left: ellipse 62% 70% at the corner, layer opacity uGlowCool
  float t = length(p / (box * vec2(0.62, 0.70)));
  vec4 cool = vec4(0.0);
  if (t < 0.30) cool = mix(vec4(0.2831, 0.4471, 0.6259, 0.95), vec4(0.1290, 0.1922, 0.3074, 0.70), t / 0.30);
  else if (t < 0.55) cool = mix(vec4(0.1290, 0.1922, 0.3074, 0.70), vec4(0.0318, 0.0459, 0.0600, 0.30), (t - 0.30) / 0.25);
  else if (t < 0.72) cool = mix(vec4(0.0318, 0.0459, 0.0600, 0.30), vec4(0.0), (t - 0.55) / 0.17);
  cool *= uGlowCool;
  // Warm glow, bottom right: ellipse 70% 80% at the corner
  float w = length((p - uView) / (box * vec2(0.70, 0.80)));
  vec4 warm = vec4(0.0);
  if (w < 0.30) warm = mix(vec4(0.8941, 0.3353, 0.1043, 0.95), vec4(0.5035, 0.1835, 0.0706, 0.60), w / 0.30);
  else if (w < 0.55) warm = mix(vec4(0.5035, 0.1835, 0.0706, 0.60), vec4(0.1078, 0.0343, 0.0147, 0.25), (w - 0.30) / 0.25);
  else if (w < 0.72) warm = mix(vec4(0.1078, 0.0343, 0.0147, 0.25), vec4(0.0), (w - 0.55) / 0.17);
  vec3 charbon = vec3(0.0549, 0.0431, 0.0392);
  vec3 bg = cool.rgb + (1.0 - cool.a) * charbon;
  bg = warm.rgb + (1.0 - warm.a) * bg;
  return bg - charbon;
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uView;
  float m = texture(uTrail, vUv).r;

  // Click "breath": a thin ring, as if blowing on the coal, that revives the fissures as it passes
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

  // Premultiplied colour accumulated bottom to top: crust, red glow through the soot, fissures, rim light
  vec4 acc = vec4(0.0);

  if (I > 0.01) {
    vec2 q0 = p / uCrackScale;
    // Heat haze: the uncovered surface is displaced by a slow noise, up to uHeat px
    vec2 warp = vec2(fbm(q0 * 1.3 + uTime * 0.12), fbm(q0 * 1.3 + 9.7 - uTime * 0.10)) - 0.5;
    vec2 pp = p + warp * uHeat * 2.0 * clamp(I, 0.0, 1.0);
    // Pieces vary in size across the page
    float sz = 1.0 + 0.5 * (fbm(pp / 520.0 + 2.3) - 0.5);
    vec2 s = pp / (uCrackScale * sz);
    // Domain warping: the gaps between the pieces wander like fissures, not like glass
    vec2 w2 = (vec2(fbm(s * 1.15 + 3.1), fbm(s * 1.15 + 7.7)) - 0.5) * 0.9;

    // Soot wipe: how much soot is gone here. A wide, smudged edge, broken by slow smudges and fine grains that
    // matter most where the wipe is thin: the soot seems to settle back grain by grain.
    float thin = 1.0 - smoothstep(0.25, 0.75, I);
    float smudge = fbm(p / 70.0 + 4.3) - 0.5;
    float grain = vn(p / 3.0 + 31.7) - 0.5;
    float J = I + (smudge * 0.6 + grain * 0.5) * uErosion * thin;
    float wipe = smoothstep(0.03, 0.42, J);
    // The heat of the pointer lights the texture: it shows more where the pointer is and has just been
    float hl = smoothstep(0.05, 0.85, J);
    float heatLight = 0.45 + 0.55 * hl;

    float c1;
    float c2;
    float bloom;
    vec3 crust;
    float transverse = 0.0;
    float spots = 0.0;
    if (uUseTex > 0.5) {
      c1 = texture(uCracks, fract(s * 0.6)).r;
      c2 = texture(uCracks, fract(s * 1.7 + 0.37)).r;
      bloom = c1;
      crust = mix(vec3(0.085, 0.052, 0.044), vec3(0.200, 0.115, 0.088), fbm(pp / uAshScale));
    } else {
      // Level 1: the pieces. The gaps between them (F2 - F1) glow.
      vec2 fd;
      vec2 cid;
      vec2 toC;
      vor3(s + w2, uTime * 0.12, fd, cid, toC);
      float edge1 = fd.y - fd.x;
      float widthMod = 0.5 + 0.95 * vn(s * 3.2 + 5.0);
      c1 = 1.0 - smoothstep(0.0, uCrackWidth * widthMod, edge1);
      // Soft red glow around each gap
      bloom = 1.0 - smoothstep(0.0, uCrackWidth * 7.0, edge1);

      // Level 2: the facets of the charcoal; the thin cracks between them are brightest right under the cursor
      vec2 fd2;
      vec2 fid;
      vec2 toF;
      vor3(s * 2.7 + 11.3 + w2 * 1.4, uTime * 0.15, fd2, fid, toF);
      float edge2 = fd2.y - fd2.x;
      c2 = pow(1.0 - smoothstep(0.0, uCrackWidth * 1.6, edge2), 2.0);

      // One piece: its type, its grain direction and a random tilt
      vec2 hA = h22(cid + 3.1);
      vec2 hB = h22(cid + 9.7);
      float isWood = step(hA.x, uWood);
      float ang = hA.y * 3.14159;
      vec2 dA = vec2(cos(ang), sin(ang));
      vec2 dB = vec2(-dA.y, dA.x);
      vec2 u = -toC; // pixel relative to the piece centre, in cells
      float along = dot(u, dA);
      float across = dot(u, dB);

      // Grazing light from the top left, like the Ambiance
      vec3 L = normalize(vec3(-0.55, -0.60, 0.58));
      vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));

      // Charcoal: near black and matte. Angular shards (one tilt per facet) softened by two scales of roughness,
      // tiny pores, and a sheen on a few facets. Two lights: the heat of the pointer (warm, strongest where the pointer
      // is: heatLight) and a cold steel light from the top left, the one of the Ambiance's titane glow, that stays on
      // the pieces as they cool (uCool is its share, 0 gives the warm brown pile).
      vec2 ft = h22(fid + 5.3) - 0.5;
      vec2 r1 = vec2(vn(p / 11.0), vn(p / 11.0 + 7.1)) - 0.5;
      vec2 r2 = vec2(vn(p / 4.0), vn(p / 4.0 + 3.3)) - 0.5;
      vec3 Nc = normalize(vec3(ft * 1.1 + (hB - 0.5) * 0.35 + r1 * 0.55 + r2 * 0.35, 1.0));
      float dc = max(dot(Nc, L), 0.0);
      float sc = pow(max(dot(Nc, H), 0.0), 40.0) * step(0.62, h21(fid + 1.7));
      float pits = smoothstep(0.62, 0.8, vn(p / 3.2 + 13.0));
      float cool = uCool;
      float diff = dc * (0.6 + 0.8 * hB.x) * uRelief;
      float spec = sc * uRelief;
      float coolLight = 0.5 + 0.5 * hl;
      vec3 coal = mix(vec3(0.034, 0.030, 0.028), vec3(0.027, 0.031, 0.042), cool)
        + vec3(0.120, 0.074, 0.054) * diff * heatLight * (1.0 - 0.45 * cool)
        + vec3(0.056, 0.084, 0.124) * diff * coolLight * cool
        + vec3(0.190, 0.120, 0.085) * spec * heatLight * (1.0 - 0.35 * cool)
        + vec3(0.105, 0.155, 0.235) * spec * coolLight * cool;
      coal *= 1.0 - 0.4 * pits;
      coal *= 0.72 + 0.28 * smoothstep(0.0, 0.10, edge2);
      // Thin bright edges on the sides that face the light, on the pieces and on their facets
      vec2 un = u / max(length(u), 0.0001);
      vec2 un2 = -toF / max(length(toF), 0.0001);
      float rim1 = (1.0 - smoothstep(0.0, 0.09, edge1)) * max(dot(un, vec2(-0.68, -0.74)), 0.0);
      float rim2 = (1.0 - smoothstep(0.0, 0.05, edge2)) * max(dot(un2, vec2(-0.68, -0.74)), 0.0);

      // Wood: a log lying in the cell, with a ragged outline. Cylinder lighting, brown fibres on black char,
      // blocks cut by cracks across and along the grain (the cracks glow).
      float rag = vn(vec2(along * 7.0, across * 9.0) + cid * 3.1) - 0.5;
      float body = 1.0 - smoothstep(0.78, 1.0, length(vec2(along / 0.70, across / 0.27)) + rag * 0.4);
      float cy = clamp(across / 0.27, -1.0, 1.0);
      vec3 Nw = normalize(vec3(dB * cy * 0.9, sqrt(max(1.0 - 0.8 * cy * cy, 0.05))));
      float dw = max(dot(Nw, L), 0.0);
      float fa = vn(vec2(across * 15.0, along * 1.6) + cid * 11.0);
      float fb = vn(vec2(across * 34.0, along * 3.2) + cid * 5.0);
      float fibre = pow(0.55 * fa + 0.45 * fb, 1.5) * 1.6;
      float tc = abs(fract(along * 3.4 + 0.35 * vn(vec2(across * 5.0, cid.x * 3.7)) + hB.y) - 0.5);
      float lc = abs(fract(across * 3.6 + 0.25 * vn(vec2(along * 3.0, cid.y * 2.9)) + hB.x) - 0.5);
      float crk = 1.0 - smoothstep(0.0, 0.045, min(tc, lc));
      vec3 burnt = mix(mix(vec3(0.030, 0.025, 0.022), vec3(0.025, 0.026, 0.031), cool), vec3(0.200, 0.112, 0.066), clamp(fibre, 0.0, 1.0));
      vec3 wood = burnt * mix(0.8, 0.5 + 0.9 * dw, uRelief) * (0.45 + 0.55 * heatLight) * (1.0 - 0.7 * crk);
      float inLog = body * isWood;
      transverse = crk * inLog;

      crust = mix(coal, wood, inLog);
      crust *= 0.85 + 0.3 * fbm(pp / uAshScale); // slow mottling
      crust *= 0.55 + 0.45 * smoothstep(0.0, 0.2, edge1); // dark recesses along the gaps between pieces
      vec3 rimWarm = vec3(0.190, 0.115, 0.080) * rim1 + vec3(0.085, 0.052, 0.038) * rim2;
      vec3 rimCool = vec3(0.100, 0.148, 0.220) * rim1 + vec3(0.046, 0.068, 0.100) * rim2;
      crust += (rimWarm * heatLight * (1.0 - 0.5 * cool) + rimCool * coolLight * cool) * uRelief * (1.0 - 0.7 * inLog);
      crust += (h21(floor(p * 0.7) + floor(uTime * 12.0)) - 0.5) * 0.012; // fine moving grain of ash
      crust = min(crust, vec3(0.26)); // never brighter than this: keeps the text above it readable
      // Some charcoal pieces are red hot in patches
      spots = (1.0 - inLog) * smoothstep(0.66, 0.92, fbm(u * 4.5 + cid * 7.0)) * 0.12;
    }
    // The Ambiance glows stay visible through the pile: the patch is the background plus the texture, not a hole in it
    crust = min(crust + ambientGlow(p), vec3(1.0));

    float aCrust = wipe * uCrust * (0.4 + 0.6 * hl);

    // The fissures glow only close to the pointer and cool quickly (red, deep red, out); the wiped patch outlasts them
    float lit = pow(smoothstep(0.1, 0.95, J), 1.2);
    float flick = 1.0 + uFlicker * (2.0 * vn(s * 0.6 + vec2(uTime * 0.5, -uTime * 0.37)) - 1.0);
    float heat = (c1 * (0.5 + 0.5 * lit) + c2 * smoothstep(0.6, 1.0, J) * 0.25 + transverse * 0.4 + spots) * lit * flick * uGlow;
    heat += ring * c1 * 0.9 * uGlow;
    heat = min(heat, cap);

    // deep red -> red -> flamme -> amber -> white hot
    vec3 hot = vec3(0.3020, 0.0627, 0.0353);
    hot = mix(hot, vec3(0.7804, 0.1490, 0.0627), smoothstep(0.06, 0.30, heat));
    hot = mix(hot, vec3(0.9412, 0.3529, 0.1098), smoothstep(0.38, 0.78, heat));
    hot = mix(hot, vec3(0.9529, 0.6039, 0.2510), smoothstep(0.78, 1.10, heat) * uCore);
    hot = mix(hot, vec3(0.9647, 0.8784, 0.7608), smoothstep(1.10, 1.50, heat) * uCore);
    float aHot = smoothstep(0.015, 0.20, heat) * 0.85 * wipe;
    float aBloom = bloom * lit * 0.12 * uGlow * wipe;

    acc = vec4(crust * aCrust, aCrust);
    acc = vec4(vec3(0.50, 0.095, 0.045) * aBloom, aBloom) + acc * (1.0 - aBloom);
    acc = vec4(hot * aHot, aHot) + acc * (1.0 - aHot);
  }

  // Faint warm glow right around the cursor (only where the trail is at its peak)
  float peak = smoothstep(0.45, 1.05, m * uIntensity * reduce);
  float hA = 0.14 * uHalo * peak;
  acc = vec4(vec3(0.62, 0.12, 0.05) * hA, hA) + acc * (1.0 - hA);

  // Rim light on the fragment: a thin warm line following its contour, drawn behind it
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
      acc = vec4(vec3(0.80, 0.20, 0.07) * rimA, rimA) + acc * (1.0 - rimA);
    }
  }

  outColor = acc;
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
  gl_PointSize = max(1.3, aSize * uPx);
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
