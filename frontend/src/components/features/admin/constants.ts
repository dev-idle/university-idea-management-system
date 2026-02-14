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
  FORM_OUTLINE_BUTTON_CLASS,
  DESTRUCTIVE_INLINE_ACCENT_CLASS,
  DESTRUCTIVE_INLINE_CLASS,
  FOCUS_RING_CLASS,
  STATUS_BADGE_WARNING_CLASS,
  TYPO_BODY_SM,
  TYPO_HEADING_SM,
  TYPO_LEAD,
} from "@/config/design";

/** Re-export outline button class from design for management forms. */
export { FORM_OUTLINE_BUTTON_CLASS };

/** Page size for all Role Manager list tables (Admin + QA Manager). Not used by Staff. */
export const MANAGEMENT_PAGE_SIZE = 7;

/** Show pagination footer only when total items exceed this (e.g. 8+ with size 7 → "Previous 1 Next"). */
export const MANAGEMENT_PAGINATION_MIN_TOTAL = 8;

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

/** Unified card — minimal, refined, stands out. */
export const UNIFIED_CARD_CLASS =
  "overflow-hidden rounded-xl border border-border/80 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200";

/** Unified card toolbar — minimal bar. */
export const UNIFIED_CARD_TOOLBAR_CLASS =
  "flex justify-between items-center gap-4 border-b border-border/60 bg-muted/[0.04] px-6 py-4";

/** Unified search input — matches Academic Years exactly. */
export const UNIFIED_SEARCH_INPUT_CLASS =
  "h-9 w-full rounded-lg border border-border bg-muted/[0.05] py-2.5 pl-10 pr-11 font-sans text-sm text-foreground placeholder:text-muted-foreground/90 outline-none transition-all duration-200 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden";

/** Sculpted modal overlay (depth, cinematic separation). */
export const DIALOG_OVERLAY_SCULPTED_CLASS =
  "!bg-overlay-modal backdrop-blur-md duration-300";

/** Sculpted modal panel (refined, Greenwich brand). */
export const DIALOG_CONTENT_SCULPTED_CLASS =
  "flex flex-col gap-6 max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl shadow-black/20 sm:max-w-lg";

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

/** Sculpted dialog header (balanced rhythm). */
export const DIALOG_HEADER_SCULPTED_CLASS =
  "space-y-1.5 text-left border-b border-border/60 pb-6";

/** Dialog title (aligned with PAGE_TITLE typography). */
export const DIALOG_TITLE_CLASS = "font-sans text-2xl font-semibold tracking-tight text-foreground";

/** Sculpted dialog title (Greenwich brand). */
export const DIALOG_TITLE_SCULPTED_CLASS = "text-xl font-semibold text-primary";

/** Dialog description. */
export const DIALOG_DESCRIPTION_CLASS = `text-muted-foreground ${TYPO_LEAD}`;

/** Sculpted dialog description. */
export const DIALOG_DESCRIPTION_SCULPTED_CLASS = TYPO_BODY_SM;

/** Table header cell (data columns) — clean white, high contrast. */
export const TABLE_HEAD_CELL_CLASS =
  "px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground/90";

/** Table header cell for Actions column (right-aligned). */
export const TABLE_HEAD_CELL_ACTIONS_CLASS =
  "min-w-[5.5rem] px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-foreground/90";

/** Min-width for Actions column (2 icon buttons, e.g. Edit + Delete). */
export const TABLE_ACTIONS_MIN_W_2 = "min-w-[5.5rem]";

/** Min-width for Actions column (3 icon buttons). */
export const TABLE_ACTIONS_MIN_W_3 = "min-w-[6rem]";

/** Actions column cell (padding + right align). */
export const TABLE_ACTIONS_CELL_CLASS = "px-6 py-4 text-right";

/** Pagination footer (minimal, aligned with table). */
export const PAGINATION_FOOTER_CLASS =
  "flex items-center justify-end border-t border-border bg-muted/[0.05] px-4 py-3 sm:px-6";

