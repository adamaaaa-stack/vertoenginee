// Node definitions and constants
import { Pin } from './types';

export const PROJECT_VERSION = 1;

// Node category definitions
export const NODE_CATEGORIES = {
  EVENTS: 'Events',
  FLOW: 'Flow',
  MATH: 'Math',
  VARIABLES: 'Variables',
  ENTITY: 'Entity/Scene',
  PHYSICS: 'Physics',
  ASSETS: 'Assets',
  UI: 'UI',
  AI: 'AI',
  LOGIC: 'Logic',
} as const;

// Node type definitions with their pins
export const NODE_DEFINITIONS: Record<
  string,
  {
    category: string;
    inputs: Pin[];
    outputs: Pin[];
    properties?: Record<string, { type: string; default?: unknown }>;
  }
> = {
  // Events
  OnStart: {
    category: NODE_CATEGORIES.EVENTS,
    inputs: [],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  OnUpdate: {
    category: NODE_CATEGORIES.EVENTS,
    inputs: [],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'delta_time', name: 'Delta Time', type: 'number', direction: 'out' },
    ],
  },
  OnPointerDown: {
    category: NODE_CATEGORIES.EVENTS,
    inputs: [],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'pos', name: 'Position', type: 'vector2', direction: 'out' },
    ],
  },
  OnPointerUp: {
    category: NODE_CATEGORIES.EVENTS,
    inputs: [],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'pos', name: 'Position', type: 'vector2', direction: 'out' },
    ],
  },
  OnKeyDown: {
    category: NODE_CATEGORIES.EVENTS,
    inputs: [],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'key', name: 'Key', type: 'string', direction: 'out' },
    ],
  },
  CustomEvent: {
    category: NODE_CATEGORIES.EVENTS,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
    properties: {
      eventName: { type: 'string', default: 'MyEvent' },
    },
  },

  // Flow control
  Branch: {
    category: NODE_CATEGORIES.FLOW,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'condition', name: 'Condition', type: 'boolean', direction: 'in' },
    ],
    outputs: [
      { id: 'true_out', name: 'True', type: 'exec', direction: 'out' },
      { id: 'false_out', name: 'False', type: 'exec', direction: 'out' },
    ],
  },
  Sequence: {
    category: NODE_CATEGORIES.FLOW,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
    ],
    outputs: [
      { id: 'out_1', name: 'Out 1', type: 'exec', direction: 'out' },
      { id: 'out_2', name: 'Out 2', type: 'exec', direction: 'out' },
      { id: 'out_3', name: 'Out 3', type: 'exec', direction: 'out' },
    ],
  },
  Delay: {
    category: NODE_CATEGORIES.FLOW,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'duration', name: 'Duration', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  DoOnce: {
    category: NODE_CATEGORIES.FLOW,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'reset', name: 'Reset', type: 'exec', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },

  // Math
  Add: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Subtract: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Multiply: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Divide: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Clamp: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'min', name: 'Min', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'max', name: 'Max', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Lerp: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 't', name: 'T', type: 'number', direction: 'in', defaultValue: 0.5 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  RandomRange: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'min', name: 'Min', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'max', name: 'Max', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },

  // Variables
  GetVariable: {
    category: NODE_CATEGORIES.VARIABLES,
    inputs: [],
    outputs: [
      { id: 'value', name: 'Value', type: 'any', direction: 'out' },
    ],
    properties: {
      variableName: { type: 'string', default: '' },
    },
  },
  SetVariable: {
    category: NODE_CATEGORIES.VARIABLES,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
    properties: {
      variableName: { type: 'string', default: '' },
    },
  },

  // Entity/Scene
  SpawnEntity: {
    category: NODE_CATEGORIES.ENTITY,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'prefab', name: 'Prefab', type: 'prefabRef', direction: 'in' },
      { id: 'position', name: 'Position', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'out' },
    ],
  },
  DestroyEntity: {
    category: NODE_CATEGORIES.ENTITY,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  SetPosition: {
    category: NODE_CATEGORIES.ENTITY,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'position', name: 'Position', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },

  // Assets
  SetSprite: {
    category: NODE_CATEGORIES.ASSETS,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'sprite', name: 'Sprite', type: 'assetRef', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  PlaySound: {
    category: NODE_CATEGORIES.ASSETS,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'audio', name: 'Audio', type: 'assetRef', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },

  // UI
  SetText: {
    category: NODE_CATEGORIES.UI,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'text', name: 'Text', type: 'string', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  SetVisible: {
    category: NODE_CATEGORIES.UI,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'visible', name: 'Visible', type: 'boolean', direction: 'in', defaultValue: true },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
};

// Grid and canvas constants
export const GRID_SIZE = 20;
export const DEFAULT_NODE_WIDTH = 180;
export const DEFAULT_NODE_HEIGHT = 60;
export const PIN_SIZE = 12;
export const PIN_HIT_RADIUS = 8;

// Colors
export const COLORS = {
  BACKGROUND: '#1e1e1e',
  GRID: '#2a2a2a',
  NODE_DEFAULT: '#3a3a3a',
  NODE_SELECTED: '#4a7c59',
  NODE_EVENT: '#c94c4c',
  NODE_FLOW: '#4a90e2',
  NODE_DATA: '#2a9d8f',
  TEXT: '#e0e0e0',
  TEXT_DARK: '#1a1a1a',
  PIN_EXEC: '#ffcc00',
  PIN_NUMBER: '#4a90e2',
  PIN_STRING: '#90ee90',
  PIN_BOOLEAN: '#ff69b4',
  PIN_VECTOR: '#ff9900',
  PIN_ASSET: '#a050ff',
  ERROR: '#ff4444',
  SUCCESS: '#44ff44',
} as const;

export const PIN_COLORS: Record<string, string> = {
  exec: COLORS.PIN_EXEC,
  number: COLORS.PIN_NUMBER,
  string: COLORS.PIN_STRING,
  boolean: COLORS.PIN_BOOLEAN,
  vector2: COLORS.PIN_VECTOR,
  vector3: COLORS.PIN_VECTOR,
  color: '#ffff00',
  assetRef: COLORS.PIN_ASSET,
  entityRef: '#00ccff',
  prefabRef: COLORS.PIN_ASSET,
  array: '#cc00ff',
  object: '#cccccc',
  any: '#888888',
};
