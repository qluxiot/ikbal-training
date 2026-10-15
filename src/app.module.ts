import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SensorModule } from './sensor/sensor.module';
import { SensorData } from './sensor/sensor.entity';
import { SensorService } from './sensor/sensor.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3' as const,
        database: config.get<string>('DATABASE_PATH', 'sensor_data.sqlite'),
        entities: [SensorData],
        synchronize: true, // auto-creates database schema
      }),
      inject: [ConfigService],
    }),
    SensorModule,
    AuthModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly sensorService: SensorService) {}

  // Run initial pull immediately on startup without waiting 1 minute
  async onModuleInit() {
    await this.sensorService.handleCron();
  }
}
