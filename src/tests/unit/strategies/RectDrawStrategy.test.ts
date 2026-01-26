import { vi, describe, beforeEach, it, expect } from 'vitest'
import type { DrawContext } from '@/core/types'
import { rectDrawStrategy } from '@/core/strategies/draw/rect-draw'

vi.mock('@/core/utils/geometry.ts', () => ({
  getSVGPoint: (_svg: SVGSVGElement, e: MouseEvent) => ({
    x: e.clientX,
    y: e.clientY
  })
}))

describe('矩形绘制策略 (Functional)', () => {
  let mockContext: DrawContext

  beforeEach(() => {
    mockContext = {
      svgElement: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      currentDraft: null,
      setDraft: vi.fn(),
      onDrawEnd: vi.fn(),
      storage: {}
    }
  })

  const createMockEvent = (clientX: number, clientY: number) => {
    return { clientX, clientY } as React.MouseEvent<SVGSVGElement>
  }

  it('onMouseDown: 应将起始点存入 storage 并初始化草稿', () => {
    const event = createMockEvent(10, 10)

    rectDrawStrategy.onMouseDown(event, mockContext)

    expect(mockContext.storage.startPoint).toEqual({ x: 10, y: 10 })

    expect(mockContext.setDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'rect',
        x: 10,
        y: 10,
        width: 0,
        height: 0
      })
    )
  })

  it('onMouseMove: 应读取 storage 中的起始点并更新草稿 (向右下拖拽)', () => {
    mockContext.storage.startPoint = { x: 10, y: 10 }

    rectDrawStrategy.onMouseMove(createMockEvent(50, 40), mockContext)

    expect(mockContext.setDraft).toHaveBeenLastCalledWith(
      expect.objectContaining({
        x: 10,
        y: 10,
        width: 40,
        height: 30
      })
    )
  })

  it('onMouseMove: 应处理反向拖拽 (向左上拖拽)', () => {
    mockContext.storage.startPoint = { x: 100, y: 100 }

    rectDrawStrategy.onMouseMove(createMockEvent(80, 80), mockContext)

    expect(mockContext.setDraft).toHaveBeenLastCalledWith(
      expect.objectContaining({
        x: 80,
        y: 80,
        width: 20,
        height: 20
      })
    )
  })

  it('onMouseUp: 尺寸有效时应提交形状并清理 storage', () => {
    mockContext.storage.startPoint = { x: 10, y: 10 }
    mockContext.currentDraft = {
      id: 'draft',
      type: 'rect',
      x: 10,
      y: 10,
      width: 50,
      height: 50
    }

    rectDrawStrategy.onMouseUp(createMockEvent(0, 0), mockContext)

    expect(mockContext.onDrawEnd).toHaveBeenCalled()
    expect(mockContext.storage.startPoint).toBeNull()
    expect(mockContext.setDraft).toHaveBeenCalledWith(null)
  })

  it('onMouseUp: 应忽略尺寸过小的形状', () => {
    mockContext.storage.startPoint = { x: 10, y: 10 }
    mockContext.currentDraft = {
      id: 'draft',
      type: 'rect',
      x: 10,
      y: 10,
      width: 2,
      height: 2
    }

    rectDrawStrategy.onMouseUp(createMockEvent(0, 0), mockContext)

    expect(mockContext.onDrawEnd).not.toHaveBeenCalled()
    expect(mockContext.storage.startPoint).toBeNull()
    expect(mockContext.setDraft).toHaveBeenCalledWith(null)
  })
})
