# Backend API Documentation

The AICBot backend is a Node.js/Express application that provides RESTful API endpoints and WebSocket support for real-time chat functionality with Manus AI integration.

## 🏗️ Architecture

```
┌─────────────────┐
│   API Gateway   │
│   (Express)     │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
┌───▼───┐   ┌───▼───┐
│Routes │   │WS     │
│       │   │Handler│
└───┬───┘   └───┬───┘
    │           │
┌───▼───┐   ┌───▼───┐
│Ctrlrs │   │Events │
└───┬───┘   └───┬───┘
    │           │
┌───▼───┐   ┌───▼───┐
│Services│   │Manus  │
│       │   │API    │
└───────┘   └───────┘
```

## 📁 Directory Structure

```
packages/backend/
├── src/
│   ├── controllers/          # Route handlers
│   │   ├── chatController.js  # Chat endpoints
│   │   ├── healthController.js # Health checks
│   │   └── userController.js  # User management
│   ├── middleware/            # Express middleware
│   │   ├── auth.js           # Authentication
│   │   ├── cors.js           # CORS configuration
│   │   ├── errorHandler.js   # Error handling
│   │   ├── rateLimiter.js    # Rate limiting
│   │   └── validation.js     # Input validation
│   ├── services/             # Business logic
│   │   ├── manusService.js   # Manus AI integration
│   │   ├── chatService.js    # Chat management
│   │   └── userService.js    # User management
│   ├── utils/                # Helper functions
│   │   ├── logger.js         # Logging utilities
│   │   ├── config.js         # Configuration
│   │   └── validation.js     # Validation schemas
│   ├── websocket/            # WebSocket handlers
│   │   ├── chatHandler.js    # Chat streaming
│   │   └── connectionManager.js # Connection management
│   └── app.js                # Application entry point
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── fixtures/             # Test data
├── package.json
├── Dockerfile
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0+
- npm 8.0.0+
- Manus API key

### Installation

```bash
cd packages/backend
npm install
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start

# Debug mode
npm run debug
```

## 📡 API Endpoints

### Base URL
- Development: `http://localhost:5000`
- Production: `https://api.aicbot.com`

### Authentication

Most endpoints require authentication via Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "manus_api": "available"
  }
}
```

#### Chat Endpoints

##### Send Chat Message
```http
POST /api/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Hello, how are you?",
  "conversationId": "optional-conversation-id",
  "stream": true
}
```

**Response (Non-streaming):**
```json
{
  "id": "msg_123",
  "conversationId": "conv_456",
  "message": "Hello! I'm doing well, thank you for asking...",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "model": "manus-gpt-4",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 15,
    "totalTokens": 25
  }
}
```

**Response (Streaming):**
Server-Sent Events (SSE) format:
```
data: {"type": "start", "conversationId": "conv_456"}

data: {"type": "token", "content": "Hello"}

data: {"type": "token", "content": "!"}

data: {"type": "token", "content": " I'm"}

data: {"type": "end", "usage": {"promptTokens": 10, "completionTokens": 15, "totalTokens": 25}}
```

##### Get Conversation History
```http
GET /api/chat/conversations/:conversationId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "conversationId": "conv_456",
  "messages": [
    {
      "id": "msg_123",
      "role": "user",
      "content": "Hello, how are you?",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "msg_124",
      "role": "assistant",
      "content": "Hello! I'm doing well, thank you for asking...",
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:01.000Z"
}
```

##### List User Conversations
```http
GET /api/chat/conversations?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv_456",
      "title": "First Conversation",
      "lastMessage": "Hello! I'm doing well...",
      "messageCount": 10,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:01.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### User Management

##### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🌐 WebSocket Support

### Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

// Authenticate after connection
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));
```

### Chat Streaming WebSocket

```javascript
// Send chat message
ws.send(JSON.stringify({
  type: 'chat',
  message: 'Hello, how are you?',
  conversationId: 'optional-conversation-id'
}));

// Receive streaming response
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'chat_start':
      console.log('Chat started:', data.conversationId);
      break;
    case 'chat_token':
      console.log('Token:', data.content);
      break;
    case 'chat_end':
      console.log('Chat ended:', data.usage);
      break;
    case 'error':
      console.error('Error:', data.message);
      break;
  }
};
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment (development, production, test) |
| `PORT` | No | `5000` | Server port |
| `MANUS_API_KEY` | Yes | - | Manus AI API key |
| `MANUS_API_URL` | No | `https://api.manus.ai` | Manus API base URL |
| `DATABASE_URL` | No | - | Database connection string |
| `REDIS_URL` | No | - | Redis connection string for caching |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiration time |
| `CORS_ORIGIN` | No | `*` | CORS allowed origins |
| `RATE_LIMIT_WINDOW` | No | `15` | Rate limit window in minutes |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |
| `LOG_LEVEL` | No | `info` | Logging level (debug, info, warn, error) |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL for CORS |

