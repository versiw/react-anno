import React, { useRef, useState } from 'react'
import type { AnnotatorProps } from './types'
import { Rect } from './shapes/Rect'
import { useDraw } from './hooks/useDraw'

export const Annotator: React.FC<AnnotatorProps> = ({
  imageUrl,
  data,
  tool,
  selectedId,
  width = '100%',
  height = '600px',
  style,
  onChange,
  onSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

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
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden', // 防止图片加载前溢出
        userSelect: 'none',
        ...style
      }}
    >
      <img
        src={imageUrl}
        onLoad={handleImageLoad}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
        draggable={false}
        alt="annotation target"
      />

      {imgSize.w > 0 && (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: tool === 'rect' ? 'crosshair' : 'default'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {data.map((shape) => (
            <Rect key={shape.id} shape={shape} isSelected={shape.id === selectedId} />
          ))}

          {/* 2. 渲染正在绘制的草稿 */}
          {draft && <Rect shape={draft} isDraft />}
        </svg>
      )}
    </div>
  )
}
