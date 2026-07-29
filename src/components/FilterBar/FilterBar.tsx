import { useState, useEffect } from 'react';
import type { CategoryFilter, StatusFilter } from '../../types/task';
import { CATEGORY_LABELS } from '../../types/task';

import styles from './FilterBar.module.css';

interface Props {
  category: CategoryFilter;
  status: StatusFilter;
  onCategoryChange: (c: CategoryFilter) => void;
  onStatusChange: (s: StatusFilter) => void;
  onClearDone?: () => void;
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

export function FilterBar({ category, status, onCategoryChange, onStatusChange, onClearDone }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!showConfirm) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowConfirm(false); };
    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, [showConfirm]);

  return (
    <>
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
      <div className={styles.groupWrap}>
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
        <button
          className={`${styles.clearBtn}${status !== 'done' ? ' ' + styles.hidden : ''}`}
          onClick={() => setShowConfirm(true)}
          tabIndex={status === 'done' ? 0 : -1}
          aria-hidden={status !== 'done'}
        >
          Clear all
        </button>
      </div>
    </div>
    {showConfirm && (() => {
      const onConfirm = () => { onClearDone?.(); setShowConfirm(false); };
      const onCancel = () => setShowConfirm(false);
      return (
        <div className={styles.backdrop} onClick={onCancel}>
          <div className={styles.card} onClick={e => e.stopPropagation()}>
            <p className={styles.message}>Clear all done tasks? This can't be undone.</p>
            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.cancel}`} onClick={onCancel}>Cancel</button>
              <button className={`${styles.btn} ${styles.confirm}`} onClick={onConfirm}>Clear</button>
            </div>
          </div>
        </div>
      );
    })()}
    </>
  );
}
