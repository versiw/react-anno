import { RectTool } from './RectTool'
import type { IToolStrategy, ToolType } from '../types'

const tools: Record<string, IToolStrategy> = {
  rect: new RectTool()
  // polygon: new PolygonTool(),
}

/**
 * 获取工具策略实例
 */
export const getToolStrategy = (type: ToolType): IToolStrategy | undefined => {
  return tools[type]
}
