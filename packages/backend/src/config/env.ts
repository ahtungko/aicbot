import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().pipe(z.coerce.number()).default('5000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  MANUS_API_KEY: z.string().min(1, 'MANUS_API_KEY is required'),
  MANUS_API_BASE_URL: z.string().url('MANUS_API_BASE_URL must be a valid URL'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().pipe(z.coerce.number()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().pipe(z.coerce.number()).default('100'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnvironment(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    console.log('✓ Environment variables validated successfully');
    return validatedEnv;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((e) => `${e.path.join('.') || 'env'}: ${e.message}`)
        .join('\n  ');
      console.error(`✗ Environment validation failed:\n  ${missingVars}`);
      process.exit(1);
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!validatedEnv) {
    validateEnvironment();
  }
  return validatedEnv!;
}
