import { Project, Scene, Graph, Entity, Prefab, Asset } from '../core/types';
import { PROJECT_VERSION } from '../core/constants';

export interface SerializedProject {
  version: number;
  id: string;
  name: string;
  timestamp: number;
  data: Project;
}

export function serializeProject(project: Project): SerializedProject {
  return {
    version: PROJECT_VERSION,
    id: project.id,
    name: project.name,
    timestamp: Date.now(),
    data: JSON.parse(JSON.stringify(project)), // Deep clone
  };
}

export function deserializeProject(serialized: SerializedProject): Project {
  // Handle version migration if needed in the future
  if (serialized.version !== PROJECT_VERSION) {
    console.warn(
      `Project version ${serialized.version} may not be compatible with engine version ${PROJECT_VERSION}`
    );
  }

  return serialized.data;
}

export function saveProjectToLocalStorage(project: Project, key: string = 'verto_project'): void {
  const serialized = serializeProject(project);
  localStorage.setItem(key, JSON.stringify(serialized));
}

export function loadProjectFromLocalStorage(key: string = 'verto_project'): Project | null {
  const data = localStorage.getItem(key);
  if (!data) return null;

  try {
    const serialized: SerializedProject = JSON.parse(data);
    return deserializeProject(serialized);
  } catch (error) {
    console.error('Failed to load project from localStorage:', error);
    return null;
  }
}

export function exportProjectAsJSON(project: Project): string {
  const serialized = serializeProject(project);
  return JSON.stringify(serialized, null, 2);
}

export function importProjectFromJSON(json: string): Project | null {
  try {
    const serialized: SerializedProject = JSON.parse(json);
    return deserializeProject(serialized);
  } catch (error) {
    console.error('Failed to import project from JSON:', error);
    return null;
  }
}

export function downloadProjectFile(project: Project, filename?: string): void {
  const json = exportProjectAsJSON(project);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${project.name}.vertoproj`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProjectFromFile(file: File): Promise<Project | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const project = importProjectFromJSON(content);
      resolve(project);
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

export function createDefaultProject(name: string): Project {
  const project: Project = {
    id: `project_${Math.random().toString(36).substr(2, 9)}`,
    name,
    version: PROJECT_VERSION,
    scenes: [],
    prefabs: [],
    assets: [],
    graphs: [],
    globalVariables: [],
    settings: {
      canvasWidth: 1024,
      canvasHeight: 768,
      targetFPS: 60,
    },
  };

  // Create default scene
  const defaultScene: Scene = {
    id: `scene_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Main Scene',
    entities: [],
    backgroundColor: '#1a1a1a',
    metadata: {},
  };

  project.scenes.push(defaultScene);
  return project;
}

// Migration helpers for future version upgrades
export function migrateProject(project: Project, fromVersion: number): Project {
  // This will be called if deserializing a project from an older version
  // Add migration logic here as needed
  return project;
}
