import {
  BLEND_SHADER_INDEX,
  PAPER_SHADER_INDEX,
  PROP_SHADER_INDEX,
  getPresetConfig,
} from './presets';
import type { StudioParams } from '../types/studio';

const VERTEX_SHADER_SOURCE = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform sampler2D uTex;
uniform float uPhase;
uniform int uPreset;
uniform int uPropStyle;
uniform int uPaperStyle;
uniform int uBlendMode;
uniform int uCameraView;
uniform float uAmplitude;
uniform float uDepthAmp;
uniform float uDistance;
uniform float uGloss;
uniform float uScale;
uniform float uCanvasAspect;
uniform float uImageAspect;
uniform float uInkEnhance;
uniform float uFlipY;
uniform vec2 uPointerOffset;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

mat3 rotX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, s,
    0.0, -s, c
  );
}

mat3 rotZ(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(
    c, s, 0.0,
    -s, c, 0.0,
    0.0, 0.0, 1.0
  );
}

void computeMotion(
  out vec3 penPos,
  out float tiltZ,
  out float tiltX,
  out vec2 paperShift
) {
  float ampX = uAmplitude;
  float ampZ = uDepthAmp;
  float ph = uPhase;

  penPos = vec3(0.0);
  tiltZ = 0.0;
  tiltX = 0.0;
  paperShift = vec2(0.0);

  if (uPreset == 0) {
    // Parallel Slide: upright pen sliding left & right + front & back
    penPos = vec3(0.48 * ampX * sin(ph), 0.0, 0.24 * ampZ * cos(2.0 * ph));
  } else if (uPreset == 1) {
    // U-Curve Glide: upright pen slides side-to-side with front-back dip at center
    penPos = vec3(0.44 * ampX * sin(ph), 0.0, -0.28 * ampZ * cos(2.0 * ph));
  } else if (uPreset == 2) {
    // Hyper Side Hop: double-tempo upright parallel bounce
    float h = sin(2.0 * ph) + 0.25 * sin(3.0 * ph);
    penPos = vec3(0.42 * ampX * h, 0.0, 0.22 * ampZ * cos(4.0 * ph));
  } else if (uPreset == 3) {
    // Orbit Glide: upright pen glides in a smooth horizontal oval
    penPos = vec3(0.44 * ampX * sin(ph), 0.0, 0.26 * ampZ * cos(ph));
  } else {
    // Paper Slide: pen fixed upright while paper slides left-right & front-back
    paperShift = vec2(0.46 * ampX * sin(ph), 0.24 * ampZ * cos(2.0 * ph));
  }

  // Interactive pointer drag translates the upright pen parallel in X & Z
  penPos.x += uPointerOffset.x * 0.68;
  penPos.z += uPointerOffset.y * 0.42;
}

void tryFrustum(
  vec3 ro,
  vec3 rd,
  float yMin,
  float yMax,
  float rBottom,
  float rTop,
  int matId,
  inout float bestT,
  inout vec3 bestN,
  inout vec3 bestLocalP,
  inout int bestMat
) {
  float h = max(0.0001, yMax - yMin);
  float s = (rTop - rBottom) / h;
  float r0 = rBottom - s * yMin;
  float R0 = r0 + s * ro.y;
  float sr = s * rd.y;

  float a = rd.x * rd.x + rd.z * rd.z - sr * sr;
  float b = ro.x * rd.x + ro.z * rd.z - R0 * sr;
  float c = ro.x * ro.x + ro.z * ro.z - R0 * R0;

  if (abs(a) < 1e-5) {
    if (abs(b) > 1e-5) {
      float t = -c / (2.0 * b);
      if (t > 0.002 && t < bestT) {
        vec3 p = ro + rd * t;
        if (p.y >= yMin && p.y <= yMax) {
          float rad = max(0.0001, r0 + s * p.y);
          vec3 n = normalize(vec3(p.x / rad, -s, p.z / rad));
          if (dot(rd, n) < 0.0) {
            bestT = t;
            bestN = n;
            bestLocalP = p;
            bestMat = matId;
          }
        }
      }
    }
    return;
  }

  float disc = b * b - a * c;
  if (disc < 0.0) return;

  float sq = sqrt(disc);
  float t1 = (-b - sq) / a;
  float t2 = (-b + sq) / a;

  if (t1 > 0.002 && t1 < bestT) {
    vec3 p1 = ro + rd * t1;
    if (p1.y >= yMin && p1.y <= yMax) {
      float rad1 = max(0.0001, r0 + s * p1.y);
      vec3 n1 = normalize(vec3(p1.x / rad1, -s, p1.z / rad1));
      if (dot(rd, n1) < 0.0) {
        bestT = t1;
        bestN = n1;
        bestLocalP = p1;
        bestMat = matId;
      }
    }
  }

  if (t2 > 0.002 && t2 < bestT) {
    vec3 p2 = ro + rd * t2;
    if (p2.y >= yMin && p2.y <= yMax) {
      float rad2 = max(0.0001, r0 + s * p2.y);
      vec3 n2 = normalize(vec3(p2.x / rad2, -s, p2.z / rad2));
      if (dot(rd, n2) < 0.0) {
        bestT = t2;
        bestN = n2;
        bestLocalP = p2;
        bestMat = matId;
      }
    }
  }
}

