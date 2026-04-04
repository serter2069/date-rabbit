import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';

export class UpdateCityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @Length(2, 2)
  @IsOptional()
  state?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
