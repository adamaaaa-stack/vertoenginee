import React, { useRef, useEffect, useState, forwardRef } from 'react'
import { Project, Graph, Node } from '../core/types'
import { GraphViewport, HitTestResult } from '../editor/viewport'
import './nodeEditor.css'

interface NodeEditorProps {
  project: Project
  activeGraphId: string
  onAddNode: (nodeType: string, x: number, y: number) => void
  onDeleteNode: (nodeId: string) => void
  onConnectNodes: (fromNodeId: string, fromPinId: string, toNodeId: string, toPinId: string) => void
}

interface DragState {
  nodeId?: string
  pinId?: string
  startX: number
  startY: number
  isDragging: boolean
}

const NodeEditor = forwardRef<any, NodeEditorProps>(
  ({ project, activeGraphId, onAddNode, onDeleteNode, onConnectNodes }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const viewportRef = useRef<GraphViewport | null>(null)
    const dragStateRef = useRef<DragState>({
      startX: 0,
      startY: 0,
      isDragging: false,
    })
    const [graph, setGraph] = useState<Graph | null>(null)
    const [connectionStart, setConnectionStart] = useState<{
      nodeId: string
      pinId: string
      pinDirection: 'in' | 'out'
    } | null>(null)
    const [isDragoverActive, setIsDragoverActive] = useState(false)
    const [dragPreviewPos, setDragPreviewPos] = useState<{ x: number; y: number } | null>(null)

    // Expose viewport methods to parent
    React.useImperativeHandle(ref, () => ({
      getViewport: () => viewportRef.current?.getViewport(),
      zoom: (zoomDelta: number, centerX?: number, centerY?: number) => {
        if (!canvasRef.current || !viewportRef.current) return
        const rect = canvasRef.current.getBoundingClientRect()
        const x = centerX ?? rect.width / 2
        const y = centerY ?? rect.height / 2
        viewportRef.current.zoom(zoomDelta, x, y)
      },
      resetZoom: () => {
        if (!viewportRef.current) return
        viewportRef.current.setViewport({ zoomLevel: 1, offsetX: 0, offsetY: 0 })
      },
      fitToView: (minX: number, minY: number, maxX: number, maxY: number) => {
        if (!canvasRef.current || !viewportRef.current) return
        const canvas = canvasRef.current
        const padding = 50
        const boundsWidth = maxX - minX + padding * 2
        const boundsHeight = maxY - minY + padding * 2

        const scaleX = (canvas.width / (window.devicePixelRatio || 1)) / boundsWidth
        const scaleY = (canvas.height / (window.devicePixelRatio || 1)) / boundsHeight
        const scale = Math.min(scaleX, scaleY, 1)

        viewportRef.current.setViewport({
          zoomLevel: scale,
          offsetX: (canvas.width / (window.devicePixelRatio || 1)) / 2 - (minX + (maxX - minX) / 2) * scale,
          offsetY: (canvas.height / (window.devicePixelRatio || 1)) / 2 - (minY + (maxY - minY) / 2) * scale,
        })
      },
      pan: (deltaX: number, deltaY: number) => {
        if (!viewportRef.current) return
        viewportRef.current.pan(deltaX, deltaY)
      },
      toggleGrid: () => {
        if (!viewportRef.current) return
        const current = viewportRef.current.getViewport()
        viewportRef.current.setViewport({ showGrid: !current.showGrid })
      },
      setViewportCenter: (x: number, y: number) => {
        if (!canvasRef.current || !viewportRef.current) return
        const canvas = canvasRef.current
        const viewport = viewportRef.current.getViewport()
        const centerOffsetX = (canvas.width / (window.devicePixelRatio || 1)) / 2
        const centerOffsetY = (canvas.height / (window.devicePixelRatio || 1)) / 2
        viewportRef.current.setViewport({
          offsetX: centerOffsetX - x * viewport.zoomLevel,
          offsetY: centerOffsetY - y * viewport.zoomLevel,
        })
      },
    }), [canvasRef, viewportRef])

    // Get active graph
    useEffect(() => {
      const activeGraph = project.graphs.find(g => g.id === activeGraphId)
      setGraph(activeGraph || null)
    }, [project, activeGraphId])

    // Initialize canvas and viewport
    useEffect(() => {
      if (!canvasRef.current || !graph) return
      viewportRef.current = new GraphViewport(canvasRef.current)
    }, [graph])

    // Render loop
    useEffect(() => {
      if (!viewportRef.current || !graph || !canvasRef.current) return

      let animationId: number
      const render = () => {
        viewportRef.current!.render(graph)
        if (connectionStart) {
          // Draw connection preview
          drawConnectionPreview()
        }
        if (isDragoverActive && dragPreviewPos) {
          // Draw drag preview
          drawDragPreview()
        }
        animationId = requestAnimationFrame(render)
      }

      animationId = requestAnimationFrame(render)
      return () => cancelAnimationFrame(animationId)
    }, [graph, connectionStart, isDragoverActive, dragPreviewPos])

    const drawConnectionPreview = () => {
      if (!canvasRef.current || !connectionStart || !viewportRef.current) return

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      const fromNode = graph?.nodes.find(n => n.id === connectionStart.nodeId)
      if (!fromNode) return

      const fromScreen = viewportRef.current.worldToScreen(
        fromNode.position.x,
        fromNode.position.y
      )

      ctx.strokeStyle = '#ffcc00'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(
        fromScreen.x + fromNode.size.width * viewportRef.current.getViewport().zoomLevel,
        fromScreen.y + 40 * viewportRef.current.getViewport().zoomLevel
      )
      ctx.lineTo(
        canvasRef.current.width / (window.devicePixelRatio || 1),
        canvasRef.current.height / (window.devicePixelRatio || 1)
      )
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawDragPreview = () => {
      if (!canvasRef.current || !dragPreviewPos || !viewportRef.current) return

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      const screen = viewportRef.current.worldToScreen(dragPreviewPos.x, dragPreviewPos.y)
      const w = 120 * viewportRef.current.getViewport().zoomLevel
      const h = 60 * viewportRef.current.getViewport().zoomLevel

      // Draw semi-transparent preview box
      ctx.fillStyle = 'rgba(100, 150, 255, 0.2)'
      ctx.fillRect(screen.x, screen.y, w, h)

      // Draw border
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(screen.x, screen.y, w, h)
      ctx.setLineDash([])

      // Draw center crosshair
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)'
      ctx.lineWidth = 1
      const cx = screen.x + w / 2
      const cy = screen.y + h / 2
      ctx.beginPath()
      ctx.moveTo(cx - 10, cy)
      ctx.lineTo(cx + 10, cy)
      ctx.moveTo(cx, cy - 10)
      ctx.lineTo(cx, cy + 10)
      ctx.stroke()
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !viewportRef.current || !graph) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      dragStateRef.current = {
        startX: x,
        startY: y,
        isDragging: true,
      }

      if (e.button === 0) {
        const hitResult = viewportRef.current.hitTest(x, y, graph)

        if (hitResult.type === 'pin') {
          // Start connection
          setConnectionStart({
            nodeId: hitResult.nodeId!,
            pinId: hitResult.pinId!,
            pinDirection: hitResult.pinDirection!,
          })
        } else if (hitResult.type === 'node') {
          // Select node
          dragStateRef.current.nodeId = hitResult.nodeId
          viewportRef.current.selectNode(hitResult.nodeId!, e.ctrlKey || e.metaKey)
        } else {
          // Deselect
          viewportRef.current.clearSelection()
        }
      }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !viewportRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (!dragStateRef.current.isDragging) return

      const deltaX = x - dragStateRef.current.startX
      const deltaY = y - dragStateRef.current.startY

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        if (dragStateRef.current.nodeId && graph && !connectionStart) {
          // Dragging node
          const node = graph.nodes.find(n => n.id === dragStateRef.current.nodeId)
          if (node) {
            node.position.x += deltaX / viewportRef.current.getViewport().zoomLevel
            node.position.y += deltaY / viewportRef.current.getViewport().zoomLevel
            dragStateRef.current.startX = x
            dragStateRef.current.startY = y
            setGraph({ ...graph })
          }
        } else if (!dragStateRef.current.nodeId && !connectionStart) {
          // Panning
          viewportRef.current.pan(deltaX, deltaY)
          dragStateRef.current.startX = x
          dragStateRef.current.startY = y
        }
      }
    }

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !viewportRef.current || !graph) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (connectionStart) {
        // Check if we're hovering over a pin
        const hitResult = viewportRef.current.hitTest(x, y, graph)
        if (hitResult.type === 'pin' && hitResult.pinDirection === 'in') {
          // Check compatibility
          const fromNode = graph.nodes.find(n => n.id === connectionStart.nodeId)
          const toNode = graph.nodes.find(n => n.id === hitResult.nodeId)
          if (fromNode && toNode) {
            const fromPin = fromNode.outputs.find(p => p.id === connectionStart.pinId)
            const toPin = toNode.inputs.find(p => p.id === hitResult.pinId)
            if (fromPin && toPin) {
              onConnectNodes(
                connectionStart.nodeId,
                connectionStart.pinId,
                hitResult.nodeId!,
                hitResult.pinId!
              )
            }
          }
        }
        setConnectionStart(null)
      }

      dragStateRef.current.isDragging = false
      dragStateRef.current.nodeId = undefined
    }

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (!viewportRef.current) return
      e.preventDefault()

      const rect = canvasRef.current!.getBoundingClientRect()
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1
      viewportRef.current.zoom(zoomDelta, e.clientX - rect.left, e.clientY - rect.top)
    }

    const handleDragEnter = (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }

    const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'

      if (!canvasRef.current || !viewportRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const worldCoords = viewportRef.current.screenToWorld(x, y)
      setDragPreviewPos({ x: worldCoords.x - 60, y: worldCoords.y - 30 })
      setIsDragoverActive(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLCanvasElement>) => {
      if (e.target === canvasRef.current) {
        setIsDragoverActive(false)
        setDragPreviewPos(null)
      }
    }

    const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      setIsDragoverActive(false)
      setDragPreviewPos(null)

      const nodeType = e.dataTransfer.getData('nodeType')
      if (!nodeType) return

      const rect = canvasRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (viewportRef.current) {
        const worldCoords = viewportRef.current.screenToWorld(x, y)
        onAddNode(nodeType, worldCoords.x, worldCoords.y)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNode = graph?.nodes.find(n => viewportRef.current?.isNodeSelected(n.id))
        if (selectedNode) {
          onDeleteNode(selectedNode.id)
        }
      } else if (e.key === 'Escape') {
        setConnectionStart(null)
        viewportRef.current?.clearSelection()
      }
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
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
    )
  }
)

NodeEditor.displayName = 'NodeEditor'

export default NodeEditor
