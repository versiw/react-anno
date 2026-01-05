import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useShapeStyle } from '@/core/hooks/useShapeStyle'
import { AnnoProvider } from '@/core/context/AnnoContext'
import type { Shape, AnnotatorStyleConfig } from '@/core/types'
import React from 'react'

const mockShape: Shape = {
  id: '1',
  type: 'rect',
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  style: { stroke: 'purple' }
}

const mockConfig: AnnotatorStyleConfig = {
  default: { stroke: 'black', fill: 'gray' },
  selected: { stroke: 'blue', fill: 'blue' },
  draft: { stroke: 'green', strokeDasharray: '4 4' }
}

const createWrapper = (config: AnnotatorStyleConfig) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AnnoProvider value={{ styleConfig: config }}>{children}</AnnoProvider>
  )
}

describe('useShapeStyle Hook', () => {
  it('应正确应用默认样式', () => {
    const { result } = renderHook(() => useShapeStyle({ shape: { ...mockShape, style: {} } }), {
      wrapper: createWrapper(mockConfig)
    })

    expect(result.current.stroke).toBe('black')
    expect(result.current.fill).toBe('gray')
    expect(result.current.cssStyle.cursor).toBeUndefined()
  })

  it('选中状态(Selected)应覆盖默认样式', () => {
    const { result } = renderHook(
      () => useShapeStyle({ shape: { ...mockShape, style: {} }, isSelected: true }),
      { wrapper: createWrapper(mockConfig) }
    )

    expect(result.current.stroke).toBe('blue')
  })

  it('草稿状态(Draft)应具有最高优先级', () => {
    const { result } = renderHook(
      () => useShapeStyle({ shape: { ...mockShape, style: {} }, isSelected: true, isDraft: true }),
      { wrapper: createWrapper(mockConfig) }
    )

    expect(result.current.stroke).toBe('green')
    expect(result.current.strokeDasharray).toBe('4 4')
    expect(result.current.cssStyle.pointerEvents).toBe('none')
  })

  it('实例级样式(Shape.style)应覆盖配置样式', () => {
    const { result } = renderHook(() => useShapeStyle({ shape: mockShape }), {
      wrapper: createWrapper(mockConfig)
    })

    expect(result.current.stroke).toBe('purple')
    expect(result.current.fill).toBe('gray')
  })
})
