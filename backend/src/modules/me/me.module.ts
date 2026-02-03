import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { MeController } from './me.controller';
import { MeService } from './me.service';

@Module({
  imports: [AuthModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
