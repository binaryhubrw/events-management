"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const app_1 = __importDefault(require("./app"));
const AppConfig_1 = require("./config/AppConfig");
const Database_1 = require("./config/Database");
// Bootstrap function to start the application
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Initialize database connection
            yield (0, Database_1.initializeDatabase)();
            // Start the server
            app_1.default.listen(AppConfig_1.AppConfig.PORT, () => {
                console.log(`Server running on port ${AppConfig_1.AppConfig.PORT}`);
                console.log(`API available at http://localhost:${AppConfig_1.AppConfig.PORT}${AppConfig_1.AppConfig.API_PREFIX}`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    });
}
// Start the application
bootstrap();
