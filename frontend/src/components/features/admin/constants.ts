/**
 * Shared UI constants for management UIs (Admin + QA Manager).
 * Aligned with app design system (config/design) for consistency with Staff pages.
 * List tables: use MANAGEMENT_PAGE_SIZE and formatManagementShowingRange for standardization.
 *
 * Design scale (config/design.ts):
 * - Borders: /40 divider, /55 card, /80 input
 * - Muted bg: /[0.03] toolbar, /[0.05] header, /[0.06] hover, /[0.10] row hover
 * - Primary: /[0.06] hover, /[0.08] ring, /30 border hover, /80 focus
 * - Text: muted-foreground/80 hint; foreground/78 header, /88 secondary
 * - Transitions: duration-300 card hover, 360ms modals (design.ts)
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
  TYPO_BODY_SM,
  TYPO_CAPTION_XS,
  TYPO_LEAD,
  MGMT_BORDER_CARD,
  MGMT_BORDER_DIVIDER,
  MGMT_BORDER_ROW,
  MGMT_BG_TOOLBAR,
  MGMT_BG_TABLE_HEAD,
  MGMT_BG_ROW_HOVER,
  MGMT_DIVIDE,
  SKELETON_BG_SUBTLE,
  SKELETON_BG_MEDIUM,
  SKELETON_BG_STRONG,
  SKELETON_BG_INPUT,
} from "@/config/design";

/** Re-export from design for management forms. */
export {
  FORM_OUTLINE_BUTTON_CLASS,
  SKELETON_BG_SUBTLE,
  SKELETON_BG_MEDIUM,
  SKELETON_BG_STRONG,
  SKELETON_BG_INPUT,
};

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
  `flex flex-wrap items-center justify-between gap-3 min-h-12 border-b px-4 py-3.5 sm:px-6 ${MGMT_BORDER_DIVIDER} ${MGMT_BG_TOOLBAR}`;

/** Management card wrapper (table card). Uses shared CARD_CLASS. */
export const MANAGEMENT_CARD_CLASS = `overflow-hidden ${CARD_CLASS} py-0`;

/** Unified card — refined, academic. Aligned with layout scale. */
export const UNIFIED_CARD_CLASS =
  `overflow-hidden rounded-xl border bg-background shadow-[var(--shadow-card-subtle)] transition-shadow duration-200 ${MGMT_BORDER_CARD}`;

/** Unified card toolbar — minimal, refined. */
export const UNIFIED_CARD_TOOLBAR_CLASS =
  `flex justify-between items-center gap-4 border-b px-6 py-4 ${MGMT_BORDER_DIVIDER} ${MGMT_BG_TOOLBAR}`;

/** Unified search input — design: border/80, ring /[0.08]. */
export const UNIFIED_SEARCH_INPUT_CLASS =
  "h-9 w-full rounded-xl border border-border/80 bg-muted/[0.03] py-2.5 pl-10 pr-11 font-sans text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-colors duration-200 focus:border-primary/80 focus:bg-background focus:ring-1 focus:ring-primary/[0.08] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden";

/** Sculpted modal overlay (matches TR_OVERLAY 360ms). */
export const DIALOG_OVERLAY_SCULPTED_CLASS =
  "!bg-overlay-modal backdrop-blur-md duration-[360ms]";

/** Sculpted modal panel (elegant, academic). */
export const DIALOG_CONTENT_SCULPTED_CLASS =
  `flex flex-col gap-6 max-h-[90vh] overflow-y-auto rounded-2xl border bg-background p-6 shadow-[var(--shadow-dialog)] sm:max-w-lg ${MGMT_BORDER_CARD}`;

/** Sculpted modal panel (wider, e.g. proposal cycle form). */
export const DIALOG_CONTENT_SCULPTED_CLASS_LG =
  `flex flex-col gap-6 max-h-[90vh] overflow-y-auto rounded-2xl border bg-background p-6 shadow-[var(--shadow-dialog)] sm:max-w-2xl ${MGMT_BORDER_CARD}`;

/** Dialog content (standard width). */
export const DIALOG_CONTENT_CLASS =
  `max-h-[90vh] overflow-y-auto ${CARD_CLASS} sm:max-w-lg`;

