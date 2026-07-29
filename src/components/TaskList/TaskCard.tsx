import { useState, useCallback, useRef, useEffect } from 'react';
import type { Task } from '../../types/task';
import { CATEGORY_LABELS, CATEGORY_COLORS, PRIORITY_COLORS } from '../../types/task';
import { formatDate, isOverdue, daysUntil } from '../../utils/dates';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';
import styles from './TaskCard.module.css';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, changes: Partial<Pick<Task, 'title' | 'category' | 'priority' | 'dueDate'>>) => void;
}

export function TaskCard({ task, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleTitleClick = useCallback(() => {
    if (task.done) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setEditTitle(task.title);
      setEditing(true);
    }
    lastTapRef.current = now;
  }, [task.done, task.title]);

  const handleEditBlur = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onEdit(task.id, { title: trimmed });
    }
    setEditing(false);
  }, [editTitle, task.id, task.title, onEdit]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
      }
      if (e.key === 'Escape') {
        setEditTitle(task.title);
        setEditing(false);
      }
    },
    [task.title]
  );

  const handleDelete = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setShowConfirm(false);
    setDeleting(true);
    setTimeout(() => onDelete(task.id), 150);
  }, [task.id, onDelete]);

  const handleCancelDelete = useCallback(() => setShowConfirm(false), []);

  return (
    <article
      className={`${styles.card}${task.done ? ' ' + styles.done : ''}${deleting ? ' ' + styles.deleting : ''}`}
      role="listitem"
    >
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={task.done}
          onChange={() => onToggle(task.id)}
          aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
        />
        <span className={styles.checkVisual} aria-hidden="true" />
      </label>

      <div className={styles.body}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.editInput}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleEditBlur}
            onKeyDown={handleEditKeyDown}
          />
        ) : (
          <span
            className={styles.title}
            onClick={handleTitleClick}
            title="Double-tap to edit"
          >
            {task.title}
          </span>
        )}

        <div className={styles.meta}>
          <span className="category-badge" style={{ background: `color-mix(in oklch, ${CATEGORY_COLORS[task.category]} 15%, transparent)`, color: CATEGORY_COLORS[task.category] }}>{CATEGORY_LABELS[task.category]}</span>
          <span className="priority-dot" style={{ background: PRIORITY_COLORS[task.priority] }} aria-hidden="true" />
          {(() => {
            if (!task.dueDate) return null;
            const overdue = isOverdue(task.dueDate);
            const remaining = daysUntil(task.dueDate);
            return (
              <span className={`due-date-badge${overdue ? ' is-overdue' : ''}`}>
                {formatDate(task.dueDate)}
                {overdue && <span className="overdue-label"> overdue</span>}
                {!overdue && remaining <= 3 && remaining >= 0 && (
                  <span className="due-soon-label"> in {remaining}d</span>
                )}
              </span>
            );
          })()}
        </div>
      </div>

      <button
        className={styles.deleteBtn}
        onClick={handleDelete}
        aria-label={`Delete "${task.title}"`}
      >
        ×
      </button>
      <ConfirmModal
        open={showConfirm}
        message={`Delete "${task.title}"? This can't be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleCancelDelete}
      />
    </article>
  );
}