### Configuration Example (.env)

```bash
# Environment
NODE_ENV=production
PORT=5000

# API Keys
MANUS_API_KEY=your-manus-api-key-here
JWT_SECRET=your-super-secret-jwt-key-here

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/aicbot
REDIS_URL=redis://localhost:6379

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Frontend
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

## 🔧 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Build for production
npm run build

# Start database migrations
npm run migrate

# Seed database with test data
npm run seed
```

### Testing

#### Unit Tests
```bash
npm run test:unit
```

#### Integration Tests
```bash
npm run test:integration
```

#### E2E Tests
```bash
npm run test:e2e
```

#### Test Coverage
```bash
npm run test:coverage
```

### Debugging

#### VS Code Debug Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/packages/backend/src/app.js",
  "env": {
    "NODE_ENV": "development"
  },
  "console": "integratedTerminal",
  "restart": true,
  "runtimeExecutable": "nodemon"
}
```

## 📊 Monitoring & Logging

### Health Endpoints

#### Basic Health Check
```http
GET /health
```

#### Detailed Health Check
```http
GET /health/detailed
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 5
    },
    "redis": {
      "status": "connected",
      "responseTime": 2
    },
    "manus_api": {
      "status": "available",
      "responseTime": 150
    }
  },
  "metrics": {
    "activeConnections": 25,
    "requestsPerMinute": 120,
    "memoryUsage": {
      "used": "150MB",
      "total": "512MB"
    }
  }
}
```

### Metrics

#### Prometheus Metrics
```http
GET /metrics
```

Available metrics:
- `http_requests_total`: Total HTTP requests
- `http_request_duration_seconds`: Request duration
- `websocket_connections_active`: Active WebSocket connections
- `manus_api_requests_total`: Manus API requests
- `manus_api_errors_total`: Manus API errors

### Logging

#### Log Format
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "metadata": {
    "userId": "user_123",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "requestId": "req_456"
  }
}
```

#### Log Levels
- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages
- `debug`: Debug messages

## 🔒 Security

### Rate Limiting

Default rate limiting: 100 requests per 15 minutes per IP.

Custom rate limiting per endpoint:
```javascript
// Apply custom rate limiting
app.use('/api/chat', rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute
}));
```

### Input Validation

All input is validated using Joi schemas:

```javascript
const chatSchema = Joi.object({
  message: Joi.string().required().max(4000),
  conversationId: Joi.string().optional(),
  stream: Joi.boolean().default(false)
});
```

### CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Environment-Specific Configurations

#### Development
- Hot reload enabled
- Debug logging
- CORS allows all origins
- Rate limiting disabled

#### Production
- Optimized builds
- Error logging only
- Restricted CORS
- Rate limiting enabled

## 🛠️ API Client Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

class AICBotClient {
  constructor(baseURL, apiKey) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async sendMessage(message, conversationId = null, stream = false) {
    const response = await this.client.post('/api/chat', {
      message,
      conversationId,
      stream
    });
    return response.data;
  }

  async getConversation(conversationId) {
    const response = await this.client.get(`/api/chat/conversations/${conversationId}`);
    return response.data;
  }
}

// Usage
const client = new AICBotClient('http://localhost:5000', 'your-api-key');
const response = await client.sendMessage('Hello, how are you?');
console.log(response.message);
```

### Python

```python
import requests
import json

class AICBotClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def send_message(self, message, conversation_id=None, stream=False):
        data = {
            'message': message,
            'conversationId': conversation_id,
            'stream': stream
        }
        response = requests.post(
            f'{self.base_url}/api/chat',
            headers=self.headers,
            json=data
        )
        return response.json()

# Usage
client = AICBotClient('http://localhost:5000', 'your-api-key')
response = client.send_message('Hello, how are you?')
print(response['message'])
```

## 📝 Changelog

See [CHANGELOG.md](../../CHANGELOG.md) for version history and updates.

## 🆘 Support

For backend-specific issues:
- Check the [API documentation](#api-endpoints)
- Review [error codes](#error-codes)
- Contact the development team

---

**Backend API Version**: 1.0.0  
**Last Updated**: 2024-01-01
