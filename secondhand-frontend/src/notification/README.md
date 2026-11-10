# Notification UI Module

Global feedback toast alerts, in-app notification center, real-time push events, and badge tracking.

## Architecture

- **`NotificationProvider` & `NotificationContext`:** Application-wide feedback system providing `useNotification()` (`success`, `error`, `info`, `warning`). Dispatches transient toast alerts (`Toast.jsx`) with auto-dismiss timers and manual close controls.
- **`InAppNotificationProvider` & `InAppNotificationContext`:** Persistent notification hub managing activity feed items (order status changes, price drops, offer responses).
- **`InboxNotificationsPanel`:** Component embedded within `InboxPage` presenting paginated notifications with action links and mark-as-read buttons.
- **`useNotificationWebSocket`:** Real-time push listener attached to the user private queue, alerting users immediately when asynchronous events fire.
- **`notificationService`:** API service managing `/v1/notifications` endpoints (`getNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead`).

## Invariants

- **No Native Alerts:** Browser-native `alert()`, `confirm()`, or `prompt()` calls are strictly forbidden across the frontend codebase; all feedback uses `useNotification()`.
- **Safe Message Handling:** Error toasts extract user-friendly messages via `errorUtils.getErrorMessage`, preventing raw Axios error objects or stack traces from reaching the UI.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: toast banners use semantic background tints and clear text, avoid bouncing animations, and contain zero emojis.

