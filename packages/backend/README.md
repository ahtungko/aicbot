# AICBot Backend

A robust Node.js API server for AI chatbot functionality with streaming support and comprehensive
error handling.

## Features

- 🚀 **Streaming Chat**: Real-time AI responses using Server-Sent Events
- 🔒 **Security**: Helmet, CORS, rate limiting, and input validation
- 📊 **RESTful API**: Clean, well-documented endpoints
- 🧪 **Well Tested**: Comprehensive test coverage with Jest
- 📝 **Validation**: Joi schema validation for all inputs
- 🏗️ **Modular Architecture**: Clean separation of concerns
- 📋 **Health Checks**: Built-in monitoring endpoints
- 🛡️ **Error Handling**: Graceful error responses and logging

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **Joi** - Schema validation
- **Jest** - Testing framework
- **MSW** - API mocking for tests

## Project Structure

```
src/
├── routes/             # API route handlers
│   ├── chat.ts        # Chat streaming endpoint
│   ├── conversations.ts # Conversation CRUD
│   └── models.ts      # Model information
├── services/           # Business logic
│   ├── chatService.ts # Manus AI integration
│   ├── conversationService.ts # Conversation management
│   └── modelService.ts # Model data
├── middleware/         # Express middleware
│   ├── auth.ts        # Authentication middleware
│   ├── validation.ts  # Request validation
│   └── errorHandler.ts # Error handling
├── __tests__/         # Test files
└── app.ts            # Application entry point
```

## API Endpoints

### Chat

- `POST /api/chat` - Send message and get streaming response
- Uses Server-Sent Events for real-time streaming
- Handles conversation creation if none provided

### Conversations

- `GET /api/conversations` - List all conversations
- `GET /api/conversations/:id` - Get specific conversation with messages
- `POST /api/conversations` - Create new conversation
- `PATCH /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Models

- `GET /api/models` - List available AI models
- `GET /api/models/:id` - Get specific model information

### System

- `GET /health` - Health check endpoint
- `GET /api` - API documentation

## Key Services

### ChatService

Handles integration with Manus AI API:

- Streaming response processing
- Error handling and retries
- Request formatting and validation
- Fallback to non-streaming if needed

### ConversationService

Manages conversation data:

- In-memory storage (easily replaceable with database)
- Message persistence
- Conversation metadata management
- User-scoped data access

### ModelService

Provides AI model information:

- Static model definitions
- Model capabilities and limits
- Easy extensibility for new models

## Security Features

- **Helmet**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schemas for all inputs
- **Error Sanitization**: Safe error responses

## Error Handling

- Global error handler for consistent responses
- Structured error logging
- Development vs production error details
- Graceful degradation for external service failures

## Testing Strategy

- **Unit Tests**: Service and utility function testing
- **Integration Tests**: API endpoint testing
- **Mock Services**: Isolated testing without external dependencies
- **Coverage**: High test coverage for critical paths

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# API Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Manus AI API Configuration
MANUS_API_KEY=your_manus_api_key_here
MANUS_API_URL=https://api.manus.ai/v1

# Database Configuration (optional)
DATABASE_URL=postgresql://username:password@localhost:5432/aicbot

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Logging Configuration
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Integration

The current implementation uses in-memory storage for simplicity. To integrate with a database:

1. Replace the in-memory storage in `ConversationService`
2. Add database connection and models
3. Update the service methods to use database queries
4. Add database migrations and seeds

## Deployment

### Docker

```bash
# Build image
docker build -t aicbot-backend .

# Run container
docker run -p 5000:5000 --env-file .env aicbot-backend
```

### PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/app.js --name aicbot-backend

# Monitor
pm2 monit
```

## Monitoring

The application includes several monitoring features:

- **Health Checks**: `/health` endpoint for service monitoring
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Request Tracking**: Unique request IDs for debugging
- **Error Metrics**: Error rates and types tracking

## Performance Considerations

- **Streaming**: Reduces latency for chat responses
- **Rate Limiting**: Prevents abuse and ensures stability
- **Memory Management**: Efficient message storage
- **Connection Pooling**: Ready for database integration

## Security Best Practices

- **API Key Management**: Server-side Manus API key storage
- **Input Sanitization**: Comprehensive validation
- **CORS Configuration**: Proper cross-origin setup
- **Security Headers**: Helmet for HTTP security
- **Rate Limiting**: Prevents DoS attacks

## Scalability

The architecture is designed for scalability:

- **Stateless Design**: Easy horizontal scaling
- **Service Layer**: Clean separation for microservices
- **Database Ready**: Prepared for persistent storage
- **Load Balancer Ready**: Health checks and graceful shutdown

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update API documentation
4. Ensure all tests pass
5. Follow semantic versioning for releases
