import type {
  BlendMode,
  DancePresetConfig,
  DancePresetId,
  PaperStyle,
  PropStyle,
  StudioParams,
} from '../types/studio';

export const DANCE_PRESETS: DancePresetConfig[] = [
  {
    id: 'parallel',
    shaderIndex: 0,
    defaults: { speed: 0.62, amplitude: 0.78, depthAmplitude: 0.55, distance: 0.45, gloss: 0.72 },
  },
  {
    id: 'uhop',
    shaderIndex: 1,
    defaults: { speed: 0.62, amplitude: 0.75, depthAmplitude: 0.78, distance: 0.45, gloss: 0.72 },
  },
  {
    id: 'hyper',
    shaderIndex: 2,
    defaults: { speed: 0.8, amplitude: 0.72, depthAmplitude: 0.6, distance: 0.44, gloss: 0.72 },
  },
  {
    id: 'orbit',
    shaderIndex: 3,
    defaults: { speed: 0.54, amplitude: 0.72, depthAmplitude: 0.75, distance: 0.45, gloss: 0.75 },
  },
  {
    id: 'paper',
    shaderIndex: 4,
    defaults: { speed: 0.6, amplitude: 0.78, depthAmplitude: 0.5, distance: 0.48, gloss: 0.72 },
  },
];

export const PROP_STYLES: PropStyle[] = ['pen', 'cup', 'cone'];

export const PROP_SHADER_INDEX: Record<PropStyle, number> = {
  pen: 0,
  cup: 1,
  cone: 2,
};

export const PAPER_STYLES: PaperStyle[] = ['lined', 'grid', 'plain'];

export const PAPER_SHADER_INDEX: Record<PaperStyle, number> = {
  lined: 0,
  grid: 1,
  plain: 2,
};

export const BLEND_MODES: BlendMode[] = ['ink', 'sticker'];

export const BLEND_SHADER_INDEX: Record<BlendMode, number> = {
  ink: 0,
  sticker: 1,
};

export function getPresetConfig(id: DancePresetId): DancePresetConfig {
  return DANCE_PRESETS.find((item) => item.id === id) ?? DANCE_PRESETS[0];
}

export function createDefaultStudioParams(): StudioParams {
  const first = DANCE_PRESETS[0].defaults;
  return {
    preset: 'parallel',
    cameraView: 'full',
    aspect: 'square',
    propStyle: 'pen',
    paperStyle: 'lined',
    blendMode: 'ink',
    speed: first.speed,
    amplitude: first.amplitude,
    depthAmplitude: first.depthAmplitude,
    distance: first.distance,
    gloss: first.gloss,
    scale: 0.95,
    inkEnhance: false,
  };
}

/**
 * Shared seamless-loop cycle duration (in seconds) used by BOTH live WebGL stage
 * and GIF exporter so preview playback speed matches exported GIF 1:1.
 */
export function getCycleDurationSec(speed: number): number {
  const clamped = Math.min(1, Math.max(0.25, speed));
  return 2.4 - clamped * 1.8;
}
