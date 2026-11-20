<script setup lang="ts">
import type { StudioMessages } from '../i18n/messages';
import {
  BLEND_MODES,
  DANCE_PRESETS,
  PAPER_STYLES,
  PROP_STYLES,
  getPresetConfig,
} from '../lib/presets';
import type {
  BlendMode,
  DancePresetId,
  PaperStyle,
  PropStyle,
  StudioParams,
} from '../types/studio';

const props = defineProps<{
  params: StudioParams;
  messages: StudioMessages;
}>();

const emit = defineEmits<{
  (e: 'update:params', value: StudioParams): void;
}>();

function updateField<K extends keyof StudioParams>(key: K, value: StudioParams[K]) {
  emit('update:params', {
    ...props.params,
    [key]: value,
  });
}

function selectPreset(id: DancePresetId) {
  const cfg = getPresetConfig(id);
  emit('update:params', {
    ...props.params,
    preset: id,
    ...cfg.defaults,
  });
}

function resetPresetDefaults() {
  const cfg = getPresetConfig(props.params.preset);
  emit('update:params', {
    ...props.params,
    ...cfg.defaults,
    scale: 0.95,
  });
}

function selectProp(prop: PropStyle) {
  updateField('propStyle', prop);
}

function selectPaper(paper: PaperStyle) {
  updateField('paperStyle', paper);
}

function selectBlend(blend: BlendMode) {
  updateField('blendMode', blend);
}

function formatPct(val: number): string {
  return `${Math.round(val * 100)}%`;
}
</script>

