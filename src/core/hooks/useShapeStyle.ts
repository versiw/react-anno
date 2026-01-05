import { useMemo, type CSSProperties } from 'react'
import type { Shape } from '../types'
import { useAnnoContext } from '../context/AnnoContext'

interface UseShapeStyleProps {
  shape: Shape
  isSelected?: boolean
  isDraft?: boolean
}

export const useShapeStyle = ({
  shape,
  isSelected = false,
  isDraft = false
}: UseShapeStyleProps) => {
  const { styleConfig } = useAnnoContext()

  return useMemo(() => {
    let stateStyle = styleConfig.default
    if (isDraft) {
      stateStyle = styleConfig.draft
    } else if (isSelected) {
      stateStyle = styleConfig.selected
    }

    stateStyle = stateStyle || {}

    const finalStyle = {
      ...stateStyle,
      ...shape.style
    }

    const cssStyle: CSSProperties = {
      cursor: isDraft ? 'none' : finalStyle.cursor,
      filter: finalStyle.filter,
      pointerEvents: isDraft ? 'none' : 'all',
      transition: 'stroke 0.2s, fill 0.2s, stroke-width 0.2s'
    }

    return {
      stroke: finalStyle.stroke,
      strokeWidth: finalStyle.strokeWidth,
      strokeDasharray: finalStyle.strokeDasharray,
      fill: finalStyle.fill,
      cssStyle
    }
  }, [shape, styleConfig, isSelected, isDraft])
}
