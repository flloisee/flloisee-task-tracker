import type { TaskStats } from '../../types/stats';
import { DataManager } from '../DataManager/DataManager';
import styles from './Nav.module.css';

interface Props {
  stats: TaskStats;
  onImportComplete: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  onReauth: () => void;
}

export function Nav({ stats, onImportComplete, onDisconnect, onReconnect, onReauth }: Props) {
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
            onReauth={onReauth}
          />
        </div>
      </div>
    </nav>
  );
}
