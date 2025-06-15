// src/config/AppConfig.ts
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration class
 * Loads settings from environment variables with sensible defaults
 */
export class AppConfig {
  // Server
  static readonly NODE_ENV: string = process.env.NODE_ENV || 'development';
  static readonly PORT: number = parseInt(process.env.PORT || '3000', 10);
  static readonly API_PREFIX: string = process.env.API_PREFIX || '/api/v1';
  static readonly CORS_ORIGIN: string = process.env.CORS_ORIGIN || '*';
  
  // JWT Authentication
  static readonly JWT_SECRET: string = process.env.JWT_SECRET || 'dsghjkaskakgskjhajlslakklsjfdhjhkajlsjlajskal';
  static readonly JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || '1d';
  static readonly JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'fgdhjahshlajsaghkslkajsjkajsjgagksjhahsk';
  static readonly JWT_REFRESH_EXPIRATION: string = process.env.JWT_REFRESH_EXPIRATION || '7d';
  
  // Database
  static readonly DB_TYPE: string = process.env.DB_TYPE || 'postgres';
  static readonly DB_HOST: string = process.env.DB_HOST || 'localhost';
  static readonly DB_PORT: number = parseInt(process.env.DB_PORT || '5432', 1000);
  static readonly DB_USERNAME: string = process.env.DB_USERNAME || 'postgres';
  static readonly DB_PASSWORD: string = process.env.DB_PASSWORD || 'postgres';
  static readonly DB_DATABASE: string = process.env.DB_DATABASE || 'event_management';
  static readonly DB_SYNCHRONIZE: boolean = process.env.DB_SYNCHRONIZE === 'true';
  static readonly DB_LOGGING: boolean = process.env.DB_LOGGING === 'true';
  
  // Redis (for caching/sessions if needed)
  static readonly REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
  static readonly REDIS_PORT: number = parseInt(process.env.REDIS_PORT || '6379', 1000);

  static readonly REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';
  static readonly SESSION_SECRET: string = process.env.SESSION_SECRET || '';
  
  
  // Email
  static readonly SMTP_HOST: string = process.env.SMTP_HOST || 'smtp.gmail.com';
  static readonly SMTP_PORT: number = parseInt(process.env.SMTP_PORT || '587', 10);
  static readonly SMTP_USER: string = process.env.SMTP_USER || 'jasezikeye50@gmail.com';
  static readonly SMTP_PASSWORD: string = process.env.SMTP_PASSWORD || 'password';
  static readonly EMAIL_FROM: string = process.env.EMAIL_FROM || 'jasezikeye50@gmail.com';
  
  // File Upload
  static readonly UPLOAD_DIR: string = process.env.UPLOAD_DIR || 'uploads';
  static readonly MAX_FILE_SIZE: number = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB
  
  // Rate Limiting
  static readonly RATE_LIMIT_WINDOW_MS: number = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
  static readonly RATE_LIMIT_MAX: number = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // 100 requests per window
  
  // Logging
  static readonly LOG_LEVEL: string = process.env.LOG_LEVEL || 'info';
  static readonly LOG_FORMAT: string = process.env.LOG_FORMAT || 'combined';
  
  // Events Settings
  static readonly DEFAULT_EVENT_DURATION_HOURS: number = parseInt(process.env.DEFAULT_EVENT_DURATION_HOURS || '2', 10);
  static readonly MAX_EVENT_CAPACITY: number = parseInt(process.env.MAX_EVENT_CAPACITY || '1000', 10);
  
  /**
   * Validates that all required configuration is present
   * Throws an error if any required configuration is missing
   */
  static validate(): void {
    const requiredVars = ['JWT_SECRET'];
    
    for (const variable of requiredVars) {
      if (!process.env[variable]) {
        throw new Error(`Required environment variable ${variable} is missing!`);
      }
    }
    
    console.log(`Application configured for ${this.NODE_ENV} environment`);
  }
  
  /**
   * Checks if the application is running in production mode
   */
  static isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
  
  /**
   * Checks if the application is running in development mode
   */
  static isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }
  
  /**
   * Checks if the application is running in test mode
   */
  static isTest(): boolean {
    return this.NODE_ENV === 'test';
  }
}

// Validate config on import
AppConfig.validate();