void tryTopCap(
  vec3 ro,
  vec3 rd,
  float yCap,
  float radius,
  int matId,
  inout float bestT,
  inout vec3 bestN,
  inout vec3 bestLocalP,
  inout int bestMat
) {
  if (abs(rd.y) < 1e-5) return;
  float t = (yCap - ro.y) / rd.y;
  if (t > 0.002 && t < bestT) {
    vec3 p = ro + rd * t;
    if (p.x * p.x + p.z * p.z <= radius * radius) {
      vec3 n = vec3(0.0, 1.0, 0.0);
      if (dot(rd, n) < 0.0) {
        bestT = t;
        bestN = n;
        bestLocalP = p;
        bestMat = matId;
      }
    }
  }
}

void intersectProp(
  vec3 ro,
  vec3 rd,
  vec3 penPos,
  mat3 worldFromLocal,
  out float hitT,
  out vec3 hitWorldN,
  out vec3 hitLocalP,
  out int hitMat
) {
  hitT = 1e6;
  hitWorldN = vec3(0.0, 1.0, 0.0);
  hitLocalP = vec3(0.0);
  hitMat = 0;

  // Transpose of orthonormal matrix converts world -> local
  vec3 lro = (ro - penPos) * worldFromLocal;
  vec3 lrd = rd * worldFromLocal;

  vec3 bestN = vec3(0.0, 1.0, 0.0);
  vec3 bestLP = vec3(0.0);
  int bestMat = 0;

  if (uPropStyle == 0) {
    // Silver ballpoint pen cone + chrome ring + frosted translucent spiral barrel
    tryFrustum(lro, lrd, -0.05, 1.36, 0.19, 0.60, 1, hitT, bestN, bestLP, bestMat);
    tryFrustum(lro, lrd, 1.36, 1.45, 0.60, 0.63, 2, hitT, bestN, bestLP, bestMat);
    tryFrustum(lro, lrd, 1.45, 5.20, 0.63, 0.70, 3, hitT, bestN, bestLP, bestMat);
  } else if (uPropStyle == 1) {
    // Stainless steel straight cup cylinder
    tryFrustum(lro, lrd, -0.04, 2.55, 0.61, 0.64, 1, hitT, bestN, bestLP, bestMat);
    tryFrustum(lro, lrd, 2.55, 2.63, 0.64, 0.65, 2, hitT, bestN, bestLP, bestMat);
    tryTopCap(lro, lrd, 2.63, 0.65, 2, hitT, bestN, bestLP, bestMat);
  } else {
    // Pure glossy chrome cone
    tryFrustum(lro, lrd, -0.05, 2.90, 0.16, 0.85, 1, hitT, bestN, bestLP, bestMat);
    tryTopCap(lro, lrd, 2.90, 0.85, 2, hitT, bestN, bestLP, bestMat);
  }

  if (bestMat > 0) {
    hitMat = bestMat;
    hitLocalP = bestLP;
    hitWorldN = normalize(worldFromLocal * bestN);
  }
}

