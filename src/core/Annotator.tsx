import React, { useRef, useState, useMemo } from 'react'
import type { AnnotatorProps, AnnotatorStyleConfig } from './types'
import { useDraw } from './hooks/useDraw'
import { ShapeRenderer } from './ShapeRenderer'
import { DEFAULT_STYLE_CONFIG } from './constants'
import { AnnoProvider } from './context/AnnoContext'

export const Annotator: React.FC<AnnotatorProps> = ({
  imageUrl,
  data,
  tool,
  selectedId,
  width = '100%',
  height = '600px',
  style,
  styleConfig: userStyleConfig,
  onChange,
  onSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

  const finalStyleConfig = useMemo(() => {
    return {
      default: { ...DEFAULT_STYLE_CONFIG.default, ...userStyleConfig?.default },
      selected: { ...DEFAULT_STYLE_CONFIG.selected, ...userStyleConfig?.selected },
      draft: { ...DEFAULT_STYLE_CONFIG.draft, ...userStyleConfig?.draft }
    } as AnnotatorStyleConfig
  }, [userStyleConfig])

  const { draft, handleMouseDown, handleMouseMove, handleMouseUp } = useDraw({
    svgRef,
    tool,
    data,
    onChange,
    onSelect
  })

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgSize({
      w: e.currentTarget.naturalWidth,
      h: e.currentTarget.naturalHeight
    })
  }

  return (
    <AnnoProvider value={{ styleConfig: finalStyleConfig }}>
      <div
        className="relative overflow-hidden select-none flex items-center justify-center bg-gray-100/30"
        style={{ width, height, ...style }}
      >
        <div className="relative max-w-full max-h-full flex shadow-sm">
          <img
            src={imageUrl}
            onLoad={handleImageLoad}
            className="block max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
            draggable={false}
            alt="annotation target"
          />

          {imgSize.w > 0 && (
            <svg
              data-testid="anno-canvas"
              ref={svgRef}
              viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
              className={`absolute top-0 left-0 w-full h-full outline-none`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {data.map((shape) => (
                <ShapeRenderer key={shape.id} shape={shape} isSelected={shape.id === selectedId} />
              ))}

              {draft && <ShapeRenderer shape={draft} isDraft />}
            </svg>
          )}
        </div>
      </div>
    </AnnoProvider>
  )
}
