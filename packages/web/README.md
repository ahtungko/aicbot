# @aicbot/web

React 19 + Vite frontend application for AICBot with Tailwind CSS, shadcn/ui, and PWA support.

## Features

- React 19 (canary) with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- shadcn/ui components
- React Query for data fetching
- PWA support with offline capabilities
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
│   └── ui/          # shadcn/ui components
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── lib/             # Utility functions
├── test/            # Test setup
└── types/           # TypeScript types
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
- **PWA**: vite-plugin-pwa
