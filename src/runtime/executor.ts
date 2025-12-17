import { Graph, Node, Connection, Pin, ExecutionContext, DebuggerState } from '../core/types';

type NodeExecutor = (node: Node, context: ExecutionContext, graph: Graph) => Promise<string[]>;
type PinValueGetter = (node: Node, pinId: string, context: ExecutionContext, graph: Graph) => Promise<unknown>;

export class GraphExecutor {
  private nodeExecutors: Map<string, NodeExecutor> = new Map();
  private pinValueGetters: Map<string, PinValueGetter> = new Map();
  private debugger: DebuggerState | null = null;

  constructor() {
    this.setupDefaultExecutors();
  }

  setDebugger(debuggerState: DebuggerState | null): void {
    this.debugger = debuggerState;
  }

  private setupDefaultExecutors(): void {
    // Math nodes
    this.registerExecutor('Add', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph);
      const b = await this.getPinValue(node, 'b', context, graph);
      context.variables.set(`${node.id}_result`, (a as number) + (b as number));
      return ['result'];
    });

    this.registerExecutor('Subtract', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph);
      const b = await this.getPinValue(node, 'b', context, graph);
      context.variables.set(`${node.id}_result`, (a as number) - (b as number));
      return ['result'];
    });

    this.registerExecutor('Multiply', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph);
      const b = await this.getPinValue(node, 'b', context, graph);
      context.variables.set(`${node.id}_result`, (a as number) * (b as number));
      return ['result'];
    });

    this.registerExecutor('Divide', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph);
      const b = await this.getPinValue(node, 'b', context, graph);
      const divisor = b as number;
      if (divisor === 0) {
        throw new Error('Division by zero');
      }
      context.variables.set(`${node.id}_result`, (a as number) / divisor);
      return ['result'];
    });

    this.registerExecutor('Clamp', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph) as number;
      const min = await this.getPinValue(node, 'min', context, graph) as number;
      const max = await this.getPinValue(node, 'max', context, graph) as number;
      const clamped = Math.max(min, Math.min(max, value));
      context.variables.set(`${node.id}_result`, clamped);
      return ['result'];
    });

    this.registerExecutor('Lerp', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      const t = await this.getPinValue(node, 't', context, graph) as number;
      const result = a + (b - a) * t;
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('RandomRange', async (node, context, graph) => {
      const min = await this.getPinValue(node, 'min', context, graph) as number;
      const max = await this.getPinValue(node, 'max', context, graph) as number;
      const result = Math.random() * (max - min) + min;
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    // Flow control
    this.registerExecutor('Branch', async (node, context, graph) => {
      const condition = await this.getPinValue(node, 'condition', context, graph) as boolean;
      return condition ? ['true_out'] : ['false_out'];
    });

    this.registerExecutor('Sequence', async (node, context, graph) => {
      return ['out_1', 'out_2', 'out_3'];
    });

    this.registerExecutor('Delay', async (node, context, graph) => {
      const duration = await this.getPinValue(node, 'duration', context, graph) as number;
      await new Promise(resolve => setTimeout(resolve, duration * 1000));
      return ['exec_out'];
    });

    this.registerExecutor('DoOnce', async (node, context, graph) => {
      const executed = context.variables.get(`${node.id}_executed`);
      if (!executed) {
        context.variables.set(`${node.id}_executed`, true);
        return ['exec_out'];
      }
      return [];
    });

    // Variables
    this.registerExecutor('GetVariable', async (node, context, graph) => {
      const varName = node.properties['variableName'] as string;
      const value = context.variables.get(varName);
      context.variables.set(`${node.id}_value`, value);
      return ['value'];
    });

    this.registerExecutor('SetVariable', async (node, context, graph) => {
      const varName = node.properties['variableName'] as string;
      const value = await this.getPinValue(node, 'value', context, graph);
      context.variables.set(varName, value);
      return ['exec_out'];
    });

    // Events - these typically don't execute, they trigger
    this.registerExecutor('OnStart', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('OnUpdate', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('OnPointerDown', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('OnPointerUp', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('OnKeyDown', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('OnKeyUp', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('OnCollisionEnter', async (node, context, graph) => {
      return ['exec_out'];
    });

    // Logic
    this.registerExecutor('Not', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph) as boolean;
      context.variables.set(`${node.id}_result`, !value);
      return ['result'];
    });

    this.registerExecutor('And', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as boolean;
      const b = await this.getPinValue(node, 'b', context, graph) as boolean;
      context.variables.set(`${node.id}_result`, a && b);
      return ['result'];
    });

    this.registerExecutor('Or', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as boolean;
      const b = await this.getPinValue(node, 'b', context, graph) as boolean;
      context.variables.set(`${node.id}_result`, a || b);
      return ['result'];
    });

    this.registerExecutor('Equal', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph);
      const b = await this.getPinValue(node, 'b', context, graph);
      context.variables.set(`${node.id}_result`, a === b);
      return ['result'];
    });

    this.registerExecutor('NotEqual', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph);
      const b = await this.getPinValue(node, 'b', context, graph);
      context.variables.set(`${node.id}_result`, a !== b);
      return ['result'];
    });

    this.registerExecutor('Greater', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      context.variables.set(`${node.id}_result`, a > b);
      return ['result'];
    });

    this.registerExecutor('Less', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      context.variables.set(`${node.id}_result`, a < b);
      return ['result'];
    });

    // Debug
    this.registerExecutor('Print', async (node, context, graph) => {
      const prefix = node.properties['prefix'] as string || 'Log:';
      const value = await this.getPinValue(node, 'value', context, graph);
      console.log(prefix, value);
      return ['exec_out'];
    });

    this.registerExecutor('Assert', async (node, context, graph) => {
      const condition = await this.getPinValue(node, 'condition', context, graph) as boolean;
      return condition ? ['true_out'] : ['false_out'];
    });
  }

  registerExecutor(nodeType: string, executor: NodeExecutor): void {
    this.nodeExecutors.set(nodeType, executor);
  }

  registerPinValueGetter(key: string, getter: PinValueGetter): void {
    this.pinValueGetters.set(key, getter);
  }

  async executeGraph(graph: Graph, startNodeId?: string): Promise<void> {
    const context: ExecutionContext = {
      graphId: graph.id,
      nodeId: startNodeId || '',
      entryPoint: 'exec',
      variables: new Map(),
      currentFrame: 0,
    };

    // Initialize graph variables
    for (const variable of graph.variables) {
      context.variables.set(variable.name, variable.defaultValue);
    }

    if (startNodeId) {
      await this.executeNode(startNodeId, graph, context);
    }
  }

  private async executeNode(nodeId: string, graph: Graph, context: ExecutionContext): Promise<void> {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    context.nodeId = nodeId;

    // Check for breakpoint
    if (this.debugger?.breakpoints.has(nodeId)) {
      this.debugger.breakpointHit = true;
      return;
    }

    // Find executor for this node type
    const executor = this.nodeExecutors.get(node.type);
    if (!executor) {
      console.warn(`No executor for node type: ${node.type}`);
      return;
    }

    try {
      const outputPins = await executor(node, context, graph);

      // Execute connected nodes for each output pin
      for (const pinId of outputPins) {
        await this.executeConnectedNodes(nodeId, pinId, graph, context);
      }
    } catch (error) {
      if (this.debugger) {
        this.debugger.lastError = `Error executing node ${node.type}: ${error}`;
      }
      throw error;
    }
  }

  private async executeConnectedNodes(
    nodeId: string,
    pinId: string,
    graph: Graph,
    context: ExecutionContext
  ): Promise<void> {
    const connections = graph.connections.filter(
      c => c.fromNodeId === nodeId && c.fromPinId === pinId
    );

    for (const connection of connections) {
      // Find the input pin on the target node to determine entry point
      const targetNode = graph.nodes.find(n => n.id === connection.toNodeId);
      if (targetNode) {
        // If it's an exec pin, execute the node
        const targetPin = targetNode.inputs.find(p => p.id === connection.toPinId);
        if (targetPin?.type === 'exec') {
          await this.executeNode(connection.toNodeId, graph, context);
        }
      }
    }
  }

  private async getPinValue(
    node: Node,
    pinId: string,
    context: ExecutionContext,
    graph: Graph
  ): Promise<unknown> {
    // Check if there's a connected pin
    const incomingConnection = graph.connections.find(
      c => c.toNodeId === node.id && c.toPinId === pinId
    );

    if (incomingConnection) {
      const sourceNode = graph.nodes.find(n => n.id === incomingConnection.fromNodeId);
      if (sourceNode) {
        // Execute source node to get the value
        const key = `${incomingConnection.fromNodeId}_${incomingConnection.fromPinId}`;
        let value = context.variables.get(key);

        if (value === undefined) {
          const executor = this.nodeExecutors.get(sourceNode.type);
          if (executor) {
            await executor(sourceNode, context, graph);
            value = context.variables.get(key);
          }
        }

        return value;
      }
    }

    // Check for default value
    const pin = node.inputs.find(p => p.id === pinId);
    if (pin?.defaultValue !== undefined) {
      return pin.defaultValue;
    }

    return null;
  }

  public async watchPin(nodeId: string, pinId: string, context: ExecutionContext, graph: Graph): Promise<unknown> {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    // Try output pin first
    let pin = node.outputs.find(p => p.id === pinId);
    if (pin) {
      return context.variables.get(`${nodeId}_${pinId}`);
    }

    // Try input pin
    pin = node.inputs.find(p => p.id === pinId);
    if (pin) {
      return await this.getPinValue(node, pinId, context, graph);
    }

    return null;
  }

  public step(context: ExecutionContext, graph: Graph, nodeId: string): void {
    // Execute single node (for debugger stepping)
    const executor = this.nodeExecutors.get(
      graph.nodes.find(n => n.id === nodeId)?.type || ''
    );
    if (executor) {
      executor(graph.nodes.find(n => n.id === nodeId)!, context, graph).catch(console.error);
    }
  }
}
