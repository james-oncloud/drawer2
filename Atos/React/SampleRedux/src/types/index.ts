export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
}

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
}

export interface UpdateTaskPayload {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  projectId?: string;
}

export interface CreateProjectPayload {
  name: string;
  color: string;
  description: string;
}

export type StatusFilter = TaskStatus | 'all';
export type PriorityFilter = TaskPriority | 'all';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
