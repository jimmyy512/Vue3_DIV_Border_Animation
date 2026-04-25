# Vue3 DIV Border Animation (Vue3 邊框動畫特效)

基於 HTML5 Canvas 與 Vue 3 實作的高效能邊框動畫特效。

## 🌟 線上預覽 (Live Demo)

👉 **[點擊此處查看線上預覽](https://jimmyy512.github.io/Vue3_DIV_Border_Animation/Output/#/main)**

## 🛠️ 基本環境 (Tech Stack)

本專案主要使用以下技術與環境建置：

- **核心框架**: [Vue 3](https://vuejs.org/) (v3.5+) + [Vite](https://vitejs.dev/) (v8+)
- **開發語言**: [TypeScript](https://www.typescriptlang.org/)
- **樣式工具**: [UnoCSS](https://unocss.dev/) + SCSS
- **狀態管理與路由**: [Pinia](https://pinia.vuejs.org/) + [Vue Router](https://router.vuejs.org/)
- **實用組合式 API**: [VueUse](https://vueuse.org/)
- **繪圖技術**: HTML5 Canvas API
- **套件管理**: pnpm

## ✨ 專案特點 (Features)

- **高效能 Canvas 動畫**: 使用 HTML5 Canvas 取代傳統 DOM/CSS 邊框動畫，大幅提升複雜或多節點情境下的渲染效能。
- **流暢的視覺體驗 (雙緩衝技術)**: 內部實作了雙緩衝 (Double Buffering) 機制，先在離屏 Canvas 繪製後再同步到主畫面，徹底解決動畫閃爍與撕裂問題。
- **時間基準渲染 (Time-based Animation)**: 基於 `requestAnimationFrame` 與時間差計算位移，確保在各種螢幕更新率 (如 60Hz 或 144Hz) 下，動畫運行速度皆保持一致。
- **自適應響應式設計**: 支援 Resize 監聽，當父容器寬高變更時，Canvas 會自動重新計算並更新路徑，完美貼合容器大小。
- **高自訂性**: 提供 Vue 組件封裝，可透過 Props 靈活控制：
  - 邊框粗細 (Border Width)
  - 圓角弧度 (Border Radius)
  - 線條長度與間距 (Line Dash)
  - 動畫速度 (Speed)
  - 可隨時動態切換播放/暫停
- **良好的相容性**: 針對舊版環境 (如較舊的 iOS Safari) 不支援 Canvas `roundRect` API 的情況，實作了向下相容的 fallback 降級處理 (使用 `arcTo` / `lineTo` 繪製圓角)。

---

## 🚀 專案設定 (Project Setup)

### 安裝依賴 (Install Dependencies)

```sh
pnpm install
```

### 開發模式 (Development)

```sh
pnpm dev
```

### 生產建置 (Build for Production)

```sh
pnpm build
```

### 程式碼檢查與修復 (Lint)

```sh
pnpm lint
```
