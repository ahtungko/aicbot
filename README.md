# AI Chatbot (AICBot)

A modern, responsive AI chatbot application with streaming capabilities, PWA support, and
comprehensive deployment options.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/WS     ┌─────────────────┐    API     ┌──────────────┐
│   Frontend      │◄──────────────►│   Backend       │◄──────────►│   Manus API  │
│   (React/PWA)   │                │   (Node.js)     │            │   Service    │
└─────────────────┘                └─────────────────┘            └──────────────┘
       │                                   │
       │                                   ▼
       │                           ┌──────────────┐
       └──────────────────────────►│  Database    │
                                   │  (Optional)  │
                                   └──────────────┘
```

### Key Components

- **Frontend**: Progressive Web App with offline capabilities, real-time streaming responses
- **Backend**: RESTful API with WebSocket support for streaming chat responses
- **Manus API Integration**: External AI service for natural language processing
- **Database**: Optional persistence layer for chat history and user data

## 📁 Workspace Structure

```
aicbot/
├── packages/
│   ├── backend/                 # Node.js API server (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── controllers/     # API route handlers
│   │   │   ├── middleware/      # Express middleware
│   │   │   ├── services/        # Business logic
│   │   │   ├── utils/           # Helper functions
│   │   │   ├── config/          # Environment configuration
│   │   │   └── index.ts         # Application entry point
│   │   ├── tests/               # Backend tests
│   │   ├── package.json
│   │   └── README.md            # Backend-specific docs
│   ├── web/                     # React 19 + Vite frontend (new)
│   │   ├── public/              # Static assets
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── pages/           # Page components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── services/        # API calls
│   │   │   ├── utils/           # Helper functions
│   │   │   └── App.tsx          # Main application component
│   │   ├── tests/               # Frontend tests
│   │   ├── package.json
│   │   └── README.md            # Frontend-specific docs
│   ├── frontend/                # Legacy React frontend (deprecated)
│   └── shared/                  # Shared TypeScript types and utilities
│       ├── src/
│       │   ├── types/           # Common TypeScript interfaces
│       │   └── utils/           # Shared utility functions
│       ├── package.json
│       └── README.md
├── docs/                        # Additional documentation
├── .env.example                 # Environment variables template
├── docker-compose.yml           # Development environment
├── package.json                 # Root package.json (pnpm workspace config)
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── tsconfig.base.json           # Base TypeScript configuration
├── .eslintrc.json               # ESLint configuration
├── .prettierrc.json             # Prettier configuration
├── .editorconfig                # Editor configuration
├── .npmrc                       # pnpm configuration
├── CONTRIBUTING.md              # Contribution guidelines
└── CHANGELOG.md                 # Version history
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (recommended package manager)
- **Docker**: v20.0.0+ (for containerized deployment)
- **Git**: v2.30.0+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/aicbot.git
   cd aicbot
   ```

2. **Install pnpm (if not already installed)**

   ```bash
   npm install -g pnpm
   ```

3. **Install dependencies**

   ```bash
   pnpm bootstrap
   # or simply: pnpm install
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start development servers**

   ```bash
   # Start both frontend and backend
   pnpm dev

   # Or start individually
   pnpm dev:backend
   pnpm dev:web
   ```

6. **Access the application**
   - Frontend (new): http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/docs

### Development Commands

```bash
# Install dependencies (bootstrap workspace)
pnpm bootstrap

# Start development servers
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm type-check

# Build for production
pnpm build

# Start production servers
pnpm start

# Clean workspace
pnpm clean
```

## 🌍 Environment Configuration

The application uses environment variables for configuration. See `.env.example` for all available
options.

### Required Variables

- `MANUS_API_KEY`: API key for Manus AI service
- `NODE_ENV`: Environment (development, production, test)

### Optional Variables

- `PORT`: Backend server port (default: 5000)
- `FRONTEND_URL`: Frontend application URL
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string for caching
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## 🐳 Docker Deployment

### Quick Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Build

```bash
# Build images
docker build -t aicbot-backend -f packages/backend/Dockerfile ./packages/backend
docker build -t aicbot-frontend -f packages/frontend/Dockerfile ./packages/frontend

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentation

- [Backend API Documentation](./packages/backend/README.md)
- [Frontend Documentation](./packages/frontend/README.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 🔧 Features

### Core Features

- **Real-time Streaming**: AI responses stream in real-time for better user experience
- **PWA Support**: Installable on mobile devices with offline capabilities
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Chat History**: Persistent conversation history (when database is configured)
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Technical Features

- **TypeScript Support**: Full TypeScript implementation for type safety
- **Modern Build Tools**: Webpack/Vite for optimized builds
- **Code Splitting**: Automatic code splitting for better performance
- **Caching Strategy**: Intelligent caching for API responses and static assets
- **Security**: CORS configuration, rate limiting, and input validation

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual component and function tests
- **Integration Tests**: API endpoint and service integration tests
- **E2E Tests**: End-to-end user flow tests
- **Performance Tests**: Load testing for API endpoints

## 📈 Monitoring & Logging

### Application Monitoring

- **Health Checks**: `/health` endpoint for service monitoring
- **Metrics**: Performance metrics and usage statistics
- **Error Tracking**: Integrated error reporting and logging

### Logging

- **Structured Logging**: JSON-formatted logs for easy parsing
- **Log Levels**: Configurable log levels for different environments
- **Request Tracking**: Unique request IDs for debugging

## 🔒 Security Considerations

- **API Key Management**: Server-side storage of Manus API key
- **Input Validation**: Comprehensive input sanitization and validation
- **Rate Limiting**: Configurable rate limiting for API endpoints
- **CORS Configuration**: Proper CORS setup for cross-origin requests
- **HTTPS**: Enforced HTTPS in production environments

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details
on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our comprehensive documentation
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join our community discussions
- **Email**: support@aicbot.com for enterprise support

## 🗺️ Roadmap

### Version 1.0.0

- [x] Basic chat functionality
- [x] Streaming responses
- [x] PWA support
- [ ] User authentication
- [ ] Chat history persistence
- [ ] Multi-language support

### Future Versions

- [ ] Voice input/output
- [ ] File upload capabilities
- [ ] Custom AI model integration
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features

---

**Built with ❤️ by the AICBot team**
