//dto接受参数
//vo用于封装返回数据
//entity和数据库对应
interface UserInfo {
  id: number;
  username: string;
  nickName: string;
  email: string;
  headPic: string;
  phoneNumber: string;
  isFrozen: boolean;
  isAdmin: boolean;
  createTime: number;
  roles: string[];
  permissions: string[];
}
export class LoginUserVo {
  // 返回用户信息和两个token
  userInfo: UserInfo;
  accessToken: string;
  refreshToken: string;
}
