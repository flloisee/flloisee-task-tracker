export type TaskCategory = 'assignment' | 'exam' | 'project' | 'custom';
export type TaskPriority = 'low' | 'medium' | 'high';
export type StatusFilter = 'all' | 'active' | 'done';
export type CategoryFilter = TaskCategory | 'all';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
  done: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface TaskFormData {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  assignment: 'Assignment',
  exam: 'Exam',
  project: 'Project',
  custom: 'Custom',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  assignment: 'var(--cat-assignment)',
  exam: 'var(--cat-exam)',
  project: 'var(--cat-project)',
  custom: 'var(--cat-custom)',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'var(--pri-low)',
  medium: 'var(--pri-medium)',
  high: 'var(--pri-high)',
};

export interface TaskStats {
  total: number;
  active: number;
  done: number;
  doneToday: number;
}
