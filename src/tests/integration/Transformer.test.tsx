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
  const setupAnnotator = (data = [initialShape], selectedId = 'rect-1', onChange = vi.fn()) => {
    render(
      <Annotator
        imageUrl="test.jpg"
        data={data}
        tool="select"
        selectedId={selectedId}
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

  describe('矩形变换', () => {
    describe('基础交互', () => {
      it('移动: 拖拽整体(Body)应更新位置坐标', () => {
        const { onChange } = setupAnnotator()
        const body = screen.getByTestId('transformer-body')

        fireEvent.mouseDown(body, { clientX: 100, clientY: 100 })
        fireEvent.mouseMove(window, { clientX: 150, clientY: 150 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.x).toBe(100)
        expect(newShape.y).toBe(100)
      })

      it('缩放: 拖拽东南角(SE)应更新宽高', () => {
        const { onChange } = setupAnnotator()
        const handleSE = screen.getByTestId('transformer-handle-se')

        fireEvent.mouseDown(handleSE, { clientX: 150, clientY: 150 })
        fireEvent.mouseMove(window, { clientX: 170, clientY: 170 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.width).toBe(120)
        expect(newShape.height).toBe(120)
      })

      it('缩放: 拖拽北(N)句柄应同时改变 Y 坐标和高度', () => {
        const { onChange } = setupAnnotator()
        const handleN = screen.getByTestId('transformer-handle-n')

        fireEvent.mouseDown(handleN, { clientX: 100, clientY: 50 })
        fireEvent.mouseMove(window, { clientX: 100, clientY: 30 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.y).toBe(30)
        expect(newShape.height).toBe(120)
      })

      it('缩放: 拖拽西(W)句柄不应改变 Y 坐标', () => {
        const { onChange } = setupAnnotator()
        const handleW = screen.getByTestId('transformer-handle-w')

        fireEvent.mouseDown(handleW, { clientX: 50, clientY: 100 })
        fireEvent.mouseMove(window, { clientX: 70, clientY: 120 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.x).toBe(70)
        expect(newShape.width).toBe(80)
        expect(newShape.y).toBe(50)
      })

      it('最小尺寸: 缩放不应突破最小尺寸限制(5px)', () => {
        const { onChange } = setupAnnotator()
        const handleE = screen.getByTestId('transformer-handle-e')

        fireEvent.mouseDown(handleE, { clientX: 150, clientY: 100 })
        fireEvent.mouseMove(window, { clientX: -50, clientY: 100 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.width).toBe(5)
      })
    })

    describe('矩形边界限制', () => {
      it('移动边界: 不应允许移出画布左上角', () => {
        const { onChange } = setupAnnotator()
        const body = screen.getByTestId('transformer-body')

        fireEvent.mouseDown(body, { clientX: 50, clientY: 50 })
        fireEvent.mouseMove(window, { clientX: -50, clientY: -50 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.x).toBe(0)
        expect(newShape.y).toBe(0)
      })

      it('移动边界: 不应允许移出画布右下角', () => {
        const { onChange } = setupAnnotator()
        const body = screen.getByTestId('transformer-body')

        fireEvent.mouseDown(body, { clientX: 50, clientY: 50 })
        fireEvent.mouseMove(window, { clientX: 1000, clientY: 1000 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.x).toBe(700)
        expect(newShape.y).toBe(500)
      })

      it('缩放边界: 向左/向上拉伸不应超出 0', () => {
        const { onChange } = setupAnnotator()
        const handleNW = screen.getByTestId('transformer-handle-nw')

        fireEvent.mouseDown(handleNW, { clientX: 50, clientY: 50 })
        fireEvent.mouseMove(window, { clientX: -100, clientY: -100 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.x).toBe(0)
        expect(newShape.y).toBe(0)
        expect(newShape.width).toBe(150)
      })

      it('缩放边界: 向右/向下拉伸不应超出图片尺寸', () => {
        const { onChange } = setupAnnotator()
        const handleSE = screen.getByTestId('transformer-handle-se')

        fireEvent.mouseDown(handleSE, { clientX: 150, clientY: 150 })
        fireEvent.mouseMove(window, { clientX: 1000, clientY: 1000 })
        fireEvent.mouseUp(window)

        const newShape = onChange.mock.calls.at(-1)![0][0]
        expect(newShape.width).toBe(750)
        expect(newShape.height).toBe(550)
      })
    })
  })
})
