import React from 'react'

/**
 * 形状的具体样式属性
 */
export interface ShapeStyle {
  /** 描边颜色 (边框颜色) */
  stroke?: string
  /** 描边宽度 */
  strokeWidth?: number
  /**
   * 虚线描边模式
   *
   * @description 定义虚线和间隙的长度序列。常用于表示“草稿”或“未激活”状态。
   * @example
   * "4 4" - 4px实线，4px间隔
   * "5 3" - 5px实线，3px间隔 (更紧凑)
   * "0" - 实线 (无虚线)
   */
  strokeDasharray?: string
  /** 填充颜色 */
  fill?: string
  /** 光标样式 */
  cursor?: string
  /** SVG 滤镜，用于实现阴影以增强对比度 */
  filter?: string
}

/**
 * 全局样式配置接口
 */
export interface AnnotatorStyleConfig {
  /** 默认状态（未选中）的样式 */
  default?: ShapeStyle
  /** 选中状态的样式 */
  selected?: ShapeStyle
  /** 绘制中（草稿）状态的样式 */
  draft?: ShapeStyle
}

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

export interface PolygonShape extends BaseShape {
  type: 'polygon'
  points: { x: number; y: number }[]
}

/**
 * 所有支持的形状联合类型
 * @description 目前仅支持矩形，后续扩展多边形等只需在此处添加联合类型
 */
export type Shape = RectShape | PolygonShape

/**
 * 工具操作模式
 * - `select`: 选择模式，用于点击选中、拖拽移动或修改形状
 * - `rect`: 绘制模式，用于在画布上按住鼠标绘制矩形
 */
export type ToolType = 'select' | 'rect' | 'polygon'

/**
 * 工具上下文：提供给具体工具操作 React 状态的能力
 */
export interface ToolContext {
  /** SVG DOM 引用，用于计算坐标 */
  svgElement: SVGSVGElement
  /** 当前的草稿形状 */
  currentDraft: Shape | null
  /** 更新草稿状态 */
  setDraft: (shape: Shape | null) => void
  /** 提交绘制结果 */
  onDrawEnd: (shape: Shape) => void
}

/**
 * 工具策略接口：所有工具（矩形、圆形、画笔）都必须实现此接口
 */
export interface IToolStrategy {
  /** 工具 ID */
  id: ToolType

  /** 鼠标按下 */
  onMouseDown(e: React.MouseEvent, ctx: ToolContext): void
  /** 鼠标移动 */
  onMouseMove(e: React.MouseEvent, ctx: ToolContext): void
  /** 鼠标松开 */
  onMouseUp(e: React.MouseEvent, ctx: ToolContext): void
}

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

  /**
   * 自定义标注样式配置
   */
  styleConfig?: AnnotatorStyleConfig
}
