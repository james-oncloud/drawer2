import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CreateTaskPayload, Task, TaskStatus, UpdateTaskPayload } from '../../types';
import * as api from '../../services/api';

interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationStatus: 'idle' | 'loading';
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchAll', () => api.fetchTasks());

export const addTask = createAsyncThunk('tasks/add', (payload: CreateTaskPayload) =>
  api.createTask(payload),
);

export const patchTask = createAsyncThunk('tasks/patch', (payload: UpdateTaskPayload) =>
  api.updateTask(payload),
);

export const removeTask = createAsyncThunk('tasks/remove', (taskId: string) =>
  api.deleteTask(taskId),
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    advanceTaskStatus(state, action: PayloadAction<string>) {
      const task = state.items.find((t) => t.id === action.payload);
      if (!task) return;

      const flow: TaskStatus[] = ['todo', 'in_progress', 'done'];
      const nextIndex = flow.indexOf(task.status) + 1;
      if (nextIndex < flow.length) {
        task.status = flow[nextIndex];
      }
    },
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load tasks';
      })
      .addMatcher(
        (action) =>
          addTask.pending.match(action) ||
          patchTask.pending.match(action) ||
          removeTask.pending.match(action),
        (state) => {
          state.mutationStatus = 'loading';
        },
      )
      .addMatcher(
        (action) =>
          addTask.fulfilled.match(action) ||
          patchTask.fulfilled.match(action) ||
          removeTask.fulfilled.match(action),
        (state, action) => {
          state.mutationStatus = 'idle';
          if (addTask.fulfilled.match(action)) {
            state.items.push(action.payload);
          } else if (patchTask.fulfilled.match(action)) {
            const index = state.items.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) state.items[index] = action.payload;
          } else if (removeTask.fulfilled.match(action)) {
            state.items = state.items.filter((t) => t.id !== action.payload);
          }
        },
      )
      .addMatcher(
        (action) =>
          addTask.rejected.match(action) ||
          patchTask.rejected.match(action) ||
          removeTask.rejected.match(action),
        (state, action) => {
          state.mutationStatus = 'idle';
          state.error = action.error.message ?? 'Task operation failed';
        },
      );
  },
});

export const { advanceTaskStatus, clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