float computePaperShadow(vec2 xz, vec3 penPos, mat3 worldFromLocal) {
  // Soft directional shadow cast toward top-left just like real desk lighting
  vec3 lightDir = normalize(vec3(0.60, 0.88, 0.42));
  vec3 axisWorld = worldFromLocal * vec3(0.0, 1.0, 0.0);

  // Sample 5 points along the pen cone/barrel and project onto y = 0
  float shadow = 0.0;
  for (int k = 0; k < 5; k++) {
    float h = 0.25 + float(k) * 0.55;
    vec3 pAxis = penPos + axisWorld * h;
    float projT = pAxis.y / lightDir.y;
    vec2 sPos = pAxis.xz - lightDir.xz * projT;
    float radius = (0.28 + float(k) * 0.13) * 1.15;
    float d = length(xz - sPos);
    float s = 1.0 - smoothstep(radius * 0.25, radius * 2.15, d);
    shadow = max(shadow, s * (0.34 - float(k) * 0.04));
  }

  // Soft contact ambient occlusion right where the tip meets the paper
  float contactDist = length(xz - penPos.xz);
  float contactAo = 1.0 - smoothstep(0.14, 0.48, contactDist);
  return clamp(1.0 - max(shadow, contactAo * 0.34), 0.56, 1.0);
}

vec3 evalPaper(vec2 xz, vec3 penPos, mat3 worldFromLocal, vec2 paperShift) {
  // Base warm off-white notebook paper with soft desk vignette
  vec3 paper = vec3(0.955, 0.943, 0.918);
  vec2 shifted = xz - paperShift;

  if (uPaperStyle == 0) {
    // Lined notebook paper (horizontal rules running across X, spaced along Z)
    float spacing = 0.30;
    float phaseZ = fract((shifted.y + 0.15) / spacing);
    float lineDist = abs(phaseZ - 0.5) * spacing;
    float lineMask = 1.0 - smoothstep(0.005, 0.014, lineDist);

    // Tiny subtle alignment dots along the line like Campus notebooks
    float dotX = abs(fract(shifted.x / 0.30 + 0.5) - 0.5) * 0.30;
    float dotMask = (1.0 - smoothstep(0.008, 0.017, dotX)) * lineMask;

    paper = mix(paper, vec3(0.79, 0.83, 0.87), lineMask * 0.72);
    paper = mix(paper, vec3(0.68, 0.73, 0.78), dotMask * 0.45);
  } else if (uPaperStyle == 1) {
    // Grid paper
    float spacing = 0.26;
    vec2 gDist = abs(fract(shifted / spacing + 0.5) - 0.5) * spacing;
    float gMask = 1.0 - smoothstep(0.004, 0.012, min(gDist.x, gDist.y));
    paper = mix(paper, vec3(0.77, 0.83, 0.89), gMask * 0.68);
  } else {
    // Plain paper subtle tooth
    float grain = (hash12(floor(shifted * 140.0)) - 0.5) * 0.014;
    paper += grain;
  }

  // Place doodle flat on paper: feet near tip (small z), head toward camera (+z)
  float drawHalf = 0.56 * uScale;
  float halfX = drawHalf * (uImageAspect >= 1.0 ? 1.0 : uImageAspect);
  float halfZ = drawHalf * (uImageAspect >= 1.0 ? 1.0 / max(uImageAspect, 0.1) : 1.0);

  float zFoot = 0.16 + uDistance * 0.36;
  vec2 drawCenter = vec2(paperShift.x, zFoot + halfZ + paperShift.y);

  float imgU = (xz.x - drawCenter.x) / (2.0 * max(halfX, 0.05)) + 0.5;
  float imgV = (xz.y - (drawCenter.y - halfZ)) / (2.0 * max(halfZ, 0.05));

  if (imgU >= 0.0 && imgU <= 1.0 && imgV >= 0.0 && imgV <= 1.0) {
    vec4 tex = texture2D(uTex, vec2(imgU, imgV));
    vec3 fgCol = tex.rgb;
    float fgA = tex.a;

    if (uInkEnhance > 0.5) {
      float luma = dot(fgCol, vec3(0.299, 0.587, 0.114));
      float mask = 1.0 - smoothstep(0.45, 0.80, luma);
      fgA *= mask;
      fgCol = mix(fgCol * 0.42, fgCol, 0.42);
    }

    if (uBlendMode == 0) {
      // Ink on paper: knock out near-white backing & multiply onto paper lines
      float luma = dot(fgCol, vec3(0.299, 0.587, 0.114));
      float inkPresence = 1.0 - smoothstep(0.86, 0.98, luma);
      float effectiveA = fgA * inkPresence;
      vec3 multiplied = paper * mix(vec3(1.0), fgCol, effectiveA);
      paper = multiplied;
    } else {
      // Color sticker: opaque full-color cutout on paper
      paper = mix(paper, fgCol, fgA);
    }
  }

  // Ambient studio lighting & cast shadow from pen
  float deskGrad = 1.0 - 0.12 * smoothstep(1.2, 6.5, length(xz));
  float shadow = computePaperShadow(xz, penPos, worldFromLocal);
  return clamp(paper * deskGrad * shadow, 0.0, 1.0);
}

