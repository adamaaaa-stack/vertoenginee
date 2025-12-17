import React, { useState } from 'react'
import { Node, Graph } from '../core/types'
import { NODE_DEFINITIONS } from '../core/constants'
import './propertyInspector.css'

interface PropertyInspectorProps {
  selectedNode: Node | null
  graph: Graph | null
  onPropertyChange: (nodeId: string, propertyName: string, value: unknown) => void
}

export default function PropertyInspector({
  selectedNode,
  graph,
  onPropertyChange,
}: PropertyInspectorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['properties', 'inputs', 'outputs'])
  )

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  if (!selectedNode) {
    return (
      <div className="property-inspector">
        <div className="inspector-header">Inspector</div>
        <div className="empty-state">Select a node to edit properties</div>
      </div>
    )
  }

  const nodeDef = NODE_DEFINITIONS[selectedNode.type]
  const properties = selectedNode.properties || {}

  return (
    <div className="property-inspector">
      <div className="inspector-header">Inspector</div>

      {/* Node Info */}
      <div className="inspector-section">
        <div className="section-header">Node Info</div>
        <div className="property">
          <label>Title</label>
          <input
            type="text"
            value={selectedNode.title}
            onChange={(e) => onPropertyChange(selectedNode.id, '_title', e.target.value)}
          />
        </div>
        <div className="property">
          <label>Type</label>
          <input type="text" value={selectedNode.type} disabled />
        </div>
        <div className="property">
          <label>Category</label>
          <input type="text" value={selectedNode.category} disabled />
        </div>
        <div className="property">
          <label>ID</label>
          <input type="text" value={selectedNode.id} disabled />
        </div>
      </div>

      {/* Position & Size */}
      <div className="inspector-section">
        <div className="section-header">Transform</div>
        <div className="property-row">
          <div className="property">
            <label>X</label>
            <input
              type="number"
              value={Math.round(selectedNode.position.x)}
              onChange={(e) =>
                onPropertyChange(selectedNode.id, '_posX', parseFloat(e.target.value))
              }
            />
          </div>
          <div className="property">
            <label>Y</label>
            <input
              type="number"
              value={Math.round(selectedNode.position.y)}
              onChange={(e) =>
                onPropertyChange(selectedNode.id, '_posY', parseFloat(e.target.value))
              }
            />
          </div>
        </div>
        <div className="property-row">
          <div className="property">
            <label>Width</label>
            <input
              type="number"
              value={selectedNode.size.width}
              onChange={(e) =>
                onPropertyChange(selectedNode.id, '_width', parseFloat(e.target.value))
              }
            />
          </div>
          <div className="property">
            <label>Height</label>
            <input
              type="number"
              value={selectedNode.size.height}
              onChange={(e) =>
                onPropertyChange(selectedNode.id, '_height', parseFloat(e.target.value))
              }
            />
          </div>
        </div>
      </div>

      {/* Node Properties */}
      {Object.keys(properties).length > 0 && (
        <div className="inspector-section">
          <button
            className="section-header"
            onClick={() => toggleSection('properties')}
          >
            {expandedSections.has('properties') ? '▼' : '▶'} Properties
          </button>
          {expandedSections.has('properties') && (
            <div className="properties-list">
              {Object.entries(properties).map(([key, value]) => (
                <div key={key} className="property">
                  <label>{key}</label>
                  {typeof value === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) =>
                        onPropertyChange(selectedNode.id, key, e.target.checked)
                      }
                    />
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      value={value as number}
                      onChange={(e) =>
                        onPropertyChange(selectedNode.id, key, parseFloat(e.target.value))
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(value)}
                      onChange={(e) =>
                        onPropertyChange(selectedNode.id, key, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Pins */}
      <div className="inspector-section">
        <button
          className="section-header"
          onClick={() => toggleSection('inputs')}
        >
          {expandedSections.has('inputs') ? '▼' : '▶'} Inputs ({selectedNode.inputs.length})
        </button>
        {expandedSections.has('inputs') && (
          <div className="pins-list">
            {selectedNode.inputs.map((pin) => (
              <div key={pin.id} className="pin-info">
                <span className="pin-name">{pin.name}</span>
                <span className="pin-type">{pin.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Output Pins */}
      <div className="inspector-section">
        <button
          className="section-header"
          onClick={() => toggleSection('outputs')}
        >
          {expandedSections.has('outputs') ? '▼' : '▶'} Outputs ({selectedNode.outputs.length})
        </button>
        {expandedSections.has('outputs') && (
          <div className="pins-list">
            {selectedNode.outputs.map((pin) => (
              <div key={pin.id} className="pin-info">
                <span className="pin-name">{pin.name}</span>
                <span className="pin-type">{pin.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="inspector-section">
        <div className="section-header">Notes</div>
        <textarea
          className="notes-area"
          value={selectedNode.notes || ''}
          onChange={(e) => onPropertyChange(selectedNode.id, '_notes', e.target.value)}
          placeholder="Add notes about this node..."
        />
      </div>
    </div>
  )
}
