# PWA Features & Offline Persistence Guide

## Overview

AICBot now includes Progressive Web App (PWA) capabilities with offline support and client-side persistence for conversations and messages.

## Features

### 1. Service Worker & Offline Caching

- **Static Assets**: All app shell assets (JS, CSS, HTML, images) are cached for offline use
- **API Caching**: Network-first strategy with fallback for API requests
- **Font Caching**: Google Fonts are cached for offline availability
- **Auto-update**: Service worker automatically updates when new versions are deployed

### 2. LocalStorage Persistence

- **Conversation Metadata**: All conversations are persisted to localStorage
- **Recent Messages**: Messages within conversations are stored locally
- **Current State**: Active conversation is remembered across sessions
- **Unsent Messages**: Messages sent while offline are queued for later sending

### 3. Offline Detection & UI

- **Online/Offline Status**: Real-time detection of network connectivity
- **Visual Indicators**: Banner notification when offline or when queued messages exist
- **Message Queueing**: Messages sent while offline are queued and can be sent when reconnected
- **Input Feedback**: UI adapts to show offline state with appropriate tooltips

### 4. Sync Strategy

- **On Reconnection**: When connection is re-established, queued messages are available for sending
- **Conflict Resolution**: Server authority is preferred when syncing data
- **Local-first Updates**: Changes are immediately reflected in UI and persisted locally

## Installation as PWA

### Desktop (Chrome/Edge)
1. Visit the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click "Install" in the prompt
4. The app will be installed and can be launched from your desktop

### Mobile (iOS Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Mobile (Android Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. Tap "Install"

## Manual Verification Checklist

### PWA Installability

- [ ] App manifest is generated at `/manifest.webmanifest`
- [ ] Service worker is registered at `/sw.js`
- [ ] Icons are available (192x192 and 512x512)
- [ ] HTTPS is enabled (or localhost for development)
- [ ] Install prompt appears in supported browsers
- [ ] Lighthouse PWA audit passes installability checks

### Offline Functionality

- [ ] App loads when offline (after initial online visit)
- [ ] Static assets load from cache when offline
- [ ] Offline indicator appears when network is disconnected
- [ ] Message input shows offline placeholder text
- [ ] Send button adapts to offline state
- [ ] Messages can be queued while offline
- [ ] Queued messages are persisted across page reloads

### Persistence Testing

1. **Initial Load**:
   - [ ] Fresh load shows no persisted data
   - [ ] Version check initializes localStorage

2. **Conversation Persistence**:
   - [ ] Create a conversation - refresh page
   - [ ] Conversation list persists after reload
   - [ ] Current conversation selection persists
   - [ ] Message history is retained

3. **Offline Message Queue**:
   - [ ] Disconnect network (DevTools > Network > Offline)
   - [ ] Send a message
   - [ ] Message is added to queue (check offline indicator)
   - [ ] Refresh page - queued messages persist
   - [ ] Reconnect - queue notification appears
   - [ ] Queued messages can be processed

4. **Cross-session Persistence**:
   - [ ] Close browser completely
   - [ ] Reopen app
   - [ ] All conversations and messages are restored
   - [ ] Current conversation is restored

### Service Worker Verification

1. **DevTools Service Worker Panel**:
   - Open DevTools > Application > Service Workers
   - [ ] Service worker is registered and activated
   - [ ] Update on reload is working

2. **Cache Storage**:
   - Open DevTools > Application > Cache Storage
   - [ ] Workbox caches are created
   - [ ] Static assets are cached
   - [ ] API responses are cached (after requests)

3. **Offline Page Load**:
   - [ ] Load app while online
   - [ ] Go offline
   - [ ] Reload page
   - [ ] App loads from cache

## Development

### Enable PWA in Development

PWA features are enabled in development mode via `vite.config.ts`:

```typescript
devOptions: {
  enabled: true,
  type: 'module'
}
```

### Testing Offline Behavior

1. **Chrome DevTools**:
   - Open DevTools
   - Go to Network tab
   - Check "Offline" checkbox

2. **Service Worker Update**:
   - Make code changes
   - Service worker will detect update
   - User will be prompted to reload

### Clear All PWA Data

To reset PWA state during development:

```javascript
// Run in browser console
localStorage.clear();
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
location.reload();
```

## Troubleshooting

### Service Worker Not Registering

- Check console for errors
- Ensure HTTPS is enabled (or using localhost)
- Clear browser cache and reload
- Check DevTools > Application > Service Workers

### Persistence Not Working

- Check browser localStorage quota
- Verify localStorage is not disabled
- Check console for serialization errors
- Ensure privacy mode is not blocking storage

### Offline Mode Issues

- Verify service worker is activated
- Check cache storage in DevTools
- Ensure navigateFallback is configured
- Test with real offline mode, not just DevTools

## Architecture

### Storage Keys

All localStorage keys are prefixed with `aicbot_`:

- `aicbot_version`: Storage schema version
- `aicbot_conversations`: Serialized conversations array
- `aicbot_current_conversation_id`: Active conversation ID
- `aicbot_unsent_messages`: Queue of messages sent while offline
- `aicbot_last_sync`: Timestamp of last successful sync

### Data Serialization

- Dates are serialized to ISO strings
- Objects are JSON stringified
- Deserialization reconstructs Date objects
- Schema versioning handles migrations

### Service Worker Strategies

- **Static Assets**: CacheFirst - serve from cache, fallback to network
- **API Requests**: NetworkFirst - try network, fallback to cache
- **Navigation**: Serve index.html from cache when offline
- **Fonts**: CacheFirst with long expiration

## Performance

### Cache Sizes

- Static assets: ~1-2MB (app shell)
- API cache: Limited to 50 entries, 5 minute expiration
- Font cache: Limited to 10 entries, 1 year expiration

### Storage Quotas

- Most browsers allow 50-100MB for localStorage
- Service worker cache has browser-specific limits (typically 50-100MB)
- App monitors storage and handles quota errors gracefully

## Future Enhancements

- Background sync for automatic message sending
- Push notifications for new messages
- IndexedDB for larger data storage
- Periodic background sync
- Share target API integration
