import { formatDate, isOverdue, daysUntil } from '../../utils/dates';

interface Props {
  dueDate: string | null;
}

export function DueDateBadge({ dueDate }: Props) {
  if (!dueDate) return null;

  const overdue = isOverdue(dueDate);
  const remaining = daysUntil(dueDate);

  return (
    <span className={`due-date-badge${overdue ? ' is-overdue' : ''}`}>
      {formatDate(dueDate)}
      {overdue && <span className="overdue-label"> overdue</span>}
      {!overdue && remaining <= 3 && remaining >= 0 && (
        <span className="due-soon-label"> in {remaining}d</span>
      )}
    </span>
  );
}
