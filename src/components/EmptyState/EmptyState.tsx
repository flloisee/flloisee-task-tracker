import type { CategoryFilter, StatusFilter } from '../../types/task';
import { CATEGORY_LABELS } from '../../types/task';
import styles from './EmptyState.module.css';

interface Props {
  categoryFilter: CategoryFilter;
  statusFilter: StatusFilter;
}

export function EmptyState({ categoryFilter, statusFilter }: Props) {
  const mood = statusFilter === 'done' ? 'encouraging' : categoryFilter !== 'all' ? 'encouraging' : 'neutral';
  const msg =
    statusFilter === 'done'
      ? 'No completed tasks yet. Get cracking!'
      : categoryFilter !== 'all'
        ? `No ${CATEGORY_LABELS[categoryFilter as keyof typeof CATEGORY_LABELS]?.toLowerCase() || 'tasks'} yet. Add one!`
        : 'Start tracking! Add your first task above.';

  return (
    <div className={styles.empty} role="status">
      <div className={`dot dot--${mood}`} aria-hidden="true" />
      <p className={styles.msg}>{msg}</p>
    </div>
  );
}