vec3 sampleEnvStudio(vec3 r) {
  // Soft bright daylight room environment so metallic reflections look clean & photographic
  float upMix = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 env = mix(vec3(0.84, 0.85, 0.88), vec3(0.94, 0.95, 0.97), upMix);
  float winBand = smoothstep(0.22, 0.86, r.x * 0.72 + r.y * 0.52);
  env += vec3(0.11) * winBand;
  return clamp(env, 0.0, 1.0);
}

vec3 tracePixel(vec2 uv) {
  vec3 penPos;
  float tiltZ;
  float tiltX;
  vec2 paperShift;
  computeMotion(penPos, tiltZ, tiltX, paperShift);

  float trackX = uCameraView == 1 ? penPos.x * 0.55 : 0.0;
  float trackZ = uCameraView == 1 ? penPos.z * 0.35 : 0.0;
  vec3 ro = uCameraView == 0
    ? vec3(0.0, 2.75, 3.35)
    : vec3(trackX, 1.82, 2.26 + trackZ);
  vec3 target = uCameraView == 0
    ? vec3(0.0, 0.60, 0.36)
    : vec3(trackX, 0.68, 0.12 + trackZ);
  float tanHalfFov = uCameraView == 0 ? 0.345 : 0.275;

  vec3 fwd = normalize(target - ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);

  vec2 ndc = vec2((uv.x * 2.0 - 1.0) * uCanvasAspect, uv.y * 2.0 - 1.0);
  vec3 rd = normalize(fwd + ndc.x * tanHalfFov * right + ndc.y * tanHalfFov * up);

  mat3 worldFromLocal = rotZ(tiltZ) * rotX(tiltX);

  float hitT;
  vec3 hitN;
  vec3 hitLP;
  int hitMat;
  intersectProp(ro, rd, penPos, worldFromLocal, hitT, hitN, hitLP, hitMat);

  float planeT = rd.y < -1e-4 ? -ro.y / rd.y : 1e6;

  if (hitMat == 0 || planeT < hitT) {
    if (planeT < 1e5) {
      vec3 paperP = ro + rd * planeT;
      return evalPaper(paperP.xz, penPos, worldFromLocal, paperShift);
    }
    return sampleEnvStudio(rd);
  }

  vec3 worldP = ro + rd * hitT;
  vec3 viewDir = -rd;
  vec3 R = reflect(rd, hitN);

  if (hitMat == 1) {
    // Glossy silver cone / steel cup surface
    vec3 reflected;
    if (R.y < -0.002) {
      float tPaper = -worldP.y / R.y;
      vec2 paperXZ = worldP.xz + R.xz * tPaper;
      reflected = evalPaper(paperXZ, penPos, worldFromLocal, paperShift);
    } else {
      reflected = sampleEnvStudio(R);
    }

    // Metallic silver tint + brushed vertical highlight + Fresnel edge sheen
    float fresnel = pow(max(0.0001, 1.0 - max(0.0, dot(viewDir, hitN))), 2.6);
    vec3 silverBase = vec3(0.84, 0.86, 0.89);
    float reflectWeight = mix(0.60, 0.94, uGloss);
    vec3 col = mix(silverBase, reflected, reflectWeight);

    // Soft side window specular strip (kept gentle so reflected doodle stays sharp!)
    float sideRim = pow(max(0.0001, 1.0 - abs(hitN.x + 0.56)), 9.0);
    float rightRim = pow(max(0.0001, 1.0 - abs(hitN.x - 0.62)), 7.0);
    col += vec3(0.14) * sideRim * uGloss;
    col += vec3(0.08) * rightRim * uGloss;
    col = mix(col, vec3(0.75, 0.78, 0.82), fresnel * 0.22);

    // Subtle dark contact rim right near bottom edge
    float baseShadow = smoothstep(-0.02, 0.16, worldP.y);
    col *= mix(0.78, 1.0, baseShadow);
    return clamp(col, 0.0, 1.0);
  }

  if (hitMat == 2) {
    // High-contrast chrome trim ring
    float envY = clamp(R.y * 0.8 + 0.45, 0.0, 1.0);
    vec3 ring = mix(vec3(0.16, 0.18, 0.22), vec3(0.97, 0.98, 1.0), smoothstep(0.28, 0.72, envY));
    float glint = pow(max(0.0001, dot(R, normalize(vec3(0.4, 0.7, 0.6)))), 14.0);
    return clamp(ring + vec3(0.25) * glint, 0.0, 1.0);
  }

  // Mat 3: Frosted translucent spiral-ribbed pen body
  float ang = atan(hitLP.z, hitLP.x);
  float spiral = 0.5 + 0.5 * sin(ang * 5.0 + hitLP.y * 4.4);
  vec3 lightDir = normalize(vec3(0.58, 0.72, 0.40));
  float diff = max(0.0, dot(hitN, lightDir));
  float wrap = 0.62 + 0.38 * diff;
  float coreFade = exp(-abs(hitLP.x) * 3.2) * 0.08;
  vec3 barrel = vec3(0.83, 0.84, 0.86) * wrap;
  barrel += vec3(0.045) * spiral;
  barrel -= vec3(coreFade);
  float rim = pow(max(0.0001, 1.0 - max(0.0, dot(viewDir, hitN))), 2.2);
  barrel = mix(barrel, vec3(0.91, 0.92, 0.94), rim * 0.35);
  return clamp(barrel, 0.0, 1.0);
}

