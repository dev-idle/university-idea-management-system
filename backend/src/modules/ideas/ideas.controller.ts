import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { parsePagination } from '../../common/utils/parse-pagination.util';
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
import {
  updateIdeaBodySchema,
  addAttachmentBodySchema,
  type UpdateIdeaBody,
  type AddAttachmentBody,
} from './dto/update-idea.dto';
import { voteIdeaBodySchema, type VoteIdeaBody } from './dto/vote-idea.dto';
import {
  createCommentBodySchema,
  type CreateCommentBody,
} from './dto/create-comment.dto';
import {
  updateCommentBodySchema,
  type UpdateCommentBody,
} from './dto/update-comment.dto';
import { likeCommentBodySchema, type LikeCommentBody } from './dto/like-comment.dto';

@Controller('ideas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF', 'ADMIN', 'QA_MANAGER', 'QA_COORDINATOR')
export class IdeasController {
  constructor(
    private readonly ideasService: IdeasService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get('context')
  @Roles('STAFF', 'QA_MANAGER', 'QA_COORDINATOR')
  getContext(@CurrentUser() user: AccessTokenPayload) {
    return this.ideasService.getContext(user.sub);
  }

  @Get()
  @Roles('STAFF', 'QA_COORDINATOR')
  findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort')
    sort?: 'latest' | 'mostPopular' | 'mostViewed' | 'latestComments',
    @Query('categoryId') categoryId?: string,
    @Query('cycleId') cycleId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const { page: pageNum, limit: limitNum } = parsePagination(page, limit);
    const sortVal =
      sort === 'mostPopular' ||
      sort === 'mostViewed' ||
      sort === 'latestComments'
        ? sort
        : 'latest';
    return this.ideasService.findAllForActiveYear({
      page: pageNum,
      limit: limitNum,
      sort: sortVal,
      categoryId: categoryId || undefined,
      cycleId: cycleId || undefined,
      departmentId: departmentId || undefined,
      userId: user.sub,
    });
  }

  @Get('upload-params')
  @Roles('STAFF')
  getUploadParams() {
    return this.ideasService.getUploadParams();
  }

  /**
   * Proxy upload: receive file from frontend, upload to Cloudinary server-side.
   * Avoids CORS "Failed to fetch" when uploading directly from browser to Cloudinary.
   */
  @Post('upload')
  @Roles('STAFF')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @UploadedFile()
    file:
      | { buffer: Buffer; originalname?: string; mimetype?: string }
      | undefined,
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
  @Roles('STAFF')
  async previewAttachment(
    @Body(new ZodValidationPipe(previewAttachmentBodySchema))
    body: PreviewAttachmentBody,
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
  @Roles('STAFF', 'QA_COORDINATOR')
  async viewAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<StreamableFile> {
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
  @Roles('STAFF', 'QA_COORDINATOR')
  async downloadAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<StreamableFile> {
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

  /** Latest comments across all ideas in the active academic year. */
  @Get('latest-comments')
  @Roles('STAFF', 'QA_COORDINATOR')
  getLatestComments(@Query('limit') limit?: string) {
    const { limit: limitNum } = parsePagination(undefined, limit);
    return this.ideasService.getLatestComments({
      limit: limitNum,
    });
  }

  /* ── Own‑idea management (STAFF only) ────────────────────────────────────── */

  /** Filter options for My Ideas: years, cycles, categories (only those user has written in). */
  @Get('my/filters')
  @Roles('STAFF')
  getMyIdeasFilters(@CurrentUser() user: AccessTokenPayload) {
    return this.ideasService.getMyIdeasFilters(user.sub);
  }

  /** List own ideas with pagination. STAFF only. */
  @Get('my')
  @Roles('STAFF')
  findMyIdeas(
    @CurrentUser() user: AccessTokenPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('cycleId') cycleId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    const { page: pageNum, limit: limitNum } = parsePagination(page, limit, {
      limit: 5,
    });
    return this.ideasService.findOwnIdeas(user.sub, {
      page: pageNum,
      limit: limitNum,
      categoryId: categoryId || undefined,
      cycleId: cycleId || undefined,
      academicYearId: academicYearId || undefined,
    });
  }

  /** Get single own idea (full details for editing). STAFF only, ownership verified. */
  @Get('my/:id')
  @Roles('STAFF')
  findMyIdea(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ideasService.findOwnIdea(id, user.sub);
  }

  /** Update own idea text fields. Blocked after submission closure. STAFF only. */
  @Put('my/:id')
  @Roles('STAFF')
  updateMyIdea(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateIdeaBodySchema)) body: UpdateIdeaBody,
  ) {
    return this.ideasService.updateOwnIdea(id, user.sub, body);
  }

  /** Delete own idea. ALWAYS allowed. STAFF only, ownership verified. */
  @Delete('my/:id')
  @Roles('STAFF')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyIdea(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.ideasService.deleteOwnIdea(id, user.sub);
  }

  /** Add attachment to own idea. Blocked after closure. STAFF only. */
  @Post('my/:id/attachments')
  @Roles('STAFF')
  @HttpCode(HttpStatus.CREATED)
  addAttachmentToMyIdea(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(addAttachmentBodySchema))
    body: AddAttachmentBody,
  ) {
    return this.ideasService.addAttachmentToOwnIdea(id, user.sub, body);
  }

