import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getDrawStrategy } from '../strategies/draw/registry'
import type { DrawContext, Shape, ToolType } from '../types'

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRef = useRef<Record<string, any>>({})

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

      if (eventType === 'onMouseDown') {
        onSelect?.(null)
      }

      const strategy = getDrawStrategy(tool)
      if (!strategy) return

      const context: DrawContext = {
        svgElement: svgRef.current,
        currentDraft: draftRef.current,
        setDraft: (shape) => setDraft(shape),
        onDrawEnd: (newShape) => {
          onChange([...data, newShape])
        },
        storage: sessionRef.current
      }

      strategy[eventType](e, context)+
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
