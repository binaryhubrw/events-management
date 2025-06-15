"use strict";
// @ts-nocheck
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRepository = void 0;
const Database_1 = require("../config/Database");
const Resources_1 = require("../models/Resources");
class ResourceRepository {
    // Static function to create a new resource
    static createResource(resourceData) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = this.resourceRepository.create(resourceData);
            return yield this.resourceRepository.save(resource);
        });
    }
    // Static function to retrieve all resources
    static findAllResources() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.resourceRepository.find({ relations: ['eventResources'] });
        });
    }
    // Static function to update a resource
    static updateResource(resourceId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = yield this.resourceRepository.findOneBy({ resourceId });
            if (!resource)
                return null;
            Object.assign(resource, updateData);
            return yield this.resourceRepository.save(resource);
        });
    }
    // Static function to delete a resource
    static deleteResource(resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.resourceRepository.delete(resourceId);
            return result.affected === 1;
        });
    }
}
exports.ResourceRepository = ResourceRepository;
_a = ResourceRepository;
ResourceRepository.resourceRepository = Database_1.AppDataSource.getRepository(Resources_1.Resource);
//Static function to retrieve a resource by ID
ResourceRepository.findResourceById = (resourceId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield _a.resourceRepository.findOne({ where: { resourceId }, relations: ['eventResources'] });
});
