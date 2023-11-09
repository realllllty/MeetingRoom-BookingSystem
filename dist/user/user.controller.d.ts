import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    test(): string;
    register(registerUser: RegisterUserDto): Promise<"注册成功" | "注册失败">;
    private emailService;
    private redisService;
    captcha(address: string): Promise<string>;
    initData(): Promise<string>;
    userLogin(loginUser: LoginUserDto): Promise<import("./vo/login-user.vo").LoginUserVo>;
    adminLogin(loginUser: LoginUserDto): Promise<import("./vo/login-user.vo").LoginUserVo>;
}
