import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    response.statusCode = exception.getStatus();

    // 从异常中获取响应体
    // 断言为一个包含message的对象
    const res = exception.getResponse() as { message: string[] };

    response
      .json({
        code: exception.getStatus(),
        message: "fail",
        // 通过可选链安全访问join方法,
        // 如果message是个数组, 调用其join方法返回一个字符串
        // 否则调用备选方案exception.message
        data: res?.message?.join ? res?.message?.join(",") : exception.message,
      })
      .end();
  }
}
