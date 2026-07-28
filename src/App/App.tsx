import { useTasks } from '../hooks/useTasks';
import { ConnectFolderBanner } from '../components/ConnectFolderBanner/ConnectFolderBanner';
import { Nav } from '../components/Nav/Nav';
import { TaskForm } from '../components/TaskForm/TaskForm';
import { StatsBar } from '../components/StatsBar/StatsBar';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { TaskList } from '../components/TaskList/TaskList';
import { Footer } from '../components/Footer/Footer';
import styles from './App.module.css';

export default function App() {
  const {
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
  } = useTasks();

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  const isSupported = 'showDirectoryPicker' in window;

  return (
    <div className={styles.app}>
      <Nav
        stats={stats}
        onImportComplete={reloadTasks}
        onDisconnect={disconnect}
        onReconnect={connect}
      />

      <main className={styles.main}>
        <TaskForm onAdd={addTask} />

        {stats.total > 0 && <StatsBar stats={stats} />}

        <FilterBar
          category={categoryFilter}
          status={statusFilter}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
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

      {(connectionState === 'disconnected' || connectionState === 'unsupported') && (
        <ConnectFolderBanner
          onConnect={connect}
          isSupported={isSupported}
        />
      )}

      <Footer />
    </div>
  );
}
