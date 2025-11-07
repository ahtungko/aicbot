# Frontend Documentation

The AICBot frontend is a modern Progressive Web App (PWA) built with React that provides an intuitive chat interface with real-time streaming responses and offline capabilities.

## 🏗️ Architecture

```
┌─────────────────┐
│      UI         │
│   (React)       │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
┌───▼───┐   ┌───▼───┐
│Hooks  │   │Comps  │
│       │   │       │
└───┬───┘   └───┬───┘
    │           │
┌───▼───┐   ┌───▼───┐
│Services│   │Utils  │
│       │   │       │
└───┬───┘   └───┬───┘
    │           │
┌───▼───────────▼───┐
│   API/WebSocket  │
└───────────────────┘
```

## 📁 Directory Structure

```
packages/frontend/
├── public/                    # Static assets
│   ├── index.html            # HTML template
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   └── icons/                # App icons
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Generic components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loading.jsx
│   │   ├── chat/             # Chat-specific components
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── TypingIndicator.jsx
│   │   └── layout/           # Layout components
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       └── Footer.jsx
│   ├── pages/                # Page components
│   │   ├── Home.jsx          # Main chat page
│   │   ├── Login.jsx         # Authentication
│   │   ├── Register.jsx      # User registration
│   │   ├── Profile.jsx       # User profile
│   │   └── Settings.jsx      # App settings
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.js        # Authentication
│   │   ├── useChat.js        # Chat functionality
│   │   ├── useWebSocket.js   # WebSocket connection
│   │   ├── useLocalStorage.js # Local storage
│   │   └── usePWA.js         # PWA features
│   ├── services/             # API calls and external services
│   │   ├── api.js            # API client
│   │   ├── websocket.js      # WebSocket client
│   │   ├── auth.js           # Authentication service
│   │   └── storage.js        # Storage service
│   ├── utils/                # Helper functions
│   │   ├── constants.js      # App constants
│   │   ├── helpers.js        # Utility functions
│   │   ├── validation.js     # Form validation
│   │   └── formatting.js     # Text formatting
│   ├── styles/               # Styling
│   │   ├── globals.css       # Global styles
│   │   ├── variables.css     # CSS variables
│   │   └── components/       # Component styles
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.js    # Authentication context
│   │   ├── ChatContext.js    # Chat context
│   │   └── ThemeContext.js   # Theme context
│   ├── App.jsx               # Main application component
│   └── index.js              # Application entry point
├── tests/                    # Test files
│   ├── components/           # Component tests
│   ├── hooks/                # Hook tests
│   ├── services/             # Service tests
│   └── utils/                # Utility tests
├── package.json
├── Dockerfile
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0+
- npm 8.0.0+ or yarn 1.22.0+

### Installation

```bash
cd packages/frontend
npm install
# or
yarn install
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Running the Application

```bash
# Development mode
npm start
# or
yarn start

# Production build
npm run build
# or
yarn build

# Serve production build
npm run serve
# or
yarn serve

# Run tests
npm test
# or
yarn test

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage
```

## 🌍 Environment Variables

### Required Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:5000` | Backend API base URL |
| `REACT_APP_WS_URL` | `ws://localhost:5000` | WebSocket server URL |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_APP_NAME` | `AICBot` | Application name |
| `REACT_APP_APP_VERSION` | `1.0.0` | Application version |
| `REACT_APP_MAX_MESSAGE_LENGTH` | `4000` | Maximum message length |
| `REACT_APP_TYPING_TIMEOUT` | `3000` | Typing indicator timeout (ms) |
| `REACT_APP_RECONNECT_ATTEMPTS` | `5` | WebSocket reconnection attempts |
| `REACT_APP_RECONNECT_DELAY` | `1000` | Reconnection delay (ms) |
| `REACT_APP_OFFLINE_SUPPORT` | `true` | Enable offline support |
| `REACT_APP_THEME` | `light` | Default theme (light/dark) |
| `REACT_APP_ANALYTICS_ID` | - | Google Analytics ID |

### Example .env file

```bash
# API Configuration
REACT_APP_API_URL=https://api.aicbot.com
REACT_APP_WS_URL=wss://api.aicbot.com

# Application Settings
REACT_APP_APP_NAME=AICBot
REACT_APP_APP_VERSION=1.0.0
REACT_APP_MAX_MESSAGE_LENGTH=4000
REACT_APP_TYPING_TIMEOUT=3000

