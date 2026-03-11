import { Module } from '@nestjs/common';
import { IdeasController } from './ideas.controller';
import { IdeasAttachmentsPublicController } from './ideas-attachments-public.controller';
import { IdeasService } from './ideas.service';
import { AttachmentTokenService } from './attachment-token.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [IdeasController, IdeasAttachmentsPublicController],
  providers: [IdeasService, AttachmentTokenService],
  exports: [IdeasService, AttachmentTokenService],
})
export class IdeasModule {}
