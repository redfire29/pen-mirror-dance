<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { StudioMessages } from '../i18n/messages';
import { CylinderRenderer } from '../lib/cylinderRenderer';
import { getCycleDurationSec } from '../lib/presets';
import type { AspectRatioMode, CameraView, StudioParams } from '../types/studio';

const props = withDefaults(
  defineProps<{
    source: HTMLImageElement | HTMLCanvasElement | null;
    params: StudioParams;
    messages: StudioMessages;
    compact?: boolean;
    showFinishDoodle?: boolean;
  }>(),
  {
    compact: false,
    showFinishDoodle: false,
  }
);

const emit = defineEmits<{
  (e: 'update:params', value: StudioParams): void;
  (e: 'dropFile', file: File): void;
  (e: 'finishDoodle'): void;
  (e: 'webglUnsupported'): void;
}>();

const stageBoxRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isPlaying = ref(true);
const isDraggingOver = ref(false);

let renderer: CylinderRenderer | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;
let textureDirty = false;
let lastFrameTime = 0;
let phaseProgress = 0;
let isPointerDown = false;
let pointerOffset: [number, number] = [0, 0];
let targetPointerOffset: [number, number] = [0, 0];

const activePresetName = computed(() => props.messages.presets[props.params.preset].name);

const stageFrameClass = computed(() => {
  if (props.compact) {
    return props.params.aspect === 'portrait'
      ? 'aspect-[3/4] max-w-[175px] mx-auto'
      : 'aspect-square max-w-[210px] mx-auto';
  }
  return props.params.aspect === 'portrait'
    ? 'aspect-[3/4] max-w-[420px] mx-auto'
    : 'aspect-square w-full';
});

function setCameraView(view: CameraView) {
  emit('update:params', { ...props.params, cameraView: view });
}

function setAspect(aspect: AspectRatioMode) {
  emit('update:params', { ...props.params, aspect });
}

function notifySourceUpdated() {
  textureDirty = true;
}

defineExpose({ notifySourceUpdated });

function syncCanvasSize() {
  const box = stageBoxRef.value;
  if (!box || !renderer) return;
  const rect = box.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, props.compact ? 1.5 : 2);
  const w = Math.max(120, Math.round(rect.width * dpr));
  const h = Math.max(120, Math.round(rect.height * dpr));
  renderer.resize(w, h);
}

function tick(now: number) {
  if (!lastFrameTime) lastFrameTime = now;
  const dtSec = Math.min(0.1, (now - lastFrameTime) / 1000);
  lastFrameTime = now;

  if (isPlaying.value) {
    const cycleSec = getCycleDurationSec(props.params.speed);
    phaseProgress = (phaseProgress + dtSec / cycleSec) % 1;
  }

  pointerOffset[0] += (targetPointerOffset[0] - pointerOffset[0]) * 0.16;
  pointerOffset[1] += (targetPointerOffset[1] - pointerOffset[1]) * 0.16;

  if (renderer && props.source) {
    if (textureDirty) {
      renderer.setSource(props.source);
      textureDirty = false;
    }
    renderer.render(phaseProgress, props.params, {
      flipY: false,
      pointerOffset,
    });
  }

  rafId = window.requestAnimationFrame(tick);
}

function updatePointerFromEvent(e: PointerEvent) {
  const box = stageBoxRef.value;
  if (!box || props.compact) return;
  const rect = box.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
  const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
  const weight = isPointerDown ? 0.65 : 0.28;
  targetPointerOffset = [
    Math.max(-0.7, Math.min(0.7, nx * weight)),
    Math.max(-0.5, Math.min(0.5, ny * weight * 0.6)),
  ];
}

function handlePointerDown(e: PointerEvent) {
  if (props.compact) return;
  isPointerDown = true;
  (e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
  updatePointerFromEvent(e);
}

function handlePointerMove(e: PointerEvent) {
  updatePointerFromEvent(e);
}

function handlePointerEnd() {
  isPointerDown = false;
  targetPointerOffset = [0, 0];
}

function handleDragOver(e: DragEvent) {
  if (e.dataTransfer?.types.includes('Files')) {
    e.preventDefault();
    isDraggingOver.value = true;
  }
}

function handleDragLeave() {
  isDraggingOver.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDraggingOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    emit('dropFile', file);
  }
}

watch(
  () => props.source,
  (nextSource) => {
    if (nextSource && renderer) {
      renderer.setSource(nextSource);
      textureDirty = false;
    }
  }
);

