import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

const stripHtml = (value: string) =>
  typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : value;

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => stripHtml(value))
  comment?: string;
}
