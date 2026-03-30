import { IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

const stripHtml = (value: string) =>
  typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : value;

export class ReplyReviewDto {
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => stripHtml(value))
  text: string;
}