<template>
  <section class="sketch-card p-4 sm:p-5 space-y-5">
    <!-- 5 Physics Bounce Presets -->
    <div>
      <div class="mb-2.5 flex items-center justify-between gap-2">
        <h2 class="font-display text-base sm:text-lg font-bold text-ink">
          {{ messages.presetsTitle }}
        </h2>
        <button
          type="button"
          class="text-xs font-bold text-pen-blue underline decoration-2 underline-offset-2 hover:text-coral"
          @click="resetPresetDefaults"
        >
          {{ messages.resetDefaultsBtn }}
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="preset in DANCE_PRESETS"
          :key="preset.id"
          type="button"
          class="stamp-btn flex flex-col items-start rounded-xl p-2.5 text-left"
          :class="params.preset === preset.id ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
          :aria-pressed="params.preset === preset.id"
          @click="selectPreset(preset.id)"
        >
          <div class="flex w-full items-center justify-between gap-1">
            <span class="text-xs sm:text-sm font-bold leading-tight">
              {{ messages.presets[preset.id].name }}
            </span>
            <svg
              class="h-4 w-4 shrink-0 text-ink"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path v-if="preset.id === 'parallel'" d="M5 12h14M8 8l-3 4 3 4M16 8l3 4-3 4" />
              <path v-else-if="preset.id === 'uhop'" d="M4 8c3 10 13 10 16 0" />
              <path v-else-if="preset.id === 'hyper'" d="M4 14l4-7 4 9 4-9 4 7" />
              <ellipse v-else-if="preset.id === 'orbit'" cx="12" cy="12" rx="8" ry="4.5" />
              <path v-else d="M4 17h16M7 13l-3 4 3 4M17 13l3 4-3 4" />
            </svg>
          </div>
          <span class="mt-1 text-[11px] leading-snug text-ink-muted">
            {{ messages.presets[preset.id].desc }}
          </span>
        </button>
      </div>
    </div>

    <!-- Core Physics & Optical Sliders -->
    <div class="space-y-3 border-t-2 border-dashed border-ink/20 pt-4">
      <div>
        <div class="flex items-center justify-between text-xs font-bold">
          <label for="slider-speed">{{ messages.sliders.speed }}</label>
          <span class="font-mono text-ink-muted">{{ formatPct(params.speed) }}</span>
        </div>
        <input
          id="slider-speed"
          type="range"
          min="0.25"
          max="1"
          step="0.01"
          class="sketch-slider"
          :value="params.speed"
          @input="updateField('speed', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div>
        <div class="flex items-center justify-between text-xs font-bold">
          <label for="slider-amplitude">{{ messages.sliders.amplitude }}</label>
          <span class="font-mono text-ink-muted">{{ formatPct(params.amplitude) }}</span>
        </div>
        <input
          id="slider-amplitude"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="sketch-slider"
          :value="params.amplitude"
          @input="updateField('amplitude', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div>
        <div class="flex items-center justify-between text-xs font-bold">
          <label for="slider-depth-amp">{{ messages.sliders.depthAmplitude }}</label>
          <span class="font-mono text-ink-muted">{{ formatPct(params.depthAmplitude) }}</span>
        </div>
        <input
          id="slider-depth-amp"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="sketch-slider"
          :value="params.depthAmplitude"
          @input="updateField('depthAmplitude', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div>
        <div class="flex items-center justify-between text-xs font-bold">
          <label for="slider-distance">{{ messages.sliders.distance }}</label>
          <span class="font-mono text-ink-muted">{{ formatPct(params.distance) }}</span>
        </div>
        <input
          id="slider-distance"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="sketch-slider"
          :value="params.distance"
          @input="updateField('distance', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div>
        <div class="flex items-center justify-between text-xs font-bold">
          <label for="slider-gloss">{{ messages.sliders.gloss }}</label>
          <span class="font-mono text-ink-muted">{{ formatPct(params.gloss) }}</span>
        </div>
        <input
          id="slider-gloss"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="sketch-slider"
          :value="params.gloss"
          @input="updateField('gloss', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div>
        <div class="flex items-center justify-between text-xs font-bold">
          <label for="slider-scale">{{ messages.sliders.scale }}</label>
          <span class="font-mono text-ink-muted">{{ formatPct(params.scale) }}</span>
        </div>
        <input
          id="slider-scale"
          type="range"
          min="0.55"
          max="1.35"
          step="0.01"
          class="sketch-slider"
          :value="params.scale"
          @input="updateField('scale', Number(($event.target as HTMLInputElement).value))"
        />
      </div>
    </div>

    <!-- Reflective Prop & Paper Style -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-dashed border-ink/20 pt-4">
      <div>
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
          {{ messages.propTitle }}
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="prop in PROP_STYLES"
            :key="prop"
            type="button"
            class="stamp-btn rounded-lg px-2.5 py-1.5 text-xs font-bold"
            :class="params.propStyle === prop ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
            :aria-pressed="params.propStyle === prop"
            @click="selectProp(prop)"
          >
            {{ messages.props[prop] }}
          </button>
        </div>
      </div>

      <div>
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
          {{ messages.paperTitle }}
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="paper in PAPER_STYLES"
            :key="paper"
            type="button"
            class="stamp-btn rounded-lg px-2.5 py-1.5 text-xs font-bold"
            :class="params.paperStyle === paper ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
            :aria-pressed="params.paperStyle === paper"
            @click="selectPaper(paper)"
          >
            {{ messages.papers[paper] }}
          </button>
        </div>
      </div>
    </div>

    <!-- Paper Blend Mode & Photo Ink Boost -->
    <div class="space-y-3 border-t-2 border-dashed border-ink/20 pt-4">
      <div>
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
          {{ messages.blendTitle }}
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="mode in BLEND_MODES"
            :key="mode"
            type="button"
            class="stamp-btn flex flex-col items-start rounded-xl px-3 py-2 text-left"
            :class="params.blendMode === mode ? 'bg-highlighter text-ink' : 'bg-card text-ink'"
            :aria-pressed="params.blendMode === mode"
            @click="selectBlend(mode)"
          >
            <span class="text-xs font-bold">{{ messages.blends[mode].title }}</span>
            <span class="mt-0.5 text-[11px] leading-snug text-ink-muted">
              {{ messages.blends[mode].desc }}
            </span>
          </button>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        :aria-checked="params.inkEnhance"
        class="stamp-btn flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left"
        :class="params.inkEnhance ? 'bg-highlighter/70' : 'bg-paper'"
        @click="updateField('inkEnhance', !params.inkEnhance)"
      >
        <div class="min-w-0">
          <div class="text-xs sm:text-sm font-bold text-ink">
            {{ messages.inkEnhanceTitle }}
          </div>
          <p class="mt-0.5 text-[11px] leading-snug text-ink-muted">
            {{ messages.inkEnhanceDesc }}
          </p>
        </div>
        <span
          class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-ink transition-colors"
          :class="params.inkEnhance ? 'bg-mint' : 'bg-card'"
          aria-hidden="true"
        >
          <span
            class="inline-block h-4 w-4 rounded-full border border-ink bg-white transition-transform"
            :class="params.inkEnhance ? 'translate-x-5' : 'translate-x-0.5'"
          />
        </span>
      </button>
    </div>
  </section>
</template>
