import { Node, Connection } from '../core/types'

export interface SelectionBox {
  x: number
  y: number
  width: number
  height: number
}

export function isPointInBox(
  point: { x: number; y: number },
  box: SelectionBox
): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  )
}

export function isRectOverlapping(
  rect1: SelectionBox,
  rect2: SelectionBox
): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  )
}

export function getNodesInBox(nodes: Node[], box: SelectionBox): Node[] {
  return nodes.filter((node) =>
    isRectOverlapping(box, {
      x: node.position.x,
      y: node.position.y,
      width: node.size.width,
      height: node.size.height,
    })
  )
}

export function moveSelectedNodes(
  nodes: Node[],
  selectedIds: Set<string>,
  deltaX: number,
  deltaY: number
): Node[] {
  return nodes.map((node) => {
    if (selectedIds.has(node.id)) {
      return {
        ...node,
        position: {
          x: node.position.x + deltaX,
          y: node.position.y + deltaY,
        },
      }
    }
    return node
  })
}

export function duplicateSelectedNodes(
  nodes: Node[],
  selectedIds: Set<string>,
  offsetX: number = 20,
  offsetY: number = 20
): { nodes: Node[]; newNodeIds: Map<string, string> } {
  const newNodeIds = new Map<string, string>()
  const newNodes = [...nodes]

  for (const nodeId of selectedIds) {
    const originalNode = nodes.find((n) => n.id === nodeId)
    if (originalNode) {
      const newNodeId = `node_${Math.random().toString(36).substr(2, 9)}`
      newNodeIds.set(nodeId, newNodeId)
      const duplicatedNode: Node = {
        ...JSON.parse(JSON.stringify(originalNode)),
        id: newNodeId,
        position: {
          x: originalNode.position.x + offsetX,
          y: originalNode.position.y + offsetY,
        },
      }
      newNodes.push(duplicatedNode)
    }
  }

  return { nodes: newNodes, newNodeIds }
}

export function deleteSelectedNodes(
  nodes: Node[],
  connections: Connection[],
  selectedIds: Set<string>
): { nodes: Node[]; connections: Connection[] } {
  const filteredNodes = nodes.filter((n) => !selectedIds.has(n.id))
  const filteredConnections = connections.filter(
    (c) => !selectedIds.has(c.fromNodeId) && !selectedIds.has(c.toNodeId)
  )
  return { nodes: filteredNodes, connections: filteredConnections }
}

export function getSelectedNodeBounds(
  nodes: Node[],
  selectedIds: Set<string>
): SelectionBox | null {
  const selectedNodes = nodes.filter((n) => selectedIds.has(n.id))
  if (selectedNodes.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of selectedNodes) {
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + node.size.width)
    maxY = Math.max(maxY, node.position.y + node.size.height)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function alignSelectedNodes(
  nodes: Node[],
  selectedIds: Set<string>,
  alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v'
): Node[] {
  const selectedNodes = nodes.filter((n) => selectedIds.has(n.id))
  if (selectedNodes.length <= 1) return nodes

  const bounds = getSelectedNodeBounds(nodes, selectedIds)
  if (!bounds) return nodes

  return nodes.map((node) => {
    if (!selectedIds.has(node.id)) return node

    let newPos = { ...node.position }

    switch (alignment) {
      case 'left':
        newPos.x = bounds.x
        break
      case 'right':
        newPos.x = bounds.x + bounds.width - node.size.width
        break
      case 'top':
        newPos.y = bounds.y
        break
      case 'bottom':
        newPos.y = bounds.y + bounds.height - node.size.height
        break
      case 'center-h':
        newPos.x = bounds.x + (bounds.width - node.size.width) / 2
        break
      case 'center-v':
        newPos.y = bounds.y + (bounds.height - node.size.height) / 2
        break
    }

    return { ...node, position: newPos }
  })
}
