import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupService } from './pickup.service';
import { PickupResolver } from './pickup.resolver';
import { PickUp } from './pickup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickUp])],
  providers: [PickupResolver, PickupService],
})
export class PickupModule {}