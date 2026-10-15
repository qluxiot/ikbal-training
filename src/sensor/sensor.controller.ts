import { Controller, Get, Query } from '@nestjs/common';
import { SensorService } from './sensor.service';

@Controller('sensor-data')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get()
  async getSensorData(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lon ? parseFloat(lon) : undefined;
    return this.sensorService.getLatestAndHistory(latitude, longitude);
  }
}
