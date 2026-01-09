import { useState } from 'react'
import { MousePointer2, Square, Trash2, Code2, Image as ImageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { Annotator } from 'react-anno'
import type { Shape, ToolType } from 'react-anno'

import viteLogo from '/vite.svg'

function App() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [tool, setTool] = useState<ToolType>('select')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleDeleteSelected = () => {
    if (selectedId) {
      setShapes((prev) => prev.filter((s) => s.id !== selectedId))
      setSelectedId(null)
    }
  }

  const handleClearAll = () => {
    if (confirm('确定要清空所有标注吗？')) {
      setShapes([])
      setSelectedId(null)
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans select-none">
      <header className="h-14 shrink-0 border-b bg-card flex items-center px-6 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <img src={viteLogo} className="h-6 w-6" alt="Logo" />
          <span className="font-bold text-lg tracking-tight">React Anno</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* --- 左侧画布区域 --- */}
        <div className="flex-1 bg-muted/30 relative flex flex-col min-w-0 p-6">
          <Card className="w-full h-full border-border/50 shadow-sm bg-white relative overflow-hidden">
            <Annotator
              imageUrl="https://images.unsplash.com/photo-1550948537-130a1ce83314?auto=format&fit=crop&w=1000&q=80"
              data={shapes}
              onChange={setShapes}
              tool={tool}
              selectedId={selectedId || undefined}
              onSelect={setSelectedId}
              className="bg-white"
              style={{
                backgroundImage: 'radial-gradient(#00000015 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          </Card>
        </div>

        {/* --- 右侧侧边栏 --- */}
        <aside className="w-80 border-l bg-card flex flex-col shrink-0 z-10 shadow-[-1px_0_20px_0_rgba(0,0,0,0.05)]">
          {/* 1. 工具栏区域 */}
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <ImageIcon className="h-4 w-4" />
              <span>工具箱</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={tool === 'select' ? 'default' : 'outline'}
                className="justify-start gap-2"
                onClick={() => setTool('select')}
              >
                <MousePointer2 className="h-4 w-4" />
                选择模式
              </Button>
              <Button
                variant={tool === 'rect' ? 'default' : 'outline'}
                className="justify-start gap-2"
                onClick={() => setTool('rect')}
              >
                <Square className="h-4 w-4" />
                矩形工具
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start gap-2"
                disabled={!selectedId}
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4" />
                删除选中项
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={handleClearAll}
                disabled={shapes.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                清空画布
              </Button>
            </div>
          </div>

          {/* 2. 信息展示区域 */}
          <div className="p-4 border-b bg-muted/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">统计信息</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background border rounded-md p-2">
                <div className="text-xs text-muted-foreground">标注总数</div>
                <div className="text-lg font-bold">{shapes.length}</div>
              </div>
              <div className="bg-background border rounded-md p-2">
                <div className="text-xs text-muted-foreground">当前选中</div>
                <div className="text-xs font-mono truncate mt-1" title={selectedId || 'None'}>
                  {selectedId ? selectedId.slice(0, 8) + '...' : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* 3. JSON 数据显示区域 */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="h-9 border-b flex items-center px-4 gap-2 bg-muted/10">
              <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">JSON 输出</span>
            </div>

            <ScrollArea className="flex-1 h-full w-full bg-slate-50">
              <div className="p-4">
                {shapes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40">
                    <Code2 className="h-8 w-8 mb-2" />
                    <span className="text-xs">暂无标注数据</span>
                  </div>
                ) : (
                  <pre className="text-[10px] font-mono leading-relaxed text-slate-600 whitespace-pre-wrap break-all">
                    {JSON.stringify(shapes, null, 2)}
                  </pre>
                )}
              </div>
            </ScrollArea>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
