import { Graph, Node, Connection, Variable, Pin } from '../core/types';
import { NODE_DEFINITIONS } from '../core/constants';

export class GraphManager {
  private graphs: Map<string, Graph> = new Map();
  private nextId = 0;

  createGraph(name: string, type: Graph['type'], scope?: string): Graph {
    const graph: Graph = {
      id: `graph_${this.nextId++}`,
      name,
      type,
      scope,
      nodes: [],
      connections: [],
      variables: [],
    };
    this.graphs.set(graph.id, graph);
    return graph;
  }

  getGraph(graphId: string): Graph | undefined {
    return this.graphs.get(graphId);
  }

  addNodeToGraph(graphId: string, node: Node): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);
    graph.nodes.push(node);
  }

  removeNodeFromGraph(graphId: string, nodeId: string): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);

    // Remove node
    graph.nodes = graph.nodes.filter(n => n.id !== nodeId);

    // Remove all connections connected to this node
    graph.connections = graph.connections.filter(
      c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
    );
  }

  addConnectionToGraph(graphId: string, connection: Connection): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);

    // Validate connection doesn't already exist
    if (graph.connections.some(c => c.id === connection.id)) {
      throw new Error(`Connection ${connection.id} already exists`);
    }

    graph.connections.push(connection);
  }

  removeConnectionFromGraph(graphId: string, connectionId: string): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);
    graph.connections = graph.connections.filter(c => c.id !== connectionId);
  }

  getConnectionsFromPin(graphId: string, nodeId: string, pinId: string): Connection[] {
    const graph = this.graphs.get(graphId);
    if (!graph) return [];

    return graph.connections.filter(
      c => (c.fromNodeId === nodeId && c.fromPinId === pinId) ||
           (c.toNodeId === nodeId && c.toPinId === pinId)
    );
  }

  validateConnection(graphId: string, fromNodeId: string, fromPinId: string, toNodeId: string, toPinId: string): string[] {
    const graph = this.graphs.get(graphId);
    if (!graph) return ['Graph not found'];

    const errors: string[] = [];

    const fromNode = graph.nodes.find(n => n.id === fromNodeId);
    const toNode = graph.nodes.find(n => n.id === toNodeId);

    if (!fromNode) errors.push('Source node not found');
    if (!toNode) errors.push('Target node not found');

    if (fromNode && toNode) {
      const fromPin = fromNode.outputs.find(p => p.id === fromPinId);
      const toPin = toNode.inputs.find(p => p.id === toPinId);

      if (!fromPin) errors.push('Source pin not found');
      if (!toPin) errors.push('Target pin not found');

      if (fromPin && toPin) {
        // Type compatibility check
        if (fromPin.type !== 'exec' && toPin.type !== 'exec') {
          if (fromPin.type !== toPin.type && fromPin.type !== 'any' && toPin.type !== 'any') {
            errors.push(`Type mismatch: ${fromPin.type} to ${toPin.type}`);
          }
        }

        // Can't connect exec pins across different pin types
        if (fromPin.type === 'exec' && toPin.type !== 'exec') {
          errors.push('Cannot connect exec pin to data pin');
        }
        if (fromPin.type !== 'exec' && toPin.type === 'exec') {
          errors.push('Cannot connect data pin to exec pin');
        }
      }
    }

    return errors;
  }

  addVariable(graphId: string, variable: Variable): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);
    graph.variables.push(variable);
  }

  removeVariable(graphId: string, variableId: string): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);
    graph.variables = graph.variables.filter(v => v.id !== variableId);
  }

  deleteGraph(graphId: string): void {
    this.graphs.delete(graphId);
  }
}

export function createNode(nodeType: string, x: number, y: number): Node {
  const def = NODE_DEFINITIONS[nodeType];
  if (!def) {
    throw new Error(`Unknown node type: ${nodeType}`);
  }

  // Deep clone pins to ensure each node has independent pin objects
  const inputs: Pin[] = def.inputs.map(pin => ({ ...pin, id: `${pin.id}_${Math.random().toString(36).substr(2, 9)}` }));
  const outputs: Pin[] = def.outputs.map(pin => ({ ...pin, id: `${pin.id}_${Math.random().toString(36).substr(2, 9)}` }));

  const node: Node = {
    id: `node_${Math.random().toString(36).substr(2, 9)}`,
    title: nodeType,
    category: def.category,
    type: nodeType,
    position: { x, y },
    size: { width: 180, height: 60 },
    inputs,
    outputs,
    properties: {},
  };

  // Initialize properties from definition
  if (def.properties) {
    for (const [key, prop] of Object.entries(def.properties)) {
      node.properties[key] = prop.default;
    }
  }

  return node;
}

export function createConnection(
  id: string,
  fromNodeId: string,
  fromPinId: string,
  toNodeId: string,
  toPinId: string
): Connection {
  return {
    id,
    fromNodeId,
    fromPinId,
    toNodeId,
    toPinId,
  };
}
