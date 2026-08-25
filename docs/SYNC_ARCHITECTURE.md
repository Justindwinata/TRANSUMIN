# Synchronization Architecture

This document describes the synchronization architecture used in TRANSUM-IN.

## Overview
TRANSUM-IN uses a local-first synchronization strategy, where changes (history, notifications, preferences) are persisted locally first, then asynchronously synchronized with the backend.

## Account Isolation
All local persistence (SharedPreferences) is scoped by user identity to prevent data leakage across account switches.
- **Helper:** `AccountScopedPersistence`
- **Key Pattern:** `{prefix}:{userId}`

## Offline Queue
History mutations (add, remove, clear) are enqueued in `OfflineQueue` when offline.
- **Processing:** `QueueProcessor` drains the queue when connectivity is restored.
- **Idempotency:** Each action is assigned a unique ID to prevent double processing.
- **Failures:** Permanent errors (4xx) are discarded to unblock the queue; temporary errors (5xx/network) are retained.

## Notifications
Notifications are fetched from the backend (source of truth) and cached locally per user.
- **Isolation:** `notifications:{userId}` key pattern
- **Sync:** Mark-read/mark-all-read mutations are synchronized asynchronously.
- **Logout:** Cache cleared upon logout for the current user.
