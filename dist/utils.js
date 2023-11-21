"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateParseIntPipe = exports.md5 = void 0;
const crypto = require("crypto");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
function md5(str) {
    const hash = crypto.createHash("md5");
    hash.update(str);
    return hash.digest("hex");
}
exports.md5 = md5;
function generateParseIntPipe(name) {
    return new common_1.ParseIntPipe({
        exceptionFactory() {
            throw new common_2.BadRequestException(name + " 应该传数字");
        },
    });
}
exports.generateParseIntPipe = generateParseIntPipe;
//# sourceMappingURL=utils.js.map