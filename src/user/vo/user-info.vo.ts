// 用于封装返回给客户端的对象(可以用于except密码之类的无用的数据)
import { ApiProperty } from "@nestjs/swagger";

export class UserDetailVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  headPic: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isFrozen: boolean;

  @ApiProperty()
  createTime: Date;
}
