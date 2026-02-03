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
import { CategoriesService } from './categories.service';
import { createCategoryBodySchema } from './dto/create-category.dto';
import {
  updateCategoryBodySchema,
  categoryIdParamSchema,
} from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('QA_MANAGER')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createCategoryBodySchema))
    body: { name: string },
  ) {
    return this.categoriesService.create(body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param(new ZodValidationPipe(categoryIdParamSchema)) params: { id: string },
    @Body(new ZodValidationPipe(updateCategoryBodySchema))
    body: { name?: string },
  ) {
    return this.categoriesService.update(params.id, body);
  }

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param(new ZodValidationPipe(categoryIdParamSchema)) params: { id: string },
  ) {
    await this.categoriesService.remove(params.id);
  }
}
