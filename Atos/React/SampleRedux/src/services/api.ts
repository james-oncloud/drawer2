import type { CreateProjectPayload, CreateTaskPayload, Project, Task, UpdateTaskPayload } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    color: '#6366f1',
    description: 'Refresh the marketing site and component library.',
  },
  {
    id: 'proj-2',
    name: 'Mobile App',
    color: '#10b981',
    description: 'Ship v2 of the iOS and Android clients.',
  },
  {
    id: 'proj-3',
    name: 'Platform Ops',
    color: '#f59e0b',
    description: 'Infrastructure, monitoring, and on-call improvements.',
  },
];

let tasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Audit existing pages',
    description: 'Document current routes, copy, and broken links.',
    status: 'done',
    priority: 'medium',
    dueDate: '2026-03-01',
    createdAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Design new hero section',
    description: 'Work with design on above-the-fold layout.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-03-15',
    createdAt: '2026-02-12T11:30:00.000Z',
  },
  {
    id: 'task-3',
    projectId: 'proj-2',
    title: 'Implement push notifications',
    description: 'Firebase integration for iOS and Android.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-04-01',
    createdAt: '2026-02-14T08:15:00.000Z',
  },
  {
    id: 'task-4',
    projectId: 'proj-2',
    title: 'Offline sync spike',
    description: 'Evaluate SQLite vs IndexedDB for local cache.',
    status: 'todo',
    priority: 'low',
    dueDate: null,
    createdAt: '2026-02-18T14:00:00.000Z',
  },
  {
    id: 'task-5',
    projectId: 'proj-3',
    title: 'Upgrade staging cluster',
    description: 'Move staging to Kubernetes 1.30.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-03-20',
    createdAt: '2026-02-20T10:00:00.000Z',
  },
];

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export async function fetchProjects(): Promise<Project[]> {
  await delay(400);
  return structuredClone(projects);
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  await delay(300);
  const project: Project = { id: uid('proj'), ...payload };
  projects = [...projects, project];
  return structuredClone(project);
}

export async function fetchTasks(): Promise<Task[]> {
  await delay(500);
  return structuredClone(tasks);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  await delay(350);
  const task: Task = {
    id: uid('task'),
    ...payload,
    status: 'todo',
    createdAt: new Date().toISOString(),
  };
  tasks = [...tasks, task];
  return structuredClone(task);
}

export async function updateTask(payload: UpdateTaskPayload): Promise<Task> {
  await delay(250);
  const index = tasks.findIndex((t) => t.id === payload.id);
  if (index === -1) {
    throw new Error(`Task ${payload.id} not found`);
  }
  const updated = { ...tasks[index], ...payload };
  tasks = tasks.map((t) => (t.id === payload.id ? updated : t));
  return structuredClone(updated);
}

export async function deleteTask(taskId: string): Promise<string> {
  await delay(200);
  const exists = tasks.some((t) => t.id === taskId);
  if (!exists) {
    throw new Error(`Task ${taskId} not found`);
  }
  tasks = tasks.filter((t) => t.id !== taskId);
  return taskId;
}
