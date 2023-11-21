import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { RegisterUserDto } from "./dto/register-user.dto";
import { RedisService } from "../redis/redis.service";
import { md5 } from "../utils";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { LoginUserDto } from "./dto/login-user.dto";
import { LoginUserVo } from "./vo/login-user.vo";
import { UpdateUserPasswordDto } from "./dto/update-user-password.dts";
import { Like } from "typeorm";

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  // 注入 Repository 需要在 UserModule 里引入下 TypeOrm.forFeature
  private userRepository: Repository<User>;

  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private redisService: RedisService;

  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin,
      },
      // 根据username和isAdmin查询数据库, 设置级联查询roles和roles.permisions
      relations: ["roles", "roles.permissions"],
    });

    if (!user) {
      throw new HttpException("用户不存在", HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException("密码错误", HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    if (!captcha) {
      throw new HttpException("验证码已失效", HttpStatus.BAD_REQUEST);
    }
    if (user.captcha != captcha) {
      throw new HttpException("验证码错误", HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException("用户名已存在", HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userRepository.save(newUser);
      return "注册成功";
    } catch (e) {
      this.logger.error(e, UserService);
      return "注册失败";
    }
  }
  async initData() {
    const user1 = new User();
    user1.username = "zhangsan";
    user1.password = md5("111111");
    user1.email = "xxx@xx.com";
    user1.isAdmin = true;
    user1.nickName = "张三";
    user1.phoneNumber = "13233323333";

    const user2 = new User();
    user2.username = "lisi";
    user2.password = md5("222222");
    user2.email = "yy@yy.com";
    user2.nickName = "李四";

    const role1 = new Role();
    role1.name = "管理员";

    const role2 = new Role();
    role2.name = "普通用户";

    const permission1 = new Permission();
    permission1.code = "ccc";
    permission1.description = "访问 ccc 接口";

    const permission2 = new Permission();
    permission2.code = "ddd";
    permission2.description = "访问 ddd 接口";

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }

  async findUserById(userId: number, isAdmin: boolean) {
    // 通过用户id和isAdmin 查询用户信息
    // 级联查询用户的角色和角色的权限
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ["roles", "roles.permissions"],
    });

    //返回一个满足User类型结构的数据
    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      // reduce() 方法对累加器和数组中的每个元素 (从左到右)应用
      // 收纳所有role的permissions
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return user;
  }

  // 通过邮箱验证码修改密码功能
  async updatePassword(userId: number, passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`
    );

    if (!captcha) {
      throw new HttpException("验证码不正确", HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    foundUser.password = md5(passwordDto.password);

    try {
      await this.userRepository.save(foundUser);
      return "密码修改成功";
    } catch (e) {
      return "密码修改失败";
    }
  }

  //修改一般信息
  async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUserDto.email}`
    );

    if (!captcha) {
      throw new HttpException("验证码已失效", HttpStatus.BAD_REQUEST);
    }

    if (updateUserDto.captcha !== captcha) {
      throw new HttpException("验证码不正确", HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    if (updateUserDto.nickName) {
      foundUser.nickName = updateUserDto.nickName;
    }
    if (updateUserDto.headPic) {
      foundUser.headPic = updateUserDto.headPic;
    }

    try {
      await this.userRepository.save(foundUser);
      return "用户信息修改成功";
    } catch (e) {
      this.logger.error(e, UserService);
      return "用户信息修改成功";
    }
  }

  // 冻结用户账号
  async freezeUserById(id: number) {
    const user = await this.userRepository.findOneBy({
      id: id,
    });
    user.isFrozen = true;
    this.userRepository.save(user);
  }

  // 分页查询用户
  // 对应mysql 语句 select * from users limit 0,2
  async findUsersByPage(pageNo: number, pageSize: number) {
    if (pageSize <= 1 || pageNo <= 0) {
      throw new HttpException("页数或是分页数错误", HttpStatus.BAD_REQUEST);
    }
    // 计算出LIMIT
    const skipCount = (pageNo - 1) * pageSize;

    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        "id",
        "username",
        "nickName",
        "email",
        "phoneNumber",
        "isFrozen",
        "headPic",
        "createTime",
      ],
      skip: skipCount,
      take: pageSize,
    });

    return {
      users,
      totalCount,
    };
  }

  async findUsers(
    username: string,
    nickName: string,
    email: string,
    pageNo: number,
    pageSize: number
  ) {
    const skipCount = (pageNo - 1) * pageSize;

    // 空对象, 用于方便后续添加搜索条件
    const condition: Record<string, any> = {};

    // Like函数允许在字段搜索中包含特定字符串的记录
    if (username) {
      condition.username = Like(`%${username}%`);
    }
    if (nickName) {
      condition.nickName = Like(`%${nickName}%`);
    }
    if (email) {
      condition.email = Like(`%${email}%`);
    }

    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        "id",
        "username",
        "nickName",
        "email",
        "phoneNumber",
        "isFrozen",
        "headPic",
        "createTime",
      ],
      skip: skipCount,
      take: pageSize,
      where: condition, // 查询条件
    });

    return {
      users,
      totalCount,
    };
  }
}
