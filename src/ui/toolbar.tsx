import React from 'react'
import './toolbar.css'

interface ToolbarProps {
  onNew: () => void
  onSave: () => void
  onRun: () => void
  onStop: () => void
  isRunning: boolean
}

export default function Toolbar({ onNew, onSave, onRun, onStop, isRunning }: ToolbarProps) {
  return (
    <div className="toolbar">
      <button onClick={onNew} title="New Project">
        📄 New
      </button>
      <button onClick={onSave} title="Save Project">
        💾 Save
      </button>
      <div className="toolbar-separator"></div>
      <button onClick={onRun} disabled={isRunning} title="Run Game">
        ▶️ Run
      </button>
      <button onClick={onStop} disabled={!isRunning} title="Stop Game">
        ⏹️ Stop
      </button>
      <div className="toolbar-separator"></div>
      <button title="Undo">↶ Undo</button>
      <button title="Redo">↷ Redo</button>
      <div style={{ flex: 1 }}></div>
      <span className="status-indicator">Ready</span>
    </div>
  )
}
