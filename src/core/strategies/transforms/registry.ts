import { rectTransformStrategy } from './rect-transform'
import type { Shape, TransformStrategy } from '../../types'

const strategies = {
  rect: rectTransformStrategy
}

export const getTransformStrategy = (type: Shape['type']): TransformStrategy<Shape> | undefined => {
  return strategies[type as keyof typeof strategies] as unknown as TransformStrategy<Shape>
}
