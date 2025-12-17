import React, { useState } from 'react'
import { NODE_CATEGORIES, NODE_DEFINITIONS } from '../core/constants'
import './nodePalette.css'

interface NodePaletteProps {
  onAddNode: (nodeType: string, x: number, y: number) => void
}

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([NODE_CATEGORIES.EVENTS]))
  const [searchTerm, setSearchTerm] = useState('')

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleNodeDrag = (nodeType: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('nodeType', nodeType)
  }

  const getCategories = () => {
    const categories = new Map<string, string[]>()

    for (const [nodeType, def] of Object.entries(NODE_DEFINITIONS)) {
      if (searchTerm && !nodeType.toLowerCase().includes(searchTerm.toLowerCase())) {
        continue
      }
      if (!categories.has(def.category)) {
        categories.set(def.category, [])
      }
      categories.get(def.category)!.push(nodeType)
    }

    return categories
  }

  const categories = getCategories()

  return (
    <div className="node-palette">
      <div className="palette-header">Node Palette</div>
      <input
        type="text"
        placeholder="Search nodes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="palette-search"
      />

      <div className="palette-content">
        {Array.from(categories.entries()).map(([category, nodes]) => (
          <div key={category} className="category-group">
            <button
              className="category-button"
              onClick={() => toggleCategory(category)}
            >
              {expandedCategories.has(category) ? '▼' : '▶'} {category}
            </button>

            {expandedCategories.has(category) && (
              <div className="category-nodes">
                {nodes.map((nodeType) => (
                  <div
                    key={nodeType}
                    draggable
                    onDragStart={handleNodeDrag(nodeType)}
                    className="palette-node"
                    title={`Drag to add ${nodeType} node`}
                  >
                    {nodeType}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
