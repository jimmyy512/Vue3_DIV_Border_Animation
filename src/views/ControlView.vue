<template>
  <div id="InterviewView" class="min-h-screen bg-slate-950 flex flex-col items-center p-10 gap-8">
    <!-- 控制面板 -->
    <div
      class="bg-slate-900/50 p-6 rounded-2xl border border-white/10 backdrop-blur-xl mb-8 flex flex-wrap gap-6 max-w-4xl w-full"
    >
      <div class="flex flex-col gap-2">
        <label class="text-xs text-slate-400 font-bold uppercase tracking-widest"
          >走線比例 ({{ (config.dashRatio * 100).toFixed(0) }}%)</label
        >
        <input
          type="range"
          v-model.number="config.dashRatio"
          min="0.05"
          max="0.5"
          step="0.01"
          class="w-40 accent-cyan-500"
        />
      </div>

      <!-- 旋轉速度調整 (秒/圈) -->
      <div class="flex flex-col gap-2">
        <label class="text-xs text-slate-400 font-bold uppercase tracking-widest"
          >旋轉速度 ({{ config.duration }} 秒/圈)</label
        >
        <input
          type="range"
          v-model.number="config.duration"
          min="1"
          max="10"
          step="0.5"
          class="w-32 accent-cyan-500"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs text-slate-400 font-bold uppercase tracking-widest"
          >範圍線條顏色</label
        >
        <input
          type="color"
          v-model="config.baseColor"
          class="w-20 h-8 rounded bg-transparent border-none cursor-pointer"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs text-slate-400 font-bold uppercase tracking-widest">走線顏色 1</label>
        <input
          type="color"
          v-model="config.lineColor1"
          class="w-20 h-8 rounded bg-transparent border-none cursor-pointer"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs text-slate-400 font-bold uppercase tracking-widest">走線顏色 2</label>
        <input
          type="color"
          v-model="config.lineColor2"
          class="w-20 h-8 rounded bg-transparent border-none cursor-pointer"
        />
      </div>

      <div class="flex flex-col gap-2 items-center">
        <label class="text-xs text-slate-400 font-bold uppercase tracking-widest text-center"
          >對角走線</label
        >
        <input
          type="checkbox"
          v-model="config.showOpposite"
          class="w-6 h-6 accent-cyan-500 rounded cursor-pointer"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs text-slate-400 font-bold uppercase tracking-widest"
          >線條粗細 ({{ config.lineWidth }}px)</label
        >
        <input
          type="range"
          v-model.number="config.lineWidth"
          min="1"
          max="10"
          step="1"
          class="w-32 accent-cyan-500"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs text-slate-400 font-bold uppercase tracking-widest"
          >圓角大小 ({{ config.borderRadius }}px)</label
        >
        <input
          type="range"
          v-model.number="config.borderRadius"
          min="0"
          max="100"
          step="1"
          class="w-32 accent-cyan-500"
        />
      </div>

      <div class="flex items-end pb-1">
        <button
          @click="resetConfig"
          class="text-[10px] text-slate-500 hover:text-white transition-colors underline underline-offset-4"
        >
          重設設定
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-8">
      <AnimatedBorder width="320px" height="192px" v-bind="config">
        <div class="text-center">
          <h3 class="text-xl font-bold tracking-wider text-cyan-400">RECT</h3>
        </div>
      </AnimatedBorder>

      <AnimatedBorder
        width="192px"
        height="192px"
        v-bind="config"
        :pathData="HEART_PATH"
        :viewBox="HEART_VIEWBOX"
      >
        <div class="text-center">
          <h3 class="text-xl font-bold tracking-wider text-rose-400">HEART</h3>
        </div>
      </AnimatedBorder>
    </div>

    <div class="fixed bottom-10 left-1/2 -translate-x-1/2">
      <button @click="showMany = !showMany" class="custom-btn">
        {{ showMany ? "顯示單個" : "模擬 100 個實例" }}
      </button>

      <button @click="$router.push({ name: 'main' })" class="ml-20px custom-btn">返回主頁</button>
    </div>

    <div
      v-if="showMany"
      class="fixed inset-0 bg-slate-950 overflow-auto p-10 flex flex-wrap gap-4 z-50"
    >
      <div v-for="i in 100" :key="i" class="w-40 h-24">
        <AnimatedBorder
          v-bind="config"
          :pathData="i % 2 === 0 ? undefined : HEART_PATH"
          :viewBox="i % 2 === 0 ? undefined : HEART_VIEWBOX"
        >
          <span class="text-[10px] text-slate-500"
            >{{ i % 2 === 0 ? "Rect" : "Heart" }} {{ i }}</span
          >
        </AnimatedBorder>
      </div>

      <button
        @click="showMany = false"
        class="fixed top-5 right-5 bg-white/10 hover:bg-white/20 text-white w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all z-[60]"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStorage } from "@vueuse/core";
import AnimatedBorder from "@/components/AnimatedBorder.vue";

const showMany = ref(false);

const defaultConfig = {
  dashRatio: 0.07,
  duration: 1,
  baseColor: "#6c6c6c",
  lineColor1: "#ffffff",
  lineColor2: "#9ca3af",
  showOpposite: true,
  lineWidth: 3,
  borderRadius: 8,
};

const config = useStorage("border-animation-settings", { ...defaultConfig });

const resetConfig = () => {
  config.value = { ...defaultConfig };
};

const HEART_VIEWBOX = { x: -10, y: -20, w: 110, h: 110 };
const HEART_PATH =
  "M82.83,40.33c-5.51,8.07-22.28,24.26-38.4,30.87-16.13-6.61-32.9-22.79-38.4-30.87C1.9,34.28-.37,27.84.05,20.67.42,14.44,3.8,8.43,9.07,4.6,14.35.77,21.44-.81,28,.4c7,1.29,13.22,5.77,16.43,11.7C47.63,6.17,53.85,1.68,60.86.4c6.56-1.21,13.65.37,18.93,4.2,5.28,3.83,8.65,9.85,9.02,16.07.43,7.17-1.85,13.61-5.98,19.66Z";
</script>

<style lang="scss" scoped>
#InterviewView {
  font-family: "Outfit", sans-serif;
  perspective: 1000px;
}

input[type="range"] {
  @apply h-1.5 rounded-lg appearance-none bg-slate-800 border-none outline-none;
  &::-webkit-slider-thumb {
    @apply appearance-none w-4 h-4 rounded-full bg-cyan-500 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.5)];
  }
}

input[type="color"] {
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
  }
}

.custom-btn {
  @apply px-8 py-3 rounded-full font-bold text-white transition-all duration-300;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #06b6d4;
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
    transform: translateY(-2px);
  }
}
</style>
