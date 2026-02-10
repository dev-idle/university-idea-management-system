import { PipeTransform, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

/**
 * Validates that a route param is a valid UUID v4.
 * Usage: @Param('id', ParseUUIDPipe) id: string
 */
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const result = uuidSchema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    throw new BadRequestException('Invalid UUID parameter.');
  }
}
