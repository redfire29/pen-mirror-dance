export type Locale = 'zh-TW' | 'en';

export type DancePresetId = 'parallel' | 'uhop' | 'hyper' | 'orbit' | 'paper';

export type PropStyle = 'pen' | 'cup' | 'cone';

export type PaperStyle = 'lined' | 'grid' | 'plain';

export type BlendMode = 'ink' | 'sticker';

export type CameraView = 'full' | 'closeup';

export type AspectRatioMode = 'square' | 'portrait';

export type ExportSizePreset = 256 | 480 | 640;

export interface StudioParams {
  preset: DancePresetId;
  cameraView: CameraView;
  aspect: AspectRatioMode;
  propStyle: PropStyle;
  paperStyle: PaperStyle;
  blendMode: BlendMode;
  /** 0.25 ~ 1.0 */
  speed: number;
  /** 0.0 ~ 1.0 */
  amplitude: number;
  /** 0.0 ~ 1.0 */
  depthAmplitude: number;
  /** 0.0 ~ 1.0 */
  distance: number;
  /** 0.0 ~ 1.0 */
  gloss: number;
  /** 0.55 ~ 1.35 */
  scale: number;
  inkEnhance: boolean;
}

export interface ExportOptions {
  size: ExportSizePreset;
  fps: number;
}

export interface DancePresetConfig {
  id: DancePresetId;
  shaderIndex: number;
  defaults: Pick<StudioParams, 'speed' | 'amplitude' | 'depthAmplitude' | 'distance' | 'gloss'>;
}

export interface SampleDoodleMeta {
  id: 'cat' | 'stickman' | 'ghost' | 'starman';
  thumbDataUrl: string;
}

export interface GifExportResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  frameCount: number;
  durationMs: number;
}
