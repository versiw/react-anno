import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { Annotator } from '@/core/Annotator'
import type { Shape } from '@/core/types'

describe('Annotator 堆叠层级测试', () => {
  const mockData: Shape[] = [
    { id: 'shape-1', type: 'rect', x: 10, y: 10, width: 50, height: 50 },
    { id: 'shape-2', type: 'rect', x: 20, y: 20, width: 50, height: 50 },
    { id: 'shape-3', type: 'rect', x: 30, y: 30, width: 50, height: 50 }
  ]

  const setup = (selectedId?: string) => {
    const utils = render(
      <Annotator
        imageUrl="test.jpg"
        data={mockData}
        tool="select"
        selectedId={selectedId}
        onChange={vi.fn()}
        width={800}
        height={600}
      />
    )

    const img = screen.getByAltText('annotation target')
    Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 800 })
    Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 600 })
    fireEvent.load(img)

    return utils
  }

  it('未选中任何形状时，DOM 顺序应遵循数据数组顺序', () => {
    const { container } = setup()
    const shapes = container.querySelectorAll('rect[data-id]')

    expect(shapes[0]).toHaveAttribute('data-id', 'shape-1')
    expect(shapes[1]).toHaveAttribute('data-id', 'shape-2')
    expect(shapes[2]).toHaveAttribute('data-id', 'shape-3')
  })

  it('选中中间的形状时，该形状应被移动到已渲染标注的最末尾', () => {
    const { container } = setup('shape-2')
    const shapes = container.querySelectorAll('rect[data-id]')

    expect(shapes).toHaveLength(3)
    expect(shapes[0]).toHaveAttribute('data-id', 'shape-1')
    expect(shapes[1]).toHaveAttribute('data-id', 'shape-3')
    expect(shapes[2]).toHaveAttribute('data-id', 'shape-2')
  })

  it('选中起始形状时，该形状应移动到末尾', () => {
    const { container } = setup('shape-1')
    const shapes = container.querySelectorAll('rect[data-id]')

    expect(shapes[0]).toHaveAttribute('data-id', 'shape-2')
    expect(shapes[1]).toHaveAttribute('data-id', 'shape-3')
    expect(shapes[2]).toHaveAttribute('data-id', 'shape-1')
  })

  it('Transformer 手柄应始终在选中形状之后渲染', () => {
    const { container } = setup('shape-2')

    const allSvgElements = container.querySelectorAll('rect, path')
    let selectedShapeIndex = -1
    let transformerHandleIndex = -1

    allSvgElements.forEach((el, index) => {
      if (el.getAttribute('data-id') === 'shape-2') {
        selectedShapeIndex = index
      }
      if (el.getAttribute('data-testid')?.startsWith('transformer-handle')) {
        if (transformerHandleIndex === -1) transformerHandleIndex = index
      }
    })

    expect(selectedShapeIndex).toBeLessThan(transformerHandleIndex)
  })

  it('切换选中项后，DOM 顺序应动态更新', () => {
    const { rerender, container } = setup('shape-1')

    let shapes = container.querySelectorAll('rect[data-id]')
    expect(shapes[2]).toHaveAttribute('data-id', 'shape-1')

    rerender(
      <Annotator
        imageUrl="test.jpg"
        data={mockData}
        tool="select"
        selectedId="shape-3"
        onChange={vi.fn()}
      />
    )

    shapes = container.querySelectorAll('rect[data-id]')
    expect(shapes[2]).toHaveAttribute('data-id', 'shape-3')
    expect(shapes[0]).toHaveAttribute('data-id', 'shape-1')
  })
})
