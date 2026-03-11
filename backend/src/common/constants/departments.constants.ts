/**
 * Department names for support/admin roles (IT Services, QA Office).
 * Excluded from Ideas Hub filters, export stats, and QC requirements.
 */
export const EXCLUDED_DEPARTMENT_NAMES = [
  'IT Services / System Administration Department',
  'Quality Assurance Office',
] as const;

export const EXCLUDED_DEPARTMENT_NAMES_SET = new Set(
  EXCLUDED_DEPARTMENT_NAMES,
) as Set<string>;
