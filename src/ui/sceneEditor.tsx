import React, { useRef, useEffect, useState } from 'react'
import { Scene, Entity } from '../core/types'
import './sceneEditor.css'

interface SceneEditorProps {
  scene: Scene | null
  entities: Entity[]
  selectedEntityId: string | null
  onSelectEntity: (entityId: string) => void
  onMoveEntity: (entityId: string, x: number, y: number) => void
  onDeleteEntity: (entityId: string) => void
  canvasWidth: number
  canvasHeight: number
}

interface DragState {
  isDragging: boolean
  entityId?: string
  startX: number
  startY: number
  startEntityX: number
  startEntityY: number
}

export default function SceneEditor({
  scene,
  entities,
  selectedEntityId,
  onSelectEntity,
  onMoveEntity,
  onDeleteEntity,
  canvasWidth,
  canvasHeight,
}: SceneEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startEntityX: 0,
    startEntityY: 0,
  })
  const [sceneOffset, setSceneOffset] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1)

  // Render scene
  useEffect(() => {
    if (!canvasRef.current || !scene) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = scene.backgroundColor || '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    const gridSize = 20 * zoomLevel
    for (let x = sceneOffset.x % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = sceneOffset.y % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw entities
    for (const entity of entities) {
      const transform = entity.components.find(c => c.type === 'Transform')
      if (!transform) continue

      const x = ((transform.properties.x as number) || 0) * zoomLevel + sceneOffset.x
      const y = ((transform.properties.y as number) || 0) * zoomLevel + sceneOffset.y
      const w = 32 * zoomLevel
      const h = 32 * zoomLevel

      // Draw entity
      const isSelected = entity.id === selectedEntityId
      ctx.fillStyle = isSelected ? '#4a7c59' : '#3a4a5a'
      ctx.fillRect(x - w / 2, y - h / 2, w, h)

      ctx.strokeStyle = isSelected ? '#66ff00' : '#666'
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.strokeRect(x - w / 2, y - h / 2, w, h)

      // Draw name
      ctx.fillStyle = '#e0e0e0'
      ctx.font = `${10 * zoomLevel}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(entity.name, x, y)
    }
  }, [scene, entities, selectedEntityId, sceneOffset, zoomLevel])

  const getWorldCoordinates = (screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (screenX - rect.left - sceneOffset.x) / zoomLevel,
      y: (screenY - rect.top - sceneOffset.y) / zoomLevel,
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find entity at this position
    let clickedEntity: Entity | undefined
    for (const entity of entities) {
      const transform = entity.components.find(c => c.type === 'Transform')
      if (!transform) continue

      const ex = ((transform.properties.x as number) || 0) * zoomLevel + sceneOffset.x
      const ey = ((transform.properties.y as number) || 0) * zoomLevel + sceneOffset.y
      const w = 32 * zoomLevel
      const h = 32 * zoomLevel

      if (
        x >= ex - w / 2 &&
        x <= ex + w / 2 &&
        y >= ey - h / 2 &&
        y <= ey + h / 2
      ) {
        clickedEntity = entity
        break
      }
    }

    if (clickedEntity) {
      onSelectEntity(clickedEntity.id)
      const transform = clickedEntity.components.find(c => c.type === 'Transform')
      if (transform) {
        setDragState({
          isDragging: true,
          entityId: clickedEntity.id,
          startX: x,
          startY: y,
          startEntityX: (transform.properties.x as number) || 0,
          startEntityY: (transform.properties.y as number) || 0,
        })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.entityId) return

    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const deltaX = (x - dragState.startX) / zoomLevel
    const deltaY = (y - dragState.startY) / zoomLevel

    const newX = dragState.startEntityX + deltaX
    const newY = dragState.startEntityY + deltaY

    onMoveEntity(dragState.entityId, newX, newY)
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      startEntityX: 0,
      startEntityY: 0,
    })
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + (e.deltaY > 0 ? -0.1 : 0.1)))
    setZoomLevel(newZoom)
  }

  const handleDelete = () => {
    if (selectedEntityId) {
      onDeleteEntity(selectedEntityId)
    }
  }

  return (
    <div className="scene-editor">
      <div className="editor-toolbar">
        <span className="toolbar-title">Scene Editor</span>
        <div className="toolbar-controls">
          <span className="zoom-display">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={() => setZoomLevel(1)} title="Reset zoom">
            🔍 Reset
          </button>
          {selectedEntityId && (
            <button onClick={handleDelete} title="Delete selected entity">
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="scene-canvas"
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="editor-info">
        {selectedEntityId ? (
          <>
            <div className="entity-info">
              {(() => {
                const entity = entities.find(e => e.id === selectedEntityId)
                if (!entity) return null
                const transform = entity.components.find(c => c.type === 'Transform')
                return (
                  <>
                    <strong>{entity.name}</strong>
                    <div className="coordinates">
                      {transform && (
                        <>
                          X: {Math.round((transform.properties.x as number) || 0)} Y:{' '}
                          {Math.round((transform.properties.y as number) || 0)}
                        </>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </>
        ) : (
          <div className="empty-info">Click on entities to select</div>
        )}
      </div>
    </div>
  )
}
