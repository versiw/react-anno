import React from 'react'

/**
 * 基础形状接口
 * 所有具体的形状类型（如矩形、多边形）都应继承此接口
 */
export interface BaseShape {
  /**
   * 形状的唯一标识符
   * @description 建议使用 UUID，用于 React 渲染 key 以及查找/删除操作
   */
  id: string

  /**
   * 自定义形状样式
   * @description 可覆盖默认的 SVG 样式（如 stroke, fill 等）
   */
  style?: React.CSSProperties
}

/**
 * 矩形形状定义
 */
export interface RectShape extends BaseShape {
  /**
   * 形状类型标识
   * @description 用于在联合类型中区分形状
   */
  type: 'rect'

  /** 矩形左上角的 X 坐标 (相对于画布) */
  x: number

  /** 矩形左上角的 Y 坐标 (相对于画布) */
  y: number

  /** 矩形的宽度 */
  width: number

  /** 矩形的高度 */
  height: number
}

/**
 * 所有支持的形状联合类型
 * @description 目前仅支持矩形，后续扩展多边形等只需在此处添加联合类型
 */
export type Shape = RectShape

/**
 * 工具操作模式
 * - `select`: 选择模式，用于点击选中、拖拽移动或修改形状
 * - `rect`: 绘制模式，用于在画布上按住鼠标绘制矩形
 */
export type ToolType = 'select' | 'rect'

/**
 * Annotator 标注器组件属性
 * @description 这是一个完全受控组件，遵循 "Data Down, Events Up" 的 React 数据流模式
 */
export interface AnnotatorProps {
  /**
   * 待标注的背景图片 URL
   */
  imageUrl: string

  /**
   * 标注数据列表
   * @description 组件的数据源，渲染所有已存在的标注框
   */
  data: Shape[]

  /**
   * 数据变更回调
   * @description 当完成绘制、修改形状或删除形状时触发
   * @param newShapes 更新后的完整形状数组
   */
  onChange: (newShapes: Shape[]) => void

  /**
   * 当前激活的工具
   * @description 决定鼠标在画布上的交互行为（绘制 vs 选择）
   * @default "select"
   */
  tool: ToolType

  /**
   * 当前选中的形状 ID
   * @description 传入 `undefined` 或 `null` 表示未选中任何形状
   */
  selectedId?: string

  /**
   * 选中状态变更回调
   * @description 当用户点击某个形状时触发 (id 为形状 ID)；点击空白处时触发 (id 为 null)
   */
  onSelect?: (id: string | null) => void

  /**
   * 容器内联样式
   */
  style?: React.CSSProperties

  /**
   * 标注器宽度
   * @default "100%"
   */
  width?: number | string

  /**
   * 标注器高度
   * @default "600px"
   */
  height?: number | string

  /**
   * (可选) 绘制开始回调
   */
  onDrawStart?: () => void

  /**
   * (可选) 绘制结束回调
   * @param shape 新生成的形状数据
   */
  onDrawEnd?: (shape: Shape) => void
}
