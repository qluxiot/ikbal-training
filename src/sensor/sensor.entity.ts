import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sensor_data')
export class SensorData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sensor_name: string;

  @Column('float')
  value: number;

  @Column({ nullable: true })
  unit: string;

  @CreateDateColumn()
  timestamp: Date;
}
