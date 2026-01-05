import React, { useState, useEffect, useRef } from 'react'
import type { Shape } from '../types'
import { getStrategy } from './registry'
import { getSVGPoint } from '../utils/geometry'

interface TransformerProps {
  /** 当前选中的图形 */
  shape: Shape
  /** SVG 容器引用 (用于坐标转换) */
  svgElement: SVGSVGElement
  /** 更新回调 */
  onChange: (shape: Shape) => void
}

export const Transformer: React.FC<TransformerProps> = ({ shape, svgElement, onChange }) => {
  const strategy = getStrategy(shape.type)

  const [isDragging, setIsDragging] = useState(false)
  const [activeHandleId, setActiveHandleId] = useState<string | null>(null)

  const dragStartRef = useRef<{
    startX: number
    startY: number
    startShape: Shape
  } | null>(null)

  const handleMouseDown = (e: React.MouseEvent, handleId: string) => {
    e.stopPropagation()

    const point = getSVGPoint(svgElement, e)

    dragStartRef.current = {
      startX: point.x,
      startY: point.y,
      startShape: shape
    }

    setActiveHandleId(handleId)
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging || !activeHandleId || !strategy) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return

      const currentPoint = getSVGPoint(svgElement, e)
      const { startX, startY, startShape } = dragStartRef.current

      const dx = currentPoint.x - startX
      const dy = currentPoint.y - startY

      const newShape = strategy.transform(activeHandleId, {
        dx,
        dy,
        startShape
      })

      onChange(newShape)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setActiveHandleId(null)
      dragStartRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, activeHandleId, svgElement, strategy, onChange])

  if (!strategy) return null

  const handles = strategy.getHandles(shape)

  return (
    <g className="transformer-layer">
      <path
        d={getShapePath(shape)}
        fill="transparent"
        stroke="transparent"
        className="cursor-move"
        onMouseDown={(e) => handleMouseDown(e, 'body')}
      />

      <path d={getShapePath(shape)} fill="none" pointerEvents="none" />

      {handles.map((handle) => (
        <rect
          key={handle.id}
          x={handle.x - 4}
          y={handle.y - 4}
          width={8}
          height={8}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={1}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => handleMouseDown(e, handle.id)}
        />
      ))}
    </g>
  )
}

function getShapePath(shape: Shape): string {
  if (shape.type === 'rect') {
    return `M ${shape.x} ${shape.y} h ${shape.width} v ${shape.height} h -${shape.width} Z`
  }
  return ''
}
