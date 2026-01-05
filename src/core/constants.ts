import type { AnnotatorStyleConfig } from './types'

export const DEFAULT_STYLE_CONFIG: AnnotatorStyleConfig = {
  default: {
    stroke: '#eab308',
    strokeWidth: 2,
    fill: 'rgba(234, 179, 8, 0.15)',
    strokeDasharray: '0',
    cursor: 'pointer',
    filter: 'drop-shadow(0px 0px 1px rgba(0,0,0,0.5))'
  },
  selected: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    fill: 'rgba(59, 130, 246, 0.25)',
    strokeDasharray: '0',
    cursor: 'move',
    filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))'
  },
  draft: {
    stroke: '#00FF00',
    strokeWidth: 2,
    fill: 'rgba(59, 130, 246, 0.1)',
    strokeDasharray: '4 4',
    cursor: 'default',
    filter: 'none'
  }
}
