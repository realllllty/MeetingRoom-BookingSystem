import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";

import { UserService } from "./user.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { Body } from "@nestjs/common";
import { EmailService } from "../email/email.service";
import { RedisService } from "../redis/redis.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RequireLogin, UserInfo } from "../custom.decorators";
import { UserDetailVo } from "./vo/user-info.vo";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dts";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("test")
  test() {
    console.log("received");
    return "glad to meet u";
  }
  @Post("register")
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Get("register-captcha")
  async captcha(@Query("address") address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 5 * 60);
    await this.emailService.sendMail({
      to: address,
      subject: "注册验证码",
      html: `<p>你的注册验证码是 ${code}</p>`,
    });
    return "发送成功";
  }

  @Get("init-data")
  async initData() {
    await this.userService.initData();
    return "done";
  }

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  //普通用户登录
  @Post("login")
  async userLogin(@Body() loginUser: LoginUserDto) {
    // 返回用户信息(包括通过用户名称查询权限)
    const vo = await this.userService.login(loginUser, false);

    // 签发access token
    // sign(payload:{},options:{})
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get("jwt_expiresIn") || "30m",
      }
    );

    // 签发refreshToken
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn: this.configService.get("jwt_refresh_expiresIn") || "7d",
      }
    );

    return vo;
  }

  //管理员用户登录
  @Post("admin/login")
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get("jwt_access_token_expires_time") || "30m",
      }
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get("jwt_refresh_token_expres_time") || "7d",
      }
    );
    return vo;
  }

  //普通用户刷新token
  @Get("refresh")
  async refresh(@Query("refreshToken") refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      // refreshToken仅存用户id, 通过id查找用户信息方法
      const user = await this.userService.findUserById(data.userId, false);

      //获取用户信息重新签发Token
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get("jwt_access_token_expires_time") || "30m",
        }
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get("jwt_refresh_token_expres_time") || "7d",
        }
      );

      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      throw new UnauthorizedException("token已经实现请重新登录");
    }
  }

  //管理员刷新token
  @Get("admin/refresh")
  async adminRefresh(@Query("refreshToken") refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, true);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get("jwt_access_token_expires_time") || "30m",
        }
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get("jwt_refresh_token_expres_time") || "7d",
        }
      );

      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      throw new UnauthorizedException("token 已失效，请重新登录");
    }
  }

  // 查询用户信息接口, 用于回显
  @Get("info")
  @RequireLogin()
  async info(@UserInfo("userId") userId: number) {
    const user = await this.userService.findUserDetailById(userId);
    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.email = user.email;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.nickName = user.nickName;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;
    return vo;
  }

  // 修改密码接口(admin和common user共用)
  @Post(["update_password", "admin/update_password"])
  @RequireLogin()
  async updatePassword(
    @UserInfo("userId") userId: number,
    @Body() passwordDto: UpdateUserPasswordDto
  ) {
    console.log(passwordDto);
    return "success";
  }
}
