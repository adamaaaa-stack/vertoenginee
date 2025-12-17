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
  STRING: 'String',
  VECTOR: 'Vector',
  COLOR: 'Color',
  TIME: 'Time',
  AUDIO: 'Audio',
  PARTICLE: 'Particle',
  CONVERSION: 'Conversion',
  DEBUG: 'Debug',
  COLLECTIONS: 'Collections',
  DATA: 'Data',
  TRANSFORM: 'Transform',
  ANIMATION: 'Animation',
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
  OnKeyUp: {
    category: NODE_CATEGORIES.EVENTS,
    inputs: [],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'key', name: 'Key', type: 'string', direction: 'out' },
    ],
  },
  OnCollisionEnter: {
    category: NODE_CATEGORIES.EVENTS,
    inputs: [],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'other', name: 'Other Entity', type: 'entityRef', direction: 'out' },
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

  // Logic
  Not: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'value', name: 'Value', type: 'boolean', direction: 'in', defaultValue: false },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  And: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'boolean', direction: 'in', defaultValue: false },
      { id: 'b', name: 'B', type: 'boolean', direction: 'in', defaultValue: false },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  Or: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'boolean', direction: 'in', defaultValue: false },
      { id: 'b', name: 'B', type: 'boolean', direction: 'in', defaultValue: false },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  Equal: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'any', direction: 'in' },
      { id: 'b', name: 'B', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Equal', type: 'boolean', direction: 'out' },
    ],
  },
  NotEqual: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'any', direction: 'in' },
      { id: 'b', name: 'B', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Not Equal', type: 'boolean', direction: 'out' },
    ],
  },
  Greater: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'A > B', type: 'boolean', direction: 'out' },
    ],
  },
  Less: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'A < B', type: 'boolean', direction: 'out' },
    ],
  },

  // Debug
  Print: {
    category: 'Debug',
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
    properties: {
      prefix: { type: 'string', default: 'Log:' },
    },
  },
  Assert: {
    category: 'Debug',
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'condition', name: 'Condition', type: 'boolean', direction: 'in' },
    ],
    outputs: [
      { id: 'true_out', name: 'True', type: 'exec', direction: 'out' },
      { id: 'false_out', name: 'False', type: 'exec', direction: 'out' },
    ],
  },

  // Physics
  CheckOverlap: {
    category: NODE_CATEGORIES.PHYSICS,
    inputs: [
      { id: 'entity1', name: 'Entity 1', type: 'entityRef', direction: 'in' },
      { id: 'entity2', name: 'Entity 2', type: 'entityRef', direction: 'in' },
    ],
    outputs: [
      { id: 'overlap', name: 'Overlapping', type: 'boolean', direction: 'out' },
    ],
  },
  Raycast: {
    category: NODE_CATEGORIES.PHYSICS,
    inputs: [
      { id: 'origin', name: 'Origin', type: 'vector2', direction: 'in' },
      { id: 'direction', name: 'Direction', type: 'vector2', direction: 'in' },
      { id: 'distance', name: 'Distance', type: 'number', direction: 'in', defaultValue: 100 },
    ],
    outputs: [
      { id: 'hit', name: 'Hit', type: 'boolean', direction: 'out' },
      { id: 'entity', name: 'Hit Entity', type: 'entityRef', direction: 'out' },
      { id: 'point', name: 'Hit Point', type: 'vector2', direction: 'out' },
    ],
  },
  SetVelocity: {
    category: NODE_CATEGORIES.PHYSICS,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'velocity', name: 'Velocity', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  ApplyImpulse: {
    category: NODE_CATEGORIES.PHYSICS,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'force', name: 'Force', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },

  // Array/Object operations
  MakeArray: {
    category: 'Collections',
    inputs: [
      { id: 'element_0', name: 'Element 0', type: 'any', direction: 'in' },
      { id: 'element_1', name: 'Element 1', type: 'any', direction: 'in' },
      { id: 'element_2', name: 'Element 2', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'out' },
    ],
  },
  GetArrayElement: {
    category: 'Collections',
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'index', name: 'Index', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'element', name: 'Element', type: 'any', direction: 'out' },
    ],
  },
  SetArrayElement: {
    category: 'Collections',
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'index', name: 'Index', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'element', name: 'Element', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'array_out', name: 'Array', type: 'array', direction: 'out' },
    ],
  },
  ArrayLength: {
    category: 'Collections',
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
    ],
    outputs: [
      { id: 'length', name: 'Length', type: 'number', direction: 'out' },
    ],
  },

  // Entity operations
  GetComponent: {
    category: NODE_CATEGORIES.ENTITY,
    inputs: [
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
    ],
    outputs: [
      { id: 'component', name: 'Component', type: 'object', direction: 'out' },
    ],
    properties: {
      componentType: { type: 'string', default: 'Transform' },
    },
  },
  SetComponentProperty: {
    category: NODE_CATEGORIES.ENTITY,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
    properties: {
      componentType: { type: 'string', default: 'Transform' },
      propertyName: { type: 'string', default: 'x' },
    },
  },
  FindEntityByTag: {
    category: NODE_CATEGORIES.ENTITY,
    inputs: [
      { id: 'tag', name: 'Tag', type: 'string', direction: 'in' },
    ],
    outputs: [
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'out' },
      { id: 'found', name: 'Found', type: 'boolean', direction: 'out' },
    ],
  },
  SpawnPrefab: {
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

  // Animation
  PlayAnimation: {
    category: 'Animation',
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'animation', name: 'Animation', type: 'assetRef', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
    properties: {
      loop: { type: 'boolean', default: true },
    },
  },
  StopAnimation: {
    category: 'Animation',
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },

  // AI
  SetBlackboardValue: {
    category: NODE_CATEGORIES.AI,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
    properties: {
      key: { type: 'string', default: 'state' },
    },
  },
  GetBlackboardValue: {
    category: NODE_CATEGORIES.AI,
    inputs: [
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
    ],
    outputs: [
      { id: 'value', name: 'Value', type: 'any', direction: 'out' },
    ],
    properties: {
      key: { type: 'string', default: 'state' },
    },
  },
  StateMachine: {
    category: NODE_CATEGORIES.AI,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'entity', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'state', name: 'State', type: 'string', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'entered', name: 'State Entered', type: 'exec', direction: 'out' },
      { id: 'exited', name: 'State Exited', type: 'exec', direction: 'out' },
    ],
  },

  // String Operations
  Concatenate: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'a', name: 'A', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'b', name: 'B', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'c', name: 'C', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  StringLength: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'length', name: 'Length', type: 'number', direction: 'out' },
    ],
  },
  SubString: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'start', name: 'Start', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'length', name: 'Length', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  ToUpperCase: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  ToLowerCase: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  StringReplace: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'find', name: 'Find', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'replace', name: 'Replace', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  StringSplit: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'delimiter', name: 'Delimiter', type: 'string', direction: 'in', defaultValue: ',' },
    ],
    outputs: [
      { id: 'result', name: 'Array', type: 'array', direction: 'out' },
    ],
  },
  StringContains: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'search', name: 'Search', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Contains', type: 'boolean', direction: 'out' },
    ],
  },
  StringIndexOf: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'search', name: 'Search', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Index', type: 'number', direction: 'out' },
    ],
  },
  ParseInt: {
    category: NODE_CATEGORIES.CONVERSION,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '0' },
    ],
    outputs: [
      { id: 'result', name: 'Number', type: 'number', direction: 'out' },
    ],
  },
  ParseFloat: {
    category: NODE_CATEGORIES.CONVERSION,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '0.0' },
    ],
    outputs: [
      { id: 'result', name: 'Number', type: 'number', direction: 'out' },
    ],
  },
  ToString: {
    category: NODE_CATEGORIES.CONVERSION,
    inputs: [
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'String', type: 'string', direction: 'out' },
    ],
  },

  // Vector Operations
  MakeVector2: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'x', name: 'X', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'y', name: 'Y', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'vector', name: 'Vector', type: 'vector2', direction: 'out' },
    ],
  },
  BreakVector2: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'vector', name: 'Vector', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'x', name: 'X', type: 'number', direction: 'out' },
      { id: 'y', name: 'Y', type: 'number', direction: 'out' },
    ],
  },
  VectorDistance: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'a', name: 'A', type: 'vector2', direction: 'in' },
      { id: 'b', name: 'B', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'distance', name: 'Distance', type: 'number', direction: 'out' },
    ],
  },
  VectorDot: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'a', name: 'A', type: 'vector2', direction: 'in' },
      { id: 'b', name: 'B', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Dot', type: 'number', direction: 'out' },
    ],
  },
  VectorNormalize: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'vector', name: 'Vector', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Normalized', type: 'vector2', direction: 'out' },
    ],
  },
  VectorScale: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'vector', name: 'Vector', type: 'vector2', direction: 'in' },
      { id: 'scale', name: 'Scale', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Scaled', type: 'vector2', direction: 'out' },
    ],
  },
  VectorAdd: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'a', name: 'A', type: 'vector2', direction: 'in' },
      { id: 'b', name: 'B', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'vector2', direction: 'out' },
    ],
  },
  VectorSubtract: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'a', name: 'A', type: 'vector2', direction: 'in' },
      { id: 'b', name: 'B', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'vector2', direction: 'out' },
    ],
  },

  // Time Operations
  Timer: {
    category: NODE_CATEGORIES.TIME,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'duration', name: 'Duration', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'finished', name: 'Finished', type: 'exec', direction: 'out' },
      { id: 'elapsed', name: 'Elapsed', type: 'number', direction: 'out' },
    ],
  },
  Stopwatch: {
    category: NODE_CATEGORIES.TIME,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
    ],
    outputs: [
      { id: 'time', name: 'Time', type: 'number', direction: 'out' },
    ],
    properties: {
      startOnExecution: { type: 'boolean', default: true },
    },
  },
  GetTime: {
    category: NODE_CATEGORIES.TIME,
    inputs: [],
    outputs: [
      { id: 'time', name: 'Time', type: 'number', direction: 'out' },
    ],
  },

  // Audio Operations
  PlayAudio: {
    category: NODE_CATEGORIES.AUDIO,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'audio', name: 'Audio', type: 'assetRef', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
    properties: {
      volume: { type: 'number', default: 1 },
      loop: { type: 'boolean', default: false },
    },
  },
  StopAudio: {
    category: NODE_CATEGORIES.AUDIO,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  SetAudioVolume: {
    category: NODE_CATEGORIES.AUDIO,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'volume', name: 'Volume', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },

  // Particle Operations
  EmitParticles: {
    category: NODE_CATEGORIES.PARTICLE,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'position', name: 'Position', type: 'vector2', direction: 'in' },
      { id: 'count', name: 'Count', type: 'number', direction: 'in', defaultValue: 10 },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
    properties: {
      life: { type: 'number', default: 1 },
      spread: { type: 'number', default: 45 },
    },
  },

  // Color Operations
  MakeColor: {
    category: NODE_CATEGORIES.COLOR,
    inputs: [
      { id: 'r', name: 'Red', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'g', name: 'Green', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'b', name: 'Blue', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'a', name: 'Alpha', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'color', name: 'Color', type: 'color', direction: 'out' },
    ],
  },
  BreakColor: {
    category: NODE_CATEGORIES.COLOR,
    inputs: [
      { id: 'color', name: 'Color', type: 'color', direction: 'in' },
    ],
    outputs: [
      { id: 'r', name: 'Red', type: 'number', direction: 'out' },
      { id: 'g', name: 'Green', type: 'number', direction: 'out' },
      { id: 'b', name: 'Blue', type: 'number', direction: 'out' },
      { id: 'a', name: 'Alpha', type: 'number', direction: 'out' },
    ],
  },
  LerpColor: {
    category: NODE_CATEGORIES.COLOR,
    inputs: [
      { id: 'a', name: 'From', type: 'color', direction: 'in' },
      { id: 'b', name: 'To', type: 'color', direction: 'in' },
      { id: 't', name: 'T', type: 'number', direction: 'in', defaultValue: 0.5 },
    ],
    outputs: [
      { id: 'result', name: 'Color', type: 'color', direction: 'out' },
    ],
  },

  // Advanced Math
  Sin: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'angle', name: 'Angle (Degrees)', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Cos: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'angle', name: 'Angle (Degrees)', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Tan: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'angle', name: 'Angle (Degrees)', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Abs: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Sqrt: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Power: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'base', name: 'Base', type: 'number', direction: 'in', defaultValue: 2 },
      { id: 'exponent', name: 'Exponent', type: 'number', direction: 'in', defaultValue: 2 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Min: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Min', type: 'number', direction: 'out' },
    ],
  },
  Max: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Max', type: 'number', direction: 'out' },
    ],
  },
  Round: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Floor: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Ceil: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Modulo: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },

  // Advanced Flow
  While: {
    category: NODE_CATEGORIES.FLOW,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'condition', name: 'Condition', type: 'boolean', direction: 'in' },
    ],
    outputs: [
      { id: 'loop', name: 'Loop', type: 'exec', direction: 'out' },
      { id: 'finished', name: 'Finished', type: 'exec', direction: 'out' },
    ],
  },
  ForLoop: {
    category: NODE_CATEGORIES.FLOW,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'start', name: 'Start', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'end', name: 'End', type: 'number', direction: 'in', defaultValue: 10 },
    ],
    outputs: [
      { id: 'loop', name: 'Loop', type: 'exec', direction: 'out' },
      { id: 'finished', name: 'Finished', type: 'exec', direction: 'out' },
      { id: 'index', name: 'Index', type: 'number', direction: 'out' },
    ],
  },
  ForEachLoop: {
    category: NODE_CATEGORIES.FLOW,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
    ],
    outputs: [
      { id: 'loop', name: 'Loop', type: 'exec', direction: 'out' },
      { id: 'finished', name: 'Finished', type: 'exec', direction: 'out' },
      { id: 'element', name: 'Element', type: 'any', direction: 'out' },
      { id: 'index', name: 'Index', type: 'number', direction: 'out' },
    ],
  },
  Switch: {
    category: NODE_CATEGORIES.FLOW,
    inputs: [
      { id: 'exec_in', name: 'In', type: 'exec', direction: 'in' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'case_0', name: 'Case 0', type: 'exec', direction: 'out' },
      { id: 'case_1', name: 'Case 1', type: 'exec', direction: 'out' },
      { id: 'case_2', name: 'Case 2', type: 'exec', direction: 'out' },
      { id: 'default', name: 'Default', type: 'exec', direction: 'out' },
    ],
  },

  // Data
  CreateObject: {
    category: NODE_CATEGORIES.DATA,
    inputs: [
      { id: 'key_0', name: 'Key 0', type: 'string', direction: 'in', defaultValue: 'key0' },
      { id: 'val_0', name: 'Value 0', type: 'any', direction: 'in' },
      { id: 'key_1', name: 'Key 1', type: 'string', direction: 'in', defaultValue: 'key1' },
      { id: 'val_1', name: 'Value 1', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'object', name: 'Object', type: 'object', direction: 'out' },
    ],
  },
  GetObjectProperty: {
    category: NODE_CATEGORIES.DATA,
    inputs: [
      { id: 'object', name: 'Object', type: 'object', direction: 'in' },
      { id: 'key', name: 'Key', type: 'string', direction: 'in', defaultValue: 'key' },
    ],
    outputs: [
      { id: 'value', name: 'Value', type: 'any', direction: 'out' },
    ],
  },
  SetObjectProperty: {
    category: NODE_CATEGORIES.DATA,
    inputs: [
      { id: 'object', name: 'Object', type: 'object', direction: 'in' },
      { id: 'key', name: 'Key', type: 'string', direction: 'in', defaultValue: 'key' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'object_out', name: 'Object', type: 'object', direction: 'out' },
    ],
  },

  // Transform nodes
  Rotate: {
    category: NODE_CATEGORIES.TRANSFORM,
    inputs: [
      { id: 'entityId', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'angle', name: 'Angle (degrees)', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  Scale: {
    category: NODE_CATEGORIES.TRANSFORM,
    inputs: [
      { id: 'entityId', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'scaleX', name: 'Scale X', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'scaleY', name: 'Scale Y', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  GetRotation: {
    category: NODE_CATEGORIES.TRANSFORM,
    inputs: [
      { id: 'entityId', name: 'Entity', type: 'entityRef', direction: 'in' },
    ],
    outputs: [
      { id: 'rotation', name: 'Rotation', type: 'number', direction: 'out' },
    ],
  },
  GetScale: {
    category: NODE_CATEGORIES.TRANSFORM,
    inputs: [
      { id: 'entityId', name: 'Entity', type: 'entityRef', direction: 'in' },
    ],
    outputs: [
      { id: 'scaleX', name: 'Scale X', type: 'number', direction: 'out' },
      { id: 'scaleY', name: 'Scale Y', type: 'number', direction: 'out' },
    ],
  },

  // Array utilities
  AppendArray: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'array_out', name: 'Array', type: 'array', direction: 'out' },
    ],
  },
  RemoveArrayElement: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'index', name: 'Index', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'array_out', name: 'Array', type: 'array', direction: 'out' },
    ],
  },
  ArrayContains: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'contains', name: 'Contains', type: 'boolean', direction: 'out' },
    ],
  },
  ArrayIndexOf: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'index', name: 'Index', type: 'number', direction: 'out' },
    ],
  },
  SortArray: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
    ],
    outputs: [
      { id: 'array_out', name: 'Array', type: 'array', direction: 'out' },
    ],
  },
  ReverseArray: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
    ],
    outputs: [
      { id: 'array_out', name: 'Array', type: 'array', direction: 'out' },
    ],
  },
  SliceArray: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'start', name: 'Start', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'end', name: 'End', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'array_out', name: 'Array', type: 'array', direction: 'out' },
    ],
  },

  // More string utilities
  StringTrim: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  StringPadStart: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'length', name: 'Length', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'fillString', name: 'Fill String', type: 'string', direction: 'in', defaultValue: ' ' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  StringPadEnd: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'length', name: 'Length', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'fillString', name: 'Fill String', type: 'string', direction: 'in', defaultValue: ' ' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  StringRepeat: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'count', name: 'Count', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },

  // Comparison nodes (missing comparisons)
  GreaterOrEqual: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  LessOrEqual: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },

  // Animation nodes
  Tween: {
    category: NODE_CATEGORIES.ANIMATION,
    inputs: [
      { id: 'start', name: 'Start', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'end', name: 'End', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'duration', name: 'Duration', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'out' },
      { id: 'complete', name: 'Complete', type: 'exec', direction: 'out' },
    ],
  },
  EaseLinear: {
    category: NODE_CATEGORIES.ANIMATION,
    inputs: [
      { id: 'time', name: 'Time', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'start', name: 'Start', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'end', name: 'End', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'duration', name: 'Duration', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'out' },
    ],
  },
  EaseCubicInOut: {
    category: NODE_CATEGORIES.ANIMATION,
    inputs: [
      { id: 'time', name: 'Time', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'start', name: 'Start', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'end', name: 'End', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'duration', name: 'Duration', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'out' },
    ],
  },

  // UI nodes
  ShowUI: {
    category: NODE_CATEGORIES.UI,
    inputs: [
      { id: 'uiId', name: 'UI ID', type: 'string', direction: 'in', defaultValue: 'ui' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  HideUI: {
    category: NODE_CATEGORIES.UI,
    inputs: [
      { id: 'uiId', name: 'UI ID', type: 'string', direction: 'in', defaultValue: 'ui' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  FocusUI: {
    category: NODE_CATEGORIES.UI,
    inputs: [
      { id: 'uiId', name: 'UI ID', type: 'string', direction: 'in', defaultValue: 'ui' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  SetUIText: {
    category: NODE_CATEGORIES.UI,
    inputs: [
      { id: 'uiId', name: 'UI ID', type: 'string', direction: 'in', defaultValue: 'ui' },
      { id: 'text', name: 'Text', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },

  // State management nodes
  SaveState: {
    category: NODE_CATEGORIES.VARIABLES,
    inputs: [
      { id: 'key', name: 'Key', type: 'string', direction: 'in', defaultValue: 'state' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },
  LoadState: {
    category: NODE_CATEGORIES.VARIABLES,
    inputs: [
      { id: 'key', name: 'Key', type: 'string', direction: 'in', defaultValue: 'state' },
    ],
    outputs: [
      { id: 'value', name: 'Value', type: 'any', direction: 'out' },
    ],
  },
  ClearState: {
    category: NODE_CATEGORIES.VARIABLES,
    inputs: [
      { id: 'key', name: 'Key', type: 'string', direction: 'in', defaultValue: 'state' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
    ],
  },

  // Networking stubs
  SendHTTP: {
    category: NODE_CATEGORIES.ASSETS,
    inputs: [
      { id: 'url', name: 'URL', type: 'string', direction: 'in', defaultValue: '' },
      { id: 'method', name: 'Method', type: 'string', direction: 'in', defaultValue: 'GET' },
      { id: 'body', name: 'Body', type: 'object', direction: 'in' },
    ],
    outputs: [
      { id: 'exec_out', name: 'Out', type: 'exec', direction: 'out' },
      { id: 'response', name: 'Response', type: 'object', direction: 'out' },
      { id: 'error', name: 'Error', type: 'string', direction: 'out' },
    ],
  },
  ReceiveHTTP: {
    category: NODE_CATEGORIES.ASSETS,
    inputs: [
      { id: 'port', name: 'Port', type: 'number', direction: 'in', defaultValue: 8080 },
    ],
    outputs: [
      { id: 'onReceive', name: 'On Receive', type: 'exec', direction: 'out' },
      { id: 'data', name: 'Data', type: 'object', direction: 'out' },
    ],
  },

  // Device and environment nodes
  GetCanvasSize: {
    category: NODE_CATEGORIES.ASSETS,
    inputs: [],
    outputs: [
      { id: 'width', name: 'Width', type: 'number', direction: 'out' },
      { id: 'height', name: 'Height', type: 'number', direction: 'out' },
    ],
  },
  GetDeviceInfo: {
    category: NODE_CATEGORIES.ASSETS,
    inputs: [],
    outputs: [
      { id: 'platform', name: 'Platform', type: 'string', direction: 'out' },
      { id: 'userAgent', name: 'User Agent', type: 'string', direction: 'out' },
    ],
  },

  // Map/Dictionary operations
  MapCreate: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [],
    outputs: [
      { id: 'map', name: 'Map', type: 'object', direction: 'out' },
    ],
  },
  MapGet: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'map', name: 'Map', type: 'object', direction: 'in' },
      { id: 'key', name: 'Key', type: 'string', direction: 'in', defaultValue: 'key' },
    ],
    outputs: [
      { id: 'value', name: 'Value', type: 'any', direction: 'out' },
    ],
  },
  MapSet: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'map', name: 'Map', type: 'object', direction: 'in' },
      { id: 'key', name: 'Key', type: 'string', direction: 'in', defaultValue: 'key' },
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'map_out', name: 'Map', type: 'object', direction: 'out' },
    ],
  },
  MapKeys: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'map', name: 'Map', type: 'object', direction: 'in' },
    ],
    outputs: [
      { id: 'keys', name: 'Keys', type: 'array', direction: 'out' },
    ],
  },
  MapValues: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'map', name: 'Map', type: 'object', direction: 'in' },
    ],
    outputs: [
      { id: 'values', name: 'Values', type: 'array', direction: 'out' },
    ],
  },

  // Random nodes
  RandomInt: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'min', name: 'Min', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'max', name: 'Max', type: 'number', direction: 'in', defaultValue: 100 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  RandomFloat: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'min', name: 'Min', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'max', name: 'Max', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  RandomChoice: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
    ],
    outputs: [
      { id: 'choice', name: 'Choice', type: 'any', direction: 'out' },
    ],
  },

  // Bitwise operations
  BitwiseAnd: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  BitwiseOr: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  BitwiseXor: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'b', name: 'B', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  BitwiseNot: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'a', name: 'A', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },

  // Date/Time nodes
  GetCurrentTime: {
    category: NODE_CATEGORIES.TIME,
    inputs: [],
    outputs: [
      { id: 'time', name: 'Time (ms)', type: 'number', direction: 'out' },
    ],
  },
  GetCurrentDate: {
    category: NODE_CATEGORIES.TIME,
    inputs: [],
    outputs: [
      { id: 'year', name: 'Year', type: 'number', direction: 'out' },
      { id: 'month', name: 'Month', type: 'number', direction: 'out' },
      { id: 'day', name: 'Day', type: 'number', direction: 'out' },
    ],
  },
  FormatTime: {
    category: NODE_CATEGORIES.TIME,
    inputs: [
      { id: 'time', name: 'Time (ms)', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'format', name: 'Format', type: 'string', direction: 'in', defaultValue: 'hh:mm:ss' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },

  // JSON operations
  JSONParse: {
    category: NODE_CATEGORIES.CONVERSION,
    inputs: [
      { id: 'json', name: 'JSON String', type: 'string', direction: 'in', defaultValue: '{}' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'object', direction: 'out' },
      { id: 'error', name: 'Error', type: 'string', direction: 'out' },
    ],
  },
  JSONStringify: {
    category: NODE_CATEGORIES.CONVERSION,
    inputs: [
      { id: 'object', name: 'Object', type: 'object', direction: 'in' },
      { id: 'prettyPrint', name: 'Pretty Print', type: 'boolean', direction: 'in', defaultValue: false },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },

  // Array filter/map/reduce operations
  FilterArray: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'predicate', name: 'Predicate', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'array', direction: 'out' },
    ],
  },
  MapArray: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'mapper', name: 'Mapper', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'array', direction: 'out' },
    ],
  },
  ArrayJoin: {
    category: NODE_CATEGORIES.COLLECTIONS,
    inputs: [
      { id: 'array', name: 'Array', type: 'array', direction: 'in' },
      { id: 'separator', name: 'Separator', type: 'string', direction: 'in', defaultValue: ',' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },

  // Lerp and interpolation nodes
  LerpNumber: {
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
  LerpVector: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'a', name: 'A', type: 'vector2', direction: 'in' },
      { id: 'b', name: 'B', type: 'vector2', direction: 'in' },
      { id: 't', name: 'T', type: 'number', direction: 'in', defaultValue: 0.5 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'vector2', direction: 'out' },
    ],
  },

  // Vector operations (expanded)
  VectorLength: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'vector', name: 'Vector', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'length', name: 'Length', type: 'number', direction: 'out' },
    ],
  },
  VectorCross: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'a', name: 'A', type: 'vector2', direction: 'in' },
      { id: 'b', name: 'B', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  VectorAngle: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'a', name: 'A', type: 'vector2', direction: 'in' },
      { id: 'b', name: 'B', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'angle', name: 'Angle', type: 'number', direction: 'out' },
    ],
  },
  VectorRotate: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'vector', name: 'Vector', type: 'vector2', direction: 'in' },
      { id: 'angle', name: 'Angle', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'vector2', direction: 'out' },
    ],
  },
  VectorReflect: {
    category: NODE_CATEGORIES.VECTOR,
    inputs: [
      { id: 'vector', name: 'Vector', type: 'vector2', direction: 'in' },
      { id: 'normal', name: 'Normal', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'vector2', direction: 'out' },
    ],
  },

  // More string operations
  StringReverse: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },
  StringToCharArray: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'string', name: 'String', type: 'string', direction: 'in', defaultValue: '' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'array', direction: 'out' },
    ],
  },
  StringInterpolate: {
    category: NODE_CATEGORIES.STRING,
    inputs: [
      { id: 'template', name: 'Template', type: 'string', direction: 'in', defaultValue: 'Value: {0}' },
      { id: 'arg0', name: 'Arg 0', type: 'any', direction: 'in' },
      { id: 'arg1', name: 'Arg 1', type: 'any', direction: 'in' },
      { id: 'arg2', name: 'Arg 2', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },

  // Rounding and precision nodes
  Sign: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  Truncate: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  ToFixed: {
    category: NODE_CATEGORIES.CONVERSION,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'digits', name: 'Digits', type: 'number', direction: 'in', defaultValue: 2 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'string', direction: 'out' },
    ],
  },

  // Boolean logic nodes
  LogicalNand: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'boolean', direction: 'in', defaultValue: true },
      { id: 'b', name: 'B', type: 'boolean', direction: 'in', defaultValue: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  LogicalNor: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'boolean', direction: 'in', defaultValue: true },
      { id: 'b', name: 'B', type: 'boolean', direction: 'in', defaultValue: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  LogicalXor: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'boolean', direction: 'in', defaultValue: true },
      { id: 'b', name: 'B', type: 'boolean', direction: 'in', defaultValue: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  LogicalNot: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'a', name: 'A', type: 'boolean', direction: 'in', defaultValue: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },

  // Game-specific nodes
  PointDistance: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'p1', name: 'Point 1', type: 'vector2', direction: 'in' },
      { id: 'p2', name: 'Point 2', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'distance', name: 'Distance', type: 'number', direction: 'out' },
    ],
  },
  IsPointInCircle: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'point', name: 'Point', type: 'vector2', direction: 'in' },
      { id: 'center', name: 'Center', type: 'vector2', direction: 'in' },
      { id: 'radius', name: 'Radius', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  IsPointInRect: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'point', name: 'Point', type: 'vector2', direction: 'in' },
      { id: 'rectMin', name: 'Rect Min', type: 'vector2', direction: 'in' },
      { id: 'rectMax', name: 'Rect Max', type: 'vector2', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },

  // Color operations (expanded)
  HSVToRGB: {
    category: NODE_CATEGORIES.COLOR,
    inputs: [
      { id: 'h', name: 'Hue', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 's', name: 'Saturation', type: 'number', direction: 'in', defaultValue: 1 },
      { id: 'v', name: 'Value', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'color', name: 'Color', type: 'color', direction: 'out' },
    ],
  },
  RGBToHSV: {
    category: NODE_CATEGORIES.COLOR,
    inputs: [
      { id: 'color', name: 'Color', type: 'color', direction: 'in' },
    ],
    outputs: [
      { id: 'h', name: 'Hue', type: 'number', direction: 'out' },
      { id: 's', name: 'Saturation', type: 'number', direction: 'out' },
      { id: 'v', name: 'Value', type: 'number', direction: 'out' },
    ],
  },
  ColorInvert: {
    category: NODE_CATEGORIES.COLOR,
    inputs: [
      { id: 'color', name: 'Color', type: 'color', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'color', direction: 'out' },
    ],
  },
  ColorBrightness: {
    category: NODE_CATEGORIES.COLOR,
    inputs: [
      { id: 'color', name: 'Color', type: 'color', direction: 'in' },
      { id: 'amount', name: 'Amount', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'color', direction: 'out' },
    ],
  },

  // Procedural generation stubs
  PerlinNoise: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'x', name: 'X', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'y', name: 'Y', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'scale', name: 'Scale', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },
  SimplexNoise: {
    category: NODE_CATEGORIES.MATH,
    inputs: [
      { id: 'x', name: 'X', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'y', name: 'Y', type: 'number', direction: 'in', defaultValue: 0 },
      { id: 'scale', name: 'Scale', type: 'number', direction: 'in', defaultValue: 1 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'number', direction: 'out' },
    ],
  },

  // Type checking nodes
  GetType: {
    category: NODE_CATEGORIES.CONVERSION,
    inputs: [
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'type', name: 'Type', type: 'string', direction: 'out' },
    ],
  },
  IsNull: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'value', name: 'Value', type: 'any', direction: 'in' },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  IsNaN: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },
  IsInfinite: {
    category: NODE_CATEGORIES.LOGIC,
    inputs: [
      { id: 'value', name: 'Value', type: 'number', direction: 'in', defaultValue: 0 },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'boolean', direction: 'out' },
    ],
  },

  // Physics stub nodes
  ApplyForce: {
    category: NODE_CATEGORIES.PHYSICS,
    inputs: [
      { id: 'entityId', name: 'Entity', type: 'entityRef', direction: 'in' },
      { id: 'force', name: 'Force', type: 'vector2', direction: 'in' },
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
