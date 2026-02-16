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
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AcademicYearsService } from './academic-years.service';
import { createAcademicYearBodySchema } from './dto/create-academic-year.dto';
import {
  updateAcademicYearBodySchema,
  academicYearIdParamSchema,
} from './dto/update-academic-year.dto';

@Controller('academic-years')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('ACADEMIC_YEARS')
export class AcademicYearsController {
  constructor(
    private readonly academicYearsService: AcademicYearsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createAcademicYearBodySchema))
    body: { name: string; startDate: Date; endDate?: Date },
  ) {
    return this.academicYearsService.create(body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param(new ZodValidationPipe(academicYearIdParamSchema))
    params: { id: string },
    @Body(new ZodValidationPipe(updateAcademicYearBodySchema))
    body: {
      name?: string;
      startDate?: Date;
      endDate?: Date | null;
      isActive?: boolean;
    },
  ) {
    return this.academicYearsService.update(params.id, body);
  }

  @Get()
  async findAll() {
    return this.academicYearsService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param(new ZodValidationPipe(academicYearIdParamSchema))
    params: { id: string },
  ) {
    await this.academicYearsService.remove(params.id);
  }
}