/** Dialog content (wider, e.g. proposal cycle form). */
export const DIALOG_CONTENT_CLASS_LG =
  `max-h-[90vh] overflow-y-auto ${CARD_CLASS} sm:max-w-2xl`;

/** Dialog content (narrower, e.g. edit user). */
export const DIALOG_CONTENT_CLASS_SM =
  `max-h-[90vh] overflow-y-auto ${CARD_CLASS} sm:max-w-md`;

/** Dialog header wrapper. */
export const DIALOG_HEADER_CLASS =
  `space-y-1.5 text-left border-b pb-4 ${MGMT_BORDER_DIVIDER}`;

/** Sculpted dialog header (balanced rhythm, refined). */
export const DIALOG_HEADER_SCULPTED_CLASS =
  `space-y-1.5 text-left border-b pb-6 ${MGMT_BORDER_DIVIDER}`;

/** Dialog title (aligned with PAGE_TITLE typography). */
export const DIALOG_TITLE_CLASS = "font-sans text-2xl font-semibold tracking-tight text-foreground";

/** Sculpted dialog title (Greenwich brand). */
export const DIALOG_TITLE_SCULPTED_CLASS = "text-xl font-semibold text-primary";

/** Dialog description. */
export const DIALOG_DESCRIPTION_CLASS = `text-muted-foreground ${TYPO_LEAD}`;

/** Sculpted dialog description. */
export const DIALOG_DESCRIPTION_SCULPTED_CLASS = TYPO_BODY_SM;

/** Table header cell (data columns). Design: foreground/78 header. */
export const TABLE_HEAD_CELL_CLASS =
  "px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-foreground/78";

/** Table header cell for Actions column (right-aligned). */
export const TABLE_HEAD_CELL_ACTIONS_CLASS =
  "min-w-[5.5rem] px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-foreground/78";

/** Min-width for Actions column (2 icon buttons, e.g. Edit + Delete). */
export const TABLE_ACTIONS_MIN_W_2 = "min-w-[5.5rem]";

/** Min-width for Actions column (3 icon buttons). */
export const TABLE_ACTIONS_MIN_W_3 = "min-w-[6rem]";

/** Min-width for Actions column (4 icon buttons, e.g. Edit + Activate + Lock + Delete). */
export const TABLE_ACTIONS_MIN_W_4 = "min-w-[7.5rem]";

/** Actions column cell (padding + right align). */
export const TABLE_ACTIONS_CELL_CLASS = "px-6 py-4 text-right";

/** Pagination footer (minimal, aligned with table). */
export const PAGINATION_FOOTER_CLASS =
  `flex items-center justify-end border-t px-4 py-3 sm:px-6 ${MGMT_BORDER_DIVIDER} ${MGMT_BG_TOOLBAR}`;

/** "Showing X–Y of Z" badge inside search input. Design: muted-foreground/80. */
export const SHOWING_RANGE_BADGE_CLASS =
  `pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center rounded border bg-muted/[0.06] px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground/80 sm:inline-flex ${MGMT_BORDER_CARD}`;

// ─── Editorial Page Header (Breadcrumb + Title + Actions) ─────────────────────

/** Ghost-style breadcrumb (uppercase, subtle, academic). */
export const BREADCRUMB_GHOST_CLASS = TYPO_CAPTION_XS;

/** Breadcrumb separator: design scale muted-foreground/80. */
export const BREADCRUMB_SEP_CLASS = "text-muted-foreground/80 mx-2";

/** Main page title (refined, academic). */
export const PAGE_TITLE_HIGH_END_CLASS =
  "font-sans text-3xl font-semibold tracking-tight text-foreground";

/** Subtitle below title (muted, relaxed). */
export const PAGE_SUBTITLE_CLASS = TYPO_LEAD;

/** Page header wrapper: flex layout, mb-8. */
export const MANAGEMENT_PAGE_HEADER_CLASS =
  "mb-8 flex justify-between items-end pl-6 pr-4 sm:pr-6";

