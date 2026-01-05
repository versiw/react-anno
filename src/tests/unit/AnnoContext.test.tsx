import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Rect } from '@/core/shapes/Rect'
import { AnnoProvider } from '@/core/context/AnnoContext'
import { DEFAULT_STYLE_CONFIG } from '@/core/constants'
import type { RectShape, AnnotatorStyleConfig } from '@/core/types'

const mockShape: RectShape = {
  id: 'test-rect',
  type: 'rect',
  x: 10,
  y: 10,
  width: 50,
  height: 50
}

const customConfig: AnnotatorStyleConfig = {
  default: { stroke: 'purple', strokeWidth: 10 }
}

describe('Rect 组件', () => {
  it('在 AnnoProvider 内部渲染时，应用 Context 中的自定义样式', () => {
    const { container } = render(
      <AnnoProvider value={{ styleConfig: customConfig }}>
        <svg>
          <Rect shape={mockShape} />
        </svg>
      </AnnoProvider>
    )

    const rectEl = container.querySelector('rect')

    expect(rectEl).not.toBeNull()

    expect(rectEl).toHaveAttribute('stroke', 'purple')
    expect(rectEl).toHaveAttribute('stroke-width', '10')
  })

  it('如果没有 Provider 包裹，应回退使用默认样式 (DEFAULT_STYLE_CONFIG)', () => {
    const { container } = render(
      <svg>
        <Rect shape={mockShape} />
      </svg>
    )

    const rectEl = container.querySelector('rect')
    expect(rectEl).not.toBeNull()

    const defaultStroke = DEFAULT_STYLE_CONFIG.default?.stroke
    if (defaultStroke) {
      expect(rectEl).toHaveAttribute('stroke', defaultStroke)
    }
  })
})
