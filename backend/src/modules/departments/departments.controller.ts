import {
  Controller,
  Post,
  Get,
  Patch,
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
import { DepartmentsService } from './departments.service';
import { createDepartmentBodySchema } from './dto/create-department.dto';
import {
  updateDepartmentBodySchema,
  departmentIdParamSchema,
} from './dto/update-department.dto';

@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('DEPARTMENTS')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createDepartmentBodySchema))
    body: { name: string },
  ) {
    return this.departmentsService.create(body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param(new ZodValidationPipe(departmentIdParamSchema)) params: { id: string },
    @Body(new ZodValidationPipe(updateDepartmentBodySchema))
    body: { name?: string },
  ) {
    return this.departmentsService.update(params.id, body);
  }

  @Get()
  async findAll() {
    return this.departmentsService.findAll();
  }
}
