import { v4 as uuidv4 } from 'uuid'
import { getSVGPoint } from '../../utils/geometry'
import type { DrawStrategy, RectShape } from '../../types'

export const rectDrawStrategy: DrawStrategy = {
  id: 'rect',

  onMouseDown: (e, ctx) => {
    const start = getSVGPoint(ctx.svgElement, e)

    ctx.storage.startPoint = start

    const draft: RectShape = {
      id: 'draft',
      type: 'rect',
      x: start.x,
      y: start.y,
      width: 0,
      height: 0
    }
    ctx.setDraft(draft)
  },

  onMouseMove: (e, ctx) => {
    const start = ctx.storage.startPoint
    if (!start) return

    const current = getSVGPoint(ctx.svgElement, e)

    const x = Math.min(start.x, current.x)
    const y = Math.min(start.y, current.y)
    const width = Math.abs(start.x - current.x)
    const height = Math.abs(start.y - current.y)

    ctx.setDraft({
      id: 'draft',
      type: 'rect',
      x,
      y,
      width,
      height
    })
  },

  onMouseUp: (_e, ctx) => {
    const start = ctx.storage.startPoint
    const draft = ctx.currentDraft as RectShape

    if (start && draft) {
      if (draft.width > 5 && draft.height > 5) {
        ctx.onDrawEnd({
          ...draft,
          id: uuidv4()
        })
      }
    }

    ctx.storage.startPoint = null
    ctx.setDraft(null)
  }
}
