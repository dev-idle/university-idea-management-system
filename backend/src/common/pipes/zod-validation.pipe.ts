import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

/**
 * Validation pipe using Zod only. Use per-parameter:
 *   @Body(new ZodValidationPipe(mySchema)) body: z.infer<typeof mySchema>
 * No class-validator; Zod ONLY.
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    void metadata; // PipeTransform signature requires second param; unused for Zod
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    const error = result.error;
    const message = error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new BadRequestException(message);
  }
}
