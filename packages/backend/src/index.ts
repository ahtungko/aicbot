import app from './app';
import { getEnv } from './config/env';

const env = getEnv();
const port = env.PORT;

app.listen(port, () => {
  console.log(`🚀 AICBot Backend server running on port ${port}`);
  console.log(`📚 API documentation: http://localhost:${port}/api`);
  console.log(`🏥 Health check: http://localhost:${port}/healthz`);
});