/** Loading / empty state cell (centered, padded). */
export const TABLE_LOADING_CELL_CLASS =
  `flex items-center justify-center px-6 py-20 ${TYPO_BODY_SM}`;

/** Empty table message cell (typography for children). */
export const TABLE_EMPTY_CELL_CLASS =
  `px-6 py-20 text-center sm:px-6 ${TYPO_BODY_SM}`;

/** Skeleton: divide between rows. */
export const SKELETON_DIVIDE_CLASS = MGMT_DIVIDE;

// ─── Dashboard & Profile (aligned with Academic Years) ────────────────────

/** Dashboard stat card — refined, primary top accent. */
export const DASHBOARD_STAT_CARD_CLASS =
  `overflow-hidden rounded-xl border bg-background shadow-[var(--shadow-card-subtle)] border-t-[1px] border-t-primary/12 px-6 py-4 ${MGMT_BORDER_CARD}`;

/** Dashboard/Profile module or content card — matches UNIFIED_CARD. */
export const DASHBOARD_CARD_CLASS = UNIFIED_CARD_CLASS;

/** Section header bar (Dashboard/Profile cards) — refined. */
export const SECTION_HEADER_BAR_CLASS =
  `border-b px-6 py-4 ${MGMT_BORDER_DIVIDER} ${MGMT_BG_TOOLBAR}`;

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

/** Profile section header — refined, aligned with toolbar. */
export const PROFILE_SECTION_HEADER_CLASS =
  `flex items-center justify-between gap-4 px-8 py-5 border-b ${MGMT_BORDER_DIVIDER}`;

/** Profile header action button — primary filled. */
export const PROFILE_HEADER_BUTTON_CLASS =
  "h-9 shrink-0 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground shadow-[var(--shadow-card-subtle)] transition-all duration-200 hover:bg-primary/95";

/** Profile section title — subtle, icon + text. Design: muted-foreground/80. */
export const PROFILE_SECTION_TITLE_CLASS =
  "flex items-center gap-2.5 text-sm font-medium text-muted-foreground/80";

/** Profile form item — group + min-w-0. */
export const PROFILE_FORM_ITEM_CLASS = "group min-w-0";

/** Profile form label — design: muted-foreground/80. Cursor pointer for label→control association. */
export const PROFILE_LABEL_CLASS =
  "cursor-pointer text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 transition-colors duration-200 group-focus-within:text-primary";

/** Profile input — matches FORM_DIALOG_INPUT. Design: border/80. */
export const PROFILE_INPUT_CLASS =
  "h-11 w-full rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/80 text-sm transition-colors duration-200 hover:border-primary/30 focus:border-primary/80 focus:ring-1 focus:ring-primary/[0.08] focus:bg-background aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10";

/** Profile select trigger — matches input. */
export const PROFILE_SELECT_TRIGGER_CLASS =
  "!h-11 w-full min-w-0 rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors duration-200 outline-none hover:border-primary/30 focus-visible:border-primary/80 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate data-[placeholder]:text-muted-foreground/80";

/** Profile password toggle button — matches primary hover. */
export const PROFILE_PASSWORD_TOGGLE_CLASS =
  "absolute right-0 top-0 h-full px-3 text-muted-foreground transition-colors duration-200 hover:bg-primary/[0.04] hover:text-primary/80";

/** Profile password field wrapper — group so input shows hover when toggle is hovered. */
export const PROFILE_PASSWORD_FIELD_WRAPPER_CLASS = "group/field relative";

/** Profile optional hint — matches FORM_DIALOG_HINT. */
export const PROFILE_OPTIONAL_CLASS =
  "ml-1.5 font-normal normal-case text-muted-foreground/80";

/** Profile primary button — matches FORM_BUTTON. */
export const PROFILE_BUTTON_CLASS = FORM_SUBMIT_BUTTON_CLASS;

/** Profile outline button — matches FORM_OUTLINE_BUTTON. */
export const PROFILE_OUTLINE_BUTTON_CLASS = FORM_OUTLINE_BUTTON_CLASS;

/** Profile avatar. Design: border/55, primary/[0.10]. */
export const PROFILE_AVATAR_CLASS =
  "size-20 sm:size-24 rounded-full border border-border/55 bg-primary/[0.10]";

