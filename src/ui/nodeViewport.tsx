import React, { useRef, useEffect, useState, forwardRef } from 'react'
import { Project, Graph } from '../core/types'
import NodeEditor from './nodeEditor'
import { GraphViewport } from '../editor/viewport'
import './nodeViewport.css'

interface NodeViewportProps {
  project: Project
  activeGraphId: string
  onAddNode: (nodeType: string, x: number, y: number) => void
  onDeleteNode: (nodeId: string) => void
  onConnectNodes: (fromNodeId: string, fromPinId: string, toNodeId: string, toPinId: string) => void
}

interface ViewportStats {
  zoomLevel: number
  nodeCount: number
  connectionCount: number
  offsetX: number
  offsetY: number
}

const NodeViewport = forwardRef<any, NodeViewportProps>(
  ({ project, activeGraphId, onAddNode, onDeleteNode, onConnectNodes }, ref) => {
    const nodeEditorRef = useRef<any>(null)
    const minimapCanvasRef = useRef<HTMLCanvasElement>(null)
    const minimapCtxRef = useRef<CanvasRenderingContext2D | null>(null)
    const [stats, setStats] = useState<ViewportStats>({
      zoomLevel: 1,
      nodeCount: 0,
      connectionCount: 0,
      offsetX: 0,
      offsetY: 0,
    })
    const [showMinimap, setShowMinimap] = useState(true)
    const [isDraggingMinimap, setIsDraggingMinimap] = useState(false)

    // Get active graph
    const activeGraph = project.graphs.find(g => g.id === activeGraphId)

    // Update stats
    useEffect(() => {
      if (!activeGraph) return

      const updateStats = () => {
        const viewport = nodeEditorRef.current?.getViewport?.()
        if (viewport) {
          setStats({
            zoomLevel: Math.round(viewport.zoomLevel * 100),
            nodeCount: activeGraph.nodes.length,
            connectionCount: activeGraph.connections.length,
            offsetX: Math.round(viewport.offsetX),
            offsetY: Math.round(viewport.offsetY),
          })
        }
      }

      // Update on every frame
      const animationId = requestAnimationFrame(updateStats)
      return () => cancelAnimationFrame(animationId)
    }, [activeGraph])

    // Draw minimap
    useEffect(() => {
      if (!minimapCanvasRef.current || !activeGraph || !showMinimap) return

      const ctx = minimapCanvasRef.current.getContext('2d')
      if (!ctx) return

      minimapCtxRef.current = ctx

      // Clear minimap
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, minimapCanvasRef.current.width, minimapCanvasRef.current.height)

      if (activeGraph.nodes.length === 0) return

      // Calculate bounds
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (const node of activeGraph.nodes) {
        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + node.size.width)
        maxY = Math.max(maxY, node.position.y + node.size.height)
      }

      const padding = 50
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      const boundsWidth = maxX - minX
      const boundsHeight = maxY - minY

      const minimapWidth = minimapCanvasRef.current.width
      const minimapHeight = minimapCanvasRef.current.height

      const scaleX = minimapWidth / boundsWidth
      const scaleY = minimapHeight / boundsHeight
      const scale = Math.min(scaleX, scaleY)

      // Draw nodes on minimap
      for (const node of activeGraph.nodes) {
        const x = (node.position.x - minX) * scale
        const y = (node.position.y - minY) * scale
        const w = node.size.width * scale
        const h = node.size.height * scale

        ctx.fillStyle = '#4a4a4a'
        ctx.fillRect(x, y, w, h)

        ctx.strokeStyle = '#888'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, w, h)
      }

      // Draw connections on minimap
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 0.5
      for (const connection of activeGraph.connections) {
        const fromNode = activeGraph.nodes.find(n => n.id === connection.fromNodeId)
        const toNode = activeGraph.nodes.find(n => n.id === connection.toNodeId)

        if (fromNode && toNode) {
          const fromX = (fromNode.position.x + fromNode.size.width - minX) * scale
          const fromY = (fromNode.position.y + fromNode.size.height / 2 - minY) * scale
          const toX = (toNode.position.x - minX) * scale
          const toY = (toNode.position.y + toNode.size.height / 2 - minY) * scale

          ctx.beginPath()
          ctx.moveTo(fromX, fromY)
          ctx.lineTo(toX, toY)
          ctx.stroke()
        }
      }

      // Draw viewport bounds
      const viewport = nodeEditorRef.current?.getViewport?.()
      if (viewport) {
        const vpLeft = (viewport.offsetX - minX) * scale
        const vpTop = (viewport.offsetY - minY) * scale
        const vpRight = (viewport.offsetX + minimapWidth / viewport.zoomLevel - minX) * scale
        const vpBottom = (viewport.offsetY + minimapHeight / viewport.zoomLevel - minY) * scale

        ctx.strokeStyle = '#ffcc00'
        ctx.lineWidth = 1
        ctx.strokeRect(vpLeft, vpTop, vpRight - vpLeft, vpBottom - vpTop)
      }
    }, [activeGraph, showMinimap])

    const handleZoomIn = () => {
      nodeEditorRef.current?.zoom?.(0.1)
    }

    const handleZoomOut = () => {
      nodeEditorRef.current?.zoom?.(-0.1)
    }

    const handleZoomReset = () => {
      nodeEditorRef.current?.resetZoom?.()
    }

    const handleFitToView = () => {
      if (!activeGraph || activeGraph.nodes.length === 0) return

      // Calculate bounds
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (const node of activeGraph.nodes) {
        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + node.size.width)
        maxY = Math.max(maxY, node.position.y + node.size.height)
      }

      nodeEditorRef.current?.fitToView?.(minX, minY, maxX, maxY)
    }

    const handleToggleGrid = () => {
      nodeEditorRef.current?.toggleGrid?.()
    }

    const handlePan = (dx: number, dy: number) => {
      nodeEditorRef.current?.pan?.(dx, dy)
    }

    const handleMinimapMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDraggingMinimap(true)
      handleMinimapClick(e)
    }

    const handleMinimapMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingMinimap || !minimapCanvasRef.current || !activeGraph) return
      handleMinimapClick(e)
    }

    const handleMinimapMouseUp = () => {
      setIsDraggingMinimap(false)
    }

    const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!minimapCanvasRef.current || !activeGraph || activeGraph.nodes.length === 0) return

      const rect = minimapCanvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Calculate bounds
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (const node of activeGraph.nodes) {
        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + node.size.width)
        maxY = Math.max(maxY, node.position.y + node.size.height)
      }

      const padding = 50
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      const boundsWidth = maxX - minX
      const boundsHeight = maxY - minY
      const scaleX = minimapCanvasRef.current.width / boundsWidth
      const scaleY = minimapCanvasRef.current.height / boundsHeight
      const scale = Math.min(scaleX, scaleY)

      // Convert minimap coords to world coords
      const worldX = x / scale + minX
      const worldY = y / scale + minY

      // Center view on this point
      const viewport = nodeEditorRef.current?.getViewport?.()
      if (viewport) {
        const canvasWidth = minimapCanvasRef.current.width / viewport.zoomLevel
        const canvasHeight = minimapCanvasRef.current.height / viewport.zoomLevel
        nodeEditorRef.current?.setViewportCenter?.(worldX - canvasWidth / 2, worldY - canvasHeight / 2)
      }
    }

    return (
      <div className="node-viewport">
        <div className="viewport-toolbar">
          <div className="toolbar-group">
            <button
              className="viewport-btn"
              title="Zoom In (Scroll Up)"
              onClick={handleZoomIn}
            >
              <span>🔍+</span>
            </button>
            <button
              className="viewport-btn"
              title="Zoom Out (Scroll Down)"
              onClick={handleZoomOut}
            >
              <span>🔍−</span>
            </button>
            <button
              className="viewport-btn"
              title="Reset Zoom (100%)"
              onClick={handleZoomReset}
            >
              <span>1:1</span>
            </button>
            <span className="zoom-label">{stats.zoomLevel}%</span>
          </div>

          <div className="toolbar-group">
            <button
              className="viewport-btn"
              title="Fit All Nodes to View"
              onClick={handleFitToView}
            >
              <span>⬚</span>
            </button>
            <button
              className="viewport-btn"
              title="Pan Up"
              onClick={() => handlePan(0, 50)}
            >
              <span>⬆</span>
            </button>
            <button
              className="viewport-btn"
              title="Pan Down"
              onClick={() => handlePan(0, -50)}
            >
              <span>⬇</span>
            </button>
            <button
              className="viewport-btn"
              title="Pan Left"
              onClick={() => handlePan(50, 0)}
            >
              <span>⬅</span>
            </button>
            <button
              className="viewport-btn"
              title="Pan Right"
              onClick={() => handlePan(-50, 0)}
            >
              <span>➡</span>
            </button>
          </div>

          <div className="toolbar-group">
            <button
              className="viewport-btn"
              title="Toggle Grid"
              onClick={handleToggleGrid}
            >
              <span>⊞</span>
            </button>
            <button
              className="viewport-btn"
              title={showMinimap ? 'Hide Minimap' : 'Show Minimap'}
              onClick={() => setShowMinimap(!showMinimap)}
            >
              <span>🗺</span>
            </button>
          </div>

          <div className="viewport-stats">
            <span>Nodes: {stats.nodeCount}</span>
            <span>Connections: {stats.connectionCount}</span>
            <span>Pos: ({stats.offsetX}, {stats.offsetY})</span>
          </div>
        </div>

        <div className="viewport-container">
          <NodeEditor
            ref={nodeEditorRef}
            project={project}
            activeGraphId={activeGraphId}
            onAddNode={onAddNode}
            onDeleteNode={onDeleteNode}
            onConnectNodes={onConnectNodes}
          />
        </div>

        {showMinimap && (
          <div className="minimap-container">
            <div className="minimap-label">Minimap</div>
            <canvas
              ref={minimapCanvasRef}
              className="minimap-canvas"
              width={200}
              height={150}
              onMouseDown={handleMinimapMouseDown}
              onMouseMove={handleMinimapMouseMove}
              onMouseUp={handleMinimapMouseUp}
              onMouseLeave={handleMinimapMouseUp}
            />
          </div>
        )}
      </div>
    )
  }
)

NodeViewport.displayName = 'NodeViewport'

export default NodeViewport
