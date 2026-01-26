import { describe, it, expect } from 'vitest'
import { rectTransformStrategy } from '@/core/strategies/transforms/rect-transform'
import type { RectShape, TransformContext } from '@/core/types'

describe('矩形变形策略 (Functional)', () => {
  const startShape: RectShape = {
    id: 'test',
    type: 'rect',
    x: 100,
    y: 100,
    width: 100,
    height: 100
  }

  const baseContext: TransformContext = {
    dx: 0,
    dy: 0,
    startShape,
    imageSize: { width: 1000, height: 1000 }
  }

  it('getHandles: 应返回 8 个控制点', () => {
    const handles = rectTransformStrategy.getHandles(startShape)
    expect(handles).toHaveLength(8)
    expect(handles.map((h) => h.id)).toEqual(
      expect.arrayContaining(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'])
    )
  })

  it('transform (Body): 整体移动', () => {
    const ctx = { ...baseContext, dx: 50, dy: 50 }
    const result = rectTransformStrategy.transform('body', ctx)

    expect(result).toMatchObject({
      x: 150,
      y: 150,
      width: 100,
      height: 100
    })
  })

  it('transform (SE): 调整东南角 (改变宽高)', () => {
    const ctx = { ...baseContext, dx: 20, dy: 30 }
    const result = rectTransformStrategy.transform('se', ctx)

    expect(result).toMatchObject({
      x: 100,
      y: 100,
      width: 120,
      height: 130
    })
  })

  it('transform (NW): 调整西北角 (改变坐标和宽高)', () => {
    const ctx = { ...baseContext, dx: -10, dy: -10 }
    const result = rectTransformStrategy.transform('nw', ctx)

    expect(result).toMatchObject({
      x: 90,
      y: 90,
      width: 110,
      height: 110
    })
  })

  it('transform (Boundary): 不应移出画布边界', () => {
    const ctx = { ...baseContext, dx: -200, dy: -200 }
    const result = rectTransformStrategy.transform('body', ctx)

    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })
})
