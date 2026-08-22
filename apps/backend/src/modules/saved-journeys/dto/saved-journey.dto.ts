import { IsString, IsOptional } from 'class-validator';

export class CreateSavedJourneyDto {
  @IsString()
  originName: string = '';

  @IsString()
  destName: string = '';

  @IsString()
  payloadJson: string = '';

  @IsOptional()
  @IsString()
  label?: string = '';
}

export class UpdateSavedJourneyDto {
  @IsOptional()
  @IsString()
  originName?: string = '';

  @IsOptional()
  @IsString()
  destName?: string = '';

  @IsOptional()
  @IsString()
  payloadJson?: string = '';

  @IsOptional()
  @IsString()
  label?: string = '';
}
