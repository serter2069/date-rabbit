import { IsBoolean } from 'class-validator';

export class SubmitConsentDto {
  @IsBoolean()
  consentGiven: boolean;
}
