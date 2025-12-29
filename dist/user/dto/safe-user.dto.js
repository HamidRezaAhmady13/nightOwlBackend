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
exports.SafeUserDto = void 0;
const class_transformer_1 = require("class-transformer");
const constants_1 = require("../../common/constants");
const BASE = process.env.API_URL?.replace(/\/$/, '') || '';
let SafeUserDto = class SafeUserDto {
    id;
    username;
    email;
    avatarUrl;
    bio;
    location;
    website;
    following;
    settings;
};
exports.SafeUserDto = SafeUserDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SafeUserDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SafeUserDto.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SafeUserDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => {
        const raw = obj.avatarUrl;
        if (!raw)
            return constants_1.DEFAULT_AVATAR;
        if (raw.startsWith('http'))
            return raw;
        return `${BASE}${raw}`;
    }),
    __metadata("design:type", String)
], SafeUserDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SafeUserDto.prototype, "bio", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SafeUserDto.prototype, "location", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SafeUserDto.prototype, "website", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => {
        const following = obj.following;
        if (!Array.isArray(following))
            return [];
        return following.map((u) => ({
            id: String(u.id),
            username: u.username,
            avatarUrl: u.avatarUrl && u.avatarUrl.startsWith('http')
                ? u.avatarUrl
                : `${BASE}${u.avatarUrl || constants_1.DEFAULT_AVATAR}`,
        }));
    }),
    __metadata("design:type", Array)
], SafeUserDto.prototype, "following", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => obj.settings ?? { notifications: false, theme: 'light', language: null }),
    __metadata("design:type", Object)
], SafeUserDto.prototype, "settings", void 0);
exports.SafeUserDto = SafeUserDto = __decorate([
    (0, class_transformer_1.Exclude)()
], SafeUserDto);
//# sourceMappingURL=safe-user.dto.js.map