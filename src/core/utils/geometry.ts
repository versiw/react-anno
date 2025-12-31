// src/lib/utils/geometry.ts
import React from 'react'

export const getSVGPoint = (svg: SVGSVGElement, event: React.MouseEvent | MouseEvent) => {
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY

  // 获取逆矩阵，将屏幕坐标转为 SVG 内部坐标
  const ctm = svg.getScreenCTM()
  if (ctm) {
    return point.matrixTransform(ctm.inverse())
  }
  return { x: 0, y: 0 }
}
