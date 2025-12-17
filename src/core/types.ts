// Fundamental type definitions for the game engine

// Pin data types
export type PinDataType =
  | 'exec'       // Execution flow (no value)
  | 'number'
  | 'string'
  | 'boolean'
  | 'vector2'
  | 'vector3'
  | 'color'
  | 'assetRef'
  | 'entityRef'
  | 'prefabRef'
  | 'array'      // array<T>
  | 'object'     // Untyped object
  | 'any';

// Pin definition
export interface Pin {
  id: string;
  name: string;
  type: PinDataType;
  direction: 'in' | 'out'; // input or output
  isArray?: boolean;
  arrayElementType?: PinDataType;
  defaultValue?: unknown;
  tooltip?: string;
}

// Connection between two pins
export interface Connection {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
}

// Node definition
export interface Node {
  id: string;
  title: string;
  category: string; // e.g., "Events", "Flow", "Math", "Entity"
  type: string; // specific node type like "OnStart", "Branch", "Add"
  position: { x: number; y: number };
  size: { width: number; height: number };
  inputs: Pin[];
  outputs: Pin[];
  properties: Record<string, unknown>; // Node-specific properties
  breakpoint?: boolean;
  notes?: string;
}

// Graph definition
export interface Graph {
  id: string;
  name: string;
  type: 'level' | 'entity' | 'component' | 'ui' | 'function';
  scope?: string; // For entity/component graphs: entity ID or component type
  nodes: Node[];
  connections: Connection[];
  variables: Variable[];
  description?: string;
}

// Variable definitions (can be global, scene, entity, or local)
export interface Variable {
  id: string;
  name: string;
  type: PinDataType;
  scope: 'global' | 'scene' | 'entity' | 'local';
  defaultValue?: unknown;
  isArray?: boolean;
}

// Asset types
export interface Asset {
  id: string;
  name: string;
  type: 'sprite' | 'audio' | 'spritesheet' | 'json' | 'font' | 'other';
  url?: string; // For external assets
  data?: string; // Base64 encoded data
  tags: string[];
  metadata: Record<string, unknown>;
  thumbnail?: string; // Base64 thumbnail
}

// Entity-Component System types
export interface Component {
  id: string;
  type: string; // e.g., "Transform", "SpriteRenderer", "Collider"
  properties: Record<string, unknown>;
}

export interface Entity {
  id: string;
  name: string;
  prefabId?: string;
  tags: string[];
  active: boolean;
  components: Component[];
}

export interface Scene {
  id: string;
  name: string;
  entities: Entity[];
  graph?: Graph; // Level graph for this scene
  backgroundColor?: string;
  metadata: Record<string, unknown>;
}

export interface Prefab {
  id: string;
  name: string;
  entity: Entity;
  tags: string[];
  thumbnail?: string;
}

// Project structure
export interface Project {
  id: string;
  name: string;
  version: number;
  scenes: Scene[];
  prefabs: Prefab[];
  assets: Asset[];
  graphs: Graph[];
  globalVariables: Variable[];
  settings: {
    canvasWidth: number;
    canvasHeight: number;
    targetFPS: number;
  };
}

// Runtime execution context
export interface ExecutionContext {
  graphId: string;
  nodeId: string;
  entryPoint: 'exec' | 'property'; // exec pin or property evaluation
  variables: Map<string, unknown>;
  breakpointHit?: boolean;
  currentFrame: number;
}

// Debugger state
export interface DebuggerState {
  running: boolean;
  paused: boolean;
  breakpoints: Set<string>; // Node IDs with breakpoints
  breakpointHit?: boolean;
  watchedPins: Map<string, string>; // nodeId -> pinId
  callStack: ExecutionContext[];
  lastError?: string;
}

// Editor state
export interface EditorState {
  selectedNodeIds: Set<string>;
  selectedConnectionIds: Set<string>;
  hoveredNodeId?: string;
  hoveredPinId?: string;
  clipboard: (Node | Connection)[];
  viewportOffset: { x: number; y: number };
  zoomLevel: number;
  gridSnap: boolean;
  showGrid: boolean;
}
