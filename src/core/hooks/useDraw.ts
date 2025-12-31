import { useState, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Shape, RectShape, ToolType } from '../types'
import { getSVGPoint } from '../utils/geometry'

interface UseDrawParams {
  svgRef: React.RefObject<SVGSVGElement | null>
  tool: ToolType
  data: Shape[]
  onChange: (shapes: Shape[]) => void
  onSelect?: (id: string | null) => void
}

export const useDraw = ({ svgRef, tool, data, onChange, onSelect }: UseDrawParams) => {
  // 临时正在画的形状 (草稿)
  const [draft, setDraft] = useState<RectShape | null>(null)

  // 记录鼠标起始点
  const startPoint = useRef<{ x: number; y: number } | null>(null)

  // 标记是否正在拖拽中
  const isDrawing = useRef(false)

  // --- 鼠标按下 ---
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!svgRef.current) return

      // 1. 如果是选择模式 (Select Mode)
      if (tool === 'select') {
        // 利用 DOM 事件冒泡获取点击的元素 ID
        const target = e.target as Element
        // 假设我们在形状组件上绑定了 data-id 属性
        const clickedId = target.getAttribute('data-id')

        if (onSelect) {
          onSelect(clickedId || null) // 有 ID 传 ID，没 ID (点空白处) 传 null
        }
        return
      }

      // 2. 如果是矩形绘制模式 (Rect Mode)
      if (tool === 'rect') {
        const { x, y } = getSVGPoint(svgRef.current, e)
        startPoint.current = { x, y }
        isDrawing.current = true

        // 初始化草稿
        setDraft({
          id: 'draft',
          type: 'rect',
          x,
          y,
          width: 0,
          height: 0
        })

        // 如果点击开始画图，通常建议取消当前的选中状态
        onSelect?.(null)
      }
    },
    [svgRef, tool, onSelect]
  )

  // --- 鼠标移动 ---
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!svgRef.current) return

      // 只有在矩形模式且正在拖拽时才更新草稿
      if (tool === 'rect' && isDrawing.current && startPoint.current) {
        const current = getSVGPoint(svgRef.current, e)
        const start = startPoint.current

        // 计算标准化坐标（处理反向拖拽）
        const x = Math.min(start.x, current.x)
        const y = Math.min(start.y, current.y)
        const width = Math.abs(start.x - current.x)
        const height = Math.abs(start.y - current.y)

        setDraft((prev) => (prev ? { ...prev, x, y, width, height } : null))
      }
    },
    [svgRef, tool]
  )

  // --- 鼠标抬起 ---
  const handleMouseUp = useCallback(() => {
    // 结束绘制逻辑
    if (tool === 'rect' && isDrawing.current && draft) {
      // 过滤掉太小的误触框
      if (draft.width > 5 && draft.height > 5) {
        const newShape: RectShape = {
          ...draft,
          id: uuidv4() // 赋予正式 ID
        }
        // 【关键】受控组件核心：不修改本地 data，而是通知父组件更新
        onChange([...data, newShape])
      }

      // 清理现场
      setDraft(null)
      startPoint.current = null
      isDrawing.current = false
    }
  }, [tool, draft, data, onChange])

  return {
    draft,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  }
}
