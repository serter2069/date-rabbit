import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateCityDto {
  @IsString()
  name: string;

  @IsString()
  @Length(2, 2)
  state: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
