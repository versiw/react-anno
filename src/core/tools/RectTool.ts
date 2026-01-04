import { v4 as uuidv4 } from 'uuid'
import { BaseTool } from './BaseTool'
import type { ToolContext, RectShape } from '../types'

export class RectTool extends BaseTool {
  id = 'rect' as const

  private startPoint: { x: number; y: number } | null = null

  onMouseDown(e: React.MouseEvent, ctx: ToolContext) {
    const start = this.getPoint(e, ctx)
    this.startPoint = start

    const draft: RectShape = {
      id: 'draft',
      type: 'rect',
      x: start.x,
      y: start.y,
      width: 0,
      height: 0
    }
    ctx.setDraft(draft)
  }

  onMouseMove(e: React.MouseEvent, ctx: ToolContext) {
    if (!this.startPoint) return

    const current = this.getPoint(e, ctx)
    const start = this.startPoint

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
  }

  onMouseUp(_e: React.MouseEvent, ctx: ToolContext) {
    if (this.startPoint && ctx.currentDraft) {
      const draft = ctx.currentDraft as RectShape

      if (draft.width > 5 && draft.height > 5) {
        ctx.onDrawEnd({
          ...draft,
          id: uuidv4()
        })
      }
    }

    this.startPoint = null
    ctx.setDraft(null)
  }
}