  /** Remove attachment from own idea. Blocked after closure. STAFF only. */
  @Delete('my/:id/attachments/:attachmentId')
  @Roles('STAFF')
  removeAttachmentFromMyIdea(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ) {
    return this.ideasService.removeAttachmentFromOwnIdea(
      id,
      user.sub,
      attachmentId,
    );
  }

  /* ── Public idea routes ───────────────────────────────────────────────────── */

  @Get(':id/comments')
  @Roles('STAFF', 'QA_COORDINATOR')
  getComments(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ideasService.getComments(id, user.sub);
  }

  /** Record a view for an idea. Idempotent: at most one view per user per idea. QA Coordinator views are not counted. */
  @Post(':id/view')
  @Roles('STAFF', 'QA_COORDINATOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recordView(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.ideasService.recordView(id, user.sub, user.roles);
  }

  @Post(':id/vote')
  @Roles('STAFF')
  setVote(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(voteIdeaBodySchema)) body: VoteIdeaBody,
  ) {
    return this.ideasService.setVote(id, user.sub, body);
  }

  @Post(':id/comments')
  @Roles('STAFF')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createCommentBodySchema))
    body: CreateCommentBody,
  ) {
    return this.ideasService.createComment(id, user.sub, body);
  }

  @Patch(':id/comments/:commentId')
  @Roles('STAFF')
  updateComment(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body(new ZodValidationPipe(updateCommentBodySchema))
    body: UpdateCommentBody,
  ) {
    return this.ideasService.updateComment(id, commentId, user.sub, body);
  }

  @Delete(':id/comments/:commentId')
  @Roles('STAFF')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<void> {
    await this.ideasService.deleteComment(id, commentId, user.sub);
  }

  @Post(':id/comments/:commentId/like')
  @Roles('STAFF')
  likeComment(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body(new ZodValidationPipe(likeCommentBodySchema)) body: LikeCommentBody,
  ) {
    return this.ideasService.likeComment(id, commentId, user.sub, body);
  }

  @Get(':id')
  @Roles('STAFF', 'QA_COORDINATOR')
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ideasService.findOne(id, user.sub);
  }

  @Delete(':id')
  @Roles('QA_MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIdea(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.ideasService.deleteIdea(id);
  }

  @Post()
  @Roles('STAFF')
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body(new ZodValidationPipe(createIdeaBodySchema)) body: CreateIdeaBody,
  ) {
    return this.ideasService.create(user.sub, body);
  }
}
