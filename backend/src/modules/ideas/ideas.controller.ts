import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/auth.types';
import { IdeasService } from './ideas.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  createIdeaBodySchema,
  previewAttachmentBodySchema,
  type CreateIdeaBody,
  type PreviewAttachmentBody,
} from './dto/create-idea.dto';
import { voteIdeaBodySchema, type VoteIdeaBody } from './dto/vote-idea.dto';
import {
  createCommentBodySchema,
  type CreateCommentBody,
} from './dto/create-comment.dto';

@Controller('ideas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF', 'ADMIN')
export class IdeasController {
  constructor(
    private readonly ideasService: IdeasService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get('context')
  @Roles('STAFF', 'ADMIN')
  getContext(@CurrentUser() user: AccessTokenPayload) {
    return this.ideasService.getContext(user.sub);
  }

  @Get()
  @Roles('STAFF', 'ADMIN')
  findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: 'latest' | 'mostPopular' | 'mostViewed',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const sortVal = sort === 'mostPopular' || sort === 'mostViewed' ? sort : 'latest';
    return this.ideasService.findAllForActiveYear({
      page: pageNum,
      limit: limitNum,
      sort: sortVal,
      userId: user.sub,
    });
  }

  @Get('upload-params')
  @Roles('STAFF', 'ADMIN')
  getUploadParams() {
    return this.ideasService.getUploadParams();
  }

  /**
   * Proxy upload: receive file from frontend, upload to Cloudinary server-side.
   * Avoids CORS "Failed to fetch" when uploading directly from browser to Cloudinary.
   */
  @Post('upload')
  @Roles('STAFF', 'ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @UploadedFile() file: { buffer: Buffer; originalname?: string; mimetype?: string } | undefined,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('No file provided.');
    }
    return this.cloudinary.uploadFile(
      file.buffer,
      file.originalname ?? 'file',
      file.mimetype,
    );
  }

  /**
   * Preview an unsaved attachment by URL (same behavior as view on idea detail).
   * Validates secureUrl is from our Cloudinary cloud, then streams with inline disposition.
   */
  @Post('attachments/preview')
  @Roles('STAFF', 'ADMIN')
  async previewAttachment(
    @Body(new ZodValidationPipe(previewAttachmentBodySchema)) body: PreviewAttachmentBody,
  ): Promise<StreamableFile> {
    if (!this.cloudinary.isOurSecureUrl(body.secureUrl)) {
      throw new BadRequestException('Invalid attachment URL.');
    }
    const res = await fetch(body.secureUrl);
    if (!res.ok) {
      throw new BadRequestException('Unable to load attachment.');
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const disposition = `inline; filename="${body.fileName.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    return new StreamableFile(buffer, {
      type: body.mimeType ?? 'application/octet-stream',
      disposition,
    });
  }

  /**
   * Proxy attachment for viewing in browser (inline). Streams from Cloudinary with
   * Content-Disposition: inline and correct filename so the file opens with the right extension.
   */
  @Get('attachments/:attachmentId/view')
  @Roles('STAFF', 'ADMIN')
  async viewAttachment(@Param('attachmentId') attachmentId: string): Promise<StreamableFile> {
    const { secureUrl, fileName, mimeType } =
      await this.ideasService.getAttachmentForStream(attachmentId);
    const res = await fetch(secureUrl);
    if (!res.ok) {
      throw new BadRequestException('Unable to load attachment.');
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const disposition = `inline; filename="${fileName.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    return new StreamableFile(buffer, {
      type: mimeType ?? 'application/octet-stream',
      disposition,
    });
  }

  /**
   * Proxy attachment for download. Streams from Cloudinary with
   * Content-Disposition: attachment and correct filename so the saved file keeps its extension.
   */
  @Get('attachments/:attachmentId/download')
  @Roles('STAFF', 'ADMIN')
  async downloadAttachment(@Param('attachmentId') attachmentId: string): Promise<StreamableFile> {
    const { secureUrl, fileName, mimeType } =
      await this.ideasService.getAttachmentForStream(attachmentId);
    const res = await fetch(secureUrl);
    if (!res.ok) {
      throw new BadRequestException('Unable to load attachment.');
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const disposition = `attachment; filename="${fileName.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    return new StreamableFile(buffer, {
      type: mimeType ?? 'application/octet-stream',
      disposition,
    });
  }

  @Get(':id/comments')
  @Roles('STAFF', 'ADMIN')
  getComments(@Param('id') id: string) {
    return this.ideasService.getComments(id);
  }

  @Post(':id/vote')
  @Roles('STAFF', 'ADMIN')
  setVote(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(voteIdeaBodySchema)) body: VoteIdeaBody,
  ) {
    return this.ideasService.setVote(id, user.sub, body);
  }

  @Post(':id/comments')
  @Roles('STAFF', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createCommentBodySchema)) body: CreateCommentBody,
  ) {
    return this.ideasService.createComment(id, user.sub, body);
  }

  @Get(':id')
  @Roles('STAFF', 'ADMIN')
  findOne(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.ideasService.findOne(id, user.sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIdea(@Param('id') id: string): Promise<void> {
    await this.ideasService.deleteIdea(id);
  }

  @Post()
  @Roles('STAFF', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body(new ZodValidationPipe(createIdeaBodySchema)) body: CreateIdeaBody,
  ) {
    return this.ideasService.create(user.sub, body);
  }
}
