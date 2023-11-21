import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FormatResponseInterceptor } from "./format-response.interceptor";
import { InvokeRecordInterceptor } from "./invoke-record.interceptor";
import { UnloginFilter } from "./unlogin.filter";
import { CustomExceptionFilter } from "./custom-exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  app.useGlobalFilters(new UnloginFilter());
  app.useGlobalFilters(new CustomExceptionFilter());

  // 新增swagger配置
  const config = new DocumentBuilder()
    .setTitle("会议室预定系统")
    .setDescription("api接口文档")
    .setVersion("1.0")
    .addBearerAuth({
      type: "http",
      description: "基于jwt的认证",
    })
    .build();
  // 创建swagger文档(传入应用实例app, 配置对象config)
  const document = SwaggerModule.createDocument(app, config);
  // 设置swagger UI路径
  SwaggerModule.setup("api-doc", app, document);

  const configService = app.get(ConfigService);
  await app.listen(configService.get("nest_server_port"));
}
bootstrap();
