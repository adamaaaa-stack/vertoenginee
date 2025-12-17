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

    // Physics
    this.registerExecutor('CheckOverlap', async (node, context, graph) => {
      context.variables.set(`${node.id}_overlap`, false);
      return ['overlap'];
    });

    this.registerExecutor('Raycast', async (node, context, graph) => {
      context.variables.set(`${node.id}_hit`, false);
      return ['hit'];
    });

    this.registerExecutor('SetVelocity', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('ApplyImpulse', async (node, context, graph) => {
      return ['exec_out'];
    });

    // Collections
    this.registerExecutor('MakeArray', async (node, context, graph) => {
      const elements = [];
      for (let i = 0; i < 3; i++) {
        const element = await this.getPinValue(node, `element_${i}`, context, graph);
        if (element !== undefined) {
          elements.push(element);
        }
      }
      context.variables.set(`${node.id}_array`, elements);
      return ['array'];
    });

    this.registerExecutor('GetArrayElement', async (node, context, graph) => {
      const array = await this.getPinValue(node, 'array', context, graph) as unknown[];
      const index = await this.getPinValue(node, 'index', context, graph) as number;
      const element = array && array[Math.floor(index)];
      context.variables.set(`${node.id}_element`, element);
      return ['element'];
    });

    this.registerExecutor('SetArrayElement', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const index = await this.getPinValue(node, 'index', context, graph) as number;
      const element = await this.getPinValue(node, 'element', context, graph);
      const newArray = [...array];
      newArray[Math.floor(index)] = element;
      context.variables.set(`${node.id}_array_out`, newArray);
      return ['exec_out', 'array_out'];
    });

    this.registerExecutor('ArrayLength', async (node, context, graph) => {
      const array = await this.getPinValue(node, 'array', context, graph) as unknown[];
      context.variables.set(`${node.id}_length`, array ? array.length : 0);
      return ['length'];
    });

    // Entity
    this.registerExecutor('GetComponent', async (node, context, graph) => {
      context.variables.set(`${node.id}_component`, {});
      return ['component'];
    });

    this.registerExecutor('SetComponentProperty', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('FindEntityByTag', async (node, context, graph) => {
      context.variables.set(`${node.id}_found`, false);
      return ['found'];
    });

    this.registerExecutor('SpawnPrefab', async (node, context, graph) => {
      context.variables.set(`${node.id}_entity`, `spawned_${Math.random()}`);
      return ['exec_out', 'entity'];
    });

    // Animation
    this.registerExecutor('PlayAnimation', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('StopAnimation', async (node, context, graph) => {
      return ['exec_out'];
    });

    // AI
    this.registerExecutor('SetBlackboardValue', async (node, context, graph) => {
      const key = node.properties['key'] as string;
      const value = await this.getPinValue(node, 'value', context, graph);
      context.variables.set(`blackboard_${key}`, value);
      return ['exec_out'];
    });

    this.registerExecutor('GetBlackboardValue', async (node, context, graph) => {
      const key = node.properties['key'] as string;
      const value = context.variables.get(`blackboard_${key}`);
      context.variables.set(`${node.id}_value`, value);
      return ['value'];
    });

    this.registerExecutor('StateMachine', async (node, context, graph) => {
      const state = await this.getPinValue(node, 'state', context, graph) as string;
      const currentState = context.variables.get(`state_machine_current`);
      if (currentState !== state) {
        context.variables.set(`state_machine_current`, state);
        return ['entered'];
      }
      return ['exec_out'];
    });

    // String operations
    this.registerExecutor('Concatenate', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as string;
      const b = await this.getPinValue(node, 'b', context, graph) as string;
      const c = await this.getPinValue(node, 'c', context, graph) as string;
      context.variables.set(`${node.id}_result`, (a || '') + (b || '') + (c || ''));
      return ['result'];
    });

    this.registerExecutor('StringLength', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      context.variables.set(`${node.id}_length`, (str || '').length);
      return ['length'];
    });

    this.registerExecutor('SubString', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      const start = await this.getPinValue(node, 'start', context, graph) as number;
      const len = await this.getPinValue(node, 'length', context, graph) as number;
      context.variables.set(`${node.id}_result`, (str || '').substr(start, len));
      return ['result'];
    });

    this.registerExecutor('ToUpperCase', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').toUpperCase());
      return ['result'];
    });

    this.registerExecutor('ToLowerCase', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').toLowerCase());
      return ['result'];
    });

    this.registerExecutor('StringReplace', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      const find = await this.getPinValue(node, 'find', context, graph) as string;
      const replace = await this.getPinValue(node, 'replace', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').replaceAll(find || '', replace || ''));
      return ['result'];
    });

    this.registerExecutor('StringSplit', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      const delim = await this.getPinValue(node, 'delimiter', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').split(delim || ','));
      return ['result'];
    });

    this.registerExecutor('StringContains', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      const search = await this.getPinValue(node, 'search', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').includes(search || ''));
      return ['result'];
    });

    this.registerExecutor('StringIndexOf', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      const search = await this.getPinValue(node, 'search', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').indexOf(search || ''));
      return ['result'];
    });

    // Conversions
    this.registerExecutor('ParseInt', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      context.variables.set(`${node.id}_result`, parseInt(str as string, 10) || 0);
      return ['result'];
    });

    this.registerExecutor('ParseFloat', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      context.variables.set(`${node.id}_result`, parseFloat(str as string) || 0);
      return ['result'];
    });

    this.registerExecutor('ToString', async (node, context, graph) => {
      const val = await this.getPinValue(node, 'value', context, graph);
      context.variables.set(`${node.id}_result`, String(val));
      return ['result'];
    });

    // Vectors
    this.registerExecutor('MakeVector2', async (node, context, graph) => {
      const x = await this.getPinValue(node, 'x', context, graph) as number;
      const y = await this.getPinValue(node, 'y', context, graph) as number;
      context.variables.set(`${node.id}_vector`, { x, y });
      return ['vector'];
    });

    this.registerExecutor('BreakVector2', async (node, context, graph) => {
      const vec = await this.getPinValue(node, 'vector', context, graph) as { x: number; y: number };
      context.variables.set(`${node.id}_x`, vec?.x || 0);
      context.variables.set(`${node.id}_y`, vec?.y || 0);
      return ['x', 'y'];
    });

    this.registerExecutor('VectorDistance', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as { x: number; y: number };
      const b = await this.getPinValue(node, 'b', context, graph) as { x: number; y: number };
      const dx = (b?.x || 0) - (a?.x || 0);
      const dy = (b?.y || 0) - (a?.y || 0);
      context.variables.set(`${node.id}_distance`, Math.sqrt(dx * dx + dy * dy));
      return ['distance'];
    });

    this.registerExecutor('VectorDot', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as { x: number; y: number };
      const b = await this.getPinValue(node, 'b', context, graph) as { x: number; y: number };
      context.variables.set(`${node.id}_result`, (a?.x || 0) * (b?.x || 0) + (a?.y || 0) * (b?.y || 0));
      return ['result'];
    });

    this.registerExecutor('VectorNormalize', async (node, context, graph) => {
      const v = await this.getPinValue(node, 'vector', context, graph) as { x: number; y: number };
      const len = Math.sqrt((v?.x || 0) ** 2 + (v?.y || 0) ** 2);
      if (len === 0) {
        context.variables.set(`${node.id}_result`, { x: 0, y: 0 });
      } else {
        context.variables.set(`${node.id}_result`, { x: (v?.x || 0) / len, y: (v?.y || 0) / len });
      }
      return ['result'];
    });

    this.registerExecutor('VectorScale', async (node, context, graph) => {
      const v = await this.getPinValue(node, 'vector', context, graph) as { x: number; y: number };
      const scale = await this.getPinValue(node, 'scale', context, graph) as number;
      context.variables.set(`${node.id}_result`, { x: (v?.x || 0) * scale, y: (v?.y || 0) * scale });
      return ['result'];
    });

    this.registerExecutor('VectorAdd', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as { x: number; y: number };
      const b = await this.getPinValue(node, 'b', context, graph) as { x: number; y: number };
      context.variables.set(`${node.id}_result`, { x: (a?.x || 0) + (b?.x || 0), y: (a?.y || 0) + (b?.y || 0) });
      return ['result'];
    });

    this.registerExecutor('VectorSubtract', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as { x: number; y: number };
      const b = await this.getPinValue(node, 'b', context, graph) as { x: number; y: number };
      context.variables.set(`${node.id}_result`, { x: (a?.x || 0) - (b?.x || 0), y: (a?.y || 0) - (b?.y || 0) });
      return ['result'];
    });

    // Advanced math
    this.registerExecutor('Sin', async (node, context, graph) => {
      const angle = await this.getPinValue(node, 'angle', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.sin((angle * Math.PI) / 180));
      return ['result'];
    });

    this.registerExecutor('Cos', async (node, context, graph) => {
      const angle = await this.getPinValue(node, 'angle', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.cos((angle * Math.PI) / 180));
      return ['result'];
    });

    this.registerExecutor('Tan', async (node, context, graph) => {
      const angle = await this.getPinValue(node, 'angle', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.tan((angle * Math.PI) / 180));
      return ['result'];
    });

    this.registerExecutor('Abs', async (node, context, graph) => {
      const val = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.abs(val));
      return ['result'];
    });

    this.registerExecutor('Sqrt', async (node, context, graph) => {
      const val = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.sqrt(val));
      return ['result'];
    });

    this.registerExecutor('Power', async (node, context, graph) => {
      const base = await this.getPinValue(node, 'base', context, graph) as number;
      const exp = await this.getPinValue(node, 'exponent', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.pow(base, exp));
      return ['result'];
    });

    this.registerExecutor('Min', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.min(a, b));
      return ['result'];
    });

    this.registerExecutor('Max', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.max(a, b));
      return ['result'];
    });

    this.registerExecutor('Round', async (node, context, graph) => {
      const val = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.round(val));
      return ['result'];
    });

    this.registerExecutor('Floor', async (node, context, graph) => {
      const val = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.floor(val));
      return ['result'];
    });

    this.registerExecutor('Ceil', async (node, context, graph) => {
      const val = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.ceil(val));
      return ['result'];
    });

    this.registerExecutor('Modulo', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      context.variables.set(`${node.id}_result`, a % b);
      return ['result'];
    });

    // Flow controls
    this.registerExecutor('While', async (node, context, graph) => {
      return ['loop'];
    });

    this.registerExecutor('ForLoop', async (node, context, graph) => {
      return ['loop'];
    });

    this.registerExecutor('ForEachLoop', async (node, context, graph) => {
      return ['loop'];
    });

    this.registerExecutor('Switch', async (node, context, graph) => {
      const val = await this.getPinValue(node, 'value', context, graph);
      return ['case_0'];
    });

    // Time
    this.registerExecutor('Timer', async (node, context, graph) => {
      return ['finished'];
    });

    this.registerExecutor('Stopwatch', async (node, context, graph) => {
      context.variables.set(`${node.id}_time`, 0);
      return ['time'];
    });

    this.registerExecutor('GetTime', async (node, context, graph) => {
      context.variables.set(`${node.id}_time`, Date.now() / 1000);
      return ['time'];
    });

    // Audio
    this.registerExecutor('PlayAudio', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('StopAudio', async (node, context, graph) => {
      return ['exec_out'];
    });

    this.registerExecutor('SetAudioVolume', async (node, context, graph) => {
      return ['exec_out'];
    });

    // Particles
    this.registerExecutor('EmitParticles', async (node, context, graph) => {
      return ['exec_out'];
    });

    // Colors
    this.registerExecutor('MakeColor', async (node, context, graph) => {
      const r = await this.getPinValue(node, 'r', context, graph) as number;
      const g = await this.getPinValue(node, 'g', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      context.variables.set(`${node.id}_color`, { r, g, b, a });
      return ['color'];
    });

    this.registerExecutor('BreakColor', async (node, context, graph) => {
      const col = await this.getPinValue(node, 'color', context, graph) as { r: number; g: number; b: number; a: number };
      context.variables.set(`${node.id}_r`, col?.r || 0);
      context.variables.set(`${node.id}_g`, col?.g || 0);
      context.variables.set(`${node.id}_b`, col?.b || 0);
      context.variables.set(`${node.id}_a`, col?.a || 1);
      return ['r', 'g', 'b', 'a'];
    });

    this.registerExecutor('LerpColor', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as { r: number; g: number; b: number; a: number };
      const b = await this.getPinValue(node, 'b', context, graph) as { r: number; g: number; b: number; a: number };
      const t = await this.getPinValue(node, 't', context, graph) as number;
      context.variables.set(`${node.id}_result`, {
        r: (a?.r || 0) + ((b?.r || 0) - (a?.r || 0)) * t,
        g: (a?.g || 0) + ((b?.g || 0) - (a?.g || 0)) * t,
        b: (a?.b || 0) + ((b?.b || 0) - (a?.b || 0)) * t,
        a: (a?.a || 1) + ((b?.a || 1) - (a?.a || 1)) * t,
      });
      return ['result'];
    });

    // Data
    this.registerExecutor('CreateObject', async (node, context, graph) => {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < 2; i++) {
        const key = await this.getPinValue(node, `key_${i}`, context, graph) as string;
        const val = await this.getPinValue(node, `val_${i}`, context, graph);
        if (key) obj[key] = val;
      }
      context.variables.set(`${node.id}_object`, obj);
      return ['object'];
    });

    this.registerExecutor('GetObjectProperty', async (node, context, graph) => {
      const obj = await this.getPinValue(node, 'object', context, graph) as Record<string, unknown>;
      const key = await this.getPinValue(node, 'key', context, graph) as string;
      context.variables.set(`${node.id}_value`, obj?.[key]);
      return ['value'];
    });

    this.registerExecutor('SetObjectProperty', async (node, context, graph) => {
      const obj = (await this.getPinValue(node, 'object', context, graph) as Record<string, unknown>) || {};
      const key = await this.getPinValue(node, 'key', context, graph) as string;
      const val = await this.getPinValue(node, 'value', context, graph);
      obj[key] = val;
      context.variables.set(`${node.id}_object_out`, obj);
      return ['object_out'];
    });

    // Transform nodes
    this.registerExecutor('Rotate', async (node, context, graph) => {
      const entityId = await this.getPinValue(node, 'entityId', context, graph) as string;
      const angle = await this.getPinValue(node, 'angle', context, graph) as number;
      // Store rotation in entity (stub implementation)
      context.variables.set(`entity_${entityId}_rotation`, angle);
      return ['exec_out'];
    });

    this.registerExecutor('Scale', async (node, context, graph) => {
      const entityId = await this.getPinValue(node, 'entityId', context, graph) as string;
      const scaleX = await this.getPinValue(node, 'scaleX', context, graph) as number;
      const scaleY = await this.getPinValue(node, 'scaleY', context, graph) as number;
      context.variables.set(`entity_${entityId}_scaleX`, scaleX);
      context.variables.set(`entity_${entityId}_scaleY`, scaleY);
      return ['exec_out'];
    });

    this.registerExecutor('GetRotation', async (node, context, graph) => {
      const entityId = await this.getPinValue(node, 'entityId', context, graph) as string;
      const rotation = context.variables.get(`entity_${entityId}_rotation`) || 0;
      context.variables.set(`${node.id}_rotation`, rotation);
      return ['rotation'];
    });

    this.registerExecutor('GetScale', async (node, context, graph) => {
      const entityId = await this.getPinValue(node, 'entityId', context, graph) as string;
      const scaleX = context.variables.get(`entity_${entityId}_scaleX`) || 1;
      const scaleY = context.variables.get(`entity_${entityId}_scaleY`) || 1;
      context.variables.set(`${node.id}_scaleX`, scaleX);
      context.variables.set(`${node.id}_scaleY`, scaleY);
      return ['scaleX', 'scaleY'];
    });

    // Array utilities
    this.registerExecutor('AppendArray', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const value = await this.getPinValue(node, 'value', context, graph);
      const newArray = [...array, value];
      context.variables.set(`${node.id}_array_out`, newArray);
      return ['array_out'];
    });

    this.registerExecutor('RemoveArrayElement', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const index = await this.getPinValue(node, 'index', context, graph) as number;
      const newArray = array.filter((_, i) => i !== index);
      context.variables.set(`${node.id}_array_out`, newArray);
      return ['array_out'];
    });

    this.registerExecutor('ArrayContains', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const value = await this.getPinValue(node, 'value', context, graph);
      const contains = array.includes(value);
      context.variables.set(`${node.id}_contains`, contains);
      return ['contains'];
    });

    this.registerExecutor('ArrayIndexOf', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const value = await this.getPinValue(node, 'value', context, graph);
      const index = array.indexOf(value);
      context.variables.set(`${node.id}_index`, index);
      return ['index'];
    });

    this.registerExecutor('SortArray', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const sorted = [...array].sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      });
      context.variables.set(`${node.id}_array_out`, sorted);
      return ['array_out'];
    });

    this.registerExecutor('ReverseArray', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const reversed = [...array].reverse();
      context.variables.set(`${node.id}_array_out`, reversed);
      return ['array_out'];
    });

    this.registerExecutor('SliceArray', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const start = await this.getPinValue(node, 'start', context, graph) as number;
      const end = await this.getPinValue(node, 'end', context, graph) as number;
      const sliced = array.slice(start, end);
      context.variables.set(`${node.id}_array_out`, sliced);
      return ['array_out'];
    });

    // More string utilities
    this.registerExecutor('StringTrim', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').trim());
      return ['result'];
    });

    this.registerExecutor('StringPadStart', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      const length = await this.getPinValue(node, 'length', context, graph) as number;
      const fillString = await this.getPinValue(node, 'fillString', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').padStart(length, fillString));
      return ['result'];
    });

    this.registerExecutor('StringPadEnd', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      const length = await this.getPinValue(node, 'length', context, graph) as number;
      const fillString = await this.getPinValue(node, 'fillString', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').padEnd(length, fillString));
      return ['result'];
    });

    this.registerExecutor('StringRepeat', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      const count = await this.getPinValue(node, 'count', context, graph) as number;
      context.variables.set(`${node.id}_result`, (str || '').repeat(Math.max(0, count)));
      return ['result'];
    });

    // Comparison nodes
    this.registerExecutor('GreaterOrEqual', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      context.variables.set(`${node.id}_result`, a >= b);
      return ['result'];
    });

    this.registerExecutor('LessOrEqual', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      context.variables.set(`${node.id}_result`, a <= b);
      return ['result'];
    });

    // Animation nodes
    this.registerExecutor('Tween', async (node, context, graph) => {
      const start = await this.getPinValue(node, 'start', context, graph) as number;
      const end = await this.getPinValue(node, 'end', context, graph) as number;
      const duration = await this.getPinValue(node, 'duration', context, graph) as number;
      // Stub: return current value (should be animated over time)
      context.variables.set(`${node.id}_value`, start + (end - start) * 0.5);
      return ['value'];
    });

    this.registerExecutor('EaseLinear', async (node, context, graph) => {
      const time = await this.getPinValue(node, 'time', context, graph) as number;
      const start = await this.getPinValue(node, 'start', context, graph) as number;
      const end = await this.getPinValue(node, 'end', context, graph) as number;
      const duration = await this.getPinValue(node, 'duration', context, graph) as number;
      const t = Math.min(time / duration, 1);
      const value = start + (end - start) * t;
      context.variables.set(`${node.id}_value`, value);
      return ['value'];
    });

    this.registerExecutor('EaseCubicInOut', async (node, context, graph) => {
      const time = await this.getPinValue(node, 'time', context, graph) as number;
      const start = await this.getPinValue(node, 'start', context, graph) as number;
      const end = await this.getPinValue(node, 'end', context, graph) as number;
      const duration = await this.getPinValue(node, 'duration', context, graph) as number;
      let t = Math.min(time / duration, 1);
      // Cubic easing function
      t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const value = start + (end - start) * t;
      context.variables.set(`${node.id}_value`, value);
      return ['value'];
    });

    // UI nodes
    this.registerExecutor('ShowUI', async (node, context, graph) => {
      const uiId = await this.getPinValue(node, 'uiId', context, graph) as string;
      context.variables.set(`ui_${uiId}_visible`, true);
      return ['exec_out'];
    });

    this.registerExecutor('HideUI', async (node, context, graph) => {
      const uiId = await this.getPinValue(node, 'uiId', context, graph) as string;
      context.variables.set(`ui_${uiId}_visible`, false);
      return ['exec_out'];
    });

    this.registerExecutor('FocusUI', async (node, context, graph) => {
      const uiId = await this.getPinValue(node, 'uiId', context, graph) as string;
      context.variables.set(`ui_${uiId}_focused`, true);
      return ['exec_out'];
    });

    this.registerExecutor('SetUIText', async (node, context, graph) => {
      const uiId = await this.getPinValue(node, 'uiId', context, graph) as string;
      const text = await this.getPinValue(node, 'text', context, graph) as string;
      context.variables.set(`ui_${uiId}_text`, text);
      return ['exec_out'];
    });

    // State management nodes
    this.registerExecutor('SaveState', async (node, context, graph) => {
      const key = await this.getPinValue(node, 'key', context, graph) as string;
      const value = await this.getPinValue(node, 'value', context, graph);
      context.variables.set(`state_${key}`, value);
      return ['exec_out'];
    });

    this.registerExecutor('LoadState', async (node, context, graph) => {
      const key = await this.getPinValue(node, 'key', context, graph) as string;
      const value = context.variables.get(`state_${key}`);
      context.variables.set(`${node.id}_value`, value);
      return ['value'];
    });

    this.registerExecutor('ClearState', async (node, context, graph) => {
      const key = await this.getPinValue(node, 'key', context, graph) as string;
      context.variables.delete(`state_${key}`);
      return ['exec_out'];
    });

    // Networking stubs
    this.registerExecutor('SendHTTP', async (node, context, graph) => {
      const url = await this.getPinValue(node, 'url', context, graph) as string;
      const method = await this.getPinValue(node, 'method', context, graph) as string;
      const body = await this.getPinValue(node, 'body', context, graph);
      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        context.variables.set(`${node.id}_response`, data);
        context.variables.set(`${node.id}_error`, '');
      } catch (error) {
        context.variables.set(`${node.id}_error`, String(error));
      }
      return ['exec_out'];
    });

    this.registerExecutor('ReceiveHTTP', async (node, context, graph) => {
      // Stub: Server-side listening would require a separate backend
      context.variables.set(`${node.id}_data`, {});
      return ['onReceive'];
    });

    // More math nodes
    this.registerExecutor('Abs', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.abs(a));
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

    // More debug nodes
    this.registerExecutor('DebugBreak', async (node, context, graph) => {
      const condition = await this.getPinValue(node, 'condition', context, graph) as boolean;
      const message = await this.getPinValue(node, 'message', context, graph) as string;
      if (condition) {
        console.log(`[DebugBreak] ${message}`);
        if (this.debugger) {
          this.debugger.breakpointHit = true;
        }
      }
      return ['exec_out'];
    });

    this.registerExecutor('Assert', async (node, context, graph) => {
      const condition = await this.getPinValue(node, 'condition', context, graph) as boolean;
      const message = await this.getPinValue(node, 'message', context, graph) as string;
      if (!condition) {
        console.error(`[Assert] ${message}`);
        if (this.debugger) {
          this.debugger.lastError = message;
        }
      }
      return ['exec_out'];
    });

    // Device and environment nodes
    this.registerExecutor('GetCanvasSize', async (node, context, graph) => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const height = typeof window !== 'undefined' ? window.innerHeight : 768;
      context.variables.set(`${node.id}_width`, width);
      context.variables.set(`${node.id}_height`, height);
      return ['width', 'height'];
    });

    this.registerExecutor('GetDeviceInfo', async (node, context, graph) => {
      const platform = typeof window !== 'undefined' ? navigator.platform : 'unknown';
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'unknown';
      context.variables.set(`${node.id}_platform`, platform);
      context.variables.set(`${node.id}_userAgent`, userAgent);
      return ['platform', 'userAgent'];
    });

    // Map/Dictionary operations
    this.registerExecutor('MapCreate', async (node, context, graph) => {
      context.variables.set(`${node.id}_map`, {});
      return ['map'];
    });

    this.registerExecutor('MapGet', async (node, context, graph) => {
      const map = (await this.getPinValue(node, 'map', context, graph) as Record<string, unknown>) || {};
      const key = await this.getPinValue(node, 'key', context, graph) as string;
      context.variables.set(`${node.id}_value`, map[key]);
      return ['value'];
    });

    this.registerExecutor('MapSet', async (node, context, graph) => {
      const map = (await this.getPinValue(node, 'map', context, graph) as Record<string, unknown>) || {};
      const key = await this.getPinValue(node, 'key', context, graph) as string;
      const value = await this.getPinValue(node, 'value', context, graph);
      const newMap = { ...map, [key]: value };
      context.variables.set(`${node.id}_map_out`, newMap);
      return ['map_out'];
    });

    this.registerExecutor('MapKeys', async (node, context, graph) => {
      const map = (await this.getPinValue(node, 'map', context, graph) as Record<string, unknown>) || {};
      const keys = Object.keys(map);
      context.variables.set(`${node.id}_keys`, keys);
      return ['keys'];
    });

    this.registerExecutor('MapValues', async (node, context, graph) => {
      const map = (await this.getPinValue(node, 'map', context, graph) as Record<string, unknown>) || {};
      const values = Object.values(map);
      context.variables.set(`${node.id}_values`, values);
      return ['values'];
    });

    // Random nodes
    this.registerExecutor('RandomInt', async (node, context, graph) => {
      const min = await this.getPinValue(node, 'min', context, graph) as number;
      const max = await this.getPinValue(node, 'max', context, graph) as number;
      const result = Math.floor(Math.random() * (max - min + 1)) + min;
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('RandomFloat', async (node, context, graph) => {
      const min = await this.getPinValue(node, 'min', context, graph) as number;
      const max = await this.getPinValue(node, 'max', context, graph) as number;
      const result = Math.random() * (max - min) + min;
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('RandomChoice', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const choice = array[Math.floor(Math.random() * array.length)];
      context.variables.set(`${node.id}_choice`, choice);
      return ['choice'];
    });

    // Bitwise operations
    this.registerExecutor('BitwiseAnd', async (node, context, graph) => {
      const a = Math.floor(await this.getPinValue(node, 'a', context, graph) as number);
      const b = Math.floor(await this.getPinValue(node, 'b', context, graph) as number);
      context.variables.set(`${node.id}_result`, a & b);
      return ['result'];
    });

    this.registerExecutor('BitwiseOr', async (node, context, graph) => {
      const a = Math.floor(await this.getPinValue(node, 'a', context, graph) as number);
      const b = Math.floor(await this.getPinValue(node, 'b', context, graph) as number);
      context.variables.set(`${node.id}_result`, a | b);
      return ['result'];
    });

    this.registerExecutor('BitwiseXor', async (node, context, graph) => {
      const a = Math.floor(await this.getPinValue(node, 'a', context, graph) as number);
      const b = Math.floor(await this.getPinValue(node, 'b', context, graph) as number);
      context.variables.set(`${node.id}_result`, a ^ b);
      return ['result'];
    });

    this.registerExecutor('BitwiseNot', async (node, context, graph) => {
      const a = Math.floor(await this.getPinValue(node, 'a', context, graph) as number);
      context.variables.set(`${node.id}_result`, ~a);
      return ['result'];
    });

    // Date/Time nodes
    this.registerExecutor('GetCurrentTime', async (node, context, graph) => {
      context.variables.set(`${node.id}_time`, Date.now());
      return ['time'];
    });

    this.registerExecutor('GetCurrentDate', async (node, context, graph) => {
      const date = new Date();
      context.variables.set(`${node.id}_year`, date.getFullYear());
      context.variables.set(`${node.id}_month`, date.getMonth() + 1);
      context.variables.set(`${node.id}_day`, date.getDate());
      return ['year', 'month', 'day'];
    });

    this.registerExecutor('FormatTime', async (node, context, graph) => {
      const time = await this.getPinValue(node, 'time', context, graph) as number;
      const seconds = Math.floor(time / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      context.variables.set(`${node.id}_result`, formatted);
      return ['result'];
    });

    // JSON operations
    this.registerExecutor('JSONParse', async (node, context, graph) => {
      const json = await this.getPinValue(node, 'json', context, graph) as string;
      try {
        const result = JSON.parse(json);
        context.variables.set(`${node.id}_result`, result);
        context.variables.set(`${node.id}_error`, '');
      } catch (error) {
        context.variables.set(`${node.id}_error`, String(error));
      }
      return ['result', 'error'];
    });

    this.registerExecutor('JSONStringify', async (node, context, graph) => {
      const obj = await this.getPinValue(node, 'object', context, graph);
      const pretty = await this.getPinValue(node, 'prettyPrint', context, graph) as boolean;
      const result = JSON.stringify(obj, null, pretty ? 2 : 0);
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    // Array operations
    this.registerExecutor('FilterArray', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      // Stub: simple filter by truthy values
      const result = array.filter(v => v);
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('MapArray', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      // Stub: return as-is
      context.variables.set(`${node.id}_result`, array);
      return ['result'];
    });

    this.registerExecutor('ArrayJoin', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      const separator = await this.getPinValue(node, 'separator', context, graph) as string;
      const result = array.join(separator);
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('ArrayLength', async (node, context, graph) => {
      const array = (await this.getPinValue(node, 'array', context, graph) as unknown[]) || [];
      context.variables.set(`${node.id}_length`, array.length);
      return ['length'];
    });

    // Lerp operations
    this.registerExecutor('LerpNumber', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as number;
      const b = await this.getPinValue(node, 'b', context, graph) as number;
      const t = await this.getPinValue(node, 't', context, graph) as number;
      const result = a + (b - a) * t;
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('LerpVector', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as any;
      const b = await this.getPinValue(node, 'b', context, graph) as any;
      const t = await this.getPinValue(node, 't', context, graph) as number;
      const result = {
        x: (a?.x || 0) + ((b?.x || 0) - (a?.x || 0)) * t,
        y: (a?.y || 0) + ((b?.y || 0) - (a?.y || 0)) * t,
      };
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    // Vector operations (expanded)
    this.registerExecutor('VectorLength', async (node, context, graph) => {
      const vector = await this.getPinValue(node, 'vector', context, graph) as any;
      const length = Math.sqrt((vector?.x || 0) ** 2 + (vector?.y || 0) ** 2);
      context.variables.set(`${node.id}_length`, length);
      return ['length'];
    });

    this.registerExecutor('VectorCross', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as any;
      const b = await this.getPinValue(node, 'b', context, graph) as any;
      // 2D cross product
      const result = (a?.x || 0) * (b?.y || 0) - (a?.y || 0) * (b?.x || 0);
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('VectorAngle', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as any;
      const b = await this.getPinValue(node, 'b', context, graph) as any;
      const dotProduct = (a?.x || 0) * (b?.x || 0) + (a?.y || 0) * (b?.y || 0);
      const lenA = Math.sqrt((a?.x || 0) ** 2 + (a?.y || 0) ** 2);
      const lenB = Math.sqrt((b?.x || 0) ** 2 + (b?.y || 0) ** 2);
      const angle = lenA && lenB ? Math.acos(dotProduct / (lenA * lenB)) : 0;
      context.variables.set(`${node.id}_angle`, angle);
      return ['angle'];
    });

    this.registerExecutor('VectorRotate', async (node, context, graph) => {
      const vector = await this.getPinValue(node, 'vector', context, graph) as any;
      const angle = await this.getPinValue(node, 'angle', context, graph) as number;
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const result = {
        x: (vector?.x || 0) * cos - (vector?.y || 0) * sin,
        y: (vector?.x || 0) * sin + (vector?.y || 0) * cos,
      };
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('VectorReflect', async (node, context, graph) => {
      const vector = await this.getPinValue(node, 'vector', context, graph) as any;
      const normal = await this.getPinValue(node, 'normal', context, graph) as any;
      const dotProduct = (vector?.x || 0) * (normal?.x || 0) + (vector?.y || 0) * (normal?.y || 0);
      const result = {
        x: (vector?.x || 0) - 2 * dotProduct * (normal?.x || 0),
        y: (vector?.y || 0) - 2 * dotProduct * (normal?.y || 0),
      };
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    // String operations
    this.registerExecutor('StringReverse', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').split('').reverse().join(''));
      return ['result'];
    });

    this.registerExecutor('StringToCharArray', async (node, context, graph) => {
      const str = await this.getPinValue(node, 'string', context, graph) as string;
      context.variables.set(`${node.id}_result`, (str || '').split(''));
      return ['result'];
    });

    this.registerExecutor('StringInterpolate', async (node, context, graph) => {
      const template = await this.getPinValue(node, 'template', context, graph) as string;
      const arg0 = await this.getPinValue(node, 'arg0', context, graph);
      const arg1 = await this.getPinValue(node, 'arg1', context, graph);
      const arg2 = await this.getPinValue(node, 'arg2', context, graph);
      const result = (template || '')
        .replace('{0}', String(arg0 || ''))
        .replace('{1}', String(arg1 || ''))
        .replace('{2}', String(arg2 || ''));
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    // Math precision nodes
    this.registerExecutor('Sign', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.sign(value));
      return ['result'];
    });

    this.registerExecutor('Truncate', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, Math.trunc(value));
      return ['result'];
    });

    this.registerExecutor('ToFixed', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph) as number;
      const digits = await this.getPinValue(node, 'digits', context, graph) as number;
      context.variables.set(`${node.id}_result`, value.toFixed(Math.max(0, digits)));
      return ['result'];
    });

    // Boolean logic nodes
    this.registerExecutor('LogicalNand', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as boolean;
      const b = await this.getPinValue(node, 'b', context, graph) as boolean;
      context.variables.set(`${node.id}_result`, !(a && b));
      return ['result'];
    });

    this.registerExecutor('LogicalNor', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as boolean;
      const b = await this.getPinValue(node, 'b', context, graph) as boolean;
      context.variables.set(`${node.id}_result`, !(a || b));
      return ['result'];
    });

    this.registerExecutor('LogicalXor', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as boolean;
      const b = await this.getPinValue(node, 'b', context, graph) as boolean;
      context.variables.set(`${node.id}_result`, a !== b);
      return ['result'];
    });

    this.registerExecutor('LogicalNot', async (node, context, graph) => {
      const a = await this.getPinValue(node, 'a', context, graph) as boolean;
      context.variables.set(`${node.id}_result`, !a);
      return ['result'];
    });

    // Game-specific nodes
    this.registerExecutor('PointDistance', async (node, context, graph) => {
      const p1 = await this.getPinValue(node, 'p1', context, graph) as any;
      const p2 = await this.getPinValue(node, 'p2', context, graph) as any;
      const distance = Math.hypot((p2?.x || 0) - (p1?.x || 0), (p2?.y || 0) - (p1?.y || 0));
      context.variables.set(`${node.id}_distance`, distance);
      return ['distance'];
    });

    this.registerExecutor('IsPointInCircle', async (node, context, graph) => {
      const point = await this.getPinValue(node, 'point', context, graph) as any;
      const center = await this.getPinValue(node, 'center', context, graph) as any;
      const radius = await this.getPinValue(node, 'radius', context, graph) as number;
      const distance = Math.hypot((point?.x || 0) - (center?.x || 0), (point?.y || 0) - (center?.y || 0));
      context.variables.set(`${node.id}_result`, distance <= radius);
      return ['result'];
    });

    this.registerExecutor('IsPointInRect', async (node, context, graph) => {
      const point = await this.getPinValue(node, 'point', context, graph) as any;
      const rectMin = await this.getPinValue(node, 'rectMin', context, graph) as any;
      const rectMax = await this.getPinValue(node, 'rectMax', context, graph) as any;
      const result = (point?.x || 0) >= (rectMin?.x || 0) &&
                     (point?.x || 0) <= (rectMax?.x || 0) &&
                     (point?.y || 0) >= (rectMin?.y || 0) &&
                     (point?.y || 0) <= (rectMax?.y || 0);
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    // Color operations
    this.registerExecutor('HSVToRGB', async (node, context, graph) => {
      const h = await this.getPinValue(node, 'h', context, graph) as number;
      const s = await this.getPinValue(node, 's', context, graph) as number;
      const v = await this.getPinValue(node, 'v', context, graph) as number;
      const c = v * s;
      const hp = h / 60;
      const x = c * (1 - Math.abs((hp % 2) - 1));
      let r = 0, g = 0, b = 0;
      if (hp >= 0 && hp < 1) { r = c; g = x; b = 0; }
      else if (hp >= 1 && hp < 2) { r = x; g = c; b = 0; }
      else if (hp >= 2 && hp < 3) { r = 0; g = c; b = x; }
      else if (hp >= 3 && hp < 4) { r = 0; g = x; b = c; }
      else if (hp >= 4 && hp < 5) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }
      const m = v - c;
      context.variables.set(`${node.id}_color`, {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
      });
      return ['color'];
    });

    this.registerExecutor('RGBToHSV', async (node, context, graph) => {
      const color = await this.getPinValue(node, 'color', context, graph) as any;
      const r = (color?.r || 0) / 255;
      const g = (color?.g || 0) / 255;
      const b = (color?.b || 0) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      let h = 0;
      if (d !== 0) {
        if (max === r) h = 60 * (((g - b) / d) % 6);
        else if (max === g) h = 60 * ((b - r) / d + 2);
        else h = 60 * ((r - g) / d + 4);
      }
      const s = max === 0 ? 0 : d / max;
      context.variables.set(`${node.id}_h`, h);
      context.variables.set(`${node.id}_s`, s);
      context.variables.set(`${node.id}_v`, max);
      return ['h', 's', 'v'];
    });

    this.registerExecutor('ColorInvert', async (node, context, graph) => {
      const color = await this.getPinValue(node, 'color', context, graph) as any;
      context.variables.set(`${node.id}_result`, {
        r: 255 - (color?.r || 0),
        g: 255 - (color?.g || 0),
        b: 255 - (color?.b || 0),
      });
      return ['result'];
    });

    this.registerExecutor('ColorBrightness', async (node, context, graph) => {
      const color = await this.getPinValue(node, 'color', context, graph) as any;
      const amount = await this.getPinValue(node, 'amount', context, graph) as number;
      context.variables.set(`${node.id}_result`, {
        r: Math.max(0, Math.min(255, (color?.r || 0) + amount)),
        g: Math.max(0, Math.min(255, (color?.g || 0) + amount)),
        b: Math.max(0, Math.min(255, (color?.b || 0) + amount)),
      });
      return ['result'];
    });

    // Procedural generation (simple stubs)
    this.registerExecutor('PerlinNoise', async (node, context, graph) => {
      const x = await this.getPinValue(node, 'x', context, graph) as number;
      const y = await this.getPinValue(node, 'y', context, graph) as number;
      // Simple pseudo-random based on coordinates
      const result = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    this.registerExecutor('SimplexNoise', async (node, context, graph) => {
      const x = await this.getPinValue(node, 'x', context, graph) as number;
      const y = await this.getPinValue(node, 'y', context, graph) as number;
      // Simple pseudo-random
      const result = Math.sin(x * 23.14069263277926 + y * 2.665144142690225) * 43758.5453 % 1;
      context.variables.set(`${node.id}_result`, result);
      return ['result'];
    });

    // Type checking nodes
    this.registerExecutor('GetType', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph);
      let type: string = typeof value;
      if (type === 'object' && Array.isArray(value)) type = 'array';
      context.variables.set(`${node.id}_type`, type);
      return ['type'];
    });

    this.registerExecutor('IsNull', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph);
      context.variables.set(`${node.id}_result`, value === null || value === undefined);
      return ['result'];
    });

    this.registerExecutor('IsNaN', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, isNaN(value));
      return ['result'];
    });

    this.registerExecutor('IsInfinite', async (node, context, graph) => {
      const value = await this.getPinValue(node, 'value', context, graph) as number;
      context.variables.set(`${node.id}_result`, !isFinite(value));
      return ['result'];
    });

    // Physics stub nodes
    this.registerExecutor('ApplyForce', async (node, context, graph) => {
      const entityId = await this.getPinValue(node, 'entityId', context, graph) as string;
      const force = await this.getPinValue(node, 'force', context, graph) as any;
      // Stub: store force for entity
      const velocity = context.variables.get(`entity_${entityId}_velocity`) || { x: 0, y: 0 };
      context.variables.set(`entity_${entityId}_velocity`, {
        x: (velocity as any).x + (force?.x || 0) * 0.016,
        y: (velocity as any).y + (force?.y || 0) * 0.016,
      });
      return ['exec_out'];
    });

    this.registerExecutor('SetVelocity', async (node, context, graph) => {
      const entityId = await this.getPinValue(node, 'entityId', context, graph) as string;
      const velocity = await this.getPinValue(node, 'velocity', context, graph);
      context.variables.set(`entity_${entityId}_velocity`, velocity);
      return ['exec_out'];
    });

    this.registerExecutor('GetVelocity', async (node, context, graph) => {
      const entityId = await this.getPinValue(node, 'entityId', context, graph) as string;
      const velocity = context.variables.get(`entity_${entityId}_velocity`) || { x: 0, y: 0 };
      context.variables.set(`${node.id}_velocity`, velocity);
      return ['velocity'];
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
