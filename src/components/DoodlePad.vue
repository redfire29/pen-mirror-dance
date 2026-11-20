<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { StudioMessages } from '../i18n/messages';

const props = defineProps<{
  messages: StudioMessages;
}>();

const emit = defineEmits<{
  (e: 'ready', canvas: HTMLCanvasElement): void;
  (e: 'update', canvas: HTMLCanvasElement): void;
}>();

const PEN_COLORS = [
  '#1B1D24',
  '#2563EB',
  '#FF5C39',
  '#16A34A',
  '#7C3AED',
  '#F59E0B',
];

const BRUSH_WIDTHS = [8, 16, 28] as const;
const CANVAS_SIZE = 512;
const MAX_HISTORY = 25;

const drawCanvasRef = ref<HTMLCanvasElement | null>(null);
const selectedColor = ref<string>(PEN_COLORS[0]);
const selectedSizeIdx = ref<number>(1);
const isEraser = ref(false);
const showTracingGuide = ref(true);
const historyCount = ref(0);

let ctx: CanvasRenderingContext2D | null = null;
let isDrawing = false;
let lastPoint: { x: number; y: number } | null = null;
let midPoint: { x: number; y: number } | null = null;
const undoStack: ImageData[] = [];

function saveSnapshot() {
  if (!ctx) return;
  const snapshot = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  undoStack.push(snapshot);
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }
  historyCount.value = undoStack.length;
}

function getCanvasPoint(e: PointerEvent): { x: number; y: number } {
  const canvas = drawCanvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / Math.max(1, rect.width)) * CANVAS_SIZE,
    y: ((e.clientY - rect.top) / Math.max(1, rect.height)) * CANVAS_SIZE,
  };
}

function applyStrokeStyle() {
  if (!ctx) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const baseWidth = BRUSH_WIDTHS[selectedSizeIdx.value] ?? 16;
  if (isEraser.value) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = baseWidth * 1.65;
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = baseWidth;
    ctx.strokeStyle = selectedColor.value;
    ctx.fillStyle = selectedColor.value;
  }
}

function emitUpdate() {
  if (drawCanvasRef.value) {
    emit('update', drawCanvasRef.value);
  }
}

function handlePointerDown(e: PointerEvent) {
  const canvas = drawCanvasRef.value;
  if (!canvas || !ctx) return;
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);

  saveSnapshot();
  isDrawing = true;
  const pt = getCanvasPoint(e);
  lastPoint = pt;
  midPoint = pt;

  applyStrokeStyle();
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.fill();
  emitUpdate();
}

function handlePointerMove(e: PointerEvent) {
  if (!isDrawing || !ctx || !lastPoint || !midPoint) return;
  e.preventDefault();
  const pt = getCanvasPoint(e);
  const nextMid = {
    x: (lastPoint.x + pt.x) / 2,
    y: (lastPoint.y + pt.y) / 2,
  };

  applyStrokeStyle();
  ctx.beginPath();
  ctx.moveTo(midPoint.x, midPoint.y);
  ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, nextMid.x, nextMid.y);
  ctx.stroke();

  lastPoint = pt;
  midPoint = nextMid;
  emitUpdate();
}

function handlePointerEnd(e: PointerEvent) {
  if (!isDrawing || !ctx || !lastPoint || !midPoint) return;
  const pt = getCanvasPoint(e);
  applyStrokeStyle();
  ctx.beginPath();
  ctx.moveTo(midPoint.x, midPoint.y);
  ctx.lineTo(pt.x, pt.y);
  ctx.stroke();

  isDrawing = false;
  lastPoint = null;
  midPoint = null;
  emitUpdate();
}

function handleUndo() {
  if (!ctx || undoStack.length === 0) return;
  const prev = undoStack.pop();
  historyCount.value = undoStack.length;
  if (prev) {
    ctx.putImageData(prev, 0, 0);
    emitUpdate();
  }
}

function handleClear() {
  if (!ctx) return;
  saveSnapshot();
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  emitUpdate();
}

function selectColor(color: string) {
  selectedColor.value = color;
  isEraser.value = false;
}

onMounted(() => {
  const canvas = drawCanvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext('2d', { willReadFrequently: true });
  emit('ready', canvas);
});
</script>

