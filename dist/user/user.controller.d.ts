import { UserService } from "./user.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserDetailVo } from "./vo/user-info.vo";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dts";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginUserVo } from "./vo/login-user.vo";
import { RefreshTokenVo } from "./vo/refresh-token.vo";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    test(): string;
    register(registerUser: RegisterUserDto): Promise<"注册成功" | "注册失败">;
    private emailService;
    private redisService;
    captcha(address: string): Promise<string>;
    initData(): Promise<string>;
    private jwtService;
    private configService;
    userLogin(loginUser: LoginUserDto): Promise<LoginUserVo>;
    adminLogin(loginUser: LoginUserDto): Promise<LoginUserVo>;
    refresh(refreshToken: string): Promise<RefreshTokenVo>;
    adminRefresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    info(userId: number): Promise<UserDetailVo>;
    updatePassword(userId: number, passwordDto: UpdateUserPasswordDto): Promise<"密码修改成功" | "密码修改失败" | "success">;
    updatePasswordCaptcha(address: string): Promise<string>;
    update(userId: number, updateUserDto: UpdateUserDto): Promise<string>;
    freeze(userId: number): Promise<string>;
    list(pageNo: number, pageSize: number): Promise<{
        users: import("./entities/user.entity").User[];
        totalCount: number;
    }>;
    searchlist(pageNo: number, pageSize: number, username: string, nickName: string, email: string): Promise<{
        users: import("./entities/user.entity").User[];
        totalCount: number;
    }>;
}
