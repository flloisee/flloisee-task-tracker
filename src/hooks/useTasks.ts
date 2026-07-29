import { useState, useEffect, useRef } from 'react';
import type { Task, TaskFormData, CategoryFilter, StatusFilter } from '../types/task';
import type { TaskStats } from '../types/task';
import type { StorageBackend, StorageSource } from '../services/storageService';
import * as store from '../services/storageService';

export type ConnectionState = StorageSource;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('loading');
  const [storageBackend, setStorageBackendState] = useState<StorageBackend>(store.getBackend());
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  /* ─── Initialize ─── */
  useEffect(() => {
    (async () => {
      const supported = 'showDirectoryPicker' in window;
      try {
        const data = await store.initialize();
        setTasks(data);
        const state = await store.checkHandleState();
        if (state === 'granted') setConnectionState('connected');
        else if (state === 'stored') setConnectionState('needs-reauth');
        else setConnectionState(!supported ? 'unsupported' : 'disconnected');
      } catch {
        setTasks([]);
        setConnectionState(!supported ? 'unsupported' : 'disconnected');
      }
      setLoading(false);
    })();
  }, []);

  const reauthRef = useRef(reauth);
  reauthRef.current = reauth;

  useEffect(() => {
    if (connectionState !== 'needs-reauth') return;
    const handler = () => reauthRef.current();
    document.addEventListener('pointerdown', handler, { once: true });
    return () => document.removeEventListener('pointerdown', handler);
  }, [connectionState]);

  /* ─── Connect / Disconnect ─── */
  async function connect() {
    setConnectionState('loading');
    try {
      const data = await store.connectDirectory();
      setTasks(data);
      setStorageBackendState('file');
      setConnectionState('connected');
    } catch {
      setConnectionState('disconnected');
      throw new Error('Connection cancelled');
    }
  }

  async function disconnect() {
    await store.disconnectDirectory();
    setStorageBackendState('local');
    setConnectionState('disconnected');
  }

  /* ─── Re-auth (handle exists, permission lapsed) ─── */
  async function reauth() {
    setConnectionState('loading');
    try {
      const data = await store.reauthDirectory();
      setTasks(data);
      setStorageBackendState('file');
      setConnectionState('connected');
    } catch {
      setConnectionState('disconnected');
      throw new Error('Re-authorisation cancelled');
    }
  }

  /* ─── CRUD ─── */
  async function addTask(data: TaskFormData) {
    const task = await store.addTask(data);
    setTasks(prev => [task, ...prev]);
  }

  async function toggleTask(id: string) {
    const updated = await store.toggleTask(id);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
  }

  async function deleteTask(id: string) {
    await store.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function editTask(
    id: string,
    changes: Partial<Pick<Task, 'title' | 'category' | 'priority' | 'dueDate'>>
  ) {
    const updated = await store.updateTask(id, changes);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
  }

  async function clearDone() {
    await store.clearDoneTasks();
    setTasks(await store.getTasks());
  }

  async function reloadTasks() {
    setTasks(await store.getTasks());
  }

  /* ─── Derived data ─── */
  const filteredTasks = tasks.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (statusFilter === 'active' && t.done) return false;
    if (statusFilter === 'done' && !t.done) return false;
    return true;
  });

  const today = new Date().toISOString().split('T')[0];
  const stats: TaskStats = {
    total: tasks.length,
    active: tasks.filter(t => !t.done).length,
    done: tasks.filter(t => t.done).length,
    doneToday: tasks.filter(t => t.done && t.completedAt?.startsWith(today)).length,
  };

  function setStorageBackend(backend: StorageBackend) {
    store.setBackend(backend);
    setStorageBackendState(backend);
  }

  const storageSource = connectionState;

  function setStorageSource(source: StorageSource) {
    setConnectionState(source);
  }

  return {
    tasks,
    filteredTasks,
    stats,
    loading,
    connectionState,
    storageSource,
    setStorageSource,
    storageBackend,
    setStorageBackend,
    categoryFilter,
    statusFilter,
    setCategoryFilter,
    setStatusFilter,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    clearDone,
    reloadTasks,
    connect,
    disconnect,
    reauth,
  };
}