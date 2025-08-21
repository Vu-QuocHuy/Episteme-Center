// Environment Variables Type Definitions
interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;

  // App Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // Features
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_MOCK_API: string;

  // UI Configuration
  readonly VITE_DEFAULT_THEME: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_SIDEBAR_WIDTH: string;

  // Storage Configuration
  readonly VITE_STORAGE_PREFIX: string;
  readonly VITE_TOKEN_EXPIRY: string;

  // Development Tools
  readonly VITE_SHOW_DEBUG_INFO: string;

  // Analytics (optional)
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_HOTJAR_ID?: string;

  // Error Tracking (optional)
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Helper functions for environment variables
export const getEnvVar = (key: keyof ImportMetaEnv, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

export const getBooleanEnvVar = (key: keyof ImportMetaEnv, defaultValue = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const getNumberEnvVar = (key: keyof ImportMetaEnv, defaultValue?: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number value for environment variable ${key}: ${value}`);
  }
  return parsed;
};

// Environment validation
export const validateEnvironment = () => {
  const requiredVars: (keyof ImportMetaEnv)[] = [
    'VITE_API_URL',
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};
