import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { RoutingEngine } from './routing.service';
import { RoutingRequestDto, RoutingResponseDto, OptimizationProfile } from './routing.types';
import { plainToInstance } from 'class-transformer';
import { IsNumberString, IsOptional, IsString, IsIn, IsDateString, ValidateNested } from 'class-validator';

class LocationPointDto {
  @IsNumberString() latitude!: number;
  @IsNumberString() longitude!: number;
  @IsOptional() @IsString() name?: string;
}

class RoutingRequestDtoClass {
  @ValidateNested() origin!: LocationPointDto;
  @ValidateNested() destination!: LocationPointDto;
  @IsOptional() @IsDateString() departureTime?: string;
  @IsOptional() @IsIn(Object.values(OptimizationProfile)) preference?: OptimizationProfile;
}

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingEngine: RoutingEngine) {}

  @Post('plan')
  async plan(@Body() dto: RoutingRequestDtoClass): Promise<RoutingResponseDto> {
    const request: RoutingRequestDto = {
      origin: { latitude: Number(dto.origin.latitude), longitude: Number(dto.origin.longitude), name: dto.origin.name },
      destination: { latitude: Number(dto.destination.latitude), longitude: Number(dto.destination.longitude), name: dto.destination.name },
      departureTime: dto.departureTime,
      preference: dto.preference ?? OptimizationProfile.FASTEST,
    };

    const result = await this.routingEngine.plan(request);
    return {
      journeys: result.journeys,
      count: result.journeys.length,
      requestedAt: new Date().toISOString(),
    };
  }
}
