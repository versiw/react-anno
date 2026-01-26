import React from 'react'

export const getSVGPoint = (svg: SVGSVGElement, event: React.MouseEvent | MouseEvent) => {
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY

  const ctm = svg.getScreenCTM()
  if (ctm) {
    return point.matrixTransform(ctm.inverse())
  }
  return { x: 0, y: 0 }
}
