import type { Task, StatusFilter, CategoryFilter } from '../../types/task';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../EmptyState/EmptyState';
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
    return <EmptyState categoryFilter={categoryFilter} statusFilter={statusFilter} />;
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