void main() {
  vec2 baseUv = vec2(vUv.x, uFlipY > 0.5 ? 1.0 - vUv.y : vUv.y);
  vec2 texel = vec2(1.0 / 640.0);

  // 2x2 Rotated Grid Supersampling (RGSS) for crisp doodle lines & notebook rules
  vec3 acc = vec3(0.0);
  acc += tracePixel(baseUv + vec2(-0.375, -0.125) * texel);
  acc += tracePixel(baseUv + vec2(0.125, -0.375) * texel);
  acc += tracePixel(baseUv + vec2(0.375, 0.125) * texel);
  acc += tracePixel(baseUv + vec2(-0.125, 0.375) * texel);

  gl_FragColor = vec4(acc * 0.25, 1.0);
}
`;

export interface RenderOptions {
  flipY?: boolean;
  pointerOffset?: [number, number];
}

export class CylinderRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private ctx2d: CanvasRenderingContext2D | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private texture: WebGLTexture | null = null;
  private source: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null = null;
  private imageAspect = 1;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  public readonly isWebGL: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const contextOpts: WebGLContextAttributes = {
      alpha: false,
      antialias: true,
      preserveDrawingBuffer: true,
    };

    const gl =
      (canvas.getContext('webgl2', contextOpts) as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl', contextOpts) as WebGLRenderingContext | null);

    if (gl && this.initWebGL(gl)) {
      this.gl = gl;
      this.isWebGL = true;
    } else {
      this.ctx2d = canvas.getContext('2d');
      this.isWebGL = false;
    }
  }

  private compileShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private initWebGL(gl: WebGLRenderingContext): boolean {
    const vs = this.compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return false;

    const program = gl.createProgram();
    if (!program) return false;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return false;
    }

    const buffer = gl.createBuffer();
    if (!buffer) return false;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    if (!texture) return false;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.program = program;
    this.buffer = buffer;
    this.texture = texture;

    const uniformNames = [
      'uTex',
      'uPhase',
      'uPreset',
      'uPropStyle',
      'uPaperStyle',
      'uBlendMode',
      'uCameraView',
      'uAmplitude',
      'uDepthAmp',
      'uDistance',
      'uGloss',
      'uScale',
      'uCanvasAspect',
      'uImageAspect',
      'uInkEnhance',
      'uFlipY',
      'uPointerOffset',
    ];
    for (const name of uniformNames) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }

    return true;
  }

  public setSource(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap): void {
    this.source = source;
    const width =
      source instanceof HTMLImageElement ? source.naturalWidth || source.width : source.width;
    const height =
      source instanceof HTMLImageElement ? source.naturalHeight || source.height : source.height;
    this.imageAspect = width > 0 && height > 0 ? width / height : 1;

    if (!this.gl || !this.texture) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  public resize(width: number, height: number): void {
    const safeW = Math.max(1, Math.round(width));
    const safeH = Math.max(1, Math.round(height));
    if (this.canvas.width !== safeW || this.canvas.height !== safeH) {
      this.canvas.width = safeW;
      this.canvas.height = safeH;
    }
    if (this.gl) {
      this.gl.viewport(0, 0, safeW, safeH);
    }
  }

  public render(t: number, params: StudioParams, opts: RenderOptions = {}): void {
    if (!this.source) return;

    if (this.gl && this.program && this.texture) {
      const gl = this.gl;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const phase = (((t % 1) + 1) % 1) * Math.PI * 2;
      const presetCfg = getPresetConfig(params.preset);
      const propIndex = PROP_SHADER_INDEX[params.propStyle] ?? 0;
      const paperIndex = PAPER_SHADER_INDEX[params.paperStyle] ?? 0;
      const blendIndex = BLEND_SHADER_INDEX[params.blendMode] ?? 0;
      const camIndex = params.cameraView === 'closeup' ? 1 : 0;
      const pointer = opts.pointerOffset ?? [0, 0];

      gl.viewport(0, 0, w, h);
      gl.useProgram(this.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      gl.uniform1i(this.uniforms.uTex, 0);
      gl.uniform1f(this.uniforms.uPhase, phase);
      gl.uniform1i(this.uniforms.uPreset, presetCfg.shaderIndex);
      gl.uniform1i(this.uniforms.uPropStyle, propIndex);
      gl.uniform1i(this.uniforms.uPaperStyle, paperIndex);
      gl.uniform1i(this.uniforms.uBlendMode, blendIndex);
      gl.uniform1i(this.uniforms.uCameraView, camIndex);
      gl.uniform1f(this.uniforms.uAmplitude, params.amplitude);
      gl.uniform1f(this.uniforms.uDepthAmp, params.depthAmplitude);
      gl.uniform1f(this.uniforms.uDistance, params.distance);
      gl.uniform1f(this.uniforms.uGloss, params.gloss);
      gl.uniform1f(this.uniforms.uScale, params.scale);
      gl.uniform1f(this.uniforms.uCanvasAspect, w / Math.max(1, h));
      gl.uniform1f(this.uniforms.uImageAspect, this.imageAspect);
      gl.uniform1f(this.uniforms.uInkEnhance, params.inkEnhance ? 1.0 : 0.0);
      gl.uniform1f(this.uniforms.uFlipY, opts.flipY ? 1.0 : 0.0);
      gl.uniform2f(this.uniforms.uPointerOffset, pointer[0], pointer[1]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return;
    }

    this.renderFallback2D(t, params);
  }

  private renderFallback2D(t: number, params: StudioParams): void {
    const ctx = this.ctx2d;
    const src = this.source;
    if (!ctx || !src) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const phase = t * Math.PI * 2;
    const sway = Math.sin(phase) * w * 0.08 * params.amplitude;

    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, w, h);

    // Draw simple fallback upright parallel silver cone
    ctx.fillStyle = '#d3d7df';
    ctx.beginPath();
    ctx.moveTo(w * 0.34 + sway, h * 0.14);
    ctx.lineTo(w * 0.66 + sway, h * 0.14);
    ctx.lineTo(w * 0.56 + sway, h * 0.54);
    ctx.lineTo(w * 0.44 + sway, h * 0.54);
    ctx.closePath();
    ctx.fill();

    const srcW = src instanceof HTMLImageElement ? src.naturalWidth || src.width : src.width;
    const srcH = src instanceof HTMLImageElement ? src.naturalHeight || src.height : src.height;
    const drawW = w * 0.24;
    const drawH = drawW * (srcH / Math.max(1, srcW)) * 1.45;
    ctx.drawImage(src, w * 0.5 - drawW / 2 + sway, h * 0.22, drawW, drawH);
  }

  public captureFrameRGBA(t: number, params: StudioParams): Uint8Array {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.render(t, params, { flipY: true, pointerOffset: [0, 0] });

    if (this.gl) {
      const pixels = new Uint8Array(w * h * 4);
      this.gl.readPixels(0, 0, w, h, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
      return pixels;
    }

    if (this.ctx2d) {
      const imgData = this.ctx2d.getImageData(0, 0, w, h);
      return new Uint8Array(imgData.data.buffer);
    }

    return new Uint8Array(w * h * 4);
  }

  public dispose(loseWebGLContext = false): void {
    if (this.gl) {
      const gl = this.gl;
      if (this.texture) gl.deleteTexture(this.texture);
      if (this.buffer) gl.deleteBuffer(this.buffer);
      if (this.program) gl.deleteProgram(this.program);
      if (loseWebGLContext) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    }
    this.texture = null;
    this.buffer = null;
    this.program = null;
    this.gl = null;
    this.ctx2d = null;
    this.source = null;
  }
}
