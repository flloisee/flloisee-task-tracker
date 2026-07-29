import { useState, useCallback, useRef } from 'react';
import type { TaskCategory, TaskPriority, TaskFormData } from '../../types/task';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../../types/task';

import { Select } from './Select';
import { DatePicker } from './DatePicker';
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

      if (btnRef.current) {
          const el = btnRef.current;
          const star = document.createElement('span');
          star.className = 'star-burst';
          star.style.left = `${el.offsetWidth / 2 - 12}px`;
          star.style.top = `${el.offsetHeight / 2 - 12}px`;
          el.style.position = 'relative';
          el.appendChild(star);
          star.addEventListener('animationend', () => star.remove());
        }

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
          <Select<TaskCategory>
            value={category}
            onChange={setCategory}
            options={Object.entries(CATEGORY_LABELS) as [TaskCategory, string][]}
            label="Category"
          />
          <Select<TaskPriority>
            value={priority}
            onChange={setPriority}
            options={Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]}
            label="Priority"
          />
          <DatePicker value={dueDate} onChange={setDueDate} />
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
