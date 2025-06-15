"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; // Use env variable in production
const verifyJWT = (req, res, next) => {
    var _a;
    const authHeader = req.headers.authorization;
    const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1]) || ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.authToken);
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Access denied. No token provided.",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};
exports.verifyJWT = verifyJWT;
