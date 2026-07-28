import { useState, useEffect } from 'react';
import type { Task, TaskFormData, CategoryFilter, StatusFilter } from '../types/task';
import type { TaskStats } from '../types/stats';
import * as store from '../services/storageService';

export type ConnectionState = 'loading' | 'connected' | 'disconnected' | 'unsupported';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('loading');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  /* ─── Initialize ─── */
  useEffect(() => {
    (async () => {
      const supported = 'showDirectoryPicker' in window;
      try {
        const data = await store.initialize();
        setTasks(data);
        const connected = await store.isFileConnected();
        setConnectionState(connected ? 'connected' : !supported ? 'unsupported' : 'disconnected');
      } catch {
        setTasks([]);
        setConnectionState(!supported ? 'unsupported' : 'disconnected');
      }
      setLoading(false);
    })();
  }, []);

  /* ─── Connect / Disconnect ─── */
  async function connect() {
    setConnectionState('loading');
    try {
      const data = await store.connectDirectory();
      setTasks(data);
      setConnectionState('connected');
    } catch {
      setConnectionState('disconnected');
      throw new Error('Connection cancelled');
    }
  }

  async function disconnect() {
    await store.disconnectDirectory();
    setConnectionState('disconnected');
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

  return {
    tasks,
    filteredTasks,
    stats,
    loading,
    connectionState,
    categoryFilter,
    statusFilter,
    setCategoryFilter,
    setStatusFilter,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    reloadTasks,
    connect,
    disconnect,
  };
}