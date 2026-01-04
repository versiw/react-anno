import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

if (!SVGSVGElement.prototype.getScreenCTM) {
  SVGSVGElement.prototype.getScreenCTM = function () {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
      inverse: function () {
        return {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: 0,
          f: 0,
          multiply: function (p: DOMPoint) {
            return p
          }
        }
      }
    } as unknown as DOMMatrix
  }
}

if (!SVGSVGElement.prototype.createSVGPoint) {
  SVGSVGElement.prototype.createSVGPoint = function () {
    return {
      x: 0,
      y: 0,
      matrixTransform: function () {
        return { x: this.x, y: this.y }
      }
    } as DOMPoint
  }
}
