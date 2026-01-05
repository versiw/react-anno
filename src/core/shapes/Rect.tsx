import React from 'react'
import type { RectShape } from '../types'
import { useShapeStyle } from '../hooks/useShapeStyle'

interface RectProps {
  shape: RectShape
  isSelected?: boolean
  isDraft?: boolean
}

export const Rect: React.FC<RectProps> = (props) => {
  const styleProps = useShapeStyle(props)

  return (
    <rect
      data-id={props.shape.id}
      x={props.shape.x}
      y={props.shape.y}
      width={props.shape.width}
      height={props.shape.height}
      fill={styleProps.fill}
      stroke={styleProps.stroke}
      strokeWidth={styleProps.strokeWidth}
      strokeDasharray={styleProps.strokeDasharray}
      style={styleProps.cssStyle}
      vectorEffect="non-scaling-stroke"
    />
  )
}
