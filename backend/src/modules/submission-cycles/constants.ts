/**
 * Idea Submission Cycle status. Authoritative on backend.
 */
export const CYCLE_STATUS = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;
export type CycleStatus = (typeof CYCLE_STATUS)[number];

export function isCycleStatus(value: string): value is CycleStatus {
  return CYCLE_STATUS.includes(value as CycleStatus);
}
