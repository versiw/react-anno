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
    const { dx, dy, imageSize } = ctx
    const minSize = 5

    if (handleId === 'body') {
      let newX = shape.x + dx
      let newY = shape.y + dy

      if (newX < 0) newX = 0
      if (newX + shape.width > imageSize.width) {
        newX = imageSize.width - shape.width
      }

      if (newY < 0) newY = 0
      if (newY + shape.height > imageSize.height) {
        newY = imageSize.height - shape.height
      }

      return {
        ...shape,
        x: newX,
        y: newY
      }
    }

    let { x, y, width, height } = shape

    if (['nw', 'w', 'sw'].includes(handleId)) {
      const rightEdge = shape.x + shape.width
      let proposedX = shape.x + dx

      if (proposedX < 0) proposedX = 0
      if (proposedX > rightEdge - minSize) proposedX = rightEdge - minSize

      x = proposedX
      width = rightEdge - proposedX
    }

    if (['ne', 'e', 'se'].includes(handleId)) {
      let proposedWidth = width + dx
      if (x + proposedWidth > imageSize.width) {
        proposedWidth = imageSize.width - x
      }
      width = Math.max(minSize, proposedWidth)
    }

    if (['nw', 'n', 'ne'].includes(handleId)) {
      const bottomEdge = shape.y + shape.height
      let proposedY = shape.y + dy

      if (proposedY < 0) proposedY = 0
      if (proposedY > bottomEdge - minSize) proposedY = bottomEdge - minSize

      y = proposedY
      height = bottomEdge - proposedY
    }

    if (['sw', 's', 'se'].includes(handleId)) {
      let proposedHeight = height + dy
      if (y + proposedHeight > imageSize.height) {
        proposedHeight = imageSize.height - y
      }
      height = Math.max(minSize, proposedHeight)
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
