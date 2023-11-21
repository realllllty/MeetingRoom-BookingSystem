import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UnauthorizedException,
  ParseIntPipe,
  DefaultValuePipe,
  HttpStatus,
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
import { UpdateUserDto } from "./dto/update-user.dto";
import { generateParseIntPipe } from "src/utils";
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { LoginUserVo } from "./vo/login-user.vo";
import { RefreshTokenVo } from "./vo/refresh-token.vo";

@ApiTags("用户管理模块")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("test")
  test() {
    console.log("received");
    return "glad to meet u";
  }

  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "验证码已失效/验证码不正确/用户已存在",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "注册成功/失败",
    type: String,
  })
  @Post("register")
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  // swagger
  // 通过apiquery 描述query参数
  // 通过apiresponse 描述响应
  @ApiQuery({
    name: "address",
    type: String,
    description: "邮箱地址",
    required: true,
    example: "xxx@xx.com",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "发送成功",
    type: String,
  })
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
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "用户不存在/密码错误",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "用户信息和 token",
    type: LoginUserVo,
  })
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
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "用户不存在/密码错误",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "用户信息和 token",
    type: LoginUserVo,
  })
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
  @ApiQuery({
    name: "refreshToken",
    type: String,
    description: "刷新 token",
    required: true,
    example: "xxxxxxxxyyyyyyyyzzzzz",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "token 已失效，请重新登录",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "刷新成功",
    type: RefreshTokenVo,
  })
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

      let tokenvo = new RefreshTokenVo();
      tokenvo.refresh_token = refresh_token;
      tokenvo.access_token = access_token;

      return tokenvo;
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
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: "success",
    type: UserDetailVo,
  })
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
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserPasswordDto,
  })
  @ApiResponse({
    type: String,
    description: "验证码已失效/不正确",
  })
  @RequireLogin()
  async updatePassword(
    @UserInfo("userId") userId: number,
    @Body() passwordDto: UpdateUserPasswordDto
  ) {
    return await this.userService.updatePassword(userId, passwordDto);
    return "success";
  }

  // 修改密码接口(通过邮箱发送验证码验证用户身份)
  @Get("update_password/captcha")
  async updatePasswordCaptcha(@Query("address") address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      10 * 60
    );

    await this.emailService.sendMail({
      to: address,
      subject: "更改密码验证码",
      html: `<p>你的更改密码验证码是 ${code}</p>`,
    });
    return "发送成功";
  }

  // 普通更新
  @Post(["update", "admin/update"])
  @RequireLogin()
  async update(
    @UserInfo("userId") userId: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  // 冻结用户
  @Get("freeze")
  async freeze(@Query("id") userId: number) {
    await this.userService.freezeUserById(userId);
    return "success";
  }

  // 用户列表接口
  @Get("list")
  async list(
    // 封装parseIntPipe(./utils.ts), 使其返回特定信息
    @Query("pageNo", new DefaultValuePipe(1), generateParseIntPipe("pageNo"))
    pageNo: number,
    @Query(
      "pageSize",
      new DefaultValuePipe(2),
      generateParseIntPipe("pageSize")
    )
    pageSize: number
  ) {
    return await this.userService.findUsersByPage(pageNo, pageSize);
  }

  @Get("list")
  async searchlist(
    @Query("pageNo", new DefaultValuePipe(1), generateParseIntPipe("pageNo"))
    pageNo: number,
    @Query(
      "pageSize",
      new DefaultValuePipe(2),
      generateParseIntPipe("pageSize")
    )
    pageSize: number,
    @Query("username") username: string,
    @Query("nickName") nickName: string,
    @Query("email") email: string
  ) {
    return await this.userService.findUsers(
      username,
      nickName,
      email,
      pageNo,
      pageSize
    );
  }
}
