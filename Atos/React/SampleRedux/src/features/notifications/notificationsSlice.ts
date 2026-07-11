import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../types';

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

const uid = () => `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    pushNotification(
      state,
      action: PayloadAction<Omit<Notification, 'id'>>,
    ) {
      state.items.push({ id: uid(), ...action.payload });
    },
    dismissNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { pushNotification, dismissNotification, clearNotifications } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
