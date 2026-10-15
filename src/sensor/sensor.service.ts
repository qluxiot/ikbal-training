import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorData } from './sensor.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SensorService {
  private readonly logger = new Logger(SensorService.name);

  constructor(
    @InjectRepository(SensorData)
    private readonly sensorRepo: Repository<SensorData>,
    private readonly configService: ConfigService,
  ) {}

  // Fetch weather for specific coordinates and save
  async fetchAndSaveWeather(latitude: number, longitude: number, locationName?: string) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`;
      const response = await axios.get(url);
      const current = response.data?.current;

      if (current && typeof current.temperature_2m === 'number') {
        const record = this.sensorRepo.create({
          sensor_name: 'Temperature Sensor',
          value: current.temperature_2m,
          unit: '°C',
        });
        const saved = await this.sensorRepo.save(record);
        this.logger.log(`Logged sensor value: ${current.temperature_2m}°C`);
        return saved;
      }
    } catch (error: any) {
      this.logger.error('Failed to fetch/save weather data', error?.message || error);
    }
    return null;
  }

  // Automatically fetch default data every 1 minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Fetching real-time environmental data...');
    try {
      const apiUrl = this.configService.get<string>('API_URL');
      if (!apiUrl) {
        throw new Error('API_URL is not configured');
      }
      const response = await axios.get(apiUrl);
      
      const current = response.data?.current;
      if (current && typeof current.temperature_2m === 'number') {
        const record = this.sensorRepo.create({
          sensor_name: 'Temperature Sensor',
          value: current.temperature_2m,
          unit: '°C',
        });
        await this.sensorRepo.save(record);
        this.logger.log(`Logged sensor value: ${current.temperature_2m}°C`);
      }
    } catch (error: any) {
      this.logger.error('Failed to fetch/save sensor data', error?.message || error);
    }
  }

  async getLatestAndHistory(latitude?: number, longitude?: number) {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      await this.fetchAndSaveWeather(latitude, longitude, 'User Location');
    }

    const latest = await this.sensorRepo.findOne({
      where: {},
      order: { timestamp: 'DESC' },
    });
    const history = await this.sensorRepo.find({
      order: { timestamp: 'DESC' },
      take: 25,
    });
    return { latest, history };
  }
}
