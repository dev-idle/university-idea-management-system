import { z } from 'zod';

export const EXPORT_TYPES = ['full'] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];

export const triggerExportBodySchema = z.object({
  cycleId: z.string().uuid('Invalid cycle ID'),
  type: z.enum(EXPORT_TYPES),
});

export type TriggerExportBody = z.infer<typeof triggerExportBodySchema>;
