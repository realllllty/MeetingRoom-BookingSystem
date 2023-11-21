import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { LoginUserVo } from "./vo/login-user.vo";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dts";
export declare class UserService {
    private logger;
    private userRepository;
    private roleRepository;
    private permissionRepository;
    private redisService;
    login(loginUserDto: LoginUserDto, isAdmin: boolean): Promise<LoginUserVo>;
    register(user: RegisterUserDto): Promise<"注册成功" | "注册失败">;
    initData(): Promise<void>;
    findUserById(userId: number, isAdmin: boolean): Promise<{
        id: number;
        username: string;
        isAdmin: boolean;
        roles: string[];
        permissions: any[];
    }>;
    findUserDetailById(userId: number): Promise<User>;
    updatePassword(userId: number, passwordDto: UpdateUserPasswordDto): Promise<"密码修改成功" | "密码修改失败">;
    update(userId: number, updateUserDto: UpdateUserDto): Promise<string>;
    freezeUserById(id: number): Promise<void>;
    findUsersByPage(pageNo: number, pageSize: number): Promise<{
        users: User[];
        totalCount: number;
    }>;
    findUsers(username: string, nickName: string, email: string, pageNo: number, pageSize: number): Promise<{
        users: User[];
        totalCount: number;
    }>;
}
