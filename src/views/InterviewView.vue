<template>
  <div id="interview-view">
    <div :style="gridStyle">
      <AnimatedBorder
        v-for="(blockItem, blockIndex) in blockItemList"
        :key="blockIndex"
        :width="blockItem.width"
        :height="blockItem.height"
        v-bind="config"
      >
      </AnimatedBorder>
    </div>

    <div flex mt-20px>
      <div v-for="(btnItem, index) in btnConfig" :key="index">
        <input
          type="button"
          mr-10px
          :value="btnItem.btnLabel"
          @click="updateBlocks(btnItem.btnLabel)"
        />
      </div>
    </div>

    <div mt-50px>
      <input
        type="button"
        mr-10px
        value="點擊前往更多頁面"
        @click="$router.push({ name: 'control' })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimatedBorder, { type AnimatedBorderProps } from "@/components/AnimatedBorder.vue";
import { onMounted, reactive, ref, computed } from "vue";

interface BlockItem {
  width: string;
  height: string;
}

const blockItemList = reactive<BlockItem[]>([]);
const currentCols = ref(1);
/** 總高度 */
const TOTAL_HEIGHT = 200;
/** 間距大小 */
const GAP_SIZE = 5;
const config: AnimatedBorderProps = {
  dashRatio: 0.07,
  duration: 1,
  baseColor: "#6c6c6c",
  lineColor1: "#ffffff",
  lineColor2: "#9ca3af",
  showOpposite: true,
  lineWidth: 3,
  borderRadius: 8,
};

const gridStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(${currentCols.value}, 1fr)`,
  gap: `${GAP_SIZE}px`,
  width: "100%",
}));

const btnConfig = [
  { btnLabel: "1x1" },
  { btnLabel: "2x2" },
  { btnLabel: "5x5" },
  { btnLabel: "10x10" },
];

/** 解析 "ColxRow" 格式，回傳 { cols, rows } */
function parseLabel(label: string): { cols: number; rows: number } {
  const match = label.match(/^(\d+)x(\d+)$/i);
  if (!match || !match[1] || !match[2]) return { cols: 1, rows: 1 };
  return { cols: parseInt(match[1]), rows: parseInt(match[2]) };
}

/** 統一更新區塊的邏輯 */
function updateBlocks(label: string) {
  const { cols, rows } = parseLabel(label);
  currentCols.value = cols;

  // 計算區塊的高度， (rows * height) + ((rows - 1) * gap) = TOTAL_HEIGHT
  const calculatedHeight = (TOTAL_HEIGHT - (rows - 1) * GAP_SIZE) / rows;

  blockItemList.length = 0;
  for (let i = 0; i < cols * rows; i++) {
    blockItemList.push({
      width: "100%",
      height: `${calculatedHeight}px`,
    });
  }
}

onMounted(() => {
  if (btnConfig.length !== 0) {
    const firstBtn = btnConfig[0]!;
    updateBlocks(firstBtn.btnLabel);
  }
});
</script>

<style lang="scss" scoped>
#interview-view {
  padding: 20px;
  margin: 0 auto;
  max-width: 640px;
}
</style>
