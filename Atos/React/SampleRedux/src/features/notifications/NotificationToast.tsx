import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { dismissNotification } from './notificationsSlice';

export function NotificationToast() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className={`toast toast-${notification.type}`}>
          <span>{notification.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dispatch(dismissNotification(notification.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
