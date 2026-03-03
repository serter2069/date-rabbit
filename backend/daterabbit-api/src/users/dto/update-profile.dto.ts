import { IsOptional, IsString, IsNumber, Min, Max, IsInt, MaxLength, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsArray()
  photos?: any[];

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Hourly rate must be greater than 0' })
  @Max(9999, { message: 'Hourly rate must be less than 10000' })
  hourlyRate?: number;
}