watch(
  () => [props.compact, props.params.aspect],
  () => {
    window.requestAnimationFrame(syncCanvasSize);
  }
);

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  renderer = new CylinderRenderer(canvas);
  if (!renderer.isWebGL) {
    emit('webglUnsupported');
  }
  syncCanvasSize();
  if (props.source) {
    renderer.setSource(props.source);
  }

  if (typeof ResizeObserver !== 'undefined' && stageBoxRef.value) {
    resizeObserver = new ResizeObserver(() => {
      syncCanvasSize();
    });
    resizeObserver.observe(stageBoxRef.value);
  }

  lastFrameTime = performance.now();
  rafId = window.requestAnimationFrame(tick);
});

onUnmounted(() => {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
  }
  resizeObserver?.disconnect();
  renderer?.dispose(true);
  renderer = null;
});
</script>

<template>
  <section
    class="w-full"
    :class="compact ? 'sketch-card-sm p-2.5' : 'sketch-card p-3 sm:p-4'"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Top bar: status + view/aspect quick toggles + play -->
    <div
      class="flex flex-wrap items-center justify-between gap-2"
      :class="compact ? 'mb-2' : 'mb-3'"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-highlighter px-2.5 py-0.5 text-xs font-bold tracking-wide shrink-0"
        >
          <span class="h-2 w-2 rounded-full bg-coral animate-pulse" />
          {{ compact ? messages.stageCompactTitle : messages.stageLabel }}
        </span>
        <span class="truncate text-xs sm:text-sm font-bold text-ink-muted">
          {{ activePresetName }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-1.5 shrink-0">
        <template v-if="!compact">
          <!-- Camera View Switch (Full vs Close-up) -->
          <div class="inline-flex rounded-lg border-2 border-ink bg-paper p-0.5">
            <button
              v-for="view in (['full', 'closeup'] as CameraView[])"
              :key="view"
              type="button"
              class="rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors"
              :class="params.cameraView === view ? 'bg-highlighter text-ink' : 'text-ink-muted hover:text-ink'"
              :aria-pressed="params.cameraView === view"
              @click="setCameraView(view)"
            >
              {{ messages.cameraViews[view] }}
            </button>
          </div>

          <!-- Aspect Ratio Quick Toggle (1:1 vs 3:4) -->
          <div class="inline-flex rounded-lg border-2 border-ink bg-paper p-0.5">
            <button
              v-for="ar in (['square', 'portrait'] as AspectRatioMode[])"
              :key="ar"
              type="button"
              class="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold transition-colors"
              :class="params.aspect === ar ? 'bg-highlighter text-ink' : 'text-ink-muted hover:text-ink'"
              :aria-pressed="params.aspect === ar"
              @click="setAspect(ar)"
            >
              {{ messages.aspectShort[ar] }}
            </button>
          </div>
        </template>

        <button
          v-if="showFinishDoodle"
          type="button"
          class="stamp-btn rounded-lg bg-coral px-2.5 py-1 text-xs font-bold text-white"
          @click="emit('finishDoodle')"
        >
          {{ messages.stageFinishDoodle }}
        </button>

        <button
          type="button"
          class="stamp-btn inline-flex items-center gap-1 rounded-lg bg-card px-2.5 py-1 text-xs font-bold text-ink"
          :aria-label="isPlaying ? messages.stagePause : messages.stagePlay"
          @click="isPlaying = !isPlaying"
        >
          <svg
            v-if="isPlaying"
            class="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="3" y="2.5" width="3.5" height="11" rx="1" />
            <rect x="9.5" y="2.5" width="3.5" height="11" rx="1" />
          </svg>
          <svg
            v-else
            class="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4 2.5l9.5 5.5L4 13.5V2.5z" />
          </svg>
          <span>{{ isPlaying ? messages.stagePause : messages.stagePlay }}</span>
        </button>
      </div>
    </div>

    <!-- 3D Optical Pen-Tip Reflection Stage -->
    <div class="mirror-bezel p-2 sm:p-3">
      <div
        ref="stageBoxRef"
        class="relative overflow-hidden rounded-[16px] border-2 border-ink bg-[#f4f1ea] select-none touch-none cursor-grab active:cursor-grabbing"
        :class="stageFrameClass"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerEnd"
        @pointercancel="handlePointerEnd"
        @pointerleave="handlePointerEnd"
      >
        <canvas
          ref="canvasRef"
          class="block h-full w-full"
        />

        <!-- Drag & drop overlay -->
        <div
          v-if="isDraggingOver"
          class="absolute inset-2 flex flex-col items-center justify-center rounded-xl border-3 border-dashed border-coral bg-card/90 text-center p-4"
        >
          <p class="font-display text-lg font-bold text-coral">
            {{ messages.stageDropOverlay }}
          </p>
        </div>
      </div>
    </div>

    <p
      v-if="!compact"
      class="mt-2.5 text-center text-xs font-medium text-ink-muted"
    >
      {{ messages.stageDragHint }}
    </p>
  </section>
</template>
