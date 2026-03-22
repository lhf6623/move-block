declare global {
  type Direction = 'top' | 'bottom' | 'left' | 'right'

  interface BlockProps {
    /** 内容 */
    content: number
    /** 空格子标记 */
    isBlank: boolean
    /** 移除方向 */
    removeDirection?: Direction
    /** 移入 */
    moveIn?: boolean
    index: number
  }

  interface MoveBlockItem extends BlockProps {
    index: number
  }
}

export {}
