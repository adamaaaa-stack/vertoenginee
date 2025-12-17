import React, { useRef, useEffect, useState, forwardRef } from 'react'
import { Project, Graph } from '../core/types'
import { GraphViewport } from '../editor/viewport'
import './nodeEditor.css'

interface NodeEditorProps {
  project: Project
  activeGraphId: string
  onAddNode: (nodeType: string, x: number, y: number) => void
  onDeleteNode: (nodeId: string) => void
  onConnectNodes: (fromNodeId: string, fromPinId: string, toNodeId: string, toPinId: string) => void
}

interface TouchState {
  startX: number
  startY: number
  startDist: number
  isDragging: boolean
  isPinching: boolean
}

const NodeEditor = forwardRef<any, NodeEditorProps>(
  ({ project, activeGraphId, onAddNode, onDeleteNode, onConnectNodes }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const viewportRef = useRef<GraphViewport | null>(null)
    const touchStateRef = useRef<TouchState>({
      startX: 0,
      startY: 0,
      startDist: 0,
      isDragging: false,
      isPinching: false,
    })
    const [graph, setGraph] = useState<Graph | null>(null)

    // Initialize canvas and viewport
    useEffect(() => {
      if (!canvasRef.current) return

      viewportRef.current = new GraphViewport(canvasRef.current)

      // Get active graph
      const activeGraph = project.graphs.find(g => g.id === activeGraphId)
      setGraph(activeGraph || null)
    }, [project, activeGraphId])

    // Render loop
    useEffect(() => {
      if (!viewportRef.current || !graph) return

      const render = () => {
        viewportRef.current!.render(graph)
      }

      const animationId = requestAnimationFrame(render)
      return () => cancelAnimationFrame(animationId)
    }, [graph])

    // Handle touch/mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!canvasRef.current || !viewportRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      touchStateRef.current = {
        startX: x,
        startY: y,
        startDist: 0,
        isDragging: true,
        isPinching: false,
      }

      if (e.button === 0) {
        // Left click - select/connect
        if (graph) {
          const hitResult = viewportRef.current.hitTest(x, y, graph)
          if (hitResult.type === 'node') {
            viewportRef.current.selectNode(hitResult.nodeId!, e.ctrlKey || e.metaKey)
          } else if (hitResult.type === 'canvas') {
            viewportRef.current.clearSelection()
          }
        }
      } else if (e.button === 2) {
        // Right click - context menu
        e.preventDefault()
      }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!canvasRef.current || !viewportRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (touchStateRef.current.isDragging && !touchStateRef.current.isPinching) {
        const deltaX = x - touchStateRef.current.startX
        const deltaY = y - touchStateRef.current.startY

        viewportRef.current.pan(deltaX, deltaY)

        touchStateRef.current.startX = x
        touchStateRef.current.startY = y
      }
    }

    const handleMouseUp = () => {
      touchStateRef.current.isDragging = false
    }

    const handleWheel = (e: React.WheelEvent) => {
      if (!viewportRef.current) return
      e.preventDefault()

      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1
      viewportRef.current.zoom(zoomDelta, e.clientX, e.clientY)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
      if (!canvasRef.current) return

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        const rect = canvasRef.current.getBoundingClientRect()
        touchStateRef.current = {
          startX: touch.clientX - rect.left,
          startY: touch.clientY - rect.top,
          startDist: 0,
          isDragging: true,
          isPinching: false,
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        touchStateRef.current = {
          startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          startDist: Math.sqrt(dx * dx + dy * dy),
          isDragging: false,
          isPinching: true,
        }
      }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!canvasRef.current || !viewportRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()

      if (e.touches.length === 1 && touchStateRef.current.isDragging) {
        const touch = e.touches[0]
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top

        const deltaX = x - touchStateRef.current.startX
        const deltaY = y - touchStateRef.current.startY

        viewportRef.current.pan(deltaX, deltaY)

        touchStateRef.current.startX = x
        touchStateRef.current.startY = y
      } else if (e.touches.length === 2 && touchStateRef.current.isPinching) {
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const zoomDelta = (dist - touchStateRef.current.startDist) * 0.01
        viewportRef.current.zoom(zoomDelta)

        touchStateRef.current.startDist = dist
      }
    }

    const handleTouchEnd = () => {
      touchStateRef.current.isDragging = false
      touchStateRef.current.isPinching = false
    }

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault()
      // Show context menu
    }

    return (
      <canvas
        ref={canvasRef}
        className="node-editor-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    )
  }
)

NodeEditor.displayName = 'NodeEditor'

export default NodeEditor
