"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const AppConfig_1 = require("./config/AppConfig");
const routes_1 = __importDefault(require("./routes"));
// Initialize express app
const app = (0, express_1.default)();
// Apply middlewares
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: AppConfig_1.AppConfig.CORS_ORIGIN,
    credentials: true // Enable sending cookies
}));
app.use(express_1.default.json()); // Parse JSON request body
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded request body
app.use((0, cookie_parser_1.default)()); // Parse cookies
// Configure session middleware
app.use((0, express_session_1.default)({
    /**
     * Session secret used for signing the session ID cookie.
     * Uses the configured session secret from AppConfig, with a fallback default secret.
     * Note: In production, always use a strong, randomly generated secret from a secure configuration.
     */
    secret: "rhkfjdlsafhdakfhksdjghhkdfgkdhkdfjoshdffkshfdlhgfkashaglhksh", // Use a strong, randomly generated secret from your config
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: AppConfig_1.AppConfig.isProduction(), // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // Example: 24 hours (adjust as needed)
        sameSite: 'lax' // or 'strict' depending on your needs
    }
}));
// Logging
if (!AppConfig_1.AppConfig.isTest()) {
    app.use((0, morgan_1.default)(AppConfig_1.AppConfig.LOG_FORMAT));
}
// API routes
app.use(AppConfig_1.AppConfig.API_PREFIX, routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    console.error(`[Error] ${status} - ${message}`);
    res.status(status).json(Object.assign({ status,
        message }, (AppConfig_1.AppConfig.isDevelopment() && { stack: err.stack })));
});
exports.default = app;
