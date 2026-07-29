import type { Task, TaskFormData } from '../types/task';
import * as fileApi from './fileService';

const STORAGE_KEY = 'taskful_tasks_cache';

export type HandleState = 'granted' | 'stored' | 'none';
export type StorageSource = 'loading' | 'connected' | 'disconnected' | 'unsupported' | 'needs-reauth';
export type StorageBackend = 'local' | 'file';

const BACKEND_KEY = 'taskful_storage_backend';

export function getBackend(): StorageBackend {
  const stored = localStorage.getItem(BACKEND_KEY);
  if (stored === 'local' || stored === 'file') return stored;
  return 'local';
}

export function setBackend(backend: StorageBackend): void {
  localStorage.setItem(BACKEND_KEY, backend);
}

/* ─── Connection state ─── */

/**
 * Check whether a file handle is stored and permission is granted.
 * Used by UI components to show connection status.
 */
export async function isFileConnected(): Promise<boolean> {
  return fileApi.isFileSystemAccessSupported() && (await fileApi.hasPersistentAccess());
}

/**
 * Return the current handle state:
 * - 'granted' – handle exists and has readwrite permission
 * - 'stored'  – handle exists but permission needs re-authorization (user gesture)
 * - 'none'    – no handle stored
 */
export async function checkHandleState(): Promise<HandleState> {
  if (!fileApi.isFileSystemAccessSupported()) return 'none';
  try {
    const exists = await fileApi.hasStoredHandle();
    if (!exists) return 'none';
    return (await fileApi.hasPersistentAccess()) ? 'granted' : 'stored';
  } catch {
    return 'none';
  }
}

/* ─── Initialization ─── */

/**
 * Call once at startup. Checks for persistent file handle.
 * Falls back to localStorage.
 * Every write ALWAYS attempts to sync to data/tasks.json via FSAA.
 */
export async function initialize(): Promise<Task[]> {
  if (getBackend() === 'file' && fileApi.isFileSystemAccessSupported() && (await fileApi.hasPersistentAccess())) {
    try {
      return (await fileApi.readTasksFile()) ?? [];
    } catch {
      return [];
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}

/* ─── Connect / Disconnect ─── */

export async function connectDirectory(): Promise<Task[]> {
  await fileApi.requestDirectoryAccess();
  setBackend('file');
  const data = await fileApi.readTasksFile();
  return data ?? [];
}

export async function disconnectDirectory(): Promise<void> {
  await fileApi.revokeAccess();
  setBackend('local');
}

/**
 * Re-authorize an existing handle without the directory picker.
 * The user already connected before — just re-grant permission via one tap
 * (no need to navigate the folder picker again).
 */
export async function reauthDirectory(): Promise<Task[]> {
  const ok = await fileApi.reauthHandle();
  if (!ok) throw new Error('Permission denied');
  setBackend('file');
  const data = await fileApi.readTasksFile();
  return data ?? [];
}

/* ─── Internal helpers ─── */

function readCache(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeCache(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

async function readFromBackend(): Promise<Task[]> {
  if (getBackend() === 'file') {
    try {
      return (await fileApi.readTasksFile()) ?? [];
    } catch {
      return [];
    }
  }
  return readCache();
}

/**
 * Persist tasks to the active backend only — localStorage or tasks.json, never both.
 */
async function persist(tasks: Task[]): Promise<void> {
  if (getBackend() === 'file') {
    await fileApi.writeTasksFile(tasks);
  } else {
    writeCache(tasks);
  }
}

/* ─── CRUD ─── */

export async function getTasks(): Promise<Task[]> {
  return readFromBackend();
}

export async function addTask(data: TaskFormData): Promise<Task> {
  const tasks = await readFromBackend();
  const task: Task = {
    id: crypto.randomUUID(),
    ...data,
    done: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  await persist([task, ...tasks]);
  return task;
}

export async function toggleTask(id: string): Promise<Task> {
  const tasks = await readFromBackend();
  const updated = tasks.map(t =>
    t.id === id
      ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null }
      : t
  );
  await persist(updated);
  return updated.find(t => t.id === id)!;
}

export async function updateTask(
  id: string,
  changes: Partial<Pick<Task, 'title' | 'category' | 'priority' | 'dueDate' | 'done'>>
): Promise<Task> {
  const tasks = await readFromBackend();
  const updated = tasks.map(t => (t.id === id ? { ...t, ...changes } : t));
  await persist(updated);
  return updated.find(t => t.id === id)!;
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await readFromBackend();
  await persist(tasks.filter(t => t.id !== id));
}

export async function clearDoneTasks(): Promise<void> {
  const tasks = await readFromBackend();
  await persist(tasks.filter(t => !t.done));
}

/* ─── Export / Import ─── */

export async function exportTasksAsJson(): Promise<void> {
  const tasks = await readFromBackend();
  const json = JSON.stringify(tasks, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskful-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importTasksFromJson(json: string): Promise<number> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON file.');
  }
  if (!Array.isArray(parsed)) throw new Error('JSON must be an array of tasks.');
  for (const item of parsed) {
    if (!item || typeof item.id !== 'string' || typeof item.title !== 'string')
      throw new Error('Each task must have a string "id" and "title".');
  }
  await persist(parsed as Task[]);
  return (parsed as Task[]).length;
}
