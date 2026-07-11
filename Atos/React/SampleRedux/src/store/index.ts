import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import projectsReducer, {
  createProject,
  fetchProjects,
} from '../features/projects/projectsSlice';
import tasksReducer, {
  addTask,
  fetchTasks,
  patchTask,
  removeTask,
} from '../features/tasks/tasksSlice';
import filtersReducer from '../features/filters/filtersSlice';
import notificationsReducer, {
  pushNotification,
} from '../features/notifications/notificationsSlice';

const rootReducer = {
  projects: projectsReducer,
  tasks: tasksReducer,
  filters: filtersReducer,
  notifications: notificationsReducer,
};

type RootReducer = typeof rootReducer;
type PreloadedState = {
  [K in keyof RootReducer]: ReturnType<RootReducer[K]>;
};

const listenerMiddleware = createListenerMiddleware<PreloadedState>();

listenerMiddleware.startListening({
  matcher: isAnyOf(fetchTasks.fulfilled, fetchProjects.fulfilled),
  effect: (_action, listenerApi) => {
    const { tasks, projects } = listenerApi.getState();
    if (tasks.status === 'succeeded' && projects.status === 'succeeded') {
      listenerApi.dispatch(
        pushNotification({
          message: `Loaded ${projects.items.length} projects and ${tasks.items.length} tasks`,
          type: 'info',
        }),
      );
    }
  },
});

listenerMiddleware.startListening({
  matcher: addTask.fulfilled.match,
  effect: (action, listenerApi) => {
    listenerApi.dispatch(
      pushNotification({
        message: `Created "${action.payload.title}"`,
        type: 'success',
      }),
    );
  },
});

listenerMiddleware.startListening({
  matcher: patchTask.fulfilled.match,
  effect: (action, listenerApi) => {
    listenerApi.dispatch(
      pushNotification({
        message: `Updated "${action.payload.title}"`,
        type: 'success',
      }),
    );
  },
});

listenerMiddleware.startListening({
  matcher: removeTask.fulfilled.match,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(
      pushNotification({ message: 'Task deleted', type: 'info' }),
    );
  },
});

listenerMiddleware.startListening({
  matcher: createProject.fulfilled.match,
  effect: (action, listenerApi) => {
    listenerApi.dispatch(
      pushNotification({
        message: `Project "${action.payload.name}" created`,
        type: 'success',
      }),
    );
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(
    fetchTasks.rejected,
    fetchProjects.rejected,
    addTask.rejected,
    patchTask.rejected,
    removeTask.rejected,
    createProject.rejected,
  ),
  effect: (action, listenerApi) => {
    const err = 'error' in action ? action.error : undefined;
    const message =
      err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : 'Something went wrong';
    listenerApi.dispatch(pushNotification({ message, type: 'error' }));
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
