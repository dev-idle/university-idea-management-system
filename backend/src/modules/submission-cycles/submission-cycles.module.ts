import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubmissionCyclesController } from './submission-cycles.controller';
import { SubmissionCyclesService } from './submission-cycles.service';

@Module({
  imports: [AuthModule],
  controllers: [SubmissionCyclesController],
  providers: [SubmissionCyclesService],
  exports: [SubmissionCyclesService],
})
export class SubmissionCyclesModule {}
