import { useState, useCallback, useRef } from 'react';
import type { TaskCategory, TaskPriority, TaskFormData } from '../../types/task';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../../types/task';
import { triggerStarBurst } from '../../utils/starBurst';
import styles from './TaskForm.module.css';

interface Props {
  onAdd: (data: TaskFormData) => void;
}

export function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('assignment');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) {
        setTitleError('Enter a task title');
        return;
      }

      onAdd({
        title: trimmed,
        category,
        priority,
        dueDate: dueDate || null,
      });

      if (btnRef.current) triggerStarBurst(btnRef.current);

      setTitle('');
      setDueDate('');
      setTitleError('');
    },
    [title, category, priority, dueDate, onAdd]
  );

  return (
    <section className={styles.band}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          <div className={styles.titleField}>
            <input
              type="text"
              className={`${styles.input}${titleError ? ' ' + styles.inputError : ''}`}
              placeholder="What's on your plate?"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(''); }}
              aria-describedby={titleError ? 'title-error' : undefined}
              aria-invalid={!!titleError}
            />
            {titleError && (
              <span id="title-error" className={styles.errorText} role="alert">
                {titleError}
              </span>
            )}
          </div>
          <select
            className={styles.select}
            value={category}
            onChange={e => setCategory(e.target.value as TaskCategory)}
            aria-label="Category"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
            aria-label="Priority"
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="date"
            className={styles.dateInput}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            aria-label="Due date"
          />
        </div>
        <button
          ref={btnRef}
          type="submit"
          className={styles.btn}
          disabled={!title.trim()}
        >
          + Add Task
        </button>
      </form>
    </section>
  );
}
