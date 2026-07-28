import type { Task, TaskFormData } from '../types/task';
import * as fileApi from './fileService';

/* ponytail: seed data inlined to avoid Vite watching data/tasks.json at runtime */
const seedData: Task[] = [
  {
    id: 'seed-002',
    title: 'Study for organic chemistry midterm',
    category: 'exam',
    priority: 'medium',
    dueDate: '2025-08-10',
    done: false,
    createdAt: '2025-07-28T08:05:00.000Z',
    completedAt: null,
  },
  {
    id: 'seed-003',
    title: 'Build prototype for capstone project',
    category: 'project',
    priority: 'high',
    dueDate: '2025-08-20',
    done: false,
    createdAt: '2025-07-28T08:10:00.000Z',
    completedAt: null,
  },
  {
    id: 'seed-004',
    title: "Read chapter 5 of 'The Pragmatic Programmer'",
    category: 'custom',
    priority: 'low',
    dueDate: '2025-08-05',
    done: true,
    createdAt: '2025-07-26T09:00:00.000Z',
    completedAt: '2025-07-28T10:30:00.000Z',
  },
];

const STORAGE_KEY = 'taskful_tasks_cache';

/* ─── Connection state ─── */

/**
 * Check whether a file handle is stored and permission is granted.
 * Used by UI components to show connection status.
 */
export async function isFileConnected(): Promise<boolean> {
  return fileApi.isFileSystemAccessSupported() && (await fileApi.hasPersistentAccess());
}

/* ─── Initialization ─── */

/**
 * Call once at startup. Checks for persistent file handle.
 * Falls back to localStorage → bundled seed.
 * Every write ALWAYS attempts to sync to data/tasks.json via FSAA.
 */
export async function initialize(): Promise<Task[]> {
  if (fileApi.isFileSystemAccessSupported() && (await fileApi.hasPersistentAccess())) {
    const data = await fileApi.readTasksFile();
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const tasks = seedData as Task[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return tasks;
  } catch {
    return [];
  }
}

/* ─── Connect / Disconnect ─── */

export async function connectDirectory(): Promise<Task[]> {
  await fileApi.requestDirectoryAccess();
  const data = await fileApi.readTasksFile();
  const tasks = data ?? [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  return tasks;
}

export async function disconnectDirectory(): Promise<void> {
  await fileApi.revokeAccess();
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

/**
 * Persist tasks to localStorage AND to data/tasks.json via FSAA (if connected).
 * Always safe to call — if no FSAA handle is stored, it silently uses localStorage only.
 * This guarantees that every mutation (add, toggle, delete, edit) syncs to the file.
 */
async function persist(tasks: Task[]): Promise<void> {
  writeCache(tasks);
  await fileApi.writeTasksFile(tasks);
}

/* ─── CRUD ─── */

export async function getTasks(): Promise<Task[]> {
  return readCache();
}

export async function addTask(data: TaskFormData): Promise<Task> {
  const tasks = readCache();
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
  const tasks = readCache();
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
  const tasks = readCache();
  const updated = tasks.map(t => (t.id === id ? { ...t, ...changes } : t));
  await persist(updated);
  return updated.find(t => t.id === id)!;
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = readCache();
  await persist(tasks.filter(t => t.id !== id));
}

/* ─── Export / Import ─── */

export async function exportTasksAsJson(): Promise<void> {
  const tasks = readCache();
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
