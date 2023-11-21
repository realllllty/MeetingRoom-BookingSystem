"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const format_response_interceptor_1 = require("./format-response.interceptor");
const invoke_record_interceptor_1 = require("./invoke-record.interceptor");
const unlogin_filter_1 = require("./unlogin.filter");
const custom_exception_filter_1 = require("./custom-exception.filter");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalInterceptors(new format_response_interceptor_1.FormatResponseInterceptor());
    app.useGlobalInterceptors(new invoke_record_interceptor_1.InvokeRecordInterceptor());
    app.useGlobalFilters(new unlogin_filter_1.UnloginFilter());
    app.useGlobalFilters(new custom_exception_filter_1.CustomExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle("会议室预定系统")
        .setDescription("api接口文档")
        .setVersion("1.0")
        .addBearerAuth({
        type: "http",
        description: "基于jwt的认证",
    })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api-doc", app, document);
    const configService = app.get(config_1.ConfigService);
    await app.listen(configService.get("nest_server_port"));
}
bootstrap();
//# sourceMappingURL=main.js.map