/** Profile avatar fallback — matches navbar (primary accent). */
export const PROFILE_AVATAR_FALLBACK_CLASS =
  "rounded-full bg-primary/[0.10] text-primary text-lg font-medium";

/** Profile form vertical spacing — generous, calm. */
export const PROFILE_FORM_FIELD_GAP = "gap-6";
export const PROFILE_FORM_FIELD_STACK = "space-y-6";

/** Profile load/block error (simpler, no accent). */
export const PROFILE_ERROR_CLASS = DESTRUCTIVE_INLINE_CLASS;

/** Profile inline outline button (Edit modal Cancel). Design: border/80. */
export const PROFILE_SM_OUTLINE_CLASS =
  "h-8 rounded-xl border border-border/80 px-3 text-sm font-medium transition-colors duration-200 hover:bg-muted/[0.06] hover:border-primary/30";

/** Profile inline primary button (Edit modal Save). */
export const PROFILE_SM_PRIMARY_CLASS =
  "h-8 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/95";

/** Profile Edit button (ghost, next to display name). */
export const PROFILE_EDIT_BUTTON_CLASS =
  "h-8 shrink-0 gap-1.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-primary/[0.06] hover:text-primary";

/** Form default wrapper (card style when not in dialog). */
export const FORM_CARD_CLASS = `flex flex-col gap-6 ${CARD_CLASS} px-6 py-6`;

/** Form dialog variant (no card, just gap). */
export const FORM_DIALOG_CLASS = "flex flex-col gap-6";

/** Form section heading (default variant) — slightly smaller than section titles. */
export const FORM_HEADING_CLASS = "font-sans text-base font-semibold tracking-tight text-foreground";

/** Form section description (aligned with SECTION_CARD_DESCRIPTION_CLASS). */
export const FORM_DESCRIPTION_CLASS = `mt-2 ${SECTION_CARD_DESCRIPTION_CLASS}`;

/** Form label (aligned with SECTION_LABEL_CLASS). */
export const FORM_LABEL_CLASS = SECTION_LABEL_CLASS;

/** Form field spacing wrapper. */
export const FORM_FIELD_SPACE = "space-y-2";

/** Form actions border + padding — Cancel left, primary right. */
export const FORM_ACTIONS_CLASS =
  `flex flex-wrap justify-end gap-3 border-t pt-6 ${MGMT_BORDER_DIVIDER}`;

/** Form actions in dialog — same as FORM_ACTIONS_CLASS. */
export const FORM_ACTIONS_DIALOG_CLASS = FORM_ACTIONS_CLASS;

/** Primary submit button (aligned with design FORM_SUBMIT_BUTTON_CLASS). */
export const FORM_BUTTON_CLASS = FORM_SUBMIT_BUTTON_CLASS;

/** Toolbar Add/Cancel button — h-8, refined. */
export const TOOLBAR_ADD_BUTTON_BASE_CLASS =
  "h-8 shrink-0 rounded-lg cursor-pointer gap-2 px-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]";

/** Toolbar Add button — primary variant when not toggled. */
export const TOOLBAR_ADD_BUTTON_PRIMARY_CLASS =
  "bg-primary text-primary-foreground shadow-[var(--shadow-card-subtle)] hover:bg-primary/95";

/** Inline destructive/error block (form validation). */
/** Form/block error (left accent). Subtle fade-in when shown. */
export const FORM_ERROR_BLOCK_CLASS =
  `${DESTRUCTIVE_INLINE_ACCENT_CLASS} animate-in fade-in-0 duration-200`;

// ─── Dialog form (Academic Year standard — sculpted popups) ───────────────────

/** Dialog form wrapper — space-y-6. */
export const FORM_DIALOG_FORM_CLASS = "space-y-6";

/** Dialog label — uppercase, subtle. Design: muted-foreground/80 hint. Cursor pointer for label→control association. */
export const FORM_DIALOG_LABEL_CLASS =
  "cursor-pointer text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 transition-colors duration-200 group-focus-within:text-primary";

