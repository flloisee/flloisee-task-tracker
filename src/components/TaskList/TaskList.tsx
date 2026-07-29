import type { Task, StatusFilter, CategoryFilter } from '../../types/task';
import { CATEGORY_LABELS } from '../../types/task';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, changes: Partial<Pick<Task, 'title' | 'category' | 'priority' | 'dueDate'>>) => void;
  categoryFilter: CategoryFilter;
  statusFilter: StatusFilter;
}

export function TaskList({ tasks, onToggle, onDelete, onEdit, categoryFilter, statusFilter }: Props) {
  if (tasks.length === 0) {
    const msg =
      statusFilter === 'done'
        ? 'No completed tasks yet. Get cracking!'
        : categoryFilter !== 'all'
          ? `No ${CATEGORY_LABELS[categoryFilter as keyof typeof CATEGORY_LABELS]?.toLowerCase() || 'tasks'} yet. Add one!`
          : 'Start tracking! Add your first task above.';

    return (
      <div className={styles.empty} role="status">
        <div className={styles.dot} aria-hidden="true" />
        <p className={styles.msg}>{msg}</p>
      </div>
    );
  }

  return (
    <div className={styles.list} role="list">
      {tasks.map((task, i) => (
        <div
          key={task.id}
          className={styles.item}
          style={{ '--stagger': `${i * 60}ms` } as React.CSSProperties}
        >
          <TaskCard
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}
