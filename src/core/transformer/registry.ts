import { rectStrategy } from './strategies/rect'
import type { RectShape, Shape, TransformerStrategy } from '../types'

type StrategyMap = {
  rect: TransformerStrategy<RectShape>
}

const strategies: StrategyMap = {
  rect: rectStrategy
}

export const getStrategy = (type: Shape['type']): TransformerStrategy<Shape> | undefined => {
  return strategies[type as keyof StrategyMap] as unknown as TransformerStrategy<Shape>
}
