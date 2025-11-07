# Deployment Guide

This comprehensive guide covers deploying AICBot in various environments, from development to production.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Reverse Proxy  │    │   Application   │
│   (Optional)    │◄──►│   (Nginx)       │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Static Files  │    │   Database      │
                       │   (Frontend)    │    │   (Optional)    │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)

Docker provides consistent environments and simplifies deployment across different platforms.

#### Prerequisites

- Docker 20.0.0+
- Docker Compose 2.0.0+

#### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/aicbot.git
cd aicbot

# Set up environment variables
cp .env.example .env
# Edit .env with your production values

# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=${DATABASE_URL}
      - MANUS_API_KEY=${MANUS_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - aicbot-network

  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
      - REACT_APP_WS_URL=ws://localhost:5000
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - aicbot-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - aicbot-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - aicbot-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - aicbot-network

volumes:
  postgres_data:
  redis_data:

networks:
  aicbot-network:
    driver: bridge
```

#### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - MANUS_API_KEY=${MANUS_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${FRONTEND_URL}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile.prod
    environment:
      - REACT_APP_API_URL=${API_URL}
      - REACT_APP_WS_URL=${WS_URL}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d yourdomain.com
```

### 2. Manual Deployment

#### Backend Deployment

```bash
# 1. Clone and setup
git clone https://github.com/your-org/aicbot.git
cd aicbot/packages/backend

# 2. Install dependencies
npm ci --production

# 3. Set up environment
cp .env.example .env
# Edit .env with production values

# 4. Set up database (if using PostgreSQL)
createdb aicbot
npm run migrate

# 5. Build application
npm run build

# 6. Start application
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
```

#### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'aicbot-backend',
      script: './src/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
```

#### Frontend Deployment

```bash
# 1. Navigate to frontend directory
cd packages/frontend

# 2. Install dependencies
npm ci

# 3. Set up environment
cp .env.example .env.production
# Edit .env.production with production values

# 4. Build for production
npm run build

# 5. Serve with web server (nginx example)
sudo cp -r build/* /var/www/aicbot/
```

### 3. Cloud Platform Deployment

#### Heroku

```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create app
heroku create your-app-name

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MANUS_API_KEY=your-api-key
heroku config:set JWT_SECRET=your-jwt-secret

# 5. Add PostgreSQL (if needed)
heroku addons:create heroku-postgresql:hobby-dev

# 6. Deploy
git push heroku main
```

#### AWS (Elastic Beanstalk)

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize
eb init aicbot

# 3. Create environment
eb create production

# 4. Deploy
eb deploy
```

#### Vercel (Frontend Only)

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/packages/frontend/build/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api-url"
  }
}
```

## 🔧 Nginx Configuration

### Basic Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    upstream frontend {
        server frontend:80;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Authentication endpoints with stricter rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket
        location /ws {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Let's Encrypt SSL Setup

```bash
# 1. Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🗄️ Database Setup

### PostgreSQL

#### Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Configuration

```sql
-- Create database and user
CREATE DATABASE aicbot;
CREATE USER aicbot_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE aicbot TO aicbot_user;

-- Connect to database
\c aicbot;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create tables (example)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### Migration Scripts

```javascript
// scripts/migrate.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Get executed migrations
    const { rows } = await client.query('SELECT filename FROM migrations');
    const executedMigrations = rows.map(row => row.filename);
    
    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        const migrationSQL = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );
        
        await client.query(migrationSQL);
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );
        
        console.log(`Migration completed: ${file}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('All migrations completed successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
```

### Redis Setup

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Important settings:
# - bind 127.0.0.1 (or specific IP)
# - requirepass your-redis-password
# - maxmemory 256mb
# - maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

## 🔒 Security Configuration

### Environment Security

```bash
# 1. Set proper file permissions
chmod 600 .env
chmod 700 logs/

# 2. Create dedicated user
sudo useradd -r -s /bin/false aicbot
sudo chown -R aicbot:aicbot /opt/aicbot

# 3. Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Application Security

```javascript
// Backend security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

## 📊 Monitoring & Logging

### Application Monitoring

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    services: {}
  };

  try {
    // Check database
    await pool.query('SELECT 1');
    health.services.database = 'connected';
  } catch (error) {
    health.services.database = 'disconnected';
    health.status = 'error';
  }

  try {
    // Check Redis
    await redis.ping();
    health.services.redis = 'connected';
  } catch (error) {
    health.services.redis = 'disconnected';
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Logging Configuration

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'aicbot-backend' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Prometheus Metrics

```javascript
// metrics.js
const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which can be used to identify metrics
register.setDefaultLabels({
  app: 'aicbot-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const activeConnections = new client.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(activeConnections);

module.exports = { register, httpRequestDuration, activeConnections };
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
        MANUS_API_KEY: test-key
    
    - name: Build applications
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/aicbot
          git pull origin main
          docker-compose down
          docker-compose up -d --build
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U aicbot_user -d aicbot

# View logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### 2. Redis Connection Issues

```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli ping

# View logs
sudo tail -f /var/log/redis/redis-server.log
```

#### 3. Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo nginx -s reload

# View logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. Docker Issues

```bash
# View container logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart

# Rebuild containers
docker-compose up -d --build
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM messages WHERE conversation_id = 'uuid';

-- Create appropriate indexes
CREATE INDEX CONCURRENTLY idx_messages_conversation_created 
ON messages(conversation_id, created_at);

-- Update statistics
ANALYZE;
```

#### 2. Application Optimization

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Cache static assets
app.use(express.static('public', {
  maxAge: '1y',
  etag: true
}));

// Connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 📈 Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
    
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/load-balancer.conf:/etc/nginx/nginx.conf
```

### Load Balancer Configuration

```nginx
# nginx/load-balancer.conf
upstream backend {
    least_conn;
    server backend_1:5000;
    server backend_2:5000;
    server backend_3:5000;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🔧 Maintenance

### Backup Procedures

```bash
#!/bin/bash
# scripts/backup.sh

# Database backup
pg_dump aicbot > backup_$(date +%Y%m%d_%H%M%S).sql

# Redis backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb backup_redis_$(date +%Y%m%d_%H%M%S).rdb

# Upload to cloud storage (example with AWS S3)
aws s3 cp backup_$(date +%Y%m%d_%H%M%S).sql s3://aicbot-backups/
```

### Update Procedures

```bash
#!/bin/bash
# scripts/update.sh

# Pull latest code
git pull origin main

# Backup current version
docker-compose down
docker tag aicbot-backend:latest aicbot-backend:backup_$(date +%Y%m%d)

# Build and deploy
docker-compose build
docker-compose up -d

# Health check
sleep 30
curl -f http://localhost:5000/health || {
    echo "Health check failed, rolling back..."
    docker-compose down
    docker-compose up -d
    exit 1
}

echo "Update completed successfully"
```

---

For additional support or questions, please refer to the [main documentation](../README.md) or open an issue on GitHub.
