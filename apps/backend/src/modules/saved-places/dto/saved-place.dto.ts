import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSavedPlaceDto {
  @IsString()
  name: string = '';

  @IsString()
  address: string = '';

  @IsNumber()
  lat: number = 0;

  @IsNumber()
  lon: number = 0;

  @IsOptional()
  @IsString()
  category?: string = '';

  @IsOptional()
  @IsString()
  metadata?: string = '';
}

export class UpdateSavedPlaceDto {
  @IsOptional()
  @IsString()
  name?: string = '';

  @IsOptional()
  @IsString()
  address?: string = '';

  @IsOptional()
  @IsNumber()
  lat?: number = 0;

  @IsOptional()
  @IsNumber()
  lon?: number = 0;

  @IsOptional()
  @IsString()
  category?: string = '';

  @IsOptional()
  @IsString()
  metadata?: string = '';
}