# WebSocket Settings
REACT_APP_RECONNECT_ATTEMPTS=5
REACT_APP_RECONNECT_DELAY=1000

# PWA Settings
REACT_APP_OFFLINE_SUPPORT=true
REACT_APP_THEME=light

# Analytics
REACT_APP_ANALYTICS_ID=GA-XXXXXXXXX
```

## 🎨 UI Components

### Core Components

#### Button
```jsx
import Button from '../components/common/Button';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="primary" size="large" loading={isLoading}>
  Submit
</Button>

// With icon
<Button icon={<SendIcon />} variant="ghost">
  Send
</Button>
```

**Props:**
- `variant`: `primary`, `secondary`, `ghost`, `danger`
- `size`: `small`, `medium`, `large`
- `loading`: Boolean for loading state
- `disabled`: Boolean for disabled state
- `icon`: React node for icon
- `onClick`: Click handler

#### MessageInput
```jsx
import MessageInput from '../components/chat/MessageInput';

<MessageInput
  onSend={handleSendMessage}
  placeholder="Type your message..."
  maxLength={4000}
  disabled={isSending}
  showCharacterCount
/>
```

**Props:**
- `onSend`: Function called when message is sent
- `placeholder`: Input placeholder text
- `maxLength`: Maximum character count
- `disabled`: Boolean for disabled state
- `showCharacterCount`: Boolean to show character count

#### MessageBubble
```jsx
import MessageBubble from '../components/chat/MessageBubble';

<MessageBubble
  message="Hello, how are you?"
  sender="user"
  timestamp="2024-01-01T00:00:00.000Z"
  isTyping={false}
/>
```

**Props:**
- `message`: Message content
- `sender`: `user` or `assistant`
- `timestamp`: Message timestamp
- `isTyping`: Boolean for typing indicator
- `streaming`: Boolean for streaming state

### Layout Components

#### Header
```jsx
import Header from '../components/layout/Header';

<Header
  title="AICBot"
  user={user}
  onLogout={handleLogout}
  onSettings={handleSettings}
/>
```

#### Sidebar
```jsx
import Sidebar from '../components/layout/Sidebar';

<Sidebar
  conversations={conversations}
  activeConversationId={activeId}
  onConversationSelect={handleSelect}
  onNewConversation={handleNew}
  isOpen={isSidebarOpen}
  onToggle={handleToggle}
/>
```

## 🪝 Custom Hooks

### useAuth
```jsx
import { useAuth } from '../hooks/useAuth';

function Login() {
  const { login, logout, user, isLoading, error } = useAuth();

  const handleSubmit = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    // JSX for login form
  );
}
```

**Returns:**
- `user`: Current user object
- `login`: Login function
- `logout`: Logout function
- `register`: Register function
- `isLoading`: Loading state
- `error`: Error object

### useChat
```jsx
import { useChat } from '../hooks/useChat';

function ChatContainer() {
  const {
    messages,
    sendMessage,
    isTyping,
    isLoading,
    error,
    conversationId
  } = useChat();

  const handleSendMessage = async (message) => {
    await sendMessage(message);
  };

  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
```

**Returns:**
- `messages`: Array of messages
- `sendMessage`: Send message function
- `isTyping`: Boolean for typing indicator
- `isLoading`: Loading state
- `error`: Error object
- `conversationId`: Current conversation ID

### useWebSocket
```jsx
import { useWebSocket } from '../hooks/useWebSocket';

function ChatComponent() {
  const {
    isConnected,
    sendMessage,
    lastMessage,
    error,
    reconnect
  } = useWebSocket('ws://localhost:5000');

  useEffect(() => {
    if (lastMessage) {
      console.log('Received:', lastMessage);
    }
  }, [lastMessage]);

  return (
    <div>
      <div>Connection: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <button onClick={() => sendMessage('Hello')}>
        Send Message
      </button>
    </div>
  );
}
```

## 🌐 PWA Features

### Service Worker

The application includes a service worker for offline functionality:

```javascript
// public/sw.js
const CACHE_NAME = 'aicbot-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

### PWA Manifest

```json
{
  "name": "AICBot - AI Chat Assistant",
  "short_name": "AICBot",
  "description": "AI-powered chat assistant with real-time responses",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Offline Support

The application provides offline support through:

1. **Caching**: Static assets are cached for offline access
2. **Offline Messages**: Messages are queued when offline and sent when reconnected
3. **Offline Indicator**: Visual indicator when offline
4. **Fallback UI**: Graceful degradation when features are unavailable

```jsx
// Example offline handling
import { usePWA } from '../hooks/usePWA';

function OfflineIndicator() {
  const { isOnline, isOfflineSupported } = usePWA();

  if (!isOfflineSupported) return null;

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? 'Connected' : 'Offline - Messages will be queued'}
    </div>
  );
}
```

## 🎨 Theming

The application supports light and dark themes:

### CSS Variables
```css
:root {
  /* Light theme */
  --primary-color: #2563eb;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --border-color: #e5e7eb;
  --message-bg: #f3f4f6;
}

