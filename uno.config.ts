// uno.config.ts
import { defineConfig, presetWind4 } from 'unocss'

const numberColor: [string, string][] = [
  ['#eee4da', '#776e65'],
  ['#ede0c8', '#776e65'],
  ['#f2b179', '#776e65'],
  ['#f59563', '#776e65'],
  ['#f67c5f', '#f9f6f2'],
  ['#f65e3b', '#f9f6f2'],
  ['#edcf72', '#776e65'],
  ['#edcc61', '#776e65'],
  ['#edc850', '#776e65'],
  ['#edc53f', '#f9f6f2'],
  ['#edc22e', '#f9f6f2'],
  ['#9c005a', '#ffffff'],
  ['#8e004a', '#ffffff'],
  ['#7e003a', '#ffffff'],
  ['#6e002a', '#ffffff'],
  ['#6500cc', '#ffffff'],
  ['#5500bb', '#ffffff'],
  ['#4500aa', '#ffffff'],
  ['#350099', '#ffffff'],
  ['#250088', '#ffffff'],
  ['#0066ff', '#ffffff'],
  ['#0055ee', '#ffffff'],
  ['#0044dd', '#ffffff'],
  ['#0033cc', '#ffffff'],
  ['#0022bb', '#ffffff'],
  ['#0011aa', '#ffffff'],
  ['#000099', '#ffffff'],
  ['#000088', '#ffffff'],
  ['#000077', '#ffffff'],
  ['#000066', '#ffffff'],
]
const len = numberColor.length
export default defineConfig({
  presets: [presetWind4()],
  safelist: numberColor.map((_, i) => `block-${i + 1}`),
  rules: [
    [
      /^block-(\d+)$/,
      ([, d]) => {
        const _d = Number(d)
        const num = _d > 0 ? (_d > len ? _d % len : _d - 1) : 0
        const [backgroundColor, color] = numberColor[num]
        return { 'background-color': backgroundColor, color }
      },
    ],
  ],
  shortcuts: {
    'block-box': 'flex items-center justify-center w50px h50px rounded',
  },
})
