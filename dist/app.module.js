"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("./user/user.module");
const user_entity_1 = require("./user/entities/user.entity");
const permission_entity_1 = require("./user/entities/permission.entity");
const role_entity_1 = require("./user/entities/role.entity");
const redis_module_1 = require("./redis/redis.module");
const email_module_1 = require("./email/email.module");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const login_guard_1 = require("./login.guard");
const permission_guard_1 = require("./permission.guard");
const meeting_room_module_1 = require("./meeting-room/meeting-room.module");
const meeting_room_entity_1 = require("./meeting-room/entities/meeting-room.entity");
const booking_module_1 = require("./booking/booking.module");
const booking_entity_1 = require("./booking/entities/booking.entity");
const statistic_module_1 = require("./statistic/statistic.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.registerAsync({
                global: true,
                useFactory(configService) {
                    return {
                        secret: configService.get("jwt_secret"),
                        signOptions: {
                            expiresIn: "3d",
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: "src/.env",
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory(configService) {
                    return {
                        type: "mysql",
                        host: configService.get("mysql_server_host"),
                        port: configService.get("mysql_server_port"),
                        username: configService.get("mysql_server_username"),
                        password: configService.get("mysql_server_password"),
                        database: configService.get("mysql_server_database"),
                        synchronize: true,
                        logging: true,
                        entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, meeting_room_entity_1.MeetingRoom, booking_entity_1.Booking],
                        poolSize: 10,
                        connectorPackage: "mysql2",
                        extra: {
                            authPlugin: "sha256_password",
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            user_module_1.UserModule,
            redis_module_1.RedisModule,
            email_module_1.EmailModule,
            meeting_room_module_1.MeetingRoomModule,
            booking_module_1.BookingModule,
            statistic_module_1.StatisticModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: login_guard_1.LoginGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permission_guard_1.PermissionGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map