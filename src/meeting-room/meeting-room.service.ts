import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateMeetingRoomDto } from "./dto/create-meeting-room.dto";
import { UpdateMeetingRoomDto } from "./dto/update-meeting-room.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { MeetingRoom } from "./entities/meeting-room.entity";
import { Repository } from "typeorm";
import { Like } from "typeorm";

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  async delete(id: number) {
    await this.repository.delete({
      id,
    });
    return "success";
  }

  async findById(id: number) {
    return this.repository.findOneBy({
      id,
    });
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    // 先进行查询, 如果不存在就进行返回, 否则就更新
    const meetingRoom = await this.repository.findOneBy({
      id: meetingRoomDto.id,
    });

    if (!meetingRoomDto) {
      throw new BadRequestException("更新的会议室不存在");
    }

    meetingRoom.capacity = meetingRoomDto.capacity;
    meetingRoom.location = meetingRoomDto.location;
    meetingRoom.name = meetingRoomDto.name;

    if (meetingRoomDto.description) {
      meetingRoom.description = meetingRoomDto.description;
    }
    if (meetingRoomDto.equipment) {
      meetingRoom.equipment = meetingRoomDto.equipment;
    }

    await this.repository.update(
      {
        id: meetingRoom.id,
      },
      meetingRoom
    );
    return "success";
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      name: meetingRoomDto.name,
    });
    if (room) {
      throw new BadRequestException("会议室名字已存在");
    }
    return await this.repository.insert(meetingRoomDto);
  }

  // async find(pageNo: number, pageSize: number) {
  //   // 这里好像也把比较细节的错误处理凡在了service当中
  //   if (pageNo < 1) {
  //     throw new BadRequestException("页码最小为1");
  //   }
  //   const skipCount = (pageNo - 1) * pageSize;
  //   // 查询并返回数据记录和???
  //   const [meetingRooms, totalCount] = await this.repository.findAndCount({
  //     skip: skipCount,
  //     take: pageSize,
  //   });
  //   return {
  //     meetingRooms,
  //     totalCount,
  //   };
  // }

  async find(
    pageNo: number,
    pageSize: number,
    name: string,
    capacity: number,
    equipment: string
  ) {
    if (pageNo < 1) {
      throw new BadRequestException("页码最小为 1");
    }
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    if (capacity) {
      condition.capacity = capacity;
    }

    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
    });

    return {
      meetingRooms,
      totalCount,
    };
  }

  initData() {
    const room1 = new MeetingRoom();
    room1.name = "木星";
    room1.capacity = 10;
    room1.equipment = "白板";
    room1.location = "一层西";

    const room2 = new MeetingRoom();
    room2.name = "金星";
    room2.capacity = 5;
    room2.equipment = "";
    room2.location = "二层东";

    const room3 = new MeetingRoom();
    room3.name = "天王星";
    room3.capacity = 30;
    room3.equipment = "白板，电视";
    room3.location = "三层东";

    this.repository.save([room1, room2, room3]);
  }
}
