import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

// 定义统一的未登录异常class
// 在出现这种状况时 使用这个class
export class UnLoginException {
  message: string;

  constructor(message?) {
    this.message = message;
  }
}

// 统一处理请求过程中抛出的异常
// 这里专门用于处理没有登录的异常情况
@Catch(UnLoginException)
export class UnloginFilter<T> implements ExceptionFilter {
  catch(exception: UnLoginException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response
      .json({
        code: HttpStatus.UNAUTHORIZED,
        message: "fail",
        data: exception.message || "用户未登录",
      })
      .end(); // end()结束响应
  }
}
