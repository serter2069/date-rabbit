import { IsString, Matches } from 'class-validator';

export class SubmitSsnDto {
  @IsString()
  @Matches(/^\d{4}$/, { message: 'ssnLast4 must be exactly 4 digits' })
  ssnLast4: string;
}
