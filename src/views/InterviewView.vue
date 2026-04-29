<template>
  <div id="interview-view">
    <div :style="gridStyle">
      <AnimatedBorder
        v-for="(blockItem, blockIndex) in blockItemList"
        v-bind="config"
        :key="blockIndex"
        :width="blockItem.width"
        :height="blockItem.height"
        :show-animation="displayMode === 'All' || animatedActiveList.includes(blockIndex)"
        :pathData="iconData.pathData"
        :viewBox="iconData.viewBox"
        sync-animation
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

    <div class="radio-group" mt-20px>
      <label class="radio-item">
        <input type="radio" name="display-mode" value="All" v-model="displayMode" />
        <span class="custom-radio"></span>
        <span class="label-text">All</span>
      </label>
      <label class="radio-item">
        <input type="radio" name="display-mode" value="Random" v-model="displayMode" />
        <span class="custom-radio"></span>
        <span class="label-text">Random</span>
      </label>
    </div>

    <div class="radio-group" mt-20px>
      <label class="radio-item">
        <input type="radio" name="icon-type" value="Rect" v-model="iconType" />
        <span class="custom-radio"></span>
        <span class="label-text">Rect</span>
      </label>
      <label class="radio-item">
        <input type="radio" name="icon-type" value="Heart" v-model="iconType" />
        <span class="custom-radio"></span>
        <span class="label-text">Heart</span>
      </label>
    </div>

    <div mt-30px>
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
import { onMounted, reactive, ref, computed, watch } from "vue";
import AnimatedBorder, { type AnimatedBorderProps } from "@/components/AnimatedBorder.vue";
import utils from "@/utils";
import Heart from "@/components/SVG_Icon/Heart";

interface BlockItem {
  width: string;
  height: string;
}

/** 間距大小 */
const GAP_SIZE = 5;
const blockItemList = reactive<BlockItem[]>([]);
const currentCols = ref(1);
const config: AnimatedBorderProps = {
  dashRatio: 0.07,
  duration: 1,
  baseColor: "#6c6c6c",
  lineColor1: "#ffffff",
  lineColor2: "#ffffff",
  showOpposite: true,
  lineWidth: 3,
  borderRadius: 8,
  showAnimation: true,
};
const btnConfig = [
  { btnLabel: "1x1" },
  { btnLabel: "2x2" },
  { btnLabel: "5x5" },
  { btnLabel: "10x10" },
];

const displayMode = ref<"All" | "Random">("All");
const iconType = ref<"Heart" | "Rect">("Rect");
const iconData = reactive<{
  pathData: string | undefined;
  viewBox: { x: number; y: number; w: number; h: number } | undefined;
}>({
  pathData: undefined,
  viewBox: undefined,
});
const animatedActiveList = ref<number[]>([]);
let lastChooseBtnLabel = "";

function randomizeAnimation() {
  /** 畫面上動畫 Block 總數 */
  const totalBlockItemNum = blockItemList.length;
  if (totalBlockItemNum === 0) {
    animatedActiveList.value = [];
    return;
  }

  let pickPoolCount: number;
  if (totalBlockItemNum > 1) {
    pickPoolCount = Math.floor(Math.random() * (totalBlockItemNum - 1)) + 1;
  } else {
    pickPoolCount = totalBlockItemNum;
  }

  const tmpActiveList: number[] = [];
  const pool = Array.from({ length: totalBlockItemNum }, (_, i) => i);
  for (let i = 0; i < pickPoolCount; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    // 抽完後把被抽走的從池子移除，避免抽到重複的
    tmpActiveList.push(pool.splice(randomIndex, 1)[0]!);
  }

  animatedActiveList.value = tmpActiveList;
}

watch(displayMode, (newMode) => {
  if (newMode === "Random") {
    randomizeAnimation();
  } else {
    // 切換回 All 時清空隨機索引，讓狀態保持乾淨
    animatedActiveList.value = [];
  }
});

watch(iconType, (newVal) => {
  if (newVal === "Heart") {
    iconData.pathData = Heart.path;
    iconData.viewBox = Heart.viewBox;
  } else {
    iconData.pathData = undefined;
    iconData.viewBox = undefined;
  }
  updateBlocks(lastChooseBtnLabel);
});

const gridStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(${currentCols.value}, 1fr)`,
  gap: `${GAP_SIZE}px`,
  width: "100%",
}));

/** 總高度 */
const TOTAL_HEIGHT = computed(() => {
  if (iconType.value === "Heart") {
    return 350;
  } else {
    return 200;
  }
});

/** 統一更新區塊的邏輯 */
function updateBlocks(label: string) {
  lastChooseBtnLabel = label;
  const { cols, rows } = utils.parseLabel(label);
  currentCols.value = cols;

  // 計算區塊的高度， (rows * height) + ((rows - 1) * gap) = TOTAL_HEIGHT
  const calculatedHeight = (TOTAL_HEIGHT.value - (rows - 1) * GAP_SIZE) / rows;

  blockItemList.length = 0;
  for (let i = 0; i < cols * rows; i++) {
    blockItemList.push({
      width: "100%",
      height: `${calculatedHeight}px`,
    });
  }

  if (displayMode.value === "Random") {
    randomizeAnimation();
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
  max-width: 450px;
  min-width: 260px;

  .radio-group {
    display: flex;
    gap: 24px;
    .radio-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      gap: 10px;
      color: #efefef;
      font-size: 14px;
      transition: opacity 0.2s;

      input {
        display: none;
      }

      .custom-radio {
        width: 18px;
        height: 18px;
        border: 2px solid #4a4a4a;
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        background: transparent;

        &::after {
          content: "";
          width: 0px;
          height: 0px;
          border-radius: 50%;
          background: #3b82f6;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }
      }

      input:checked + .custom-radio {
        border-color: #3b82f6;
        &::after {
          width: 10px;
          height: 10px;
        }
      }
    }
  }
}
</style>
