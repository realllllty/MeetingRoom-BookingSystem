import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { Booking } from "src/booking/entities/booking.entity";
import { User } from "src/user/entities/user.entity";
import { MeetingRoom } from "src/meeting-room/entities/meeting-room.entity";

@Injectable()
export class StatisticService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  async userBookingCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, "b") // 用Booking实体为查询基础, 命名别名为b
      .select("u.id", "userId")
      .addSelect("u.username", "username") // 进行选择(相当于sql 当中的select语句)
      .leftJoin(User, "u", "b.userId = u.id") // 进行左连接
      .addSelect("count(1)", "bookingCount") // 和count(*)是相同的???
      .where("b.startTime between :time1 and :time2", {
        time1: startTime,
        time2: endTime,
      })
      .addGroupBy("b.user") // 添加一个分组依据
      .getRawMany();
    return res;
  }

  async meetingRoomUsedCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, "b")
      .select("m.id", "meetingRoomId")
      .addSelect("m.name", "meetingRoomName")
      .leftJoin(MeetingRoom, "m", "b.roomId = m.id")
      .addSelect("count(1)", "usedCount")
      .where("b.startTime between :time1 and :time2", {
        time1: startTime,
        time2: endTime,
      })
      .addGroupBy("b.roomId")
      .getRawMany();
    return res;
  }
}
