"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserVo = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserInfo {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserInfo.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "zhangsan" }),
    __metadata("design:type", String)
], UserInfo.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "张三" }),
    __metadata("design:type", String)
], UserInfo.prototype, "nickName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "xx@xx.com" }),
    __metadata("design:type", String)
], UserInfo.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "xxx.png" }),
    __metadata("design:type", String)
], UserInfo.prototype, "headPic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "13233333333" }),
    __metadata("design:type", String)
], UserInfo.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserInfo.prototype, "isFrozen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserInfo.prototype, "isAdmin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserInfo.prototype, "createTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ["管理员"] }),
    __metadata("design:type", Array)
], UserInfo.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "query_aaa" }),
    __metadata("design:type", Array)
], UserInfo.prototype, "permissions", void 0);
class LoginUserVo {
}
exports.LoginUserVo = LoginUserVo;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", UserInfo)
], LoginUserVo.prototype, "userInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoginUserVo.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoginUserVo.prototype, "refreshToken", void 0);
//# sourceMappingURL=login-user.vo.js.map