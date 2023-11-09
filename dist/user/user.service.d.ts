import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
export declare class UserService {
    private logger;
    private userRepository;
    private roleRepository;
    private permissionRepository;
    private redisService;
    login(loginUserDto: LoginUserDto, isAdmin: boolean): Promise<LoginUserVo>;
    register(user: RegisterUserDto): Promise<"注册成功" | "注册失败">;
    initData(): Promise<void>;
}
