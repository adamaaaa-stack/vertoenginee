# Verto Engine - Node-Based Web Game Engine

A lightweight, web-based game engine optimized for iPad/tablets featuring a node-based visual scripting system inspired by Unreal Engine Blueprints.

## Features

### Core Architecture
- **Node-Based Visual Scripting**: Drag-and-drop node graph editing with execution flow and typed data pins
- **Entity-Component System (ECS)**: Lightweight ECS implementation for flexible game object composition
- **Multi-Scene Support**: Load/unload scenes with independent entity hierarchies
- **Asset Management**: Import and manage sprites, audio, and other assets with tagging and search

### Editor Features
- **Infinite Canvas**: Pan, zoom, and place nodes on unlimited canvas
- **Touch & Keyboard Support**: iPad-friendly touch interactions (pinch zoom, multi-finger gestures)
- **Drag & Drop**: Drag nodes from palette onto canvas, drag nodes to move, drag pins to connect
- **Node Categories**: Organized node palette with searchable categories
- **Undo/Redo**: Full undo/redo support for all editor actions
- **Real-time Rendering**: Canvas-based viewport with efficient batching

### Graph Types
- **Level Graphs**: Global scene logic
- **Entity Graphs**: Per-entity behavior (future)
- **Component Graphs**: Reusable behavior blocks (future)
- **UI Graphs**: Menu and HUD logic (future)

### Node Library (Expanding)

#### Events
- OnStart, OnUpdate, OnPointerDown, OnPointerUp
- OnKeyDown, OnKeyUp, OnCollisionEnter
- CustomEvent

#### Flow Control
- Branch, Sequence, Delay, DoOnce
- Switch, For Each (future implementations)

#### Math
- Add, Subtract, Multiply, Divide
- Clamp, Lerp, RandomRange

#### Logic
- Not, And, Or, Equal, NotEqual, Greater, Less

#### Variables
- GetVariable, SetVariable (global, scene, entity scopes)

#### Entity/Scene
- SpawnEntity, DestroyEntity, SetPosition
- LoadScene, UnloadScene, FindByTag

#### Assets
- SetSprite, PlaySound, SetAnimation

#### UI
- SetText, SetVisible, ButtonOnClick

#### Debug
- Print, Assert

### Serialization
- Save/Load projects to JSON or LocalStorage
- Support for versioned project schemas
- Asset embedding with base64 encoding

### Runtime
- 2D Canvas rendering
- Per-frame update loop with delta time
- Graph execution engine with deterministic ordering
- Variable scoping (global, scene, entity, local)

## Building

```bash
npm install
npm run dev          # Start development server
npm run build        # Production build
npm run type-check   # TypeScript type checking
```

## Project Structure

```
src/
├── core/              # Core types and constants
│   ├── types.ts      # Type definitions
│   └── constants.ts  # Node definitions, colors, grid
├── graph/            # Graph system
│   └── graph.ts      # GraphManager, node/connection creation
├── editor/           # Editor components
│   ├── viewport.ts   # Canvas viewport with pan/zoom/select
│   └── undoRedo.ts   # Undo/redo system
├── ecs/              # Entity-Component System
│   └── entity.ts     # Entity and Scene managers
├── assets/           # Asset management
│   └── manager.ts    # Asset import/storage
├── runtime/          # Game runtime
│   ├── executor.ts   # Graph execution engine
│   └── renderer.ts   # 2D Canvas renderer
├── utils/            # Utilities
│   ├── serialization.ts  # Save/load projects
│   ├── math.ts          # Vector math
│   └── project.ts       # Project management
└── ui/               # React components
    ├── app.tsx       # Main app
    ├── nodeEditor.tsx # Node graph editor
    ├── nodePalette.tsx # Node selection panel
    ├── assetManager.tsx # Asset browser
    ├── gamePreview.tsx  # Game runtime view
    ├── console.tsx      # Debug console
    └── toolbar.tsx      # Top toolbar
```

## Architecture Decisions

### Execution Model
- **Deterministic Flow**: Nodes execute in a well-defined order for consistency and debugging
- **Async/Await**: Graph execution uses async/await for clean, readable code
- **Direct Pin Value Evaluation**: Data flows directly through pin connections without intermediate serialization

### Editor
- **Canvas-Based**: Uses HTML5 Canvas for efficient rendering of large graphs
- **Touch-First**: Designed with iPad in mind (though desktop compatible)
- **Viewport Abstraction**: Separates screen coordinates from world coordinates for proper zooming

### Performance
- **Efficient Rendering**: Single canvas element, minimal redraws
- **Graph Caching**: Graphs are cached by ID for quick lookup
- **Asset Embedding**: Optional base64 encoding for self-contained projects

## Example Usage

1. **Create a new project**: Click "New"
2. **Add nodes**: Drag nodes from the left palette onto the canvas
3. **Connect nodes**: Click and drag from one pin to another
4. **Set properties**: Click on nodes to edit their properties
5. **Save project**: Click "Save" to save to LocalStorage
6. **Run game**: Click "Run" to execute the level graph

## Future Enhancements

- WebGL rendering for better performance
- Physics engine integration
- Particle systems
- Animation timeline
- Prefab system
- Sprite sheet support
- Multiplayer/networked games
- Mobile app packaging
- Node templates and extensions
- Advanced debugging (breakpoints, stepping, watches)
- Performance profiler

## License

MIT
