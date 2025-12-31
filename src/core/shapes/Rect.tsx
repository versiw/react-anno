import React from 'react'
import type { RectShape } from '../types'

interface RectProps {
  shape: RectShape
  isDraft?: boolean
  isSelected?: boolean
}

export const Rect: React.FC<RectProps> = ({ shape, isDraft = false, isSelected = false }) => {
  // 动态计算样式
  const getStrokeColor = () => {
    if (isDraft) return '#0064ff' // 绘制中：蓝色
    if (isSelected) return '#ff0000' // 选中：红色
    return 'green' // 普通：绿色
  }

  const getFillColor = () => {
    if (isDraft) return 'rgba(0,100,255,0.2)'
    if (isSelected) return 'rgba(255,0,0,0.2)'
    return 'rgba(0,255,0,0.3)'
  }

  return (
    <g>
      <rect
        // 关键：绑定 ID，用于点击检测
        data-id={shape.id}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill={getFillColor()}
        stroke={getStrokeColor()}
        strokeWidth={isSelected ? 3 : 2} // 选中时边框加粗
        strokeDasharray={isDraft ? '4 2' : '0'}
        vectorEffect="non-scaling-stroke" // 防止缩放时边框变粗/变细
        style={{
          // 如果是草稿，不响应鼠标事件，让鼠标事件穿透到 SVG 底层继续画
          pointerEvents: isDraft ? 'none' : 'all',
          cursor: isDraft ? 'none' : 'pointer'
        }}
      />
    </g>
  )
}
