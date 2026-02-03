/**
 * Shared UI constants for management UIs (Admin + QA Manager).
 * Use these for consistent layout, dialogs, tables, and forms.
 */

/** Header bar for management card: "Showing X–Y of Z" left, actions right. */
export const MANAGEMENT_CARD_HEADER_CLASS =
  "flex flex-wrap items-center justify-between gap-3 min-h-12 border-b border-border/80 bg-muted/10 px-4 py-3.5 sm:px-6";

/** Management card wrapper (table card). */
export const MANAGEMENT_CARD_CLASS =
  "overflow-hidden rounded-xl border border-border/90 bg-card py-0 shadow-sm";

/** Dialog content (standard width). */
export const DIALOG_CONTENT_CLASS =
  "max-h-[90vh] overflow-y-auto rounded-xl border border-border/90 bg-card shadow-sm sm:max-w-lg";

/** Dialog content (wider, e.g. submission cycle form). */
export const DIALOG_CONTENT_CLASS_LG =
  "max-h-[90vh] overflow-y-auto rounded-xl border border-border/90 bg-card shadow-sm sm:max-w-2xl";

/** Dialog content (narrower, e.g. edit user). */
export const DIALOG_CONTENT_CLASS_SM =
  "max-h-[90vh] overflow-y-auto rounded-xl border border-border/90 bg-card shadow-sm sm:max-w-md";

/** Dialog header wrapper. */
export const DIALOG_HEADER_CLASS =
  "space-y-1.5 text-left border-b border-border/80 pb-4";

/** Dialog title. */
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

/** Form label (muted, small caps). */
export const FORM_LABEL_CLASS =
  "text-muted-foreground text-[11px] font-medium uppercase tracking-[0.12em]";

/** Form default wrapper (card style when not in dialog). */
export const FORM_CARD_CLASS =
  "flex flex-col gap-6 rounded-xl border border-border/90 bg-card px-6 py-6 shadow-sm";

/** Form dialog variant (no card, just gap). */
export const FORM_DIALOG_CLASS = "flex flex-col gap-6";

/** Form section heading (default variant). */
export const FORM_HEADING_CLASS =
  "font-serif text-base font-semibold tracking-tight text-foreground";

/** Form section description. */
export const FORM_DESCRIPTION_CLASS =
  "mt-1 text-sm leading-relaxed text-muted-foreground";

/** Form field spacing wrapper. */
export const FORM_FIELD_SPACE = "space-y-2";

/** Form actions border + padding. */
export const FORM_ACTIONS_CLASS =
  "flex flex-wrap gap-3 border-t border-border/80 pt-6";

/** Primary submit button (height + rounding). */
export const FORM_BUTTON_CLASS = "h-10 rounded-lg px-5 text-sm font-medium";

/** Action button in a disabled/locked state (blurred UI): muted, reduced opacity, non-interactive. */
export const ACTION_BUTTON_DISABLED_BLUR_CLASS =
  "cursor-not-allowed text-muted-foreground opacity-60";
