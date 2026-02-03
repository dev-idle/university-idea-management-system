import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SubmissionCyclesService } from './submission-cycles.service';
import { createCycleBodySchema, type CreateCycleBody } from './dto/create-cycle.dto';
import {
  updateCycleBodySchema,
  cycleIdParamSchema,
} from './dto/update-cycle.dto';

@Controller('submission-cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('QA_MANAGER')
export class SubmissionCyclesController {
  constructor(
    private readonly submissionCyclesService: SubmissionCyclesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createCycleBodySchema))
    body: CreateCycleBody,
  ) {
    return this.submissionCyclesService.create(body);
  }

  @Get('options/academic-years')
  async listAcademicYears() {
    return this.submissionCyclesService.listAcademicYearsForCycle();
  }

  @Get()
  async findAll() {
    return this.submissionCyclesService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param(new ZodValidationPipe(cycleIdParamSchema)) params: { id: string },
  ) {
    return this.submissionCyclesService.findOne(params.id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param(new ZodValidationPipe(cycleIdParamSchema)) params: { id: string },
    @Body(new ZodValidationPipe(updateCycleBodySchema))
    body: {
      name?: string;
      categoryIds?: string[];
      ideaSubmissionClosesAt?: Date;
      interactionClosesAt?: Date;
    },
  ) {
    return this.submissionCyclesService.update(params.id, body);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Param(new ZodValidationPipe(cycleIdParamSchema)) params: { id: string },
  ) {
    return this.submissionCyclesService.activate(params.id);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  async close(
    @Param(new ZodValidationPipe(cycleIdParamSchema)) params: { id: string },
  ) {
    return this.submissionCyclesService.close(params.id);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Param(new ZodValidationPipe(cycleIdParamSchema)) params: { id: string },
  ) {
    return this.submissionCyclesService.deactivate(params.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param(new ZodValidationPipe(cycleIdParamSchema)) params: { id: string },
  ) {
    return this.submissionCyclesService.remove(params.id);
  }
}
