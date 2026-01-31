import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { UsersService } from './users.service';
import { createUserBodySchema } from './dto/create-user.dto';
import {
  updateUserBodySchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('USERS')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createUserBodySchema))
    body: {
      email: string;
      password: string;
      role: string;
      departmentId?: string | null;
    },
  ) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateIsActive(
    @Param(new ZodValidationPipe(userIdParamSchema)) params: { id: string },
    @Body(new ZodValidationPipe(updateUserBodySchema))
    body: { isActive: boolean },
  ) {
    return this.usersService.updateIsActive(params.id, body);
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(listUsersQuerySchema))
    query: { page: number; limit: number },
  ) {
    return this.usersService.findAll(query);
  }
}
