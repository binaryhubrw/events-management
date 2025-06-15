// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// --- CORRECTED IMPORTS AND USAGE FOR REDIS SESSION STORE ---

// For connect-redis v6+, you typically import the RedisStore class directly
import * as ConnectRedis from 'connect-redis';

// Import your configured Redis client from './config/redis'
import redisClient from './config/redis';
// ------------------------------------------

import { AppConfig } from './config/AppConfig';
import routes from './routes';

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'doc', 'swagger.yaml'));

// Initialize express app
const app = express();

// Apply standard Express middlewares
app.use(helmet());
app.use(cors({
  origin: AppConfig.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- CONFIGURE REDIS AS THE SESSION STORE ---
// The RedisStore class is now directly imported.
// Instantiate it, passing your redisClient directly to its constructor.
// express-session will automatically handle passing its 'session' object internally.
app.use(session({
  secret: AppConfig.SESSION_SECRET || "a-super-secret-key-that-should-be-in-env-variables",
  name: 'my.sid',
  store: new ConnectRedis.RedisStore({ client: redisClient }), // <--- CORRECTED USAGE HERE
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: AppConfig.isProduction(),
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));
// ------------------------------------------

// Logging middleware
if (!AppConfig.isTest()) {
  app.use(morgan(AppConfig.LOG_FORMAT));
}
// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Event Management API Documentation"
}));

// API routes
app.use(AppConfig.API_PREFIX, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  console.error(`[Error] ${status} - ${message}`);

  res.status(status).json({
    status,
    message,
    ...(AppConfig.isDevelopment() && { stack: err.stack })
  });
});

export default app;