// ─── Editorial Page Header (Breadcrumb + Title + Actions) ─────────────────────

/** Ghost-style breadcrumb (uppercase, subtle). */
export const BREADCRUMB_GHOST_CLASS =
  "text-[11px] font-medium text-muted-foreground uppercase tracking-widest";

/** Breadcrumb separator: delicate. */
export const BREADCRUMB_SEP_CLASS = "text-muted-foreground/50 mx-2";

/** Main page title (Geist Sans, high-end). */
export const PAGE_TITLE_HIGH_END_CLASS =
  "text-3xl font-bold text-foreground tracking-tight";

/** Subtitle below title. */
export const PAGE_SUBTITLE_CLASS = "text-[14px] text-muted-foreground font-normal";

/** Page header wrapper: flex layout, mb-8. */
export const MANAGEMENT_PAGE_HEADER_CLASS =
  "mb-8 flex justify-between items-end pl-6 pr-4 sm:pr-6";

/** Loading state wrapper (centered spinner + text — Academic Years source of truth). */
export const LOADING_STATE_WRAPPER_CLASS =
  "flex items-center justify-center py-24";

/** Loading state content (spinner + label). */
export const LOADING_STATE_CONTENT_CLASS =
  "flex flex-col items-center gap-4";

/** Loading spinner. */
export const LOADING_SPINNER_CLASS =
  "h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary";

/** Loading / empty state cell (centered, padded). */
export const TABLE_LOADING_CELL_CLASS =
  `flex items-center justify-center px-6 py-20 ${TYPO_BODY_SM}`;

/** Empty table message cell. */
export const TABLE_EMPTY_CELL_CLASS =
  `px-6 py-20 text-center sm:px-6`;

// ─── Dashboard & Profile (aligned with Academic Years) ────────────────────

/** Dashboard stat card — minimal, primary top accent. */
export const DASHBOARD_STAT_CARD_CLASS =
  "overflow-hidden rounded-xl border border-border/80 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-t-[1px] border-t-primary/25 px-6 py-4";

/** Dashboard/Profile module or content card — matches UNIFIED_CARD. */
export const DASHBOARD_CARD_CLASS = UNIFIED_CARD_CLASS;

/** Section header bar (Dashboard/Profile cards) — matches Academic toolbar. */
export const SECTION_HEADER_BAR_CLASS =
  "border-b border-border bg-muted/[0.06] px-6 py-4";

// ─── Profile (aligned with Academic Year, User — shared color scale) ──────────

/** Profile page container — generous whitespace. */
export const PROFILE_PAGE_CLASS = "space-y-12";

/** Profile identity section — matches UNIFIED_CARD. */
export const PROFILE_IDENTITY_CARD_CLASS =
  `${UNIFIED_CARD_CLASS} px-8 py-10`;

/** Profile display name — matches Academic/User typography. */
export const PROFILE_DISPLAY_NAME_CLASS =
  "font-sans text-xl font-medium tracking-tight text-foreground sm:text-2xl";

/** Profile metadata — matches TYPO_BODY_SM. */
export const PROFILE_METADATA_CLASS =
  "text-sm leading-relaxed text-muted-foreground";

/** Profile section card — matches UNIFIED_CARD. */
export const PROFILE_SECTION_CARD_CLASS = `${UNIFIED_CARD_CLASS} py-0`;

/** Profile section header — minimal, aligned with toolbar. */
export const PROFILE_SECTION_HEADER_CLASS =
  "flex items-center justify-between gap-4 px-8 py-5 border-b border-border/60";

/** Profile header action button — primary filled, stands out. */
export const PROFILE_HEADER_BUTTON_CLASS =
  "h-9 shrink-0 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground shadow-sm shadow-primary/5 transition-all duration-150 hover:bg-primary/90";

/** Profile section title — subtle, slightly larger, icon + text. */
export const PROFILE_SECTION_TITLE_CLASS =
  "flex items-center gap-2.5 text-base font-medium text-muted-foreground";

/** Profile form item — group + min-w-0. */
export const PROFILE_FORM_ITEM_CLASS = "group min-w-0";

/** Profile form label — matches FORM_DIALOG_LABEL (focus accent). */
export const PROFILE_LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-wider text-foreground/90 transition-colors duration-150 group-focus-within:text-primary";

/** Profile input — matches FORM_DIALOG_INPUT (Academic Year). */
export const PROFILE_INPUT_CLASS =
  "h-11 w-full rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/90 text-sm transition-colors duration-150 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-card aria-[invalid=true]:border-destructive";

/** Profile select trigger — matches FORM_DIALOG_SELECT_TRIGGER. */
export const PROFILE_SELECT_TRIGGER_CLASS =
  "!h-11 w-full min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none hover:border-primary/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate data-[placeholder]:text-muted-foreground/90";

/** Profile password toggle button — matches primary hover. */
export const PROFILE_PASSWORD_TOGGLE_CLASS =
  "absolute right-0 top-0 h-full px-3 text-muted-foreground transition-colors duration-150 hover:bg-primary/5 hover:text-primary/80";

/** Profile password field wrapper — group so input shows hover when toggle is hovered. */
export const PROFILE_PASSWORD_FIELD_WRAPPER_CLASS = "group/field relative";

/** Profile optional hint — matches FORM_DIALOG_HINT. */
export const PROFILE_OPTIONAL_CLASS =
  "ml-1.5 font-normal normal-case text-muted-foreground/90";

/** Profile primary button — matches FORM_BUTTON. */
export const PROFILE_BUTTON_CLASS = FORM_SUBMIT_BUTTON_CLASS;

/** Profile outline button — matches FORM_OUTLINE_BUTTON. */
export const PROFILE_OUTLINE_BUTTON_CLASS = FORM_OUTLINE_BUTTON_CLASS;

/** Profile avatar — matches icon box (primary tint). */
export const PROFILE_AVATAR_CLASS =
  "size-20 sm:size-24 rounded-full border border-border/60 bg-primary/10";

/** Profile avatar fallback — matches navbar (primary accent). */
export const PROFILE_AVATAR_FALLBACK_CLASS =
  "rounded-full bg-primary/10 text-primary text-lg font-medium";

/** Profile form vertical spacing — generous, calm. */
export const PROFILE_FORM_FIELD_GAP = "gap-6";
export const PROFILE_FORM_FIELD_STACK = "space-y-6";

/** Profile load/block error (simpler, no accent). */
export const PROFILE_ERROR_CLASS = DESTRUCTIVE_INLINE_CLASS;

/** Profile inline outline button (Edit modal Cancel). */
export const PROFILE_SM_OUTLINE_CLASS =
  "h-8 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted/10";

/** Profile inline primary button (Edit modal Save). */
export const PROFILE_SM_PRIMARY_CLASS =
  "h-8 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

/** Profile Edit button (ghost, next to display name). */
export const PROFILE_EDIT_BUTTON_CLASS =
  "h-8 shrink-0 gap-1.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary";

/** Form label (aligned with SECTION_LABEL_CLASS). */
export const FORM_LABEL_CLASS = SECTION_LABEL_CLASS;

/** Form default wrapper (card style when not in dialog). */
export const FORM_CARD_CLASS = `flex flex-col gap-6 ${CARD_CLASS} px-6 py-6`;

/** Form dialog variant (no card, just gap). */
export const FORM_DIALOG_CLASS = "flex flex-col gap-6";

/** Form section heading (default variant) — slightly smaller than section titles. */
export const FORM_HEADING_CLASS = "font-sans text-base font-semibold tracking-tight text-foreground";

/** Form section description (aligned with SECTION_CARD_DESCRIPTION_CLASS). */
export const FORM_DESCRIPTION_CLASS = `mt-2 ${SECTION_CARD_DESCRIPTION_CLASS}`;

/** Form field spacing wrapper. */
export const FORM_FIELD_SPACE = "space-y-2";

/** Form actions border + padding — Cancel left, primary right. */
export const FORM_ACTIONS_CLASS =
  "flex flex-wrap justify-end gap-3 border-t border-border/80 pt-6";

/** Form actions in dialog (slightly softer border). */
export const FORM_ACTIONS_DIALOG_CLASS =
  "flex flex-wrap justify-end gap-3 border-t border-border/60 pt-6";

/** Primary submit button (aligned with design FORM_SUBMIT_BUTTON_CLASS). */
export const FORM_BUTTON_CLASS = FORM_SUBMIT_BUTTON_CLASS;

/** Toolbar Add/Cancel button — h-8, refined. */
export const TOOLBAR_ADD_BUTTON_BASE_CLASS =
  "h-8 shrink-0 rounded-lg cursor-pointer gap-2 px-3 text-sm font-medium transition-all duration-150 active:scale-[0.98]";

/** Toolbar Add button — primary variant when not toggled. */
export const TOOLBAR_ADD_BUTTON_PRIMARY_CLASS =
  "bg-primary text-primary-foreground shadow-sm shadow-primary/5 hover:bg-primary/90";

/** Inline destructive/error block (form validation). */
export const FORM_ERROR_BLOCK_CLASS = DESTRUCTIVE_INLINE_ACCENT_CLASS;

// ─── Dialog form (Academic Year standard — sculpted popups) ───────────────────

/** Dialog form wrapper — space-y-6. */
export const FORM_DIALOG_FORM_CLASS = "space-y-6";

/** Dialog label — uppercase, semibold, dark gray, focus accent (Academic Year). */
export const FORM_DIALOG_LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-wider text-foreground/90 transition-colors duration-150 group-focus-within:text-primary";

/** Dialog input — h-11, white bg, ring-4 focus, hover (Academic Year). */
export const FORM_DIALOG_INPUT_CLASS =
  "h-11 w-full rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/90 text-sm transition-all hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-card aria-[invalid=true]:border-destructive";

/** Card input — h-10, same focus/hover as dialog (Role Manager card forms). */
export const FORM_CARD_INPUT_CLASS =
  "h-10 w-full rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/90 text-sm transition-all hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-card aria-[invalid=true]:border-destructive";

/** Dialog field wrapper — group + min-w-0 for truncation. */
export const FORM_DIALOG_FIELD_WRAPPER_CLASS = "group min-w-0 space-y-2";

/** Field-level error message — use for all input/select validation errors. */
export const FORM_FIELD_ERROR_CLASS = "text-xs text-destructive";

/** Dialog field error — same as FORM_FIELD_ERROR_CLASS (normalized). */
export const FORM_DIALOG_ERROR_CLASS = FORM_FIELD_ERROR_CLASS;

/** Dialog root error — simple text (Academic Year). */
export const FORM_DIALOG_ROOT_ERROR_CLASS = "text-xs text-destructive";

/** Dialog hint/helper text — medium gray, smaller. */
export const FORM_DIALOG_HINT_CLASS =
  "text-xs leading-relaxed text-muted-foreground/90";

/** Default (card) hint/helper text — matches dialog variant. */
export const FORM_HINT_CLASS =
  "text-xs leading-relaxed text-muted-foreground";

/** QA Coordinator conflict — backend rejects when department already has one. */
export const QA_COORDINATOR_CONFLICT_MESSAGE =
  "This department already has a QA Coordinator.";

/** Duplicate email — backend rejects when email already exists. */
export const EMAIL_ALREADY_EXISTS_MESSAGE =
  "Email already in use.";

/** Duplicate department name — backend rejects when name already exists. */
export const DEPARTMENT_NAME_EXISTS_MESSAGE =
  "Name already in use.";

/** Dialog Select trigger — matches input height, primary focus/hover (Academic Year). */
export const FORM_DIALOG_SELECT_TRIGGER_CLASS =
  "!h-11 w-full min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none hover:border-primary/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate data-[placeholder]:text-muted-foreground/90";

/** Extends input hover to full field when inside group (e.g. password + toggle). */
export const PROFILE_INPUT_GROUP_HOVER_CLASS = "group-hover/field:border-primary/30";

/** Card Select trigger — h-10, same focus/hover as dialog (Role Manager card forms). */
export const FORM_CARD_SELECT_TRIGGER_CLASS =
  "!h-10 w-full min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none hover:border-primary/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate data-[placeholder]:text-muted-foreground/90";

/** Checkbox in Role Manager — primary focus ring (sync with Academic input). */
export const FORM_CHECKBOX_ACADEMIC_CLASS =
  "transition-colors hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2";

/** Focus ring for links and cards (management). */
export const MANAGEMENT_FOCUS_RING_CLASS = FOCUS_RING_CLASS;

/** Action button in a disabled/locked state (blurred UI): muted, reduced opacity, non-interactive. */
export const ACTION_BUTTON_DISABLED_BLUR_CLASS =
  "cursor-not-allowed text-muted-foreground opacity-60";

// ─── Table body ──────────────────────────────────────────────────────────────

/** Table base wrapper (full width, collapse borders, left-aligned). */
export const TABLE_BASE_CLASS =
  "w-full border-collapse font-sans text-left text-sm";

/** Table header row — minimal, distinct. */
export const TABLE_HEAD_ROW_CLASS =
  "border-b border-border/50 bg-muted/20";

/** Table body row — minimal borders, clear hover. */
export const TABLE_ROW_CLASS =
  "border-b border-border/40 bg-background transition-colors duration-100 last:border-b-0 hover:bg-muted/15";

/** Table data cell (secondary column — lighter). */
export const TABLE_CELL_CLASS =
  "px-6 py-4 text-sm text-foreground/85 sm:px-6";

/** Table data cell (name / primary column — dark, bold). */
export const TABLE_CELL_NAME_CLASS =
  "px-6 py-4 font-sans text-sm font-medium text-foreground";

/** Table data cell (status column — padding only, badge has its own styling). */
export const TABLE_CELL_STATUS_CLASS = "px-6 py-4";

// ─── Action buttons ──────────────────────────────────────────────────────────

/** Base action icon button (shared size, shrink, transition). */
const ACTION_BTN_BASE = "inline-flex size-8 shrink-0 items-center justify-center rounded-full p-2 transition-all duration-300";

/** Edit action (primary accent). */
export const ACTION_BUTTON_EDIT_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-primary hover:bg-primary/10 hover:text-primary`;

/** Destructive/delete action. */
export const ACTION_BUTTON_DESTRUCTIVE_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-destructive/70 hover:bg-destructive/10 hover:text-destructive`;

/** Success/activate action. */
export const ACTION_BUTTON_SUCCESS_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary`;

/** Muted action (close, archive). */
export const ACTION_BUTTON_MUTED_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-muted-foreground hover:bg-primary/[0.03] hover:text-foreground`;

/** Inline actions wrapper (right-aligned, gap — matches Academic Years). */
export const TABLE_ACTIONS_WRAPPER_CLASS =
  "inline-flex items-center justify-end gap-0.5";

// ─── Status badges (Academic Years source of truth — subtle pill style) ───────

export const STATUS_BADGE_ACTIVE_CLASS =
  "inline-flex rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success";
export const STATUS_BADGE_INACTIVE_CLASS =
  "inline-flex rounded-full border border-border/60 bg-muted/20 px-2.5 py-0.5 text-xs font-medium text-muted-foreground";
export const STATUS_BADGE_CLOSED_CLASS = STATUS_BADGE_WARNING_CLASS;

/** AlertDialog error message. */
export const ALERT_DIALOG_ERROR_CLASS =
  "mt-2 block text-sm text-destructive";
