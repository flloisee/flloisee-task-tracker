import { useTasks } from '../hooks/useTasks';
import { Nav } from '../components/Nav/Nav';
import { TaskForm } from '../components/TaskForm/TaskForm';
import { StatsBar } from '../components/StatsBar/StatsBar';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { TaskList } from '../components/TaskList/TaskList';

import styles from './App.module.css';

export default function App() {
  const {
    filteredTasks,
    stats,
    loading,
    storageBackend,
    setStorageBackend,
    categoryFilter,
    statusFilter,
    setCategoryFilter,
    setStatusFilter,
    addTask,
    toggleTask,
    deleteTask,
    clearDone,
    editTask,
    reloadTasks,
    connect,
    disconnect,
    reauth,
  } = useTasks();

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Nav
        stats={stats}
        storageBackend={storageBackend}
        onStorageBackendChange={setStorageBackend}
        onImportComplete={reloadTasks}
        onDisconnect={disconnect}
        onReconnect={connect}
        onReauth={reauth}
      />

      <main className={styles.main}>
        <TaskForm onAdd={addTask} />

        {stats.total > 0 && <StatsBar stats={stats} />}

        <FilterBar
          category={categoryFilter}
          status={statusFilter}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
          onClearDone={clearDone}
        />

        <TaskList
          tasks={filteredTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onEdit={editTask}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
        />
      </main>

      <footer className={styles.footer}>
        <hr className={styles.rule} />
        <p className={styles.text}>
          flloisee's task tracker <span className={styles.dot}>·</span> Designed with{' '}
          <span className={styles.highlight}>Hallmark</span> ·{' '}
          <span className={styles.highlight}>Hum</span> <span className={styles.dot}>·</span> Made by flloisee
        </p>
      </footer>
    </div>
  );
}
