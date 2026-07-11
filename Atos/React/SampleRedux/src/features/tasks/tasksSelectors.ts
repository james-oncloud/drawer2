import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { Task, TaskStatus } from '../../types';

const selectTasksState = (state: RootState) => state.tasks;
const selectFiltersState = (state: RootState) => state.filters;
const selectProjectsState = (state: RootState) => state.projects;

export const selectAllTasks = (state: RootState) => state.tasks.items;
export const selectTasksStatus = (state: RootState) => state.tasks.status;
export const selectTasksMutationStatus = (state: RootState) => state.tasks.mutationStatus;
export const selectTasksError = (state: RootState) => state.tasks.error;

export const selectSelectedProjectId = (state: RootState) => state.projects.selectedId;

export const selectProjectById = createSelector(
  [selectProjectsState, (_state: RootState, projectId: string) => projectId],
  (projects, projectId) => projects.items.find((p) => p.id === projectId),
);

export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectFiltersState, selectSelectedProjectId],
  (tasks, filters, selectedProjectId) => {
    const searchLower = filters.search.trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);

    return tasks.filter((task) => {
      if (selectedProjectId && task.projectId !== selectedProjectId) return false;
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.showOverdueOnly) {
        if (!task.dueDate || task.status === 'done') return false;
        if (task.dueDate >= today) return false;
      }
      if (searchLower) {
        const haystack = `${task.title} ${task.description}`.toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }
      return true;
    });
  },
);

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  overdue: number;
  highPriorityOpen: number;
}

export const selectTaskStats = createSelector(
  [selectAllTasks, selectSelectedProjectId],
  (tasks, selectedProjectId): TaskStats => {
    const scoped = selectedProjectId
      ? tasks.filter((t) => t.projectId === selectedProjectId)
      : tasks;

    const today = new Date().toISOString().slice(0, 10);

    return scoped.reduce<TaskStats>(
      (acc, task) => {
        acc.total += 1;
        acc.byStatus[task.status] += 1;
        if (task.dueDate && task.dueDate < today && task.status !== 'done') {
          acc.overdue += 1;
        }
        if (task.priority === 'high' && task.status !== 'done') {
          acc.highPriorityOpen += 1;
        }
        return acc;
      },
      {
        total: 0,
        byStatus: { todo: 0, in_progress: 0, done: 0 },
        overdue: 0,
        highPriorityOpen: 0,
      },
    );
  },
);

export const selectTasksGroupedByStatus = createSelector(
  [selectFilteredTasks],
  (tasks): Record<TaskStatus, Task[]> => ({
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  }),
);

export const selectIsLoading = createSelector(
  [selectTasksState, selectProjectsState],
  (tasks, projects) =>
    tasks.status === 'loading' ||
    projects.status === 'loading' ||
    tasks.mutationStatus === 'loading',
);
