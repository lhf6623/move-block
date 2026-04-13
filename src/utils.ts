const SIZE = 5
const TOTAL = SIZE * SIZE
const RANDOM_MAX = 6
/** [row, col] */
const directions = [
  [-1, 0], // 上
  [1, 0], // 下
  [0, 1], // 右
  [0, -1], // 左
]
export const BLOCK_SIZE = 50
export const DURATION = 150

// test git

// 初始化数据 第一次初始化数据是 1～5
export function initData(): Array<MoveBlockItem> {
  /**
   * 长度为 25 的一维数组
   * 一行为 5 个元素
   * 上下左右不能有三个及以上的数字相同
   */
  const arr = Array(TOTAL).fill(0)

  for (let i = 0; i < TOTAL; i++) {
    let n = randomNum(5)
    while (checkPosition(n, i, arr)) {
      n = randomNum(5)
    }
    arr[i] = {
      content: n,
      moveIn: undefined,
      removeDirection: undefined,
      isBlank: false,
      index: i,
    }
  }
  return arr
}
// 生成随机数 1 ~ 6
function randomNum(max = RANDOM_MAX) {
  return Math.floor(Math.random() * max) + 1
}
/** 检查当前位置是否符合规则 */
export function checkPosition(
  val: number,
  index: number,
  map: Array<MoveBlockItem>,
) {
  const arr = getSameIndex(val, index, map)
  return arr.length >= 3
}

/**
 * 根据当前位置搜索相同的数字 获取下标数组
 */
function getSameIndex(val: number, index: number, map: Array<MoveBlockItem>) {
  const arr = [index]
  // 以 index 为起点，深度优先搜索
  function dfs(index: number) {
    directions.forEach((direction) => {
      const [row, col] = direction
      const newRow = row + Math.floor(index / SIZE)
      const newCol = col + (index % SIZE)
      if (newRow < 0 || newRow >= SIZE || newCol < 0 || newCol >= SIZE) {
        return
      }
      const _index = newRow * SIZE + newCol
      if (arr.includes(_index) || _index >= TOTAL) {
        return
      }
      if (map[_index].content === val) {
        arr.push(_index)
        dfs(_index)
      }
    })
  }
  dfs(index)
  return arr
}

/**
 * 根据当前位置查找相同数字的格子，移除
 * 需要组装给动画用：假如上一个格子在找到的格子左边，那么移除方向就是 left
 */
export function removeBlock(
  val: number,
  index: number,
  map: Array<MoveBlockItem>,
) {
  const arr = [index]
  const res: Array<Array<MoveBlockItem>> = []

  // 以 index 为起点，深度优先搜索
  function dfs(index: number) {
    const _arr: Array<MoveBlockItem> = []
    directions.forEach((direction) => {
      const [row, col] = direction
      const newRow = row + Math.floor(index / SIZE)
      const newCol = col + (index % SIZE)
      if (newRow < 0 || newRow >= SIZE || newCol < 0 || newCol >= SIZE) {
        return
      }
      const _index = newRow * SIZE + newCol
      if (arr.includes(_index) || _index >= TOTAL) {
        return
      }
      if (map[_index].content === val) {
        arr.push(_index)
        let removeDirection: Direction = 'right'
        if (row !== 0) {
          removeDirection = row > 0 ? 'top' : 'bottom'
        } else if (col !== 0) {
          removeDirection = col > 0 ? 'left' : 'right'
        }
        _arr.push({
          index: _index,
          content: val,
          removeDirection,
          moveIn: false,
          isBlank: true,
        })
      }
    })
    if (_arr.length > 0) {
      res.push(_arr)
      for (const item of _arr) {
        dfs(item.index)
      }
    }
  }
  dfs(index)
  return res
}

/**
 * 扫描需要移动的格子和消除的格子
 * @param map
 * @returns [需要移动的格子数组，消除格子数组]
 */
export function scanMoveBlock(map: Array<MoveBlockItem>) {
  let blankArr: Array<MoveBlockItem> = []
  let eliminateArr: Array<MoveBlockItem> = []
  for (let i = 0; i < TOTAL; i++) {
    const item = map[i]

    if (item.isBlank === true) {
      const newRow = Math.floor(i / SIZE) - 1
      const newCol = i % SIZE
      const _index = newRow * SIZE + newCol
      // 上一个也是空的话，不做处理
      if (newRow >= 0 && map[_index].isBlank === true) {
        continue
      }
      let content = 0

      if (newRow >= 0 && newRow < SIZE && newCol >= 0 && newCol < SIZE) {
        content = map[_index].content
      } else {
        content = randomNum()
      }
      // 降落格子，消除，如果本来是个空格子，不用消除
      if (newRow >= 0) {
        eliminateArr.push({
          index: _index,
          content: content,
          removeDirection: 'bottom',
          moveIn: false,
          isBlank: true,
        })
      }
      // 空白格子，被降落的格子，移入
      blankArr.push({
        index: i,
        content,
        removeDirection: undefined,
        moveIn: true,
        isBlank: false,
      })
    }
  }
  return [blankArr, eliminateArr]
}
