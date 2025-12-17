import React, { useState } from 'react'
import { Graph, ExecutionContext } from '../core/types'
import './debugger.css'

interface DebuggerProps {
  graph: Graph | null
  isRunning: boolean
  isPaused: boolean
  onBreakpointToggle: (nodeId: string) => void
  onStepOver: () => void
  onStepInto: () => void
  onResume: () => void
  onPause: () => void
  breakpoints: Set<string>
  executionContext?: ExecutionContext
  callStack: ExecutionContext[]
}

export default function Debugger({
  graph,
  isRunning,
  isPaused,
  onBreakpointToggle,
  onStepOver,
  onStepInto,
  onResume,
  onPause,
  breakpoints,
  executionContext,
  callStack,
}: DebuggerProps) {
  const [expandedVariables, setExpandedVariables] = useState<Set<string>>(new Set())
  const [watchedPins, setWatchedPins] = useState<Set<string>>(new Set())

  const toggleVariable = (varName: string) => {
    const newExpanded = new Set(expandedVariables)
    if (newExpanded.has(varName)) {
      newExpanded.delete(varName)
    } else {
      newExpanded.add(varName)
    }
    setExpandedVariables(newExpanded)
  }

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  return (
    <div className="debugger-panel">
      <div className="debugger-header">Debugger</div>

      {/* Control buttons */}
      <div className="debugger-controls">
        {isRunning && !isPaused && (
          <button onClick={onPause} title="Pause execution" className="control-btn">
            ⏸️ Pause
          </button>
        )}
        {isPaused && (
          <>
            <button onClick={onResume} title="Resume execution" className="control-btn">
              ▶️ Resume
            </button>
            <button onClick={onStepInto} title="Step into" className="control-btn">
              ⬇️ Step Into
            </button>
            <button onClick={onStepOver} title="Step over" className="control-btn">
              ➡️ Step Over
            </button>
          </>
        )}
      </div>

      {/* Call stack */}
      <div className="debugger-section">
        <div className="section-header">Call Stack</div>
        <div className="call-stack">
          {callStack.length === 0 ? (
            <div className="empty-state">Not executing</div>
          ) : (
            callStack.map((context, i) => {
              const node = graph?.nodes.find(n => n.id === context.nodeId)
              return (
                <div key={i} className="stack-frame">
                  <span className="frame-index">{i}</span>
                  <span className="frame-name">{node?.title || 'Unknown'}</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Variables */}
      <div className="debugger-section">
        <div className="section-header">Variables</div>
        <div className="variables">
          {executionContext && executionContext.variables.size === 0 ? (
            <div className="empty-state">No variables</div>
          ) : (
            Array.from(executionContext?.variables.entries() || []).map(([name, value]) => (
              <div key={name} className="variable">
                <button
                  className="expand-btn"
                  onClick={() => toggleVariable(name)}
                >
                  {typeof value === 'object' && value !== null ? '▶' : ' '}
                </button>
                <span className="variable-name">{name}</span>
                <span className="variable-type">
                  {typeof value === 'object' ? `${typeof value}` : typeof value}
                </span>
                <span className="variable-value">{formatValue(value)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Breakpoints */}
      <div className="debugger-section">
        <div className="section-header">Breakpoints ({breakpoints.size})</div>
        <div className="breakpoints">
          {breakpoints.size === 0 ? (
            <div className="empty-state">No breakpoints set</div>
          ) : (
            Array.from(breakpoints).map(nodeId => {
              const node = graph?.nodes.find(n => n.id === nodeId)
              return (
                <div key={nodeId} className="breakpoint">
                  <button
                    className="remove-btn"
                    onClick={() => onBreakpointToggle(nodeId)}
                    title="Remove breakpoint"
                  >
                    ✕
                  </button>
                  <span className="breakpoint-node">{node?.title || 'Unknown'}</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Current node info */}
      {executionContext && graph && (
        <div className="debugger-section">
          <div className="section-header">Current Node</div>
          <div className="current-node">
            {(() => {
              const node = graph.nodes.find(n => n.id === executionContext.nodeId)
              return node ? (
                <>
                  <div className="node-info">
                    <div className="node-title">{node.title}</div>
                    <div className="node-type">{node.type}</div>
                    <div className="node-category">{node.category}</div>
                  </div>
                </>
              ) : (
                <div className="empty-state">No node</div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
