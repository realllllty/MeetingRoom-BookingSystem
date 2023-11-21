import { PartialType } from "@nestjs/swagger";
import { CreateMeetingRoomDto } from "./create-meeting-room.dto";
import { IsNotEmpty } from "class-validator";

export class UpdateMeetingRoomDto extends PartialType(CreateMeetingRoomDto) {
  // 继承原有的dto
  // 使用PartialType, 表示原本的属性都继承过来, 并且都是可选项
  @IsNotEmpty({
    message: "id不为空",
  })
  id: number;
}