<template>
  <section class="sketch-card p-3 sm:p-4">
    <!-- Header -->
    <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 class="font-display text-lg font-bold text-ink">
          {{ messages.doodleTitle }}
        </h2>
        <p class="text-xs text-ink-muted">
          {{ messages.doodleSubtitle }}
        </p>
      </div>

      <button
        type="button"
        class="stamp-btn inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold"
        :class="showTracingGuide ? 'bg-highlighter text-ink' : 'bg-card text-ink-muted'"
        :aria-pressed="showTracingGuide"
        @click="showTracingGuide = !showTracingGuide"
      >
        <span>{{ messages.doodleGuideToggle }}</span>
      </button>
    </div>

    <!-- Drawing Canvas with Notebook Guide Layer (transparent ink canvas on top) -->
    <div
      class="doodle-paper-guide relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-2xl border-2 border-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
    >
      <!-- Non-exported tracing ":3" cat SVG guide -->
      <svg
        v-if="showTracingGuide"
        class="pointer-events-none absolute inset-0 h-full w-full opacity-20"
        viewBox="0 0 512 512"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M194 152 L156 86 L146 178 Q106 212 128 258 Q88 286 120 314 Q144 320 166 300 Q164 370 176 412 Q192 434 214 418 Q234 396 256 398 Q278 396 298 418 Q320 434 336 412 Q348 370 346 300 Q368 320 392 314 Q424 286 384 258 Q406 212 366 178 L356 86 L318 152 Q256 136 194 152 Z"
          stroke="#2563EB"
          stroke-width="8"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="14 10"
        />
        <circle cx="198" cy="218" r="9" fill="#2563EB" />
        <circle cx="314" cy="218" r="9" fill="#2563EB" />
        <path
          d="M222 232 Q239 254 256 228 Q273 254 290 232"
          stroke="#2563EB"
          stroke-width="8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <canvas
        ref="drawCanvasRef"
        :width="CANVAS_SIZE"
        :height="CANVAS_SIZE"
        class="relative z-10 block h-full w-full touch-none cursor-crosshair"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerEnd"
        @pointercancel="handlePointerEnd"
      />
    </div>

    <p v-if="showTracingGuide" class="mt-1.5 text-center text-[11px] text-ink-muted">
      {{ messages.doodleGuideHint }}
    </p>

    <!-- Toolbar -->
    <div class="mt-3 flex flex-wrap items-center justify-between gap-2.5 border-t-2 border-dashed border-ink/20 pt-3">
      <!-- Pen colors -->
      <div class="flex items-center gap-1.5" role="group" :aria-label="messages.doodlePenColors">
        <button
          v-for="color in PEN_COLORS"
          :key="color"
          type="button"
          class="h-7 w-7 rounded-full border-2 border-ink transition-transform"
          :class="!isEraser && selectedColor === color ? 'scale-115 ring-2 ring-ink ring-offset-2' : 'opacity-85 hover:scale-105'"
          :style="{ backgroundColor: color }"
          :aria-label="`${messages.doodlePenColors} ${color}`"
          :aria-pressed="!isEraser && selectedColor === color"
          @click="selectColor(color)"
        />
      </div>

      <!-- Brush sizes -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="(label, idx) in messages.doodleBrushSizes"
          :key="label"
          type="button"
          class="stamp-btn rounded-lg px-2.5 py-1 text-xs font-bold"
          :class="selectedSizeIdx === idx ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
          :aria-pressed="selectedSizeIdx === idx"
          @click="selectedSizeIdx = idx"
        >
          {{ label }}
        </button>
      </div>

      <!-- Eraser / Undo / Clear -->
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="stamp-btn rounded-lg px-2.5 py-1 text-xs font-bold"
          :class="isEraser ? 'bg-pen-blue text-white' : 'bg-card text-ink'"
          :aria-pressed="isEraser"
          @click="isEraser = !isEraser"
        >
          {{ messages.doodleEraser }}
        </button>
        <button
          type="button"
          class="stamp-btn rounded-lg bg-card px-2.5 py-1 text-xs font-bold text-ink"
          :disabled="historyCount === 0"
          @click="handleUndo"
        >
          {{ messages.doodleUndo }}
        </button>
        <button
          type="button"
          class="stamp-btn rounded-lg bg-card px-2.5 py-1 text-xs font-bold text-coral"
          @click="handleClear"
        >
          {{ messages.doodleClear }}
        </button>
      </div>
    </div>
  </section>
</template>
