import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const stripHtml = (value: string) =>
  typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : value;

export class PhotoDto {
  @IsUUID()
  id: string;

  @IsString()
  url: string;

  @IsInt()
  @Min(0)
  order: number;

  @IsBoolean()
  isPrimary: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => stripHtml(value))
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => stripHtml(value))
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => stripHtml(value))
  bio?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos?: PhotoDto[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1, { message: 'hourlyRate must be greater than 0' })
  @Max(9999, { message: 'hourlyRate must be less than 10000' })
  @Type(() => Number)
  hourlyRate?: number;
}
