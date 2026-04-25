<template>
  <!-- overflow:hidden 防止 canvas 超出觸發水平 scroll -->
  <div class="overflow-hidden" :style="{ width: width, height: height }">
    <div class="animated-border-container relative group">
      <!-- 內容槽位 -->
      <div class="absolute inset-0 flex items-center justify-center">
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
  syncAnimation?: boolean;
  showAnimation?: boolean;
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
  lineColor2: "#ffffff",
  /** 是否顯示對角走線 */
  showOpposite: true,
  /** 線條粗細 */
  lineWidth: 3,
  borderRadius: 8,
  /** 是否所有實例的動畫完全同步 */
  syncAnimation: true,
  /** 是否顯示動畫 */
  showAnimation: true,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
/** 預留空間也許未來線條需要發光 */
const padding = 24;
const FPS_LIMIT = 60;
const fpsInterval = 1000 / FPS_LIMIT;

let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

let animationFrameId: number;
let lastDrawTime = performance.now();

// 防呆: 兼容舊版瀏覽器不支援 ctx.roundRect (如 iPhone 6, iOS 12 Safari)
const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const validR = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.moveTo(x + validR, y);
    ctx.arcTo(x + w, y, x + w, y + h, validR);
    ctx.arcTo(x + w, y + h, x, y + h, validR);
    ctx.arcTo(x, y + h, x, y, validR);
    ctx.arcTo(x, y, x + w, y, validR);
    ctx.closePath();
  }
};

const resize = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement("canvas");
    offscreenCtx = offscreenCanvas.getContext("2d");
  }

  // 抓 container 的父層 (wrapper) 的尺寸，避免 canvas 超出影響 scroll
  const container = canvas.parentElement;
  const wrapper = container?.parentElement;
  const sizeSource = wrapper ?? container;
  if (sizeSource) {
    const rect = sizeSource.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = (rect.width + padding * 2) * dpr;
    const height = (rect.height + padding * 2) * dpr;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${rect.width + padding * 2}px`;
    canvas.style.height = `${rect.height + padding * 2}px`;
    canvas.style.top = `-${padding}px`;
    canvas.style.left = `-${padding}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (offscreenCanvas && offscreenCtx) {
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
      offscreenCtx.scale(dpr, dpr);
    }
  }
};

onMounted(() => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 隨機時間偏移量用於不同步時錯開每個實例的動畫起點
  const randomTimeOffset = Math.random() * 100000;

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

    if (!offscreenCanvas || !offscreenCtx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    offscreenCtx.clearRect(0, 0, w, h);

    const drawW = w - padding * 2;
    const drawH = h - padding * 2;
    if (drawW <= 0 || drawH <= 0) return;

    offscreenCtx.save();
    offscreenCtx.translate(padding, padding);

    if (path2D) {
      const scaleX = drawW / props.viewBox.w;
      const scaleY = drawH / props.viewBox.h;
      offscreenCtx.scale(scaleX, scaleY);
      offscreenCtx.translate(-props.viewBox.x, -props.viewBox.y);
    }

    // 線寬
    const lw = props.pathData ? props.lineWidth / (drawW / props.viewBox.w) : props.lineWidth;
    const inset = lw / 2;
    const r = props.borderRadius;

    // 計算實際繪製的矩形尺寸與圓角半徑 (扣除線寬造成的內縮)
    const actualW = Math.max(0, drawW - lw);
    const actualH = Math.max(0, drawH - lw);
    let actualR = Math.max(0, r - inset);

    // 確保圓角半徑不會超過長寬的一半 (符合 Canvas roundRect 原生行為)
    actualR = Math.min(actualR, actualW / 2, actualH / 2);

    // 使用實際尺寸計算周長，確保動畫 offset 計算完全精準，避免動畫循環時產生跳動 (卡頓)
    const rectPerimeter = 2 * (actualW + actualH) + actualR * (2 * Math.PI - 8);
    const currentPerimeter = props.pathData ? totalLength : rectPerimeter;

    // 如果 syncAnimation 為 true，則使用 global 的 currentTime，所有實例進度一致
    // 否則加上獨立的隨機時間偏移量，讓動畫看起來是錯開的
    const timeToUse = props.syncAnimation ? currentTime : currentTime + randomTimeOffset;
    const progress = (timeToUse % (props.duration * 1000)) / (props.duration * 1000);
    const offset = progress * currentPerimeter;
    const dashLength = currentPerimeter * props.dashRatio;

    // 1. 底色
    offscreenCtx.save();
    offscreenCtx.strokeStyle = props.baseColor;
    offscreenCtx.lineWidth = lw;
    if (path2D) {
      offscreenCtx.stroke(path2D);
    } else {
      offscreenCtx.beginPath();
      // 最原始寫法
      // offscreenCtx.roundRect(0, 0, drawW, drawH, r);
      // 由於組件最外層有加上 overflow-hidden, 所以要減去邊距, 不然會顯示不完整
      drawRoundRect(offscreenCtx, inset, inset, drawW - lw, drawH - lw, Math.max(0, r - inset));
      offscreenCtx.stroke();
    }
    offscreenCtx.restore();

    // 2. 開始畫雙走線
    if (props.showAnimation) {
      offscreenCtx.save();
      offscreenCtx.lineWidth = lw;
      offscreenCtx.lineCap = "round";
      offscreenCtx.lineJoin = "round";
      offscreenCtx.setLineDash([dashLength, currentPerimeter - dashLength]);

      // *基礎走線
      offscreenCtx.strokeStyle = props.lineColor1;
      offscreenCtx.lineDashOffset = -offset;
      if (path2D) {
        offscreenCtx.stroke(path2D);
      } else {
        offscreenCtx.beginPath();
        drawRoundRect(offscreenCtx, inset, inset, drawW - lw, drawH - lw, Math.max(0, r - inset));
        offscreenCtx.stroke();
      }

      // *對角走線
      if (props.showOpposite) {
        offscreenCtx.strokeStyle = props.lineColor2;
        offscreenCtx.lineDashOffset = -offset - currentPerimeter / 2;
        if (path2D) {
          offscreenCtx.stroke(path2D);
        } else {
          offscreenCtx.beginPath();
          drawRoundRect(offscreenCtx, inset, inset, drawW - lw, drawH - lw, Math.max(0, r - inset));
          offscreenCtx.stroke();
        }
      }
      offscreenCtx.restore();
    }
    offscreenCtx.restore();

    // 將離屏 canvas 的內容繪製到主要 canvas 上
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
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
.animated-border-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
