import React, { useState, useRef, useCallback, useEffect } from 'react'
import type { Shape, ToolType, ToolContext } from '../types'
import { getToolStrategy } from '../tools'

interface UseDrawParams {
  svgRef: React.RefObject<SVGSVGElement | null>
  tool: ToolType
  data: Shape[]
  onChange: (shapes: Shape[]) => void
  onSelect?: (id: string | null) => void
}

export const useDraw = ({ svgRef, tool, data, onChange, onSelect }: UseDrawParams) => {
  const [draft, setDraft] = useState<Shape | null>(null)

  const draftRef = useRef(draft)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  const handleEvent = useCallback(
    (e: React.MouseEvent, eventType: 'onMouseDown' | 'onMouseMove' | 'onMouseUp') => {
      if (!svgRef.current) return

      if (tool === 'select') {
        if (eventType === 'onMouseDown') {
          const target = e.target as Element
          const clickedId = target.getAttribute('data-id')
          onSelect?.(clickedId || null)
        }
        return
      }

      const strategy = getToolStrategy(tool)
      if (!strategy) return

      const context: ToolContext = {
        svgElement: svgRef.current,
        currentDraft: draftRef.current,
        setDraft: (shape) => setDraft(shape),
        onDrawEnd: (newShape) => {
          onChange([...data, newShape])
        }
      }

      strategy[eventType](e, context)
    },
    [tool, data, onChange, onSelect, svgRef]
  )

  return {
    draft,
    handleMouseDown: (e: React.MouseEvent) => handleEvent(e, 'onMouseDown'),
    handleMouseMove: (e: React.MouseEvent) => handleEvent(e, 'onMouseMove'),
    handleMouseUp: (e: React.MouseEvent) => handleEvent(e, 'onMouseUp')
  }
}
