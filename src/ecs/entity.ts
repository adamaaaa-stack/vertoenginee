import { Entity, Component, Scene, Prefab } from '../core/types';

export class EntityManager {
  private entities: Map<string, Entity> = new Map();
  private prefabs: Map<string, Prefab> = new Map();
  private nextId = 0;

  createEntity(name: string, prefabId?: string): Entity {
    const entity: Entity = {
      id: `entity_${this.nextId++}`,
      name,
      prefabId,
      tags: [],
      active: true,
      components: [],
    };
    this.entities.set(entity.id, entity);
    return entity;
  }

  getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }

  deleteEntity(entityId: string): void {
    this.entities.delete(entityId);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  findEntitiesByTag(tag: string): Entity[] {
    return Array.from(this.entities.values()).filter(e => e.tags.includes(tag));
  }

  addComponentToEntity(entityId: string, component: Component): void {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);

    // Remove existing component of same type
    entity.components = entity.components.filter(c => c.type !== component.type);
    entity.components.push(component);
  }

  getComponent(entityId: string, componentType: string): Component | undefined {
    const entity = this.entities.get(entityId);
    if (!entity) return undefined;
    return entity.components.find(c => c.type === componentType);
  }

  removeComponent(entityId: string, componentType: string): void {
    const entity = this.entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);
    entity.components = entity.components.filter(c => c.type !== componentType);
  }

  createPrefab(name: string, entity: Entity): Prefab {
    const prefab: Prefab = {
      id: `prefab_${Math.random().toString(36).substr(2, 9)}`,
      name,
      entity: JSON.parse(JSON.stringify(entity)), // Deep clone
      tags: [],
    };
    this.prefabs.set(prefab.id, prefab);
    return prefab;
  }

  getPrefab(prefabId: string): Prefab | undefined {
    return this.prefabs.get(prefabId);
  }

  deletePrefab(prefabId: string): void {
    this.prefabs.delete(prefabId);
  }

  getAllPrefabs(): Prefab[] {
    return Array.from(this.prefabs.values());
  }

  instantiatePrefab(prefabId: string, position?: { x: number; y: number }): Entity | undefined {
    const prefab = this.prefabs.get(prefabId);
    if (!prefab) return undefined;

    const newEntity = JSON.parse(JSON.stringify(prefab.entity)) as Entity;
    newEntity.id = `entity_${this.nextId++}`;
    newEntity.prefabId = prefabId;

    // Set position if provided
    if (position) {
      const transformComponent = newEntity.components.find(c => c.type === 'Transform');
      if (transformComponent) {
        transformComponent.properties.x = position.x;
        transformComponent.properties.y = position.y;
      }
    }

    this.entities.set(newEntity.id, newEntity);
    return newEntity;
  }
}

export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private activeScene: Scene | null = null;
  private entityManager = new EntityManager();
  private nextId = 0;

  createScene(name: string): Scene {
    const scene: Scene = {
      id: `scene_${this.nextId++}`,
      name,
      entities: [],
      backgroundColor: '#ffffff',
      metadata: {},
    };
    this.scenes.set(scene.id, scene);
    return scene;
  }

  getScene(sceneId: string): Scene | undefined {
    return this.scenes.get(sceneId);
  }

  getActiveScene(): Scene | null {
    return this.activeScene;
  }

  loadScene(sceneId: string): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) return false;
    this.activeScene = scene;
    return true;
  }

  unloadScene(): void {
    this.activeScene = null;
  }

  deleteScene(sceneId: string): void {
    this.scenes.delete(sceneId);
    if (this.activeScene?.id === sceneId) {
      this.activeScene = null;
    }
  }

  getAllScenes(): Scene[] {
    return Array.from(this.scenes.values());
  }

  addEntityToScene(sceneId: string, entity: Entity): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) throw new Error(`Scene ${sceneId} not found`);

    // Remove if already in scene
    scene.entities = scene.entities.filter(e => e.id !== entity.id);
    scene.entities.push(entity);
  }

  removeEntityFromScene(sceneId: string, entityId: string): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) throw new Error(`Scene ${sceneId} not found`);
    scene.entities = scene.entities.filter(e => e.id !== entityId);
  }

  getEntitiesInScene(sceneId: string): Entity[] {
    const scene = this.scenes.get(sceneId);
    return scene?.entities || [];
  }
}
