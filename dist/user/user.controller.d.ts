import { UserService } from "./user.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserDetailVo } from "./vo/user-info.vo";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dts";
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
    userLogin(loginUser: LoginUserDto): Promise<import("./vo/login-user.vo").LoginUserVo>;
    adminLogin(loginUser: LoginUserDto): Promise<import("./vo/login-user.vo").LoginUserVo>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    adminRefresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    info(userId: number): Promise<UserDetailVo>;
    updatePassword(userId: number, passwordDto: UpdateUserPasswordDto): Promise<string>;
}
