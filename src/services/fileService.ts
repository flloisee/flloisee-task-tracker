import type { Task } from '../types/task';

const HANDLE_STORE = 'taskful-dir-handle';
const DB_NAME = 'flloiseeTaskTrackerHandle';
const FILE_NAME = 'tasks.json';

/* ─── IndexedDB helpers: persist the directory handle ─── */

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(HANDLE_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(HANDLE_STORE, 'readwrite');
  tx.objectStore(HANDLE_STORE).put(handle, 'dirHandle');
  await new Promise<void>(r => (tx.oncomplete = () => r()));
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDb();
  const tx = db.transaction(HANDLE_STORE, 'readonly');
  const store = tx.objectStore(HANDLE_STORE);
  return new Promise(resolve => {
    const req = store.get('dirHandle');
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
}

/* ─── Public API ─── */

export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window;
}

export async function hasPersistentAccess(): Promise<boolean> {
  try {
    const handle = await loadHandle();
    if (!handle) return false;
    const opts: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' };
    // ponytail: only queryPermission() here — requestPermission() needs a user
    // gesture and fails silently on mobile during app init.  Caller uses
    // reauthHandle() when the user taps a button.
    const status = await handle.queryPermission(opts);
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Check whether a directory handle is stored in IndexedDB (regardless of
 * current permission).  Returns true when the user previously connected but
 * the session permission may have lapsed (e.g. after page reload on mobile).
 */
export async function hasStoredHandle(): Promise<boolean> {
  const handle = await loadHandle();
  return handle !== null;
}

/**
 * Re-authorize an existing stored handle.  Must be called from a user gesture
 * (click / tap).  Returns true if permission was granted.
 */
export async function reauthHandle(): Promise<boolean> {
  const handle = await loadHandle();
  if (!handle) return false;
  const status = await handle.requestPermission({ mode: 'readwrite' });
  return status === 'granted';
}

export async function requestDirectoryAccess(): Promise<void> {
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
  // ponytail: showDirectoryPicker with mode: 'readwrite' already grants
  // permission — no need for a separate requestPermission call.
  await saveHandle(handle);
}

export async function revokeAccess(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(HANDLE_STORE, 'readwrite');
  tx.objectStore(HANDLE_STORE).delete('dirHandle');
  await new Promise<void>(r => (tx.oncomplete = () => r()));
}

async function getDirHandle(): Promise<FileSystemDirectoryHandle> {
  const handle = await loadHandle();
  if (!handle) throw new Error('No directory connected.');
  return handle;
}

/**
 * Read tasks.json from the user's connected directory.
 * Returns null if file doesn't exist yet.
 */
export async function readTasksFile(): Promise<Task[] | null> {
  try {
    const dir = await getDirHandle();
    const fileHandle = await dir.getFileHandle(FILE_NAME);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as Task[];
  } catch (err) {
    if ((err as DOMException)?.name === 'NotFoundError') return null;
    throw err;
  }
}

/**
 * Write tasks.json to the user's connected directory.
 * Silently skips if no directory handle is stored (user hasn't connected via FSAA),
 * or if permission was revoked. Always safe to call — never throws.
 */
export async function writeTasksFile(tasks: Task[]): Promise<void> {
  const handle = await loadHandle();
  if (!handle) return;

  const opts: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' };
  let status = await handle.queryPermission(opts);
  if (status === 'prompt') {
    status = await handle.requestPermission(opts);
  }
  if (status !== 'granted') return;

  try {
    const fileHandle = await handle.getFileHandle(FILE_NAME, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(tasks, null, 2));
    await writable.close();
  } catch {
    // File write failed — localStorage cache is still intact
  }
}
