import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
