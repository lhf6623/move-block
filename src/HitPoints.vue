<!-- 这是一个模拟游戏血量值的组件，默认是五格血量 -->
<template>
  <div class="flex items-center justify-center text-center mb-6px">
    <div
      class="text-24px font-bold text-#333 w200px flex gap-1px bg-#bbada0 rounded p-1px"
    >
      <div
        v-for="i in 5"
        class="h-10px bg-red w-1/5 rounded-xs p-1px"
        :style="{ 'background-color': color(i) }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  hp: {
    type: Number,
    default: 5,
  },
})
// 根据血量的不同要显示不同的颜色
// 5 绿色 4 黄色 3 黄色 2 红色 1 红色
const color = (index: number) => {
  if (index > props.hp) return '#d6d2ce'
  if (props.hp === 5) return '#78da78'
  if (props.hp === 4 || props.hp === 3) return '#e9e919'
  if (props.hp === 2 || props.hp === 1) return '#df2d2d'
  return '#78da78'
}
</script>
