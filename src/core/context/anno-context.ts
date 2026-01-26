import { createContext, useContext } from 'react'
import { DEFAULT_STYLE_CONFIG } from '../constants'
import type { AnnotatorStyleConfig } from '../types'

export interface AnnoContextValue {
  styleConfig: AnnotatorStyleConfig
}

const AnnoContext = createContext<AnnoContextValue>({
  styleConfig: DEFAULT_STYLE_CONFIG
})

export const AnnoProvider = AnnoContext.Provider

export const useAnnoContext = () => {
  const context = useContext(AnnoContext)
  if (!context) {
    throw new Error('useAnnoContext must be used within an AnnoProvider')
  }
  return context
}
