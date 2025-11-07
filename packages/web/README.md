# @aicbot/web

React 19 + Vite frontend application for AICBot with Tailwind CSS, shadcn/ui, and PWA support.

## Features

- React 19 (canary) with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- shadcn/ui components
- React Query for data fetching
- **PWA support with offline capabilities**
  - Service worker for offline asset caching
  - localStorage persistence for conversations
  - Offline detection and message queueing
  - Auto-sync when connection restored
- Dark mode support
- Responsive design with mobile sidebar

## Getting Started

### Development

```bash
pnpm --filter web dev
```

Starts the Vite development server at `http://localhost:5173` with hot module replacement.

### Build

```bash
pnpm --filter web build
```

Builds the application for production to the `dist` folder.

### Preview

```bash
pnpm --filter web preview
```

Preview the production build locally.

### Test

```bash
pnpm --filter web test
```

Run tests with Vitest.

## Environment Variables

Create a `.env` file in the `packages/web` directory:

```
VITE_API_BASE_URL=http://localhost:3000
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── ChatArea.tsx # Main chat interface
│   ├── Sidebar.tsx  # Conversation sidebar
│   └── OfflineIndicator.tsx # Offline status banner
├── contexts/        # React contexts
│   ├── ConversationContext.tsx # Conversation state & persistence
│   └── OfflineContext.tsx      # Offline detection & queue
├── hooks/           # Custom hooks
│   ├── useOnlineStatus.ts # Online/offline detection
│   └── useTheme.ts        # Dark mode theme
├── lib/             # Utility functions
│   ├── persistence.ts # localStorage utilities
│   └── utils.ts       # General utilities
├── test/            # Test setup
└── App.tsx          # Root component
```

## Tech Stack

- **Framework**: React 19 (canary)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query, Context API
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **PWA**: vite-plugin-pwa with Workbox

## PWA & Offline Support

This app includes full Progressive Web App capabilities. See [PWA_GUIDE.md](./PWA_GUIDE.md) for detailed documentation on:

- Installing the app on desktop and mobile
- Offline functionality and caching strategies
- localStorage persistence
- Message queueing when offline
- Manual verification checklist
- Development and troubleshooting

### Quick Start for PWA Testing

1. Build the app: `pnpm --filter web build`
2. Preview: `pnpm --filter web preview`
3. Open DevTools > Application > Service Workers
4. Test offline: DevTools > Network > Offline checkbox
