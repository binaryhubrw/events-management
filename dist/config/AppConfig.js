"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = void 0;
// src/config/AppConfig.ts
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
/**
 * Application configuration class
 * Loads settings from environment variables with sensible defaults
 */
class AppConfig {
    /**
     * Validates that all required configuration is present
     * Throws an error if any required configuration is missing
     */
    static validate() {
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
    static isProduction() {
        return this.NODE_ENV === 'production';
    }
    /**
     * Checks if the application is running in development mode
     */
    static isDevelopment() {
        return this.NODE_ENV === 'development';
    }
    /**
     * Checks if the application is running in test mode
     */
    static isTest() {
        return this.NODE_ENV === 'test';
    }
}
exports.AppConfig = AppConfig;
// Server
AppConfig.NODE_ENV = process.env.NODE_ENV || 'development';
AppConfig.PORT = parseInt(process.env.PORT || '3000', 10);
AppConfig.API_PREFIX = process.env.API_PREFIX || '/api/v1';
AppConfig.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
// JWT Authentication
AppConfig.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
AppConfig.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';
AppConfig.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
AppConfig.JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
// Database
AppConfig.DB_TYPE = process.env.DB_TYPE || 'postgres';
AppConfig.DB_HOST = process.env.DB_HOST || 'localhost';
AppConfig.DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
AppConfig.DB_USERNAME = process.env.DB_USERNAME || 'postgres';
AppConfig.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
AppConfig.DB_DATABASE = process.env.DB_DATABASE || 'event_management';
AppConfig.DB_SYNCHRONIZE = process.env.DB_SYNCHRONIZE === 'true';
AppConfig.DB_LOGGING = process.env.DB_LOGGING === 'true';
// Redis (for caching/sessions if needed)
AppConfig.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
AppConfig.REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
AppConfig.REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
// Email
AppConfig.SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
AppConfig.SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
AppConfig.SMTP_USER = process.env.SMTP_USER || 'user@example.com';
AppConfig.SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'password';
AppConfig.EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@example.com';
// File Upload
AppConfig.UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
AppConfig.MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB
// Rate Limiting
AppConfig.RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
AppConfig.RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // 100 requests per window
// Logging
AppConfig.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
AppConfig.LOG_FORMAT = process.env.LOG_FORMAT || 'combined';
// Events Settings
AppConfig.DEFAULT_EVENT_DURATION_HOURS = parseInt(process.env.DEFAULT_EVENT_DURATION_HOURS || '2', 10);
AppConfig.MAX_EVENT_CAPACITY = parseInt(process.env.MAX_EVENT_CAPACITY || '1000', 10);
// Validate config on import
AppConfig.validate();
