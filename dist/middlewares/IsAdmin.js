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
exports.isAdmin = void 0;
const Database_1 = require("../config/Database");
const User_1 = require("../models/User");
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: No user ID found' });
            return;
        }
        const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({
            where: { userId },
            relations: ['role'],
        });
        if (!user || user.role.roleName.toLowerCase() !== 'admin') {
            res.status(403).json({ message: 'Forbidden: Admins only' });
            return;
        }
        next(); // proceed if admin
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
exports.isAdmin = isAdmin;
