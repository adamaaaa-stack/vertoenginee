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
    const [stats, setStats] = useState<ViewportStats>({
      zoomLevel: 1,
      nodeCount: 0,
      connectionCount: 0,
      offsetX: 0,
      offsetY: 0,
    })

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
      </div>
    )
  }
)

NodeViewport.displayName = 'NodeViewport'

export default NodeViewport
