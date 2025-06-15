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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DB_URL,
    synchronize: true,
    logging: false,
    entities: ["src/models/**/*.ts"],
    migrations: ["src/models/migrations/*.ts"],
    extra: {
        connectionTimeoutMillis: 30000,
    },
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : false, // Adjust SSL for development
    schema: 'public',
});
// Modified initialization function
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!exports.AppDataSource.isInitialized) {
            yield exports.AppDataSource.initialize();
            console.log("Database connection established!");
            // Seed the GUEST role after successful initialization
            yield seedDefaultRoles();
        }
    }
    catch (error) {
        console.error("Error during database initialization:", error);
    }
});
exports.initializeDatabase = initializeDatabase;
// Function to seed default roles
function seedDefaultRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const roleRepository = exports.AppDataSource.getRepository('Role');
            // Check if GUEST role exists
            const guestRole = yield roleRepository.findOne({ where: { roleName: 'GUEST' } });
            if (!guestRole) {
                console.log("Creating default GUEST role...");
                const newRole = roleRepository.create({
                    roleName: 'GUEST',
                    permissions: ['read:public'],
                    description: 'Default role for new users'
                });
                yield roleRepository.save(newRole);
                console.log("Default GUEST role created successfully!");
            }
        }
        catch (error) {
            console.error("Error seeding default roles:", error);
        }
    });
}
