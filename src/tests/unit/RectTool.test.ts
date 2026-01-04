import { vi, describe, beforeEach, it, expect } from 'vitest'
import type { ToolContext } from '@/core/types'
import { RectTool } from '@/core/tools/RectTool'

vi.mock('@/core/utils/geometry.ts', () => ({
  getSVGPoint: (_svg: SVGSVGElement, e: MouseEvent) => ({
    x: e.clientX,
    y: e.clientY
  })
}))

describe('矩形工具策略', () => {
  let tool: RectTool
  let mockContext: ToolContext

  beforeEach(() => {
    tool = new RectTool()
    mockContext = {
      svgElement: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      currentDraft: null,
      setDraft: vi.fn(),
      onDrawEnd: vi.fn()
    }
  })

  const createMockEvent = (clientX: number, clientY: number) => {
    return { clientX, clientY } as React.MouseEvent<SVGSVGElement>
  }

  it('MouseDown 时应初始化草稿', () => {
    const event = createMockEvent(10, 10)

    tool.onMouseDown(event, mockContext)

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

  it('MouseMove 时应正确更新草稿 (向右下拖拽)', () => {
    tool.onMouseDown(createMockEvent(10, 10), mockContext)
    tool.onMouseMove(createMockEvent(50, 40), mockContext)

    expect(mockContext.setDraft).toHaveBeenLastCalledWith(
      expect.objectContaining({
        x: 10,
        y: 10,
        width: 40,
        height: 30
      })
    )
  })

  it('应处理反向拖拽 (向左上拖拽)', () => {
    tool.onMouseDown(createMockEvent(100, 100), mockContext)
    tool.onMouseMove(createMockEvent(80, 80), mockContext)

    expect(mockContext.setDraft).toHaveBeenLastCalledWith(
      expect.objectContaining({
        x: 80,
        y: 80,
        width: 20,
        height: 20
      })
    )
  })

  it('尺寸有效时 MouseUp 应提交形状', () => {
    tool.onMouseDown(createMockEvent(10, 10), mockContext)

    mockContext.currentDraft = {
      id: 'draft',
      type: 'rect',
      x: 10,
      y: 10,
      width: 50,
      height: 50
    }

    tool.onMouseUp(createMockEvent(0, 0), mockContext)

    expect(mockContext.onDrawEnd).toHaveBeenCalled()
    expect(mockContext.setDraft).toHaveBeenCalledWith(null)
  })

  it('应忽略尺寸过小的形状', () => {
    tool.onMouseDown(createMockEvent(10, 10), mockContext)

    mockContext.currentDraft = {
      id: 'draft',
      type: 'rect',
      x: 10,
      y: 10,
      width: 2,
      height: 2
    }

    tool.onMouseUp(createMockEvent(0, 0), mockContext)

    expect(mockContext.onDrawEnd).not.toHaveBeenCalled()
    expect(mockContext.setDraft).toHaveBeenCalledWith(null)
  })
})
