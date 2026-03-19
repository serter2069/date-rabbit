import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedDate } from './entities/blocked-date.entity';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { sanitizeText } from '../common/sanitize';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(BlockedDate)
    private blockedDateRepository: Repository<BlockedDate>,
  ) {}

  async blockDate(userId: string, dto: CreateBlockedDateDto): Promise<BlockedDate> {
    // Validate startTime < endTime if both provided
    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new HttpException('startTime must be before endTime', HttpStatus.BAD_REQUEST);
    }

    const blockedDate = this.blockedDateRepository.create({
      userId,
      date: dto.date,
      startTime: dto.startTime || undefined,
      endTime: dto.endTime || undefined,
      reason: dto.reason ? sanitizeText(dto.reason) : undefined,
    } as Partial<BlockedDate>);

    return this.blockedDateRepository.save(blockedDate as BlockedDate);
  }

  async getBlockedDates(userId: string): Promise<BlockedDate[]> {
    return this.blockedDateRepository.find({
      where: { userId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async removeBlock(userId: string, blockId: string): Promise<void> {
    const block = await this.blockedDateRepository.findOne({
      where: { id: blockId },
    });

    if (!block) {
      throw new HttpException('Blocked date not found', HttpStatus.NOT_FOUND);
    }

    if (block.userId !== userId) {
      throw new HttpException('Cannot delete another user\'s blocked date', HttpStatus.FORBIDDEN);
    }

    await this.blockedDateRepository.remove(block);
  }

  async isDateBlocked(companionId: string, date: string): Promise<boolean> {
    const count = await this.blockedDateRepository.count({
      where: { userId: companionId, date },
    });
    return count > 0;
  }
}
