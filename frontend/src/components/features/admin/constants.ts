/**
 * Shared UI constants for management UIs (Admin + QA Manager).
 * Aligned with app design system (config/design) for consistency with Staff pages.
 * List tables: use MANAGEMENT_PAGE_SIZE and formatManagementShowingRange for standardization.
 */
import {
  CARD_CLASS,
  SECTION_LABEL_CLASS,
  SECTION_CARD_DESCRIPTION_CLASS,
  FORM_SUBMIT_BUTTON_CLASS,
  DESTRUCTIVE_INLINE_ACCENT_CLASS,
  FOCUS_RING_CLASS,
} from "@/config/design";

/** Re-export outline button class from design for management forms. */
export { FORM_OUTLINE_BUTTON_CLASS } from "@/config/design";

/** Page size for all Role Manager list tables (Admin + QA Manager). Not used by Staff. */
export const MANAGEMENT_PAGE_SIZE = 6;

/** Show pagination footer only when total items exceed this (e.g. 7+ → "Previous 1 Next" and "Showing 1–10 of 11"). */
export const MANAGEMENT_PAGINATION_MIN_TOTAL = 7;

/** "Showing X–Y of Z" text for table header. Use when total is known (not loading). */
export function formatManagementShowingRange(
  page: number,
  pageSize: number,
  total: number
): string {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}–${end} of ${total}`;
}

/** Header bar for management card: "Showing X–Y of Z" left, actions right. */
export const MANAGEMENT_CARD_HEADER_CLASS =
  "flex flex-wrap items-center justify-between gap-3 min-h-12 border-b border-border/80 bg-muted/10 px-4 py-3.5 sm:px-6";

/** Management card wrapper (table card). Uses shared CARD_CLASS. */
export const MANAGEMENT_CARD_CLASS = `overflow-hidden ${CARD_CLASS} py-0`;

/** Dialog content (standard width). */
export const DIALOG_CONTENT_CLASS =
  `max-h-[90vh] overflow-y-auto ${CARD_CLASS} sm:max-w-lg`;

/** Dialog content (wider, e.g. submission cycle form). */
export const DIALOG_CONTENT_CLASS_LG =
  `max-h-[90vh] overflow-y-auto ${CARD_CLASS} sm:max-w-2xl`;

/** Dialog content (narrower, e.g. edit user). */
export const DIALOG_CONTENT_CLASS_SM =
  `max-h-[90vh] overflow-y-auto ${CARD_CLASS} sm:max-w-md`;

/** Dialog header wrapper. */
export const DIALOG_HEADER_CLASS =
  "space-y-1.5 text-left border-b border-border/80 pb-4";

/** Dialog title (aligned with PAGE_TITLE typography). */
export const DIALOG_TITLE_CLASS =
  "font-serif text-2xl font-semibold tracking-tight text-foreground";

/** Dialog description. */
export const DIALOG_DESCRIPTION_CLASS =
  "text-muted-foreground text-sm leading-relaxed";

/** Table header cell (data columns). */
export const TABLE_HEAD_CELL_CLASS =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6";

/** Table header cell for Actions column (right-aligned, optional min-width via className). */
export const TABLE_HEAD_CELL_ACTIONS_CLASS =
  "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6";

/** Min-width for Actions column (2 icon buttons, e.g. Edit + Delete). */
export const TABLE_ACTIONS_MIN_W_2 = "min-w-[5.5rem]";

/** Min-width for Actions column (3 icon buttons). */
export const TABLE_ACTIONS_MIN_W_3 = "min-w-[6rem]";

/** Actions column cell (padding + right align). Use with TABLE_ACTIONS_MIN_W_2 or TABLE_ACTIONS_MIN_W_3. */
export const TABLE_ACTIONS_CELL_CLASS = "px-4 py-3 text-right sm:px-6";

/** Pagination footer row. */
export const PAGINATION_FOOTER_CLASS =
  "flex flex-col gap-3 border-t border-border/80 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6";

/** Loading / empty state cell (centered, padded). */
export const TABLE_LOADING_CELL_CLASS =
  "flex items-center justify-center px-6 py-20 text-sm text-muted-foreground";

/** Empty table message cell. */
export const TABLE_EMPTY_CELL_CLASS =
  "px-4 py-14 text-center text-sm text-muted-foreground sm:px-6";

/** Form label (aligned with SECTION_LABEL_CLASS). */
export const FORM_LABEL_CLASS = SECTION_LABEL_CLASS;

/** Form default wrapper (card style when not in dialog). */
export const FORM_CARD_CLASS = `flex flex-col gap-6 ${CARD_CLASS} px-6 py-6`;

/** Form dialog variant (no card, just gap). */
export const FORM_DIALOG_CLASS = "flex flex-col gap-6";

/** Form section heading (default variant). */
export const FORM_HEADING_CLASS =
  "font-serif text-base font-semibold tracking-tight text-foreground";

/** Form section description (aligned with SECTION_CARD_DESCRIPTION_CLASS). */
export const FORM_DESCRIPTION_CLASS = `mt-2 ${SECTION_CARD_DESCRIPTION_CLASS}`;

/** Form field spacing wrapper. */
export const FORM_FIELD_SPACE = "space-y-2";

/** Form actions border + padding. */
export const FORM_ACTIONS_CLASS =
  "flex flex-wrap gap-3 border-t border-border/80 pt-6";

/** Primary submit button (aligned with design FORM_SUBMIT_BUTTON_CLASS). */
export const FORM_BUTTON_CLASS = FORM_SUBMIT_BUTTON_CLASS;

/** Inline destructive/error block (form validation). */
export const FORM_ERROR_BLOCK_CLASS = DESTRUCTIVE_INLINE_ACCENT_CLASS;

/** Focus ring for links and cards (management). */
export const MANAGEMENT_FOCUS_RING_CLASS = FOCUS_RING_CLASS;

/** Action button in a disabled/locked state (blurred UI): muted, reduced opacity, non-interactive. */
export const ACTION_BUTTON_DISABLED_BLUR_CLASS =
  "cursor-not-allowed text-muted-foreground opacity-60";
