import { describe, expect, it, vi } from 'vitest'
import { Annotator } from '@/core/Annotator'
import { render, fireEvent, screen } from '@testing-library/react'

describe('Annotator 集成测试', () => {
  it('绘制完成后应调用 onChange 并传递新形状', () => {
    const handleChange = vi.fn()

    render(
      <Annotator
        imageUrl="https://images.unsplash.com/photo-1550948537-130a1ce83314?auto=format&fit=crop&w=1000&q=80"
        data={[]}
        tool="rect"
        onChange={handleChange}
        width={800}
        height={600}
      />
    )

    const img = screen.getByAltText('annotation target') as HTMLImageElement

    Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 800 })
    Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 600 })

    fireEvent.load(img)

    const canvas = screen.getByTestId('anno-canvas')

    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 })
    fireEvent.mouseMove(canvas, { clientX: 110, clientY: 110 })
    fireEvent.mouseUp(canvas)

    expect(handleChange).toHaveBeenCalledTimes(1)

    const newShapes = handleChange.mock.calls[0][0]
    expect(newShapes).toHaveLength(1)
    expect(newShapes[0].type).toBe('rect')
    expect(newShapes[0].width).toBe(100)
  })
})
