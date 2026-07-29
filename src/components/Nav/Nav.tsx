import type { TaskStats } from '../../types/task';
import { DataManager } from '../DataManager/DataManager';
import styles from './Nav.module.css';

import type { StorageBackend } from '../../services/storageService';

interface Props {
  stats: TaskStats;
  storageBackend: StorageBackend;
  onStorageBackendChange: (backend: StorageBackend) => void;
  onImportComplete: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  onReauth: () => void;
}

export function Nav({ stats, storageBackend, onStorageBackendChange, onImportComplete, onDisconnect, onReconnect, onReauth }: Props) {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <span className={styles.wordmark}>flloisee's task tracker</span>
        <div className={styles.right}>
          <span className={styles.stat}>
            <span className={styles.statNum}>{stats.total}</span> tasks
          </span>
          <DataManager
            storageBackend={storageBackend}
            onStorageBackendChange={onStorageBackendChange}
            onImportComplete={onImportComplete}
            onDisconnect={onDisconnect}
            onReconnect={onReconnect}
            onReauth={onReauth}
          />
        </div>
      </div>
    </nav>
  );
}
