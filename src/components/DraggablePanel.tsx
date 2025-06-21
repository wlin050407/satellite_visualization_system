import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../i18n/useTranslation'

interface DraggablePanelProps {
  titleKey: string
  defaultPosition: { x: number; y: number }
  defaultCollapsed?: boolean
  children: React.ReactNode
  className?: string
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({
  titleKey,
  defaultPosition,
  defaultCollapsed = false,
  children,
  className = ''
}) => {
  const { t } = useTranslation()
  const [position, setPosition] = useState(defaultPosition)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  // 获取翻译文本
  const title = t[titleKey as keyof typeof t] as string

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return
    
    const rect = panelRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
    e.preventDefault()
  }

  // 处理拖拽移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // 限制在窗口范围内
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 250)
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 100)

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  return (
    <div
      ref={panelRef}
      className={`draggable-panel unified-panel-size ${className} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {/* 标题栏 - 可拖拽区域 */}
      <div
        className={`panel-header ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <h3>{title}</h3>
        <button
          className="collapse-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? t.expand : t.collapse}
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* 面板内容 */}
      {!isCollapsed && (
        <div className="panel-content">
          {children}
        </div>
      )}
    </div>
  )
}

export default DraggablePanel 