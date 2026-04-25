<template>
  <div id="InterviewView" class="min-h-screen bg-slate-950 flex flex-col items-center p-10px gap-8">
    <!-- 控制面板 -->
    <div
      class="bg-slate-900/50 p-20px rounded-2xl border border-white/10 backdrop-blur-xl flex flex-wrap max-w-4xl w-full"
      style="--gap: 1.5rem; gap: var(--gap)"
    >
      <div class="control-item control-item-mobile-half">
        <label>走線比例 ({{ (config.dashRatio * 100).toFixed(0) }}%)</label>
        <input type="range" v-model.number="config.dashRatio" min="0.05" max="0.5" step="0.01" />
      </div>

      <!-- 旋轉速度調整 (秒/圈) -->
      <div class="control-item control-item-mobile-half">
        <label>旋轉速度 ({{ config.duration }} 秒/圈)</label>
        <input type="range" v-model.number="config.duration" min="1" max="10" step="0.5" />
      </div>

      <div class="control-item control-item-mobile-half">
        <label>線條粗細 ({{ config.lineWidth }}px)</label>
        <input type="range" v-model.number="config.lineWidth" min="1" max="10" step="1" />
      </div>

      <div class="control-item control-item-mobile-half">
        <label>圓角大小 ({{ config.borderRadius }}px)</label>
        <input type="range" v-model.number="config.borderRadius" min="0" max="100" step="1" />
      </div>

      <div class="control-item">
        <label>範圍線條顏色</label>
        <input type="color" v-model="config.baseColor" />
      </div>

      <div class="control-item">
        <label>走線顏色 1</label>
        <input type="color" v-model="config.lineColor1" />
      </div>

      <div class="control-item">
        <label>走線顏色 2</label>
        <input type="color" v-model="config.lineColor2" />
      </div>

      <div class="control-item center">
        <label>對角走線</label>
        <input
          type="checkbox"
          v-model="config.showOpposite"
          class="w-6 h-6 accent-cyan-500 rounded cursor-pointer"
        />
      </div>
      <div class="control-item center">
        <label>顯示動畫</label>
        <input
          type="checkbox"
          v-model="config.showAnimation"
          class="w-6 h-6 accent-cyan-500 rounded cursor-pointer"
        />
      </div>

      <div class="flex items-end pb-1">
        <button @click="resetConfig" class="reset-btn">重設設定</button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-20px mb-100px">
      <AnimatedBorder width="280px" height="150px" v-bind="config">
        <div class="text-center">
          <h3 class="text-xl font-bold tracking-wider text-cyan-400">RECT</h3>
        </div>
      </AnimatedBorder>

      <AnimatedBorder
        width="192px"
        height="192px"
        v-bind="config"
        :pathData="Heart.path"
        :viewBox="Heart.viewBox"
      >
        <div class="text-center">
          <h3 class="text-xl font-bold tracking-wider text-rose-400">HEART</h3>
        </div>
      </AnimatedBorder>

      <AnimatedBorder
        width="160px"
        height="160px"
        v-bind="{
          ...config,
          borderRadius: 100,
        }"
      >
        <!-- 如果圖片本身自帶透明白邊，可以加上例如 scale-[1.5] 來放大對齊 -->
        <div class="flex items-center justify-center w-full h-full">
          <img
            src="@/assets/IG_Logo.webp"
            alt="IG Logo"
            class="w-full h-full object-contain scale-[1.62]"
          />
        </div>
      </AnimatedBorder>
    </div>

    <div class="fixed w-full bottom-10 left-1/2 -translate-x-1/2 flex justify-center">
      <button @click="showMany = !showMany" class="custom-btn">
        {{ showMany ? "顯示單個" : "多個實例" }}
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
          :pathData="i % 2 === 0 ? undefined : Heart.path"
          :viewBox="i % 2 === 0 ? undefined : Heart.viewBox"
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
import Heart from "@/components/SVG_Icon/Heart";

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
  showAnimation: true,
};

const config = useStorage("border-animation-settings", { ...defaultConfig });

const resetConfig = () => {
  config.value = { ...defaultConfig };
};
</script>

<style lang="scss" scoped>
#InterviewView {
  font-family: "Outfit", sans-serif;
  perspective: 1000px;

  .control-item {
    @apply flex flex-col gap-2;

    label {
      @apply text-xs text-slate-400 font-bold uppercase tracking-widest;
    }

    &.center {
      @apply items-center text-center;
    }
  }

  .control-item-mobile-half {
    @apply max-sm:w-[calc(50%-var(--gap)/2)];
  }

  .reset-btn {
    @apply text-[10px] text-slate-500 p-x-10px p-y-5px font-bold cursor-pointer;
  }

  input[type="range"] {
    @apply h-1.5 rounded-lg appearance-none bg-slate-800 border-none outline-none accent-cyan-500;
    &::-webkit-slider-thumb {
      @apply appearance-none w-4 h-4 rounded-full bg-cyan-500 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.5)];
    }
  }

  input[type="color"] {
    @apply w-20 h-8 rounded bg-transparent border-none cursor-pointer;
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
}
</style>
