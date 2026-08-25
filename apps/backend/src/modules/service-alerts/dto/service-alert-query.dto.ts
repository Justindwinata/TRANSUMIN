import { IsOptional, IsString, IsIn } from 'class-validator';

export class ServiceAlertQueryDto {
  @IsOptional()
  @IsString()
  operatorName?: string;

  @IsOptional()
  @IsString()
  affectedRoute?: string;

  @IsOptional()
  @IsString()
  affectedStop?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'resolved'])
  status?: string;

  @IsOptional()
  @IsIn(['live', 'official', 'fixture', 'development'])
  source?: string;
}
