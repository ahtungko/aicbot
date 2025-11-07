# AICBot Frontend

A modern, responsive React PWA for AI chatbot interactions with real-time streaming capabilities.

## Features

- 🚀 **Real-time Streaming**: Watch AI responses appear token by token
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 💬 **Conversation Management**: Create, rename, delete, and switch between conversations
- ⚙️ **Model Selection**: Choose from multiple AI models with customizable settings
- 🎨 **Modern UI**: Clean, accessible interface with smooth animations
- 🧪 **Well Tested**: Comprehensive test coverage with Jest and React Testing Library
- 🔍 **Error Handling**: Graceful error states with user-friendly messaging
- ♿ **Accessibility**: Full ARIA support and keyboard navigation

## Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **TanStack Query** - Server state management and caching
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Jest & RTL** - Testing framework
- **MSW** - API mocking for tests

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Skeleton, etc.)
│   ├── ChatLayout.tsx  # Main chat layout component
│   ├── MessageList.tsx # Message display with virtualization
│   ├── ChatComposer.tsx # Message input and send functionality
│   ├── ConversationSidebar.tsx # Conversation management
│   └── ModelSelector.tsx # AI model selection and settings
├── hooks/              # Custom React hooks
│   ├── useChat.ts      # Chat state and streaming logic
│   └── useConversations.ts # Conversation management
├── services/           # API services
│   └── api.ts          # HTTP client and API methods
├── mocks/              # API mocking for tests
│   └── server.ts       # MSW server setup
└── __tests__/          # Test files
```

## Key Components

### ChatLayout
The main layout component that orchestrates all chat functionality:
- Manages conversation selection and creation
- Handles model settings and preferences
- Integrates all sub-components

### MessageList
Displays chat messages with:
- Virtualized scrolling for performance
- Streaming indicators for live responses
- Message bubbles with timestamps
- Empty state and loading states

### ChatComposer
Message input component featuring:
- Auto-resizing textarea
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Loading and streaming states
- Error handling

### ConversationSidebar
Conversation management with:
- Create, rename, delete conversations
- Mobile-responsive drawer design
- Message previews and timestamps
- Sort by last updated

### ModelSelector
AI model configuration:
- Dropdown model selection
- Temperature and max token sliders
- Per-conversation settings persistence
- Responsive settings panel

## State Management

The application uses a hybrid approach:

- **TanStack Query** for server state (conversations, models, API calls)
- **React hooks** for local component state
- **Context** avoided in favor of prop drilling for simplicity

## Testing Strategy

- **Unit Tests**: Individual component and hook testing
- **Integration Tests**: Component interaction testing
- **API Mocking**: MSW for consistent API simulation
- **Coverage**: High test coverage for critical paths

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PWA=true
```

## PWA Features

The application includes Progressive Web App capabilities:
- Service worker for offline functionality
- App manifest for installability
- Responsive design for all devices
- Fast loading and caching strategies

## Accessibility

- Full keyboard navigation support
- Screen reader compatibility
- ARIA labels and roles
- Focus management
- High contrast support

## Performance Optimizations

- Code splitting with React.lazy
- Virtualized scrolling for long message lists
- Image optimization and lazy loading
- Efficient re-rendering with React.memo
- Debounced API calls where appropriate

## Error Handling

- Global error boundary for crash recovery
- API error handling with user-friendly messages
- Network error detection and retry logic
- Graceful degradation for older browsers

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Android Chrome)

## Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Update documentation as needed
5. Follow semantic versioning for releases