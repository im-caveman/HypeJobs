// Environment variable validation
export interface EnvConfig {
  RAPIDAPI_KEY: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

// Validate required environment variables
const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Get optional environment variable with default
const getOptionalEnvVar = (name: string, defaultValue: string): string => {
  return process.env[name] || defaultValue;
};

// Export validated environment configuration
export const env: EnvConfig = {
  RAPIDAPI_KEY: getRequiredEnvVar('RAPIDAPI_KEY'),
  NEXTAUTH_SECRET: getRequiredEnvVar('NEXTAUTH_SECRET'),
  NEXTAUTH_URL: getOptionalEnvVar('NEXTAUTH_URL', 'http://localhost:3000'),
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
};

// Check if all required environment variables are set
export const validateEnvironment = (): boolean => {
  try {
    // This will throw if any required variable is missing
    Object.values(env).forEach(value => value);
    return true;
  } catch (error) {
    console.error('Environment validation failed:', error);
    return false;
  }
};

// Development environment check
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Feature flags based on environment
export const ENV_FEATURES = {
  debugMode: isDevelopment,
  mockAPI: false, // Set to true for testing with mock data
  analytics: isProduction,
  errorReporting: isProduction,
  rateLimiting: isProduction,
};

export default env;