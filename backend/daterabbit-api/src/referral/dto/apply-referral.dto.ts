import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ApplyReferralDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^DR-[A-Z0-9]{5}$/, { message: 'Invalid referral code format' })
  code: string;
}
