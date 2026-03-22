<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Block from './Block.vue'
import { initData, removeBlock, scanBlankBlock, checkPosition } from './utils'

const blockList = ref<Array<BlockProps>>([])
// 判断全部动画结束
const animationEnd = ref<boolean>(false)
// 待消除的方块
const removeList = ref<Array<Array<MoveBlockItem>>>([])
// 当前消除的方块数量
const removeCount = ref<number>(0)
// 当前点击格子下标
const currentIndex = ref<number>(-1)
// 当前得分
const score = ref<number>(0)
// 重新开始
const stop = ref<boolean>(false)

watch(
  () => removeCount.value,
  (val) => {
    if (stop.value) {
      return
    }
    // 消除,点击后消除相同项
    if (removeList.value.length) {
      !val && updateBlockList()
    } else {
      // 消除相同项后填补空白
      !val && fillBlank()
    }
  },
)
function resetGame() {
  blockList.value = initData()
  score.value = 0
  removeCount.value = 0
  stop.value = true
  animationEnd.value = false
  setTimeout(() => {
    stop.value = false
  }, 200)
}
function updateScore(arr: MoveBlockItem[][]) {
  const _arr = arr.flat(1)
  score.value += (1 + _arr.length) * _arr[0].content
}

onMounted(resetGame)

// 点击事件处理
function handleClick(index: number) {
  if (animationEnd.value || blockList.value[index].isBlank) {
    return
  }
  blockList.value[index].content += 1
  const updatedContent = blockList.value[index].content
  // 检查是否需要移除
  if (!checkPosition(updatedContent, index, blockList.value)) {
    return
  }
  // 记录当前点击格子下标
  currentIndex.value = index
  removeList.value = removeBlock(updatedContent, index, blockList.value)

  updateScore(removeList.value)
  updateBlockList()
}

function updateBlockList() {
  if (stop.value) {
    return
  }
  animationEnd.value = true
  const item = removeList.value.pop()
  if (!item) {
    return
  }
  removeCount.value = item.length
  for (const i of item) {
    const { index } = i
    blockList.value[index] = i
  }
  // 最后一次消除点击点 +1
  if (
    !removeList.value.length &&
    currentIndex.value >= 0 &&
    currentIndex.value < blockList.value.length
  ) {
    blockList.value[currentIndex.value].content += 1
    currentIndex.value = -1
  }
}

// 消除后填补空白
function fillBlank() {
  if (stop.value) {
    return
  }
  // 先把数据还原
  for (const i of blockList.value) {
    if (!i.isBlank) {
      i.moveIn = undefined
      i.removeDirection = undefined
    }
  }
  const [blankArr, eliminateArr] = scanBlankBlock(blockList.value)

  if (!blankArr.length && !eliminateArr.length) {
    animationEnd.value = false
    checkEliminate()
    return
  }
  // 空白格子补充
  for (const i of blankArr) {
    const { index } = i
    blockList.value[index] = i
  }
  // 下落格子，向下移出
  for (const i of eliminateArr) {
    const { index } = i
    blockList.value[index] = i
  }
  // 本次有多少格子有动作
  removeCount.value = blankArr.length + eliminateArr.length
}

// 填补空白后，检查是否还有相同项需要消除
function checkEliminate() {
  if (stop.value) {
    return
  }
  const list = blockList.value
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (checkPosition(item.content, i, list)) {
      // 记录当前点击格子下标
      currentIndex.value = i
      removeList.value = removeBlock(item.content, i, blockList.value)
      updateScore(removeList.value)
      updateBlockList()
      break
    }
  }
}

// 全部动画完成后调用函数
const animationEndHandler = function () {
  removeCount.value -= 1
}
</script>

<template>
  <div class="relative h-100vh pt20px">
    <div class="text-center py20px">
      <button
        @click="resetGame"
        class="b px12px py6px rounded-md hover:opacity-90 active:opacity-80"
      >
        重新开始
      </button>

      <p
        class="inline-block px12px py6px rounded-md hover:opacity-90 active:opacity-80"
      >
        分数：{{ score }}
      </p>
    </div>
    <div
      class="grid grid-cols-5 grid-rows-5 gap5px bg-#bbada0 wfit hfit p10px rounded-lg mxauto relative"
    >
      <Block
        v-for="(item, index) in blockList"
        :content="item.content"
        :remove-direction="item.removeDirection"
        :move-in="item.moveIn"
        :index="index"
        :is-blank="item.isBlank"
        @click="() => handleClick(index)"
        @animationEnd="animationEndHandler"
      ></Block>
      <!-- 需要一个蒙版 -->
      <div
        v-if="animationEnd"
        class="absolute top-0 left-0 w-full h-full opacity-50 z-1000"
      ></div>
    </div>
  </div>
</template>
