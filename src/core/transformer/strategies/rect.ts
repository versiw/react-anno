import type { RectShape, TransformerStrategy, TransformHandle } from '../../types'

export const rectStrategy: TransformerStrategy<RectShape> = {
  getHandles: (shape) => {
    const { x, y, width, height } = shape
    const halfW = width / 2
    const halfH = height / 2

    return [
      { id: 'nw', x: x, y: y, cursor: 'nw-resize' },
      { id: 'ne', x: x + width, y: y, cursor: 'ne-resize' },
      { id: 'se', x: x + width, y: y + height, cursor: 'se-resize' },
      { id: 'sw', x: x, y: y + height, cursor: 'sw-resize' },
      { id: 'n', x: x + halfW, y: y, cursor: 'n-resize' },
      { id: 'e', x: x + width, y: y + halfH, cursor: 'e-resize' },
      { id: 's', x: x + halfW, y: y + height, cursor: 's-resize' },
      { id: 'w', x: x, y: y + halfH, cursor: 'w-resize' }
    ] as TransformHandle[]
  },

  transform: (handleId, ctx) => {
    const shape = ctx.startShape as RectShape
    const { dx, dy } = ctx
    const minSize = 5

    if (handleId === 'body') {
      return {
        ...shape,
        x: shape.x + dx,
        y: shape.y + dy
      }
    }

    let { x, y, width, height } = shape

    if (['nw', 'w', 'sw'].includes(handleId)) {
      const newWidth = Math.max(minSize, width - dx)
      if (newWidth !== minSize) {
        x += width - newWidth
        width = newWidth
      }
    }

    if (['ne', 'e', 'se'].includes(handleId)) {
      width = Math.max(minSize, width + dx)
    }

    if (['nw', 'n', 'ne'].includes(handleId)) {
      const newHeight = Math.max(minSize, height - dy)
      if (newHeight !== minSize) {
        y += height - newHeight
        height = newHeight
      }
    }

    if (['sw', 's', 'se'].includes(handleId)) {
      height = Math.max(minSize, height + dy)
    }

    return {
      ...shape,
      x,
      y,
      width,
      height
    }
  }
}
