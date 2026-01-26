import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import type { Shape, ToolType } from 'react-anno'
import { Annotator } from 'react-anno'

// -----------------------------------------------------------------------------
// Icons (Clean, monoline stroke for light theme)
// -----------------------------------------------------------------------------
const Icons = {
  Cursor: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m4 4 7.07 16.97 2.51-7.39 7.39-2.51L4 4z" />
      <path d="m14 14 6 6" />
    </svg>
  ),
  Rect: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    </svg>
  ),
  Layer: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  ),
  Trash: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  Image: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  Settings: ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// -----------------------------------------------------------------------------
// Sub-Components
// -----------------------------------------------------------------------------

const ToolButton = ({
  active,
  onClick,
  icon: Icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: React.FC<{ className?: string }>
  label: string
}) => (
  <button
    onClick={onClick}
    title={label}
    className={cn(
      'w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 border',
      active
        ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
        : 'bg-white border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
    )}
  >
    <Icon className="w-4 h-4" />
  </button>
)

const PanelSection = ({
  title,
  children,
  rightSlot
}: {
  title: string
  children: React.ReactNode
  rightSlot?: React.ReactNode
}) => (
  <div className="flex flex-col border-b border-zinc-100 last:border-0">
    <div className="flex items-center justify-between px-4 py-3 bg-white">
      <h3 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider">{title}</h3>
      {rightSlot}
    </div>
    <div className="px-4 pb-4 bg-white">{children}</div>
  </div>
)

const PropItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-zinc-500">{label}</span>
    <span className="text-xs text-zinc-900 font-mono bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100 min-w-[3rem] text-right">
      {value}
    </span>
  </div>
)

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const MOCK_IMAGE =
  'https://images.unsplash.com/photo-1550948537-130a1ce83314?auto=format&fit=crop&w=1000&q=80'

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export const Studio = () => {
  const [data, setData] = useState<Shape[]>([])
  const [tool, setTool] = useState<ToolType>('select')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [imgUrl, setImgUrl] = useState(MOCK_IMAGE)

  // Keyboard Interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select')
          break
        case 'r':
          setTool('rect')
          break
        case 'delete':
        case 'backspace':
          if (selectedId) {
            setData((prev) => prev.filter((s) => s.id !== selectedId))
            setSelectedId(null)
          }
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId])

  const selectedShape = data.find((s) => s.id === selectedId)

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-50 text-zinc-900 overflow-hidden font-sans">
      {/* 1. Header: Minimal & Flat */}
      <header className="h-12 bg-white border-b border-zinc-200 flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="w-3 h-3"
            >
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">React Anno</span>
          <div className="h-4 w-px bg-zinc-200 mx-1" />
          <span className="text-xs text-zinc-500">Playground</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 rounded-md px-2 py-1 gap-2 border border-zinc-200/50">
            <Icons.Image className="w-3.5 h-3.5 text-zinc-500" />
            <input
              className="bg-transparent border-none text-xs w-48 outline-none text-zinc-700 placeholder:text-zinc-400"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="Enter Image URL..."
            />
          </div>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-14 bg-white border-r border-zinc-200 flex flex-col items-center py-4 gap-2 z-20 shrink-0">
          <ToolButton
            active={tool === 'select'}
            onClick={() => setTool('select')}
            icon={Icons.Cursor}
            label="Select (V)"
          />
          <ToolButton
            active={tool === 'rect'}
            onClick={() => setTool('rect')}
            icon={Icons.Rect}
            label="Rectangle (R)"
          />

          <div className="mt-auto w-8 h-px bg-zinc-100 my-2" />
          <ToolButton active={false} onClick={() => {}} icon={Icons.Settings} label="Settings" />
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 relative bg-zinc-50/50 overflow-hidden flex items-center justify-center">
          {/* Light Dot Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#e4e4e7 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-900/5 bg-white">
            <Annotator
              imageUrl={imgUrl}
              data={data}
              tool={tool}
              selectedId={selectedId ?? undefined}
              onChange={setData}
              onSelect={setSelectedId}
              width="auto"
              height="auto"
              // Maximize view but keep some breathing room
              className="max-h-[calc(100vh-120px)] max-w-[calc(100vw-380px)]"
            />
          </div>
        </main>

        {/* Right Inspector */}
        <aside className="w-72 bg-white border-l border-zinc-200 flex flex-col z-20 shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)]">
          {/* Properties */}
          <div className="flex-1 overflow-y-auto">
            <PanelSection title="Properties">
              {selectedShape && selectedShape.type === 'rect' ? (
                <div className="space-y-1">
                  <PropItem label="ID" value={selectedShape.id.slice(0, 6)} />
                  <div className="h-px bg-zinc-100 my-2" />
                  <div className="grid grid-cols-2 gap-x-4">
                    <PropItem label="X" value={Math.round(selectedShape.x)} />
                    <PropItem label="Y" value={Math.round(selectedShape.y)} />
                    <PropItem label="W" value={Math.round(selectedShape.width)} />
                    <PropItem label="H" value={Math.round(selectedShape.height)} />
                  </div>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-zinc-400 gap-2 border-2 border-dashed border-zinc-100 rounded-lg bg-zinc-50/50">
                  <Icons.Cursor className="w-5 h-5 opacity-50" />
                  <span className="text-xs">No Selection</span>
                </div>
              )}
            </PanelSection>

            <PanelSection
              title="Layers"
              rightSlot={
                <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                  {data.length}
                </span>
              }
            >
              <div className="flex flex-col gap-1 min-h-[120px]">
                {data.length === 0 && (
                  <div className="text-xs text-zinc-400 italic text-center py-4">
                    Canvas is empty
                  </div>
                )}
                {data.map((shape, i) => (
                  <div
                    key={shape.id}
                    onClick={() => setSelectedId(shape.id)}
                    className={cn(
                      'group flex items-center gap-3 px-2 py-2 rounded-md text-xs cursor-pointer select-none transition-all',
                      selectedId === shape.id
                        ? 'bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-100'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    )}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        selectedId === shape.id
                          ? 'bg-blue-500'
                          : 'bg-zinc-300 group-hover:bg-zinc-400'
                      )}
                    />
                    <span className="flex-1 truncate font-mono">
                      Rect {i + 1}{' '}
                      <span className="text-zinc-400 ml-1 font-sans opacity-70">
                        #{shape.id.slice(0, 3)}
                      </span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setData(data.filter((s) => s.id !== shape.id))
                        if (selectedId === shape.id) setSelectedId(null)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all p-1"
                    >
                      <Icons.Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </PanelSection>
          </div>

          {/* JSON Preview */}
          <div className="h-48 border-t border-zinc-200 flex flex-col bg-zinc-50">
            <div className="px-4 py-2 border-b border-zinc-200 flex justify-between items-center bg-white">
              <span className="text-[10px] font-bold uppercase text-zinc-400">JSON Export</span>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <pre className="text-[10px] leading-relaxed text-zinc-500 font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
