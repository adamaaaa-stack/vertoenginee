import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Project } from '../core/types'
import { createDefaultProject, saveProjectToLocalStorage } from '../utils/serialization'
import { createNode, createConnection, GraphManager } from '../graph/graph'
import { GraphExecutor } from '../runtime/executor'
import Toolbar from './toolbar'
import NodeEditor from './nodeEditor'
import NodePalette from './nodePalette'
import AssetManager from './assetManager'
import Console from './console'
import './app.css'

export default function App() {
  const [project, setProject] = useState<Project>(() => createDefaultProject('My Game'))
  const [activeGraphId, setActiveGraphId] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [consoleMessages, setConsoleMessages] = useState<Array<{ type: string; message: string }>>([])
  const nodeEditorRef = useRef<any>(null)

  // Initialize active graph
  useEffect(() => {
    if (project.scenes.length > 0 && !activeGraphId) {
      setActiveGraphId(`level_${project.scenes[0].id}`)
    }
  }, [project, activeGraphId])

  const handleAddNode = useCallback((nodeType: string, x: number, y: number) => {
    if (!activeGraphId) return

    // Find or create the active graph
    let graph = project.graphs.find(g => g.id === activeGraphId)
    if (!graph) {
      const scene = project.scenes[0]
      graph = {
        id: activeGraphId,
        name: `Level Graph - ${scene.name}`,
        type: 'level',
        scope: scene.id,
        nodes: [],
        connections: [],
        variables: [],
      }
      setProject(prev => ({
        ...prev,
        graphs: [...prev.graphs, graph!]
      }))
      return
    }

    const newNode = createNode(nodeType, x, y)

    setProject(prev => ({
      ...prev,
      graphs: prev.graphs.map(g =>
        g.id === activeGraphId
          ? { ...g, nodes: [...g.nodes, newNode] }
          : g
      )
    }))
  }, [activeGraphId, project])

  const handleDeleteNode = useCallback((nodeId: string) => {
    setProject(prev => ({
      ...prev,
      graphs: prev.graphs.map(g =>
        g.id === activeGraphId
          ? {
              ...g,
              nodes: g.nodes.filter(n => n.id !== nodeId),
              connections: g.connections.filter(
                c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
              )
            }
          : g
      )
    }))
  }, [activeGraphId])

  const handleConnectNodes = useCallback((
    fromNodeId: string,
    fromPinId: string,
    toNodeId: string,
    toPinId: string
  ) => {
    const graph = project.graphs.find(g => g.id === activeGraphId)
    if (!graph) return

    const manager = new GraphManager()

    // Validate connection
    const errors = manager.validateConnection(activeGraphId, fromNodeId, fromPinId, toNodeId, toPinId)
    if (errors.length > 0) {
      setConsoleMessages(prev => [...prev, { type: 'error', message: `Connection error: ${errors.join(', ')}` }])
      return
    }

    const connection = createConnection(
      `conn_${Math.random().toString(36).substr(2, 9)}`,
      fromNodeId,
      fromPinId,
      toNodeId,
      toPinId
    )

    setProject(prev => ({
      ...prev,
      graphs: prev.graphs.map(g =>
        g.id === activeGraphId
          ? { ...g, connections: [...g.connections, connection] }
          : g
      )
    }))
  }, [activeGraphId, project])

  const handleRun = useCallback(async () => {
    const graph = project.graphs.find(g => g.id === activeGraphId)
    if (!graph) {
      setConsoleMessages(prev => [...prev, { type: 'error', message: 'No graph loaded' }])
      return
    }

    setIsRunning(true)
    setConsoleMessages([{ type: 'info', message: 'Game running...' }])

    try {
      const executor = new GraphExecutor()

      // Find OnStart event
      const startNode = graph.nodes.find(n => n.type === 'OnStart')
      if (startNode) {
        await executor.executeGraph(graph, startNode.id)
        setConsoleMessages(prev => [...prev, { type: 'success', message: 'Graph executed successfully' }])
      } else {
        setConsoleMessages(prev => [...prev, { type: 'info', message: 'No OnStart event found' }])
      }
    } catch (error) {
      setConsoleMessages(prev => [...prev, { type: 'error', message: `Execution error: ${error}` }])
    }

    setIsRunning(false)
  }, [project, activeGraphId])

  const handleStop = useCallback(() => {
    setIsRunning(false)
    setConsoleMessages(prev => [...prev, { type: 'info', message: 'Game stopped' }])
  }, [])

  const handleNewProject = useCallback(() => {
    const newProject = createDefaultProject('My Game')
    setProject(newProject)
    setActiveGraphId('')
    setConsoleMessages([{ type: 'info', message: 'New project created' }])
  }, [])

  const handleSave = useCallback(() => {
    saveProjectToLocalStorage(project)
    setConsoleMessages(prev => [...prev, { type: 'success', message: 'Project saved to local storage' }])
  }, [project])

  return (
    <div className="app">
      <Toolbar
        onNew={handleNewProject}
        onSave={handleSave}
        onRun={handleRun}
        onStop={handleStop}
        isRunning={isRunning}
      />
      <div className="app-layout">
        <div className="left-panel">
          <NodePalette onAddNode={handleAddNode} />
        </div>
        <div className="center-area">
          <NodeEditor
            ref={nodeEditorRef}
            project={project}
            activeGraphId={activeGraphId}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onConnectNodes={handleConnectNodes}
          />
        </div>
        <div className="right-panel">
          <AssetManager project={project} setProject={setProject} />
        </div>
        <div className="console-area">
          <Console messages={consoleMessages} />
        </div>
      </div>
    </div>
  )
}
