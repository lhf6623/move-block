<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Block from './Block.vue'
import HitPoints from './HitPoints.vue'
import { initData, removeBlock, scanMoveBlock, checkPosition } from './utils'

const blockList = ref<Array<MoveBlockItem>>([])
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
// 血量
const hp = ref<number>(5)
// 游戏结束
const gameOverEnd = ref<boolean>(false)

watch(
  () => removeCount.value,
  (val) => {
    if (stop.value) return

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
  hp.value = 5
  gameOverEnd.value = false
}
function updateScore(arr: MoveBlockItem[][]) {
  const _arr = arr.flat(1)
  score.value += (1 + _arr.length) * _arr[0].content
}

onMounted(resetGame)

function click(index: number) {
  if (hp.value <= 0) return

  hp.value -= 1
  handleClick(index)
}
// 血量增加
function addHp() {
  if (hp.value >= 5) return

  hp.value += 1
}

// 点击事件处理
function handleClick(index: number) {
  if (index < 0 || index >= blockList.value.length) return

  if (animationEnd.value || blockList.value[index].isBlank) return

  blockList.value[index].content += 1
  const updatedContent = blockList.value[index].content
  // 检查是否需要移除
  if (!checkPosition(updatedContent, index, blockList.value)) {
    if (hp.value <= 0) {
      gameOverEnd.value = true
    }
    return
  }
  // 记录当前点击格子下标
  currentIndex.value = index
  removeList.value = removeBlock(updatedContent, index, blockList.value)

  updateScore(removeList.value)
  updateBlockList()
}

function updateBlockList() {
  if (stop.value) return

  animationEnd.value = true
  const item = removeList.value.pop()

  if (!item) return

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
    addHp()
    blockList.value[currentIndex.value].content += 1
    currentIndex.value = -1
  }
}

// 消除后填补空白
function fillBlank() {
  if (stop.value) return

  // 先把数据还原
  for (const i of blockList.value) {
    if (!i.isBlank) {
      i.moveIn = undefined
      i.removeDirection = undefined
    }
  }
  const [blankArr, eliminateArr] = scanMoveBlock(blockList.value)

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
  if (stop.value) return

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
  if (removeCount.value <= 0) return
  removeCount.value -= 1
}
</script>

<template>
  <div class="relative h-100vh pt20px bg-#f0f0f0">
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
    <HitPoints :hp="hp" />
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
        @click="() => click(index)"
        @animationEnd="animationEndHandler"
      ></Block>
      <!-- 点击之后动画还没结束不能再次点击 -->
      <div
        v-if="animationEnd"
        class="absolute top-0 left-0 w-full h-full opacity-50 z-1000"
      ></div>
      <!-- 游戏结束弹出提示 -->
      <div
        v-if="gameOverEnd"
        class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-#000000aa opacity-70 z-1000"
      >
        <p class="text-2xl font-bold text-#f00">游戏结束</p>
      </div>
    </div>
  </div>
</template>
