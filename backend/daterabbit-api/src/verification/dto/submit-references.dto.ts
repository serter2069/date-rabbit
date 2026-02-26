import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';

export class ReferenceItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;
}

export class SubmitReferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceItemDto)
  references: ReferenceItemDto[];
}
