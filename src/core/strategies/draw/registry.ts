import { rectDrawStrategy } from './rect-draw'
import type { DrawStrategy, ToolType } from '../../types'

const strategies: Record<string, DrawStrategy> = {
  rect: rectDrawStrategy
}

export const getDrawStrategy = (type: ToolType): DrawStrategy | undefined => {
  return strategies[type]
}
