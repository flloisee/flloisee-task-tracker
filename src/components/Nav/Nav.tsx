import type { TaskStats } from '../../types/stats';
import { DataManager } from '../DataManager/DataManager';
import styles from './Nav.module.css';

interface Props {
  stats: TaskStats;
  onImportComplete: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
}

export function Nav({ stats, onImportComplete, onDisconnect, onReconnect }: Props) {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <span className={styles.wordmark}>flloisee's task tracker</span>
        <div className={styles.right}>
          <span className={styles.stat}>
            <span className={styles.statNum}>{stats.total}</span> tasks
          </span>
          <DataManager
            onImportComplete={onImportComplete}
            onDisconnect={onDisconnect}
            onReconnect={onReconnect}
          />
        </div>
      </div>
    </nav>
  );
}
