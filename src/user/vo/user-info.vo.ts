// 用于封装返回给客户端的对象(可以用于except密码之类的无用的数据)
export class UserDetailVo {
  id: number;

  username: string;

  nickName: string;

  email: string;

  headPic: string;

  phoneNumber: string;

  isFrozen: boolean;

  createTime: Date;
}
