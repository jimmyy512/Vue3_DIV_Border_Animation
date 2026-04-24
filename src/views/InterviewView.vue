<template>
  <div
    id="InterviewView"
    class="min-h-screen bg-slate-950 flex flex-wrap items-center justify-center p-10 gap-8"
  >
    <!-- 範例 1: 圓角長方形 -->
    <div class="relative w-80 h-48 group">
      <div class="absolute inset-0 flex items-center justify-center text-white font-medium z-10">
        <div class="text-center">
          <h3 class="text-xl font-bold tracking-wider text-cyan-400">RECT PATH</h3>
        </div>
      </div>
      <canvas ref="canvasRectRef" class="absolute pointer-events-none"></canvas>
    </div>

    <!-- 範例 2: 心型路徑 (從 SVG 讀取) -->
    <div class="relative w-48 h-48 group">
      <div class="absolute inset-0 flex items-center justify-center text-white font-medium z-10">
        <div class="text-center">
          <h3 class="text-xl font-bold tracking-wider text-rose-400">HEART PATH</h3>
        </div>
      </div>
      <canvas ref="canvasHeartRef" class="absolute pointer-events-none"></canvas>
    </div>

    <!-- 測試按鈕：模擬未來可能的多實例需求 -->
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2">
      <button @click="showMany = !showMany" class="custom-btn">
        {{ showMany ? "顯示單個" : "模擬 100 個實例" }}
      </button>
    </div>

    <!-- 模擬 100 個實例的容器 (僅示範) -->
    <div
      v-if="showMany"
      class="fixed inset-0 bg-slate-950 overflow-auto p-10 flex flex-wrap gap-4 z-50"
    >
      <div v-for="i in 100" :key="i" class="relative w-40 h-24 bg-slate-900 rounded-[20px]">
        <canvas-border-item :type="i % 2 === 0 ? 'rect' : 'heart'" />
        <div class="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500">
          {{ i % 2 === 0 ? "Rect" : "Heart" }} {{ i }}
        </div>
      </div>
      <button
        @click="showMany = false"
        class="fixed top-5 right-5 bg-white/10 hover:bg-white/20 text-white w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all z-[60]"
      >
        <div class="i-carbon-close text-2xl">✕</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, defineComponent, h } from "vue";

const canvasRectRef = ref<HTMLCanvasElement | null>(null);
const canvasHeartRef = ref<HTMLCanvasElement | null>(null);
const showMany = ref(false);

const HEART_VIEWBOX = { x: -10, y: -10, w: 110, h: 110 };
const HEART_PATH =
  "M82.83,40.33c-5.51,8.07-22.28,24.26-38.4,30.87-16.13-6.61-32.9-22.79-38.4-30.87C1.9,34.28-.37,27.84.05,20.67.42,14.44,3.8,8.43,9.07,4.6,14.35.77,21.44-.81,28,.4c7,1.29,13.22,5.77,16.43,11.7C47.63,6.17,53.85,1.68,60.86.4c6.56-1.21,13.65.37,18.93,4.2,5.28,3.83,8.65,9.85,9.02,16.07.43,7.17-1.85,13.61-5.98,19.66Z";