[data-theme="dark"] {
  /* Dark theme */
  --primary-color: #3b82f6;
  --background-color: #1f2937;
  --text-color: #f9fafb;
  --border-color: #374151;
  --message-bg: #374151;
}
```

### Theme Context
```jsx
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

## 📱 Responsive Design

The application is fully responsive:

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
  .chat-container {
    padding: 1rem;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .chat-container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .chat-container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Mobile-Specific Features
- Touch-optimized interface
- Swipe gestures for navigation
- Virtual keyboard handling
- Mobile-specific animations

## 🧪 Testing

### Component Testing
```jsx
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/common/Button';

describe('Button', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing
```jsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
  test('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  test('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.user).toBeTruthy();
  });
});
```

### Available Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for specific file
npm test -- MessageInput.test.js
```

## 🚀 Build & Deployment

### Build Configuration

The application uses Create React App with custom configurations:

```javascript
// config-overrides.js (if using react-app-rewired)
module.exports = {
  webpack: (config) => {
    // Custom webpack configurations
    return config;
  },
  devServer: (configFunction) => {
    return (proxy, allowedHost) => {
      const config = configFunction(proxy, allowedHost);
      // Custom dev server configurations
      return config;
    };
  }
};
```

### Production Build

```bash
# Create production build
npm run build

# Build with analysis
npm run build:analyze

# Build and serve locally
npm run build && npm run serve
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Development Tools

### Code Quality

```bash
# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

### Development Server

The development server includes:
- Hot Module Replacement (HMR)
- Error overlay
- Source maps
- Proxy to backend API

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using Redux)
- PWA Builder for manifest validation

## 📊 Performance Optimization

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Settings />
    </Suspense>
  );
}
```

### Image Optimization

```jsx
import OptimizedImage from '../components/common/OptimizedImage';

<OptimizedImage
  src="/images/logo.png"
  alt="AICBot Logo"
  width={200}
  height={200}
  lazy
  webp
/>
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Check bundlephobia for dependencies
npx bundlephobia-cli react
```

## 🔒 Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' ws://localhost:5000 https://api.aicbot.com;">
```

### Input Sanitization

```jsx
import DOMPurify from 'dompurify';

function MessageContent({ content }) {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
```

## 📝 Accessibility

### ARIA Labels

```jsx
<button
  aria-label="Send message"
  aria-describedby="message-input-help"
  onClick={handleSend}
>
  <SendIcon />
</button>
<div id="message-input-help" className="sr-only">
  Press Enter to send your message, Shift+Enter for new line
</div>
```

### Keyboard Navigation

```jsx
function MessageInput() {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <textarea
      onKeyDown={handleKeyDown}
      aria-label="Type your message"
      placeholder="Type your message..."
    />
  );
}
```

## 🆘 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend is running
   - Verify WebSocket URL in environment variables
   - Check firewall settings

2. **PWA Not Installing**
   - Verify service worker is registered
   - Check manifest.json syntax
   - Ensure site is served over HTTPS in production

3. **Styling Issues**
   - Clear browser cache
   - Check CSS imports
   - Verify CSS variables are defined

### Debug Tools

```javascript
// Debug logging
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = {
    log: (...args) => console.log('[DEBUG]', ...args),
    error: (...args) => console.error('[DEBUG]', ...args),
  };
}
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Performance Best Practices](https://web.dev/performance/)

---

**Frontend Version**: 1.0.0  
**Last Updated**: 2024-01-01