/** Dialog input — h-11, refined hover/focus. Design: border/80 input. */
export const FORM_DIALOG_INPUT_CLASS =
  "h-11 w-full rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/80 text-sm transition-colors duration-200 hover:border-primary/30 focus:border-primary/80 focus:ring-1 focus:ring-primary/[0.08] focus:bg-background aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10";

/** Card input — h-10, same focus/hover as dialog. */
export const FORM_CARD_INPUT_CLASS =
  "h-10 w-full rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/80 text-sm transition-colors duration-200 hover:border-primary/30 focus:border-primary/80 focus:ring-1 focus:ring-primary/[0.08] focus:bg-background aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10";

/** DatePicker/DateTimePicker trigger — matches proposal-cycles. Use for academic-years, profile. Design: h-11, border/80. */
export const DATE_PICKER_INPUT_CLASS =
  "h-11 w-full rounded-xl border border-border/80 bg-background text-foreground text-sm transition-colors duration-200 hover:border-primary/30 focus:border-primary/80 focus:ring-1 focus:ring-primary/[0.08] focus:bg-background aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10";

/** Dialog field wrapper — group + min-w-0 for truncation. */
export const FORM_DIALOG_FIELD_WRAPPER_CLASS = "group min-w-0 space-y-2";

/** Field-level error message — subtle, precise. */
export const FORM_FIELD_ERROR_CLASS = "text-xs leading-relaxed text-destructive/95";

/** Dialog field error — same as FORM_FIELD_ERROR_CLASS (normalized). */
export const FORM_DIALOG_ERROR_CLASS = FORM_FIELD_ERROR_CLASS;

/** Dialog root error — subtle text. */
export const FORM_DIALOG_ROOT_ERROR_CLASS = FORM_FIELD_ERROR_CLASS;

/** Dialog hint/helper text — subtle. */
export const FORM_DIALOG_HINT_CLASS =
  "text-xs leading-relaxed text-muted-foreground/80";

/** Default (card) hint/helper text — matches dialog. */
export const FORM_HINT_CLASS =
  "text-xs leading-relaxed text-muted-foreground/80";

/** QA Coordinator conflict — backend rejects when department already has one. */
export const QA_COORDINATOR_CONFLICT_MESSAGE =
  "This department already has a QA Coordinator.";

/** Duplicate email — backend rejects when email already exists. */
export const EMAIL_ALREADY_EXISTS_MESSAGE =
  "Email already in use.";

/** Duplicate department name — backend rejects when name already exists. */
export const DEPARTMENT_NAME_EXISTS_MESSAGE =
  "Name already in use.";

/** Dialog Select trigger — matches input. Design: border/80. */
export const FORM_DIALOG_SELECT_TRIGGER_CLASS =
  "!h-11 w-full min-w-0 rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors duration-200 outline-none hover:border-primary/30 focus-visible:border-primary/80 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate data-[placeholder]:text-muted-foreground/80";

/** Extends input hover to full field when inside group (e.g. password + toggle). */
export const PROFILE_INPUT_GROUP_HOVER_CLASS = "group-hover/field:border-primary/30";

/** Card Select trigger — h-10, matches input. */
export const FORM_CARD_SELECT_TRIGGER_CLASS =
  "!h-10 w-full min-w-0 rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors duration-200 outline-none hover:border-primary/30 focus-visible:border-primary/80 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate data-[placeholder]:text-muted-foreground/80";

/** Checkbox in Role Manager — refined focus/hover (sync with Academic input). */
export const FORM_CHECKBOX_ACADEMIC_CLASS =
  "transition-colors duration-200 hover:border-primary/30 focus-visible:border-primary/80 focus-visible:ring-2 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-2";

/** ScrollArea for categories list (proposal cycles) — design: border-border/80. */
export const FORM_CATEGORIES_SCROLL_AREA_CLASS =
  "h-40 overflow-hidden rounded-lg border border-border/80 px-3 py-2";

/** Focus ring for links and cards (management). */
export const MANAGEMENT_FOCUS_RING_CLASS = FOCUS_RING_CLASS;

/** Action button in a disabled/locked state. Design: muted-foreground/80. */
export const ACTION_BUTTON_DISABLED_BLUR_CLASS =
  "cursor-not-allowed text-muted-foreground/80 opacity-50";

