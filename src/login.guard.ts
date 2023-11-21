import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { Permission } from "./user/entities/permission.entity";
import { UnLoginException } from "./unlogin.filter";

interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  permissions: Permission[];
}

declare module "express" {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // 通过reflector获取class或者是handler当中的metadata
    const requireLogin = this.reflector.getAllAndOverride("require-login", [
      context.getClass(),
      context.getHandler(),
    ]);

    // 不需要登录直接返回true
    if (!requireLogin) {
      return true;
    }

    //获取请求头authorization
    const authorization = request.headers.authorization;

    if (!authorization) {
      // 使用自定义的UnLogin... 而非官方内置的UnauthorizedException
      throw new UnLoginException();
    }

    // 如果有authorization，解析token
    try {
      const token = authorization.split(" ")[1];
      const data = this.jwtService.verify<JwtUserData>(token);

      request.user = {
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permissions: data.permissions,
      };
      return true;
    } catch (e) {
      throw new UnauthorizedException("token 失效，请重新登录");
    }
  }
}
