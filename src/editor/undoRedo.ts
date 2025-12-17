import { Graph, Node, Connection } from '../core/types';

export type EditorAction =
  | { type: 'addNode'; node: Node }
  | { type: 'removeNode'; node: Node }
  | { type: 'updateNode'; nodeId: string; changes: Partial<Node> }
  | { type: 'moveNode'; nodeId: string; oldPos: { x: number; y: number }; newPos: { x: number; y: number } }
  | { type: 'addConnection'; connection: Connection }
  | { type: 'removeConnection'; connection: Connection }
  | { type: 'selectNode'; nodeId: string; deselect: boolean }
  | { type: 'clearSelection' };

export class UndoRedoManager {
  private undoStack: EditorAction[] = [];
  private redoStack: EditorAction[] = [];

  do(action: EditorAction): void {
    this.undoStack.push(action);
    this.redoStack = []; // Clear redo stack
  }

  undo(): EditorAction | null {
    const action = this.undoStack.pop();
    if (action) {
      this.redoStack.push(action);
    }
    return action || null;
  }

  redo(): EditorAction | null {
    const action = this.redoStack.pop();
    if (action) {
      this.undoStack.push(action);
    }
    return action || null;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  getUndoCount(): number {
    return this.undoStack.length;
  }

  getRedoCount(): number {
    return this.redoStack.length;
  }
}

export function reverseAction(action: EditorAction): EditorAction {
  switch (action.type) {
    case 'addNode':
      return { type: 'removeNode', node: action.node };
    case 'removeNode':
      return { type: 'addNode', node: action.node };
    case 'moveNode':
      return {
        type: 'moveNode',
        nodeId: action.nodeId,
        oldPos: action.newPos,
        newPos: action.oldPos,
      };
    case 'addConnection':
      return { type: 'removeConnection', connection: action.connection };
    case 'removeConnection':
      return { type: 'addConnection', connection: action.connection };
    case 'updateNode':
      // This is simplified - in practice you'd store the original values
      return action;
    case 'selectNode':
      return { ...action, deselect: !action.deselect };
    case 'clearSelection':
      return action;
    default:
      return action;
  }
}
