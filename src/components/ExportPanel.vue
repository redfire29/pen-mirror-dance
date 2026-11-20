<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { StudioMessages } from '../i18n/messages';
import { exportDancingGif } from '../lib/gifExporter';
import type {
  AspectRatioMode,
  ExportOptions,
  ExportSizePreset,
  GifExportResult,
  StudioParams,
} from '../types/studio';

const props = defineProps<{
  source: HTMLImageElement | HTMLCanvasElement | null;
  params: StudioParams;
  messages: StudioMessages;
}>();

const emit = defineEmits<{
  (e: 'update:params', value: StudioParams): void;
}>();

const SIZE_PRESETS: ExportSizePreset[] = [256, 480, 640];

const exportOptions = ref<ExportOptions>({
  size: 480,
  fps: 20,
});

const isExporting = ref(false);
const progress = ref(0);
const exportError = ref<string | null>(null);
const exportResult = ref<GifExportResult | null>(null);
const canNativeShare = ref(false);

let abortController: AbortController | null = null;

const formattedSize = computed(() => {
  if (!exportResult.value) return '';
  const bytes = exportResult.value.blob.size;
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
});

function setAspect(aspect: AspectRatioMode) {
  emit('update:params', { ...props.params, aspect });
}

function setSize(size: ExportSizePreset) {
  exportOptions.value.size = size;
}

function revokePreviousResult() {
  if (exportResult.value?.url) {
    URL.revokeObjectURL(exportResult.value.url);
  }
  exportResult.value = null;
}

async function handleExport() {
  if (!props.source || isExporting.value) return;

  exportError.value = null;
  isExporting.value = true;
  progress.value = 2;
  abortController = new AbortController();

  try {
    const res = await exportDancingGif({
      source: props.source,
      params: { ...props.params },
      exportOptions: { ...exportOptions.value },
      onProgress: (p) => {
        progress.value = p;
      },
      signal: abortController.signal,
    });

    revokePreviousResult();
    const url = URL.createObjectURL(res.blob);
    exportResult.value = {
      ...res,
      url,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
      const testFile = new File([res.blob], 'wigglemirror-dance.gif', {
        type: 'image/gif',
      });
      canNativeShare.value = navigator.canShare({ files: [testFile] });
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // Cancelled intentionally by user
    } else {
      console.error('GIF export failed:', err);
      exportError.value = props.messages.errors.exportFailed;
    }
  } finally {
    isExporting.value = false;
    abortController = null;
  }
}

function handleCancel() {
  abortController?.abort();
}

async function handleShare() {
  if (!exportResult.value) return;
  const file = new File([exportResult.value.blob], 'wigglemirror-dance.gif', {
    type: 'image/gif',
  });
  try {
    await navigator.share({
      files: [file],
      title: props.messages.brandTitle,
    });
  } catch {
    // Ignore user cancellation
  }
}

onMounted(() => {
  canNativeShare.value =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';
});

onUnmounted(() => {
  abortController?.abort();
  revokePreviousResult();
});
</script>

<template>
  <section class="sketch-card p-4 sm:p-5 space-y-4">
    <div>
      <h2 class="font-display text-base sm:text-lg font-bold text-ink">
        {{ messages.exportTitle }}
      </h2>
      <p class="text-xs text-ink-muted">
        {{ messages.exportSubtitle }}
      </p>
    </div>

    <!-- Aspect (Synced with Stage) & Size Options -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <div class="mb-1.5 text-xs font-bold text-ink-muted">
          {{ messages.aspectLabel }}
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="stamp-btn rounded-lg px-2 py-2 text-xs font-bold"
            :class="params.aspect === 'square' ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
            :aria-pressed="params.aspect === 'square'"
            @click="setAspect('square')"
          >
            {{ messages.aspectSquare }}
          </button>
          <button
            type="button"
            class="stamp-btn rounded-lg px-2 py-2 text-xs font-bold"
            :class="params.aspect === 'portrait' ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
            :aria-pressed="params.aspect === 'portrait'"
            @click="setAspect('portrait')"
          >
            {{ messages.aspectPortrait }}
          </button>
        </div>
      </div>

      <div>
        <div class="mb-1.5 text-xs font-bold text-ink-muted">
          {{ messages.sizeLabel }}
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="sz in SIZE_PRESETS"
            :key="sz"
            type="button"
            class="stamp-btn flex flex-col items-center rounded-lg px-1.5 py-1.5"
            :class="exportOptions.size === sz ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
            :aria-pressed="exportOptions.size === sz"
            @click="setSize(sz)"
          >
            <span class="font-mono text-xs font-bold">
              {{ messages.sizeLabels[sz].title }}
            </span>
            <span class="text-[10px] text-ink-muted">
              {{ messages.sizeLabels[sz].tag }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Primary Export Button / Progress -->
    <div class="space-y-2">
      <button
        v-if="!isExporting"
        type="button"
        class="stamp-btn flex w-full items-center justify-center gap-2 rounded-xl bg-coral hover:bg-coral-hover px-4 py-3 font-display text-base font-bold text-white"
        :disabled="!source"
        @click="handleExport"
      >
        <span>{{ messages.exportActionBtn }}</span>
      </button>

      <div
        v-else
        class="rounded-xl border-2 border-ink bg-paper p-3 space-y-2"
      >
        <div class="flex items-center justify-between gap-2 text-xs font-bold">
          <span>{{ messages.exportingText }}</span>
          <span class="font-mono">{{ progress }}%</span>
        </div>
        <div class="h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-card">
          <div
            class="h-full bg-coral transition-[width] duration-150"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            class="text-xs font-bold text-ink-muted underline hover:text-coral"
            @click="handleCancel"
          >
            {{ messages.cancelExportBtn }}
          </button>
        </div>
      </div>

      <p
        v-if="exportError"
        class="rounded-lg border-2 border-coral bg-coral/10 px-3 py-2 text-xs font-bold text-coral"
        role="alert"
      >
        {{ exportError }}
      </p>
    </div>

    <!-- Export Result Preview & Download -->
    <div
      v-if="exportResult"
      class="rounded-2xl border-2 border-ink bg-paper-deep/55 p-3.5 space-y-3"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="font-display text-sm font-bold text-ink">
          {{ messages.exportReadyTitle }}
        </span>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3.5">
        <div
          class="w-32 h-32 shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-card flex items-center justify-center"
        >
          <img
            :src="exportResult.url"
            alt="Generated dancing GIF preview"
            class="max-h-full max-w-full object-contain"
          />
        </div>

        <div class="flex-1 min-w-0 space-y-2.5 text-center sm:text-left">
          <p class="font-mono text-xs font-bold text-ink-muted">
            {{
              messages.fileMeta(
                formattedSize,
                exportResult.width,
                exportResult.height,
                exportResult.frameCount
              )
            }}
          </p>

          <div class="flex flex-wrap justify-center sm:justify-start gap-2">
            <a
              :href="exportResult.url"
              download="wigglemirror-dance.gif"
              class="stamp-btn inline-flex items-center gap-1.5 rounded-xl bg-mint px-4 py-2 text-xs sm:text-sm font-bold text-white"
            >
              <span>{{ messages.downloadGifBtn }}</span>
            </a>

            <button
              v-if="canNativeShare"
              type="button"
              class="stamp-btn inline-flex items-center gap-1.5 rounded-xl bg-card px-3.5 py-2 text-xs sm:text-sm font-bold text-ink"
              @click="handleShare"
            >
              <span>{{ messages.shareGifBtn }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
