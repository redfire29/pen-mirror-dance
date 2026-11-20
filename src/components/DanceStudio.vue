<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import ControlPanel from './ControlPanel.vue';
import DoodlePad from './DoodlePad.vue';
import ExportPanel from './ExportPanel.vue';
import MirrorStage from './MirrorStage.vue';
import { MESSAGES } from '../i18n/messages';
import { createDefaultStudioParams } from '../lib/presets';
import {
  createSampleCanvas,
  generateAllSampleMetas,
  type SampleId,
} from '../lib/samples';
import type { Locale, SampleDoodleMeta, StudioParams } from '../types/studio';

const locale = ref<Locale>('zh-TW');
const messages = computed(() => MESSAGES[locale.value]);

const params = ref<StudioParams>(createDefaultStudioParams());
const activeSource = shallowRef<HTMLImageElement | HTMLCanvasElement | null>(null);
const activeSampleId = ref<SampleId | null>('cat');
const sampleMetas = ref<SampleDoodleMeta[]>([]);

const isDoodleOpen = ref(false);
const isMobileView = ref(false);
const statusError = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const mirrorStageRef = ref<InstanceType<typeof MirrorStage> | null>(null);

let loadedObjectUrl: string | null = null;
let mediaQueryList: MediaQueryList | null = null;

function toggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW';
}

function clearLoadedObjectUrl() {
  if (loadedObjectUrl) {
    URL.revokeObjectURL(loadedObjectUrl);
    loadedObjectUrl = null;
  }
}

function selectSample(id: SampleId) {
  statusError.value = null;
  clearLoadedObjectUrl();
  activeSampleId.value = id;
  activeSource.value = createSampleCanvas(id, 512);
  isDoodleOpen.value = false;
}

function loadImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    statusError.value = messages.value.errors.invalidFile;
    return;
  }
  statusError.value = null;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    clearLoadedObjectUrl();
    loadedObjectUrl = url;
    activeSampleId.value = null;
    activeSource.value = img;
    isDoodleOpen.value = false;
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    statusError.value = messages.value.errors.invalidFile;
  };
  img.src = url;
}

function handleFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    loadImageFile(file);
  }
  input.value = '';
}

function triggerUpload() {
  fileInputRef.value?.click();
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        e.preventDefault();
        loadImageFile(file);
        break;
      }
    }
  }
}

function handleDoodleUpdate(canvas: HTMLCanvasElement) {
  statusError.value = null;
  activeSampleId.value = null;
  if (activeSource.value !== canvas) {
    clearLoadedObjectUrl();
    activeSource.value = canvas;
  }
  mirrorStageRef.value?.notifySourceUpdated();
}

function toggleDoodleMode() {
  isDoodleOpen.value = !isDoodleOpen.value;
}

function handleWebglUnsupported() {
  statusError.value = messages.value.errors.webglUnsupported;
}

function handleMediaChange(e: MediaQueryListEvent) {
  isMobileView.value = e.matches;
}

onMounted(() => {
  sampleMetas.value = generateAllSampleMetas();
  activeSource.value = createSampleCanvas('cat', 512);

  if (typeof window !== 'undefined') {
    window.addEventListener('paste', handlePaste);
    mediaQueryList = window.matchMedia('(max-width: 1023px)');
    isMobileView.value = mediaQueryList.matches;
    mediaQueryList.addEventListener('change', handleMediaChange);
  }
});

