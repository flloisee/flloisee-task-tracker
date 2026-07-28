import type { CategoryFilter, StatusFilter } from '../../types/task';
import { CATEGORY_LABELS } from '../../types/task';
import styles from './FilterBar.module.css';

interface Props {
  category: CategoryFilter;
  status: StatusFilter;
  onCategoryChange: (c: CategoryFilter) => void;
  onStatusChange: (s: StatusFilter) => void;
}

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as CategoryFilter,
    label,
  })),
];

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
];

export function FilterBar({ category, status, onCategoryChange, onStatusChange }: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.group} role="tablist" aria-label="Category">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            role="tab"
            aria-selected={category === c.value}
            className={`${styles.tab}${category === c.value ? ' ' + styles.active : ''}`}
            onClick={() => onCategoryChange(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className={styles.divider} />
      <div className={styles.group} role="tablist" aria-label="Status">
        {STATUSES.map(s => (
          <button
            key={s.value}
            role="tab"
            aria-selected={status === s.value}
            className={`${styles.tab}${status === s.value ? ' ' + styles.active : ''}`}
            onClick={() => onStatusChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