const initAnimation = (
  canvas: HTMLCanvasElement,
  pathData?: string,
  viewBox = { x: 0, y: 0, w: 100, h: 100 },
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let animationFrameId: number;
  let offset = 0;
  const padding = 24;

  // 如果有 pathData，預先計算長度
  let totalLength = 0;
  let path2D: Path2D | null = null;

  if (pathData) {
    path2D = new Path2D(pathData);
    // 透過隱藏的 SVG 元素獲取路徑總長度，用於 setLineDash
    const svgNS = "http://www.w3.org/2000/svg";
    const tempSvg = document.createElementNS(svgNS, "svg");
    const tempPath = document.createElementNS(svgNS, "path");
    tempPath.setAttribute("d", pathData);
    tempSvg.appendChild(tempPath);
    document.body.appendChild(tempSvg);
    totalLength = tempPath.getTotalLength();
    document.body.removeChild(tempSvg);
  }

  const draw = () => {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const lineWidth = 3;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawW = w - padding * 2;
    const drawH = h - padding * 2;

    if (drawW <= 0 || drawH <= 0) return;

    ctx.save();
    // 平移到 padding 位置
    ctx.translate(padding, padding);

    // 如果是路徑模式，需要計算縮放比例
    if (path2D) {
      const scaleX = drawW / viewBox.w;
      const scaleY = drawH / viewBox.h;
      ctx.scale(scaleX, scaleY);
      ctx.translate(-viewBox.x, -viewBox.y);
    }

    const r = 30; // 圓角半徑
    // 關鍵修正：精確計算圓角長方形的周長
    // 公式：2 * (w + h) + r * (2 * Math.PI - 8)
    const rectPerimeter = 2 * (drawW + drawH) + r * (2 * Math.PI - 8);
    const currentPerimeter = pathData ? totalLength : rectPerimeter;
    const dashLength = currentPerimeter * 0.25; // 增加長度感

    // * 繪製範圍
    ctx.save();
    ctx.strokeStyle = "rgba(108, 108, 108, 1)";
    ctx.lineWidth = pathData ? lineWidth / (drawW / viewBox.w) : lineWidth;
    if (path2D) {
      ctx.stroke(path2D);
    } else {
      ctx.roundRect(0, 0, drawW, drawH, r);
      ctx.stroke();
    }
    ctx.restore();

    // * 繪製走線
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, drawW, drawH);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#9ca3af");
    ctx.strokeStyle = gradient;

    ctx.lineWidth = pathData ? lineWidth / (drawW / viewBox.w) : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 關鍵修正：[線段長度, 間距] 的總和必須等於周長，才能達到完美無縫循環
    ctx.setLineDash([dashLength, currentPerimeter - dashLength]);
    ctx.lineDashOffset = -offset;

    if (path2D) {
      ctx.stroke(path2D);
    } else {
      ctx.beginPath();
      ctx.roundRect(0, 0, drawW, drawH, 30);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();

    // 使用穩定步進
    offset = (offset + currentPerimeter / 300) % currentPerimeter;
    animationFrameId = requestAnimationFrame(draw);
  };

  const resize = () => {
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      const dpr = window.devicePixelRatio || 1;
      const actualWidth = rect.width + padding * 2;
      const actualHeight = rect.height + padding * 2;

      canvas.width = actualWidth * dpr;
      canvas.height = actualHeight * dpr;
      canvas.style.width = `${actualWidth}px`;
      canvas.style.height = `${actualHeight}px`;
      canvas.style.top = `-${padding}px`;
      canvas.style.left = `-${padding}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
  };

  window.addEventListener("resize", resize);
  resize();
  draw();

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener("resize", resize);
  };
};

// 為了示範 100 個實例，建立一個內部的小組件
const CanvasBorderItem = defineComponent({
  props: ["type"],
  setup(props) {
    const el = ref<HTMLCanvasElement | null>(null);
    let cleanup: (() => void) | undefined;

    onMounted(() => {
      if (el.value) {
        if (props.type === "heart") {
          cleanup = initAnimation(el.value, HEART_PATH, HEART_VIEWBOX);
        } else {
          cleanup = initAnimation(el.value);
        }
      }
    });

    onUnmounted(() => cleanup?.());

    return () => h("canvas", { ref: el, class: "absolute pointer-events-none" });
  },
});

onMounted(() => {
  let cleanup1: (() => void) | undefined;
  let cleanup2: (() => void) | undefined;

  if (canvasRectRef.value) {
    cleanup1 = initAnimation(canvasRectRef.value);
  }
  if (canvasHeartRef.value) {
    cleanup2 = initAnimation(canvasHeartRef.value, HEART_PATH, HEART_VIEWBOX);
  }

  onUnmounted(() => {
    cleanup1?.();
    cleanup2?.();
  });
});
</script>

<style lang="scss" scoped>
#InterviewView {
  font-family: "Outfit", sans-serif;
  perspective: 1000px;
}
</style>