onUnmounted(() => {
  clearLoadedObjectUrl();
  if (typeof window !== 'undefined') {
    window.removeEventListener('paste', handlePaste);
  }
  mediaQueryList?.removeEventListener('change', handleMediaChange);
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-3.5 py-4 sm:px-6 sm:py-6 space-y-5">
    <!-- Top Header -->
    <header class="sketch-card px-4 py-3.5 sm:px-6 sm:py-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-highlighter shadow-[2px_2px_0_#1B1D24]"
            aria-hidden="true"
          >
            <svg class="h-7 w-7" viewBox="0 0 32 32" fill="none">
              <path
                d="M11 6h10l-1.5 11.5c-.4 2.8-6.6 2.8-7 0L11 6z"
                fill="#E6EAF0"
                stroke="#1B1D24"
                stroke-width="2"
              />
              <path
                d="M13.5 13l1-3.5L16 11l1.5-1.5 1 3.5c0 2-1.2 3-2.5 3s-2.5-1-2.5-3z"
                fill="#FFFFFF"
                stroke="#1B1D24"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path d="M9 24.5h14" stroke="#1B1D24" stroke-width="1.6" stroke-linecap="round" opacity="0.45" />
            </svg>
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
                {{ messages.brandTitle }}
              </h1>
              <span
                class="rounded-full border-2 border-ink bg-coral px-2.5 py-0.5 text-[11px] font-bold text-white"
              >
                {{ messages.brandBadge }}
              </span>
            </div>
            <p class="mt-0.5 text-xs sm:text-sm text-ink-muted">
              {{ messages.brandSubtitle }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <span
            class="hidden md:inline-flex items-center rounded-full border border-ink/30 bg-paper px-3 py-1 text-[11px] font-bold text-ink-muted"
          >
            {{ messages.privacyNote }}
          </span>
          <button
            type="button"
            class="stamp-btn rounded-xl bg-card px-3.5 py-1.5 font-mono text-xs font-bold text-ink"
            @click="toggleLocale"
          >
            {{ messages.langSwitchLabel }}
          </button>
        </div>
      </div>
    </header>

    <!-- Source & Input Bar -->
    <section class="sketch-card px-4 py-3 sm:px-5 sm:py-3.5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="text-xs font-bold uppercase tracking-wider text-ink-muted">
            {{ messages.sourceBarTitle }}
          </span>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="sr-only"
            @change="handleFileInputChange"
          />

          <button
            type="button"
            class="stamp-btn inline-flex items-center gap-1.5 rounded-xl bg-coral hover:bg-coral-hover px-3.5 py-2 text-xs sm:text-sm font-bold text-white"
            @click="triggerUpload"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 14v1.5A1.5 1.5 0 005.5 17h9a1.5 1.5 0 001.5-1.5V14" />
            </svg>
            <span>{{ messages.uploadBtn }}</span>
          </button>

          <button
            type="button"
            class="stamp-btn inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold"
            :class="isDoodleOpen ? 'bg-pen-blue text-white' : 'bg-highlighter text-ink'"
            :aria-pressed="isDoodleOpen"
            @click="toggleDoodleMode"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z" />
            </svg>
            <span>{{ isDoodleOpen ? messages.doodleToggleOn : messages.doodleToggleOff }}</span>
          </button>

          <span class="hidden sm:inline text-xs text-ink-muted">
            {{ messages.pasteHint }}
          </span>
        </div>

        <!-- Built-in Sample Doodles -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-ink-muted">
            {{ messages.samplePrefix }}
          </span>
          <button
            v-for="sample in sampleMetas"
            :key="sample.id"
            type="button"
            class="stamp-btn inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold"
            :class="activeSampleId === sample.id && !isDoodleOpen ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
            :aria-pressed="activeSampleId === sample.id && !isDoodleOpen"
            @click="selectSample(sample.id)"
          >
            <img
              :src="sample.thumbDataUrl"
              :alt="messages.samples[sample.id]"
              class="h-6 w-6 rounded-md border border-ink/30 bg-white object-contain"
            />
            <span>{{ messages.samples[sample.id] }}</span>
          </button>
        </div>
      </div>

      <p
        v-if="statusError"
        class="mt-2.5 rounded-lg border-2 border-coral bg-coral/10 px-3 py-1.5 text-xs font-bold text-coral"
        role="alert"
      >
        {{ statusError }}
      </p>
    </section>

    <!-- Main Interactive Workspace (Single persistent MirrorStage & DoodlePad instances) -->
    <main class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <!-- 3D Mirror Stage -->
      <div
        :class="
          isDoodleOpen
            ? 'sticky top-2 z-30 lg:static lg:col-span-6 lg:order-2'
            : 'lg:col-span-5 lg:sticky lg:top-5 lg:order-1'
        "
      >
        <MirrorStage
          ref="mirrorStageRef"
          v-model:params="params"
          :source="activeSource"
          :messages="messages"
          :compact="isDoodleOpen && isMobileView"
          :show-finish-doodle="isDoodleOpen && isMobileView"
          @drop-file="loadImageFile"
          @finish-doodle="isDoodleOpen = false"
          @webgl-unsupported="handleWebglUnsupported"
        />
      </div>

      <!-- Doodle Pad (kept mounted with v-show so strokes & undo stack persist across toggles) -->
      <div v-show="isDoodleOpen" class="lg:col-span-6 lg:order-1">
        <DoodlePad
          :messages="messages"
          @update="handleDoodleUpdate"
        />
      </div>

      <!-- Controls & GIF Exporter -->
      <div
        :class="
          isDoodleOpen
            ? 'lg:col-span-12 lg:order-3 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
            : 'lg:col-span-7 lg:order-2 space-y-5'
        "
      >
        <div :class="isDoodleOpen ? 'lg:col-span-7' : ''">
          <ControlPanel v-model:params="params" :messages="messages" />
        </div>
        <div :class="isDoodleOpen ? 'lg:col-span-5' : ''">
          <ExportPanel
            v-model:params="params"
            :source="activeSource"
            :messages="messages"
          />
        </div>
      </div>
    </main>
  </div>
</template>
