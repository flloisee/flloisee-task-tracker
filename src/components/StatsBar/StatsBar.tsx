import type { TaskStats } from '../../types/task';
import styles from './StatsBar.module.css';

interface Props {
  stats: TaskStats;
}

export function StatsBar({ stats }: Props) {
  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <div className={styles.stat}>
        <span className={styles.num}>{stats.total}</span>
        <span className={styles.label}>Total</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.stat}>
        <span className={styles.num}>{stats.active}</span>
        <span className={styles.label}>Active</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.stat}>
        <span className={styles.num} style={{ color: 'var(--color-mint)' }}>{stats.doneToday}</span>
        <span className={styles.label}>Done today</span>
      </div>
    </div>
  );
}
