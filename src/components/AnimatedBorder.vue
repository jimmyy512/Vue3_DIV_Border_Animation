<template>
  <!-- overflow:hidden 防止 canvas 超出觸發水平 scroll -->
  <div class="overflow-hidden" :style="{ width: width, height: height }">
    <div class="animated-border-container relative group">
      <!-- 內容槽位 -->
      <div class="absolute inset-0 z-10 flex items-center justify-center">
        <slot></slot>
      </div>
      <!-- 畫布 -->
      <canvas ref="canvasRef" class="absolute pointer-events-none"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, watch, nextTick } from "vue";

export interface AnimatedBorderProps {
  width?: string;
  height?: string;
  pathData?: string;
  viewBox?: { x: number; y: number; w: number; h: number };
  dashRatio?: number;
  duration?: number;
  baseColor?: string;
  lineColor1?: string;
  lineColor2?: string;
  showOpposite?: boolean;
  lineWidth?: number;
  borderRadius?: number;
}

const props = withDefaults(defineProps<AnimatedBorderProps>(), {
  width: "100%",
  height: "100%",
  viewBox: () => ({ x: 0, y: 0, w: 100, h: 100 }),
  /** 走線比例 */
  dashRatio: 0.25,
  /** 旋轉時間(秒) */
  duration: 5,
  /** 底色 */
  baseColor: "#6c6c6c",
  /** 走線顏色 1 */
  lineColor1: "#ffffff",
  /** 走線顏色 2 */
  lineColor2: "#9ca3af",
  /** 是否顯示對角走線 */
  showOpposite: true,
  /** 線條粗細 */
  lineWidth: 3,
  borderRadius: 8,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const padding = 24;
const FPS_LIMIT = 60;
const fpsInterval = 1000 / FPS_LIMIT;

let animationFrameId: number;
let offset = 0;
let lastDrawTime = performance.now();

const resize = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 抓 container 的父層 (wrapper) 的尺寸，避免 canvas 超出影響 scroll
  const container = canvas.parentElement;
  const wrapper = container?.parentElement;
  const sizeSource = wrapper ?? container;
  if (sizeSource) {
    const rect = sizeSource.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width + padding * 2) * dpr;
    canvas.height = (rect.height + padding * 2) * dpr;
    canvas.style.width = `${rect.width + padding * 2}px`;
    canvas.style.height = `${rect.height + padding * 2}px`;
    canvas.style.top = `-${padding}px`;
    canvas.style.left = `-${padding}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
};

onMounted(() => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let totalLength = 0;
  let path2D: Path2D | null = null;

  const initPath = () => {
    if (props.pathData) {
      path2D = new Path2D(props.pathData);
      const svgNS = "http://www.w3.org/2000/svg";
      const tempSvg = document.createElementNS(svgNS, "svg");
      const tempPath = document.createElementNS(svgNS, "path");
      tempPath.setAttribute("d", props.pathData);
      tempSvg.appendChild(tempPath);
      document.body.appendChild(tempSvg);
      totalLength = tempPath.getTotalLength();
      document.body.removeChild(tempSvg);
    } else {
      path2D = null;
      totalLength = 0;
    }
  };

  const draw = (currentTime: number) => {
    animationFrameId = requestAnimationFrame(draw);
    const elapsed = currentTime - lastDrawTime;
    if (elapsed < fpsInterval) return;
    lastDrawTime = currentTime - (elapsed % fpsInterval);

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawW = w - padding * 2;
    const drawH = h - padding * 2;
    if (drawW <= 0 || drawH <= 0) return;

    ctx.save();
    ctx.translate(padding, padding);

    if (path2D) {
      const scaleX = drawW / props.viewBox.w;
      const scaleY = drawH / props.viewBox.h;
      ctx.scale(scaleX, scaleY);
      ctx.translate(-props.viewBox.x, -props.viewBox.y);
    }

    const r = props.borderRadius;
    const rectPerimeter = 2 * (drawW + drawH) + r * (2 * Math.PI - 8);
    const currentPerimeter = props.pathData ? totalLength : rectPerimeter;

    const speedPerMs = currentPerimeter / (props.duration * 1000);
    offset = (offset + speedPerMs * elapsed) % currentPerimeter;
    const dashLength = currentPerimeter * props.dashRatio;

    // 1. 底色
    ctx.save();
    ctx.strokeStyle = props.baseColor;
    ctx.lineWidth = props.pathData ? props.lineWidth / (drawW / props.viewBox.w) : props.lineWidth;
    if (path2D) {
      ctx.stroke(path2D);
    } else {
      ctx.beginPath();
      ctx.roundRect(0, 0, drawW, drawH, r);
      ctx.stroke();
    }
    ctx.restore();

    // 2. 走線
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, drawW, drawH);
    gradient.addColorStop(0, props.lineColor1);
    gradient.addColorStop(1, props.lineColor2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = props.pathData ? props.lineWidth / (drawW / props.viewBox.w) : props.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([dashLength, currentPerimeter - dashLength]);

    ctx.lineDashOffset = -offset;
    if (path2D) {
      ctx.stroke(path2D);
    } else {
      ctx.beginPath();
      ctx.roundRect(0, 0, drawW, drawH, r);
      ctx.stroke();
    }

    if (props.showOpposite) {
      ctx.lineDashOffset = -offset - currentPerimeter / 2;
      if (path2D) {
        ctx.stroke(path2D);
      } else {
        ctx.beginPath();
        ctx.roundRect(0, 0, drawW, drawH, r);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.restore();
  };

  initPath();
  window.addEventListener("resize", resize);
  resize();
  animationFrameId = requestAnimationFrame(draw);

  watch(() => props.pathData, initPath);
  // 確保寬高調整時, canvas 尺寸也要跟著改變
  watch([() => props.width, () => props.height], async () => {
    await nextTick();
    resize();
  });
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", resize);
});
</script>

<style lang="scss" scoped>
/* 內層 container：撐滿 wrapper，canvas 在此之上定位 */
.animated-border-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
