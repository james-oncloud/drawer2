import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CreateProjectPayload, Project } from '../../types';
import * as api from '../../services/api';

interface ProjectsState {
  items: Project[];
  selectedId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  selectedId: null,
  status: 'idle',
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchAll', () => api.fetchProjects());

export const createProject = createAsyncThunk(
  'projects/create',
  (payload: CreateProjectPayload) => api.createProject(payload),
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    selectProject(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    clearProjectError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        if (!state.selectedId && action.payload.length > 0) {
          state.selectedId = action.payload[0].id;
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load projects';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.selectedId = action.payload.id;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create project';
      });
  },
});

export const { selectProject, clearProjectError } = projectsSlice.actions;
export default projectsSlice.reducer;
