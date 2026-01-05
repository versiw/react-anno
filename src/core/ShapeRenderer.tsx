import React from 'react'
import type { Shape } from './types'
import { Rect } from './shapes/Rect'

interface ShapeRendererProps {
  shape: Shape
  isSelected?: boolean
  isDraft?: boolean
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = (props) => {
  const { shape } = props

  switch (shape.type) {
    case 'rect':
      return <Rect shape={shape} isSelected={props.isSelected} isDraft={props.isDraft} />
    default:
      return null
  }
}
