import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import { CylinderRenderer } from './cylinderRenderer';
import { getCycleDurationSec } from './presets';
import type { AspectRatioMode, ExportOptions, ExportSizePreset, StudioParams } from '../types/studio';

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function computeExportDimensions(
  aspect: AspectRatioMode,
  size: ExportSizePreset
): { width: number; height: number } {
  if (aspect === 'square') {
    return { width: size, height: size };
  }
  const width = Math.max(64, Math.round((size * 3) / 4 / 2) * 2);
  return { width, height: size };
}

function buildSampleBuffer(frames: Uint8Array[]): Uint8Array {
  const sampleIndices: number[] = [];
  const step = Math.max(1, Math.floor(frames.length / 6));
  for (let i = 0; i < frames.length; i += step) {
    sampleIndices.push(i);
    if (sampleIndices.length >= 6) break;
  }

  let totalBytes = 0;
  for (const idx of sampleIndices) totalBytes += frames[idx].length;
  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const idx of sampleIndices) {
    merged.set(frames[idx], offset);
    offset += frames[idx].length;
  }
  return merged;
}

export async function exportDancingGif(options: {
  source: HTMLImageElement | HTMLCanvasElement;
  params: StudioParams;
  exportOptions: ExportOptions;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}): Promise<{
  blob: Blob;
  width: number;
  height: number;
  frameCount: number;
  durationMs: number;
}> {
  const { source, params, exportOptions, onProgress, signal } = options;
  const { width, height } = computeExportDimensions(params.aspect, exportOptions.size);

  const cycleSec = getCycleDurationSec(params.speed);
  const fps = exportOptions.fps || 20;
  const delayMs = Math.round(1000 / fps);
  const frameCount = Math.max(12, Math.min(48, Math.round(cycleSec * fps)));

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;

  const renderer = new CylinderRenderer(offscreenCanvas);

  try {
    renderer.resize(width, height);
    renderer.setSource(source);

    const frames: Uint8Array[] = [];
    for (let i = 0; i < frameCount; i++) {
      if (signal?.aborted) {
        throw new DOMException('GIF export aborted', 'AbortError');
      }
      const t = i / frameCount;
      frames.push(renderer.captureFrameRGBA(t, params));

      if (i % 2 === 1) {
        onProgress?.(Math.round(((i + 1) / frameCount) * 45));
        await yieldToMain();
      }
    }

    onProgress?.(48);
    await yieldToMain();

    if (signal?.aborted) {
      throw new DOMException('GIF export aborted', 'AbortError');
    }

    const sampleBytes = buildSampleBuffer(frames);
    const gif = GIFEncoder({ initialCapacity: 1 << 19 });
    const globalPalette = quantize(sampleBytes, 256, { format: 'rgb565' });

    for (let i = 0; i < frames.length; i++) {
      if (signal?.aborted) {
        throw new DOMException('GIF export aborted', 'AbortError');
      }
      const indexed = applyPalette(frames[i], globalPalette, 'rgb565');

      gif.writeFrame(indexed, width, height, {
        palette: i === 0 ? globalPalette : undefined,
        delay: delayMs,
        repeat: 0,
        dispose: 1,
      });

      if (i % 2 === 1 || i === frames.length - 1) {
        onProgress?.(50 + Math.round(((i + 1) / frames.length) * 50));
        await yieldToMain();
      }
    }

    gif.finish();
    const bytes = gif.bytes();
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([buffer], { type: 'image/gif' });

    return {
      blob,
      width,
      height,
      frameCount,
      durationMs: frameCount * delayMs,
    };
  } finally {
    renderer.dispose(true);
  }
}
