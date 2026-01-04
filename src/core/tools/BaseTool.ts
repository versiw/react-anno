import React from 'react'
import { getSVGPoint } from '../utils/geometry'
import type { IToolStrategy, ToolContext, ToolType } from '../types'

export abstract class BaseTool implements IToolStrategy {
  abstract id: ToolType

  /**
   * 辅助方法：获取相对于 SVG 的坐标点
   */
  protected getPoint(e: React.MouseEvent, ctx: ToolContext) {
    return getSVGPoint(ctx.svgElement, e)
  }

  abstract onMouseDown(e: React.MouseEvent, ctx: ToolContext): void
  abstract onMouseMove(e: React.MouseEvent, ctx: ToolContext): void
  abstract onMouseUp(e: React.MouseEvent, ctx: ToolContext): void
}
