import { Graph, Node, Connection, Pin } from '../core/types';
import { GRID_SIZE, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT, PIN_SIZE, PIN_HIT_RADIUS, COLORS, PIN_COLORS } from '../core/constants';

export interface ViewportState {
  offsetX: number;
  offsetY: number;
  zoomLevel: number;
  showGrid: boolean;
  gridSnap: boolean;
}

export interface HitTestResult {
  type: 'node' | 'pin' | 'connection' | 'canvas';
  nodeId?: string;
  pinId?: string;
  pinDirection?: 'in' | 'out';
  connectionId?: string;
}

export class GraphViewport {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private viewport: ViewportState;
  private selectedNodeIds: Set<string> = new Set();
  private hoveredNodeId: string | null = null;
  private hoveredPinId: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.viewport = {
      offsetX: 0,
      offsetY: 0,
      zoomLevel: 1,
      showGrid: true,
      gridSnap: true,
    };

    this.setupCanvasSize();
  }

  private setupCanvasSize(): void {
    // Use device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  pan(deltaX: number, deltaY: number): void {
    this.viewport.offsetX += deltaX;
    this.viewport.offsetY += deltaY;
  }

  zoom(zoomDelta: number, centerX?: number, centerY?: number): void {
    const oldZoom = this.viewport.zoomLevel;
    this.viewport.zoomLevel = Math.max(0.1, Math.min(5, this.viewport.zoomLevel + zoomDelta));

    // Zoom towards cursor if provided
    if (centerX !== undefined && centerY !== undefined) {
      const zoomRatio = this.viewport.zoomLevel / oldZoom;
      this.viewport.offsetX = centerX - (centerX - this.viewport.offsetX) * zoomRatio;
      this.viewport.offsetY = centerY - (centerY - this.viewport.offsetY) * zoomRatio;
    }
  }

  getViewport(): ViewportState {
    return { ...this.viewport };
  }

  setViewport(viewport: Partial<ViewportState>): void {
    this.viewport = { ...this.viewport, ...viewport };
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const relX = screenX - rect.left;
    const relY = screenY - rect.top;

    return {
      x: (relX - this.viewport.offsetX) / this.viewport.zoomLevel,
      y: (relY - this.viewport.offsetY) / this.viewport.zoomLevel,
    };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.viewport.zoomLevel + this.viewport.offsetX,
      y: worldY * this.viewport.zoomLevel + this.viewport.offsetY,
    };
  }

  render(graph: Graph): void {
    this.clear();

    if (this.viewport.showGrid) {
      this.drawGrid();
    }

    // Draw connections first (so they appear behind nodes)
    this.drawConnections(graph);

    // Draw nodes
    for (const node of graph.nodes) {
      this.drawNode(node, this.selectedNodeIds.has(node.id), this.hoveredNodeId === node.id);
    }
  }

  private clear(): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawGrid(): void {
    const gridStep = GRID_SIZE * this.viewport.zoomLevel;
    if (gridStep < 5) return; // Don't draw if too small

    this.ctx.strokeStyle = COLORS.GRID;
    this.ctx.lineWidth = 1;

    const rect = this.canvas.getBoundingClientRect();
    const startX = Math.floor(-this.viewport.offsetX / gridStep) * gridStep;
    const startY = Math.floor(-this.viewport.offsetY / gridStep) * gridStep;

    // Vertical lines
    for (let x = startX; x < rect.width; x += gridStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + this.viewport.offsetX, 0);
      this.ctx.lineTo(x + this.viewport.offsetX, rect.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y < rect.height; y += gridStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + this.viewport.offsetY);
      this.ctx.lineTo(rect.width, y + this.viewport.offsetY);
      this.ctx.stroke();
    }
  }

  private drawNode(node: Node, selected: boolean, hovered: boolean): void {
    const screen = this.worldToScreen(node.position.x, node.position.y);
    const w = node.size.width * this.viewport.zoomLevel;
    const h = node.size.height * this.viewport.zoomLevel;

    // Draw background
    this.ctx.fillStyle = selected ? COLORS.NODE_SELECTED : (hovered ? '#4a4a4a' : COLORS.NODE_DEFAULT);
    this.ctx.fillRect(screen.x, screen.y, w, h);

    // Draw border
    this.ctx.strokeStyle = selected ? '#66ff00' : '#666';
    this.ctx.lineWidth = selected ? 2 : 1;
    this.ctx.strokeRect(screen.x, screen.y, w, h);

    // Draw title
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = `${10 * this.viewport.zoomLevel}px monospace`;
    this.ctx.fillText(node.title, screen.x + 5 * this.viewport.zoomLevel, screen.y + 15 * this.viewport.zoomLevel);

    // Draw input pins
    const pinRadius = PIN_SIZE * this.viewport.zoomLevel;
    let pinY = screen.y + 25 * this.viewport.zoomLevel;
    for (const pin of node.inputs) {
      this.drawPin(screen.x - pinRadius / 2, pinY, pin, node.id, 'in');
      pinY += 18 * this.viewport.zoomLevel;
    }

    // Draw output pins
    pinY = screen.y + 25 * this.viewport.zoomLevel;
    for (const pin of node.outputs) {
      this.drawPin(screen.x + w + pinRadius / 2, pinY, pin, node.id, 'out');
      pinY += 18 * this.viewport.zoomLevel;
    }
  }

  private drawPin(x: number, y: number, pin: Pin, nodeId: string, direction: 'in' | 'out'): void {
    const radius = PIN_SIZE * this.viewport.zoomLevel;
    const color = PIN_COLORS[pin.type] || '#999';

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw pin label
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = `${8 * this.viewport.zoomLevel}px monospace`;
    const offset = direction === 'in' ? -50 : 10;
    this.ctx.fillText(pin.name, x + offset * this.viewport.zoomLevel, y + 3 * this.viewport.zoomLevel);
  }

  private drawConnections(graph: Graph): void {
    for (const connection of graph.connections) {
      const fromNode = graph.nodes.find(n => n.id === connection.fromNodeId);
      const toNode = graph.nodes.find(n => n.id === connection.toNodeId);

      if (!fromNode || !toNode) continue;

      const fromPin = fromNode.outputs.find(p => p.id === connection.fromPinId);
      const toPin = toNode.inputs.find(p => p.id === connection.toPinId);

      if (!fromPin || !toPin) continue;

      const fromScreen = this.worldToScreen(fromNode.position.x, fromNode.position.y);
      const toScreen = this.worldToScreen(toNode.position.x, toNode.position.y);

      const fromX = fromScreen.x + fromNode.size.width * this.viewport.zoomLevel;
      const fromY = fromScreen.y + 40 * this.viewport.zoomLevel;

      const toX = toScreen.x;
      const toY = toScreen.y + 40 * this.viewport.zoomLevel;

      // Draw connection line (Bezier curve)
      const color = PIN_COLORS[fromPin.type] || '#999';
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.moveTo(fromX, fromY);

      const controlX = (fromX + toX) / 2;
      this.ctx.bezierCurveTo(controlX, fromY, controlX, toY, toX, toY);

      this.ctx.stroke();
    }
  }

  hitTest(screenX: number, screenY: number, graph: Graph): HitTestResult {
    const worldCoords = this.screenToWorld(screenX, screenY);

    // Check nodes
    for (const node of graph.nodes) {
      const dist = Math.sqrt(
        Math.pow(worldCoords.x - (node.position.x + node.size.width / 2), 2) +
        Math.pow(worldCoords.y - (node.position.y + node.size.height / 2), 2)
      );

      if (
        worldCoords.x >= node.position.x &&
        worldCoords.x <= node.position.x + node.size.width &&
        worldCoords.y >= node.position.y &&
        worldCoords.y <= node.position.y + node.size.height
      ) {
        // Check pins
        const pinHitResult = this.hitTestPins(worldCoords, node);
        if (pinHitResult) return pinHitResult;

        return { type: 'node', nodeId: node.id };
      }
    }

    // Check connections
    for (const connection of graph.connections) {
      if (this.connectionHitTest(worldCoords, connection, graph)) {
        return { type: 'connection', connectionId: connection.id };
      }
    }

    return { type: 'canvas' };
  }

  private hitTestPins(coords: { x: number; y: number }, node: Node): HitTestResult | null {
    // Check output pins
    let pinY = node.position.y + 25;
    for (const pin of node.outputs) {
      const pinX = node.position.x + node.size.width;
      const dist = Math.sqrt(Math.pow(coords.x - pinX, 2) + Math.pow(coords.y - pinY, 2));
      if (dist <= PIN_HIT_RADIUS / this.viewport.zoomLevel) {
        return { type: 'pin', nodeId: node.id, pinId: pin.id, pinDirection: 'out' };
      }
      pinY += 18;
    }

    // Check input pins
    pinY = node.position.y + 25;
    for (const pin of node.inputs) {
      const pinX = node.position.x;
      const dist = Math.sqrt(Math.pow(coords.x - pinX, 2) + Math.pow(coords.y - pinY, 2));
      if (dist <= PIN_HIT_RADIUS / this.viewport.zoomLevel) {
        return { type: 'pin', nodeId: node.id, pinId: pin.id, pinDirection: 'in' };
      }
      pinY += 18;
    }

    return null;
  }

  private connectionHitTest(coords: { x: number; y: number }, connection: Connection, graph: Graph): boolean {
    // Simplified - in practice you'd check distance to Bezier curve
    return false;
  }

  selectNode(nodeId: string, deselect: boolean = false): void {
    if (deselect) {
      this.selectedNodeIds.delete(nodeId);
    } else {
      this.selectedNodeIds.add(nodeId);
    }
  }

  clearSelection(): void {
    this.selectedNodeIds.clear();
  }

  setHoveredNode(nodeId: string | null): void {
    this.hoveredNodeId = nodeId;
  }

  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodeIds.has(nodeId);
  }
}
