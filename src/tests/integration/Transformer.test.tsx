import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { Annotator } from '@/core/Annotator'
import type { Shape } from '@/core/types'

const initialShape: Shape = {
  id: 'rect-1',
  type: 'rect',
  x: 50,
  y: 50,
  width: 100,
  height: 100
}

describe('Transformer 交互测试', () => {
  const setupAnnotator = (onChange = vi.fn()) => {
    render(
      <Annotator
        imageUrl="test.jpg"
        data={[initialShape]}
        tool="select"
        selectedId="rect-1"
        onChange={onChange}
        width={800}
        height={600}
      />
    )

    const img = screen.getByAltText('annotation target')
    Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 800 })
    Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 600 })
    fireEvent.load(img)

    return { onChange }
  }

  describe('矩形 (Rect)', () => {
    it('移动: 拖拽整体(Body)应更新位置坐标', () => {
      const { onChange } = setupAnnotator()
      const body = screen.getByTestId('transformer-body')

      fireEvent.mouseDown(body, { clientX: 100, clientY: 100 })
      fireEvent.mouseMove(window, { clientX: 150, clientY: 150 })
      fireEvent.mouseUp(window)

      expect(onChange).toHaveBeenCalled()
      const newShape = onChange.mock.calls.at(-1)![0][0]
      expect(newShape.x).toBe(100)
      expect(newShape.y).toBe(100)
    })

    it('双向缩放: 拖拽东南角(SE)应更新宽高', () => {
      const { onChange } = setupAnnotator()
      const handleSE = screen.getByTestId('transformer-handle-se')

      fireEvent.mouseDown(handleSE, { clientX: 150, clientY: 150 })
      fireEvent.mouseMove(window, { clientX: 170, clientY: 170 })
      fireEvent.mouseUp(window)

      const newShape = onChange.mock.calls.at(-1)![0][0]
      expect(newShape.width).toBe(120)
      expect(newShape.height).toBe(120)
    })

    it('双向缩放: 拖拽西北角(NW)应同时更新位置与宽高', () => {
      const { onChange } = setupAnnotator()
      const handleNW = screen.getByTestId('transformer-handle-nw')

      fireEvent.mouseDown(handleNW, { clientX: 50, clientY: 50 })
      fireEvent.mouseMove(window, { clientX: 40, clientY: 40 })
      fireEvent.mouseUp(window)

      const newShape = onChange.mock.calls.at(-1)![0][0]
      expect(newShape.x).toBe(40)
      expect(newShape.y).toBe(40)
      expect(newShape.width).toBe(110)
      expect(newShape.height).toBe(110)
    })

    it('单轴缩放: 拖拽北边(N)应仅更新高度与Y坐标', () => {
      const { onChange } = setupAnnotator()
      const handleN = screen.getByTestId('transformer-handle-n')

      fireEvent.mouseDown(handleN, { clientX: 100, clientY: 50 })

      fireEvent.mouseMove(window, { clientX: 110, clientY: 30 })
      fireEvent.mouseUp(window)

      const newShape = onChange.mock.calls.at(-1)![0][0]

      expect(newShape.y).toBe(30)
      expect(newShape.height).toBe(120)

      expect(newShape.x).toBe(50)
      expect(newShape.width).toBe(100)
    })

    it('边界限制: 缩放不应突破最小尺寸限制(5px)', () => {
      const { onChange } = setupAnnotator()
      const handleE = screen.getByTestId('transformer-handle-e')

      fireEvent.mouseDown(handleE, { clientX: 150, clientY: 100 })

      fireEvent.mouseMove(window, { clientX: -50, clientY: 100 })
      fireEvent.mouseUp(window)

      const newShape = onChange.mock.calls.at(-1)![0][0]

      expect(newShape.width).toBe(5)
      expect(newShape.x).toBe(50)
    })
  })
})
