<script setup lang="ts">
import { ref, useTemplateRef, watch, type PropType } from 'vue'
import { BLOCK_SIZE, DURATION } from './utils'

const props = defineProps({
  /** 内容 */
  content: {
    type: Number,
    default: 1,
  },
  /** 是否为空白格子 */
  isBlank: {
    type: Boolean,
    default: false,
  },
  /** 移除方向,只有移出时才需要 */
  removeDirection: {
    type: String as PropType<Direction>,
  },
  /** 移入 */
  moveIn: {
    type: Boolean,
  },
  index: {
    type: Number,
    default: 0,
  },
})
// 添加一个动画结束后的事件
const emits = defineEmits<{
  (e: 'animationEnd'): void
}>()

const moveRef = useTemplateRef<HTMLDivElement>('move')
let animation: Animation | undefined
/** 动画是否结束 */
const animationEnd = ref(true)
const keyframeAnimationOptions: number | KeyframeAnimationOptions | undefined =
  {
    duration: DURATION,
    fill: 'forwards',
  }

const direction = {
  top: {
    transform: 'translateY',
    distance: -BLOCK_SIZE,
  },
  bottom: {
    transform: 'translateY',
    distance: BLOCK_SIZE,
  },
  left: {
    transform: 'translateX',
    distance: -BLOCK_SIZE,
  },
  right: {
    transform: 'translateX',
    distance: BLOCK_SIZE,
  },
}

/** 移入动画 */
function moveInAnimation() {
  animationEnd.value = false
  animation = moveRef.value?.animate(
    [
      { transform: `translateY(-${BLOCK_SIZE}px)`, opacity: 0 },
      { transform: `translateY(0px)`, opacity: 1 },
    ],
    keyframeAnimationOptions,
  )
  animation?.finished.then(() => {
    animationEnd.value = true
    // console.log('移入动画 结束 Block', props.index)
    emits('animationEnd')
    animation?.cancel()
    animation = undefined
  })
}

/** 移出动画 */
function moveAnimation() {
  animationEnd.value = false
  let { removeDirection = 'top' } = props
  const { transform, distance } = direction[removeDirection]
  animation = moveRef.value?.animate(
    [
      { transform: `${transform}(0px)`, opacity: 1 },
      { transform: `${transform}(${distance}px)`, opacity: 0 },
    ],
    keyframeAnimationOptions,
  )
  animation?.finished.then(() => {
    animationEnd.value = true
    // console.log('移出动画 结束 Block', props.index)
    emits('animationEnd')
    animation?.cancel()
    animation = undefined
  })
}
watch(
  () => props.moveIn,
  (val) => {
    if (!animationEnd.value || val === undefined) return
    val ? moveInAnimation() : moveAnimation()
  },
)
</script>
<!-- 用 v-show 控制优先级太高，动画会被立马覆盖，使用 style 控制显示 -->
<template>
  <div class="relative block-box text-lg font-bold bg-#cdc1b4 select-none">
    <div
      :class="`absolute block-box block-${props.content}`"
      ref="move"
      :style="{
        opacity: animationEnd && !isBlank ? 1 : 0,
      }"
    >
      {{ content }}
    </div>
  </div>
</template>
