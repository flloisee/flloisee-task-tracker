import type { TaskCategory } from '../../types/task';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../types/task';

interface Props {
  category: TaskCategory;
}

export function CategoryBadge({ category }: Props) {
  const color = CATEGORY_COLORS[category];
  return (
    <span
      className="category-badge"
      style={{
        background: `color-mix(in oklch, ${color} 15%, transparent)`,
        color,
      }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