// ─── Table body ──────────────────────────────────────────────────────────────

/** Table base wrapper (full width, collapse borders, left-aligned). */
export const TABLE_BASE_CLASS =
  "w-full border-collapse font-sans text-left text-sm";

/** Table header row — subtle. */
export const TABLE_HEAD_ROW_CLASS =
  `border-b ${MGMT_BORDER_DIVIDER} ${MGMT_BG_TABLE_HEAD}`;

/** Table body row — minimal borders, refined hover. */
export const TABLE_ROW_CLASS =
  `border-b bg-background transition-colors duration-200 last:border-b-0 ${MGMT_BORDER_ROW} ${MGMT_BG_ROW_HOVER}`;

/** Table data cell (secondary column). Design: /85 secondary. */
export const TABLE_CELL_CLASS =
  "px-6 py-4 text-sm text-foreground/88 sm:px-6";

/** Table data cell (name / primary column). Design: /95 primary. */
export const TABLE_CELL_NAME_CLASS =
  "px-6 py-4 font-sans text-sm font-medium text-foreground/92";

/** Table data cell (status column — padding only, badge has its own styling). */
export const TABLE_CELL_STATUS_CLASS = "px-6 py-4";

// ─── Action buttons ──────────────────────────────────────────────────────────

/** Base action icon button (shared size, shrink, refined transition). Aligned with HOVER_TRANSITION_NAV. */
const ACTION_BTN_BASE = "inline-flex size-8 shrink-0 items-center justify-center rounded-full p-2 transition-colors duration-200 ease-out";

/** Edit action. Design: /80 at rest, /[0.08] hover. */
export const ACTION_BUTTON_EDIT_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-primary/80 hover:bg-primary/[0.08] hover:text-primary`;

/** Destructive/delete action. */
export const ACTION_BUTTON_DESTRUCTIVE_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-destructive/80 hover:bg-destructive/[0.08] hover:text-destructive`;

/** Warning/deactivate action. */
export const ACTION_BUTTON_WARNING_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-warning/80 hover:bg-warning/[0.08] hover:text-warning`;

/** Success/activate action. */
export const ACTION_BUTTON_SUCCESS_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-success/80 hover:bg-success/[0.08] hover:text-success`;

/** Muted action. Design: muted/80, hover /[0.06]. */
export const ACTION_BUTTON_MUTED_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-muted-foreground/80 hover:bg-muted/[0.06] hover:text-foreground`;

/** Lock action. */
export const ACTION_BUTTON_LOCK_CLASS =
  `${ACTION_BTN_BASE} cursor-pointer text-info/80 hover:bg-info/[0.08] hover:text-info`;

/** Inline actions wrapper (right-aligned, gap — matches Academic Years). */
export const TABLE_ACTIONS_WRAPPER_CLASS =
  "inline-flex items-center justify-end gap-0.5";

// ─── Status badges (Academic Years source of truth — subtle pill style) ───────

/** Status badges — unified: border /15, bg /[0.06], text /90. */
export const STATUS_BADGE_ACTIVE_CLASS =
  "inline-flex rounded-full border border-success/15 bg-success/[0.06] px-2.5 py-0.5 text-xs font-medium text-success/90";
export const STATUS_BADGE_INACTIVE_CLASS =
  "inline-flex rounded-full border border-border/40 bg-muted/[0.04] px-2.5 py-0.5 text-xs font-medium text-muted-foreground/80";
export const STATUS_BADGE_ACTIVE_WARM_CLASS =
  "inline-flex rounded-full border border-warning/15 bg-warning/[0.06] px-2.5 py-0.5 text-xs font-medium text-warning/90";
export const STATUS_BADGE_CLOSED_CLASS =
  "inline-flex rounded-full border border-destructive/15 bg-destructive/[0.06] px-2.5 py-0.5 text-xs font-medium text-destructive/90";

/** AlertDialog error message — subtle. */
export const ALERT_DIALOG_ERROR_CLASS =
  "mt-2 block text-xs leading-relaxed text-destructive/95";
