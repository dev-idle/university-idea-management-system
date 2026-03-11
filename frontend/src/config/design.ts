/**
 * Shared design tokens for the application (Staff + Role Managers).
 * Use for consistent, elegant, academic UI: cards, headers, spacing, typography.
 *
 * Quality: Prefer design tokens over ad-hoc values. Maintain refined borders,
 * subtle hovers, and consistent typography across all views.
 *
 * Color opacity scale (use consistently):
 * - Borders: /40 divider, /55 card/main, /80 input
 * - Muted bg: /[0.03] toolbar, /[0.04] badge, /[0.05] header, /[0.06] hover light, /[0.10] row hover
 * - Primary: /[0.06] hover, /[0.08] ring/focus, /[0.12] accent, /30 border, /55 card; ring unified to 0.08
 * - Text: foreground/78 header, /88 secondary, /92–95 primary; muted-foreground/80 hint
 * - Transitions: TR_* tokens (240ms modals, 260ms menus, no in-app nav fade)
 *
 * Typography scale (2026): Use tokens below — avoid ad-hoc text-[Npx].
 * - Caption: labels, metadata, overlines
 * - Body: default copy
 * - Lead: emphasized intro text
 * - Heading: titles (serif for editorial)
 * - Stat: dashboard numbers
 */

// ─── Typography Scale (use consistently; avoid raw text-[Npx]) ─────────────────

/** Caption / overline: labels, metadata, subtle context. */
export const TYPO_CAPTION =
  "text-xs text-muted-foreground";

/** Caption strong: section labels, uppercase overlines. */
export const TYPO_CAPTION_STRONG =
  "text-xs font-medium uppercase tracking-wider text-muted-foreground";

/** Body small: secondary copy, table cells, descriptions. */
export const TYPO_BODY_SM =
  "text-sm leading-relaxed text-muted-foreground";

/** Body: default body text. */
export const TYPO_BODY =
  "text-sm text-foreground";

/** Lead: larger intro or emphasized body (e.g. staff descriptions). */
export const TYPO_LEAD =
  "text-sm leading-relaxed text-muted-foreground";

/** Heading small: section titles, card titles (h3). */
export const TYPO_HEADING_SM =
  "font-sans text-lg font-semibold tracking-tight text-foreground";

/** Heading: page/section title (h1/h2). */
export const TYPO_HEADING =
  "font-sans text-2xl font-semibold tracking-tight text-foreground";

/** Heading large: main page title, responsive. */
export const TYPO_HEADING_LG =
  "font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl";

/** Stat base: dashboard numbers (omit color for semantic variants: info, success, destructive). */
export const TYPO_STAT_BASE = "text-2xl font-bold tabular-nums tracking-tight";

/** Stat: dashboard numbers, metrics (primary). */
export const TYPO_STAT = `${TYPO_STAT_BASE} text-primary`;

/** Stat subtle: refined dashboards, lighter weight. */
export const TYPO_STAT_SUBTLE =
  "text-xl font-semibold tabular-nums tracking-tight text-primary";

/** Stat base subtle: for semantic color variants (info, success, destructive). */
export const TYPO_STAT_BASE_SUBTLE =
  "text-xl font-semibold tabular-nums tracking-tight";

/** Stat coordinated: dashboard numbers — 1.2rem, font-semibold. Use for QA Manager/Coordinator. */
export const TYPO_STAT_COORD =
  "text-[1.2rem] font-semibold tabular-nums tracking-tight text-primary";

/** Stat base coordinated: semantic variants (info, success, destructive). */
export const TYPO_STAT_BASE_COORD =
  "text-[1.2rem] font-semibold tabular-nums tracking-tight";

/** Nav item: sidebar, breadcrumbs. */
export const TYPO_NAV =
  "text-sm font-medium";

/** Header breadcrumb + dashboard stat text (e.g. cycle name, academic year). 15px. */
export const TYPO_HEADER_AND_STAT_TEXT =
  "text-[15px]";

/** Label: form labels, badges, chips. */
export const TYPO_LABEL =
  "text-xs font-medium";

/** Caption extra-small: breadcrumbs, overlines, micro labels (academic). */
export const TYPO_CAPTION_XS =
  "text-[11px] font-medium uppercase tracking-wider text-muted-foreground";

/** Body compact: secondary copy, metadata, table cells (13px). */
export const TYPO_BODY_COMPACT =
  "text-[13px] leading-relaxed text-muted-foreground";

/** Table header cell. */
export const TYPO_TABLE_HEAD =
  "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

// ─── Legacy (mapped to typography scale; prefer tokens above) ──────────────────

/** Standard border opacities (use for consistency). */
export const BORDER_HAIRLINE = "border-border/20";
export const BORDER_SUBTLE = "border-border/40";
export const BORDER_MEDIUM = "border-border/60";
export const BORDER_STRONG = "border-border/80";

/** Standard divider / separator (vertical or horizontal). */
export const DIVIDER_CLASS = "bg-border/40";

// ─── Transitions (standardized, minimal) ────────────────────────────────────
//
// Strategy:
// - In-app nav (sidebar menu): No transition — instant
// - Standalone (login, 404, error): TR_PAGE_FADE — 360ms
// - Route loading (skeleton/spinner): TR_LOADING_FRAME — 200ms
// - Modals: 240ms | Menus: 260ms | Hover: 200–300ms

/** Modal/Dialog: 240ms — snappier open, fade only, no zoom. */
export const TR_MODAL =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-[240ms]";

/** Modal overlay only. */
export const TR_OVERLAY =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-[240ms]";

/** Sheet overlay: match modal. */
export const TR_SHEET_OVERLAY = TR_OVERLAY;

/** Sheet content: 380ms open, 280ms close — soft slide + fade. */
export const TR_SHEET_BASE =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-[380ms] data-[state=closed]:duration-[280ms]";

/** Popover/Dropdown/Select: 260ms — fade + whisper slide (1 unit). */
export const TR_MENU =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 duration-[260ms]";

/** Combobox: same as TR_MENU, data-open/data-closed. */
export const TR_MENU_OPEN_CLOSED =
  "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 duration-[260ms]";

/** Initial page fade — login, 404, loading spinner, error. NOT for in-app nav. */
export const TR_PAGE_FADE = "animate-in fade-in-0 duration-[360ms]";

/** Auth form panel content — smooth entrance when switching between login/forgot/reset. */
export const TR_AUTH_FORM_ENTRANCE =
  "animate-in fade-in-0 duration-[280ms] ease-out";

/** Route loading frame (skeleton/spinner) — 200ms, snappy for in-app nav. */
export const TR_LOADING_FRAME = "animate-in fade-in-0 duration-[200ms]";

/** Chart/content entrance — staggered reveal (420ms, slide-from-bottom). */
export const TR_CHART_ENTRANCE =
  "animate-in fade-in-0 slide-in-from-bottom-1 duration-[420ms] ease-out fill-mode-both";

/** Chevron rotate (User menu, Select filter) — 200ms ease-out, rotate-180 when open. Sync across all dropdowns. */
export const TR_CHEVRON_ROTATE =
  "transition-[color,transform] duration-200 ease-out data-[state=open]:rotate-180 group-data-[state=open]:rotate-180";

/** Popup/Overlay UI — unified: User menu, Add dialogs, Action dialogs, Select, Tooltip. */
export const POPUP_BG = "bg-popover";
export const POPUP_BORDER = "border border-border/55";
export const POPUP_SHADOW = "shadow-[var(--shadow-dialog)]";
export const POPUP_ROUNDED_MENU = "rounded-xl";   /* Dropdown, Select, User menu */
export const POPUP_ROUNDED_MODAL = "rounded-2xl";   /* Dialog, AlertDialog */
export const POPUP_ROUNDED_SM = "rounded-lg";       /* Tooltip, small popovers */

/** UI Tooltip — shared: border/45, shadow-card-hover, TR_MENU, max-width for mobile. */
export const TOOLTIP_CONTENT_CLASS =
  `${TR_MENU} z-50 w-fit max-w-[min(calc(100vw-2rem),20rem)] origin-(--radix-tooltip-content-transform-origin) cursor-default break-words rounded-lg border border-border/45 bg-popover px-2.5 py-1.5 text-[11px] font-normal leading-relaxed text-foreground/90 shadow-[var(--shadow-card-hover)]`;

/** Modal overlay with blur — shared by Dialog and AlertDialog for Add/Edit/Delete/Deactivate consistency. */
export const POPUP_OVERLAY_BLUR = "!bg-overlay-modal backdrop-blur-md";

/** Mobile: popups must not overflow viewport. Use for Dialog, Select, Dropdown, Popover. */
export const POPUP_MOBILE_MAX_W = "max-w-[min(calc(100vw-2rem),100%)]";
export const POPUP_MOBILE_MAX_H = "max-h-[min(85dvh,calc(100vh-2rem))]";

/** Chart colors (@theme): --color-chart-1 = categorical/bar, --color-chart-2 = temporal/line, --color-chart-3–5 = multi-series. */
export const CHART_COLOR_CATEGORICAL = "var(--color-chart-1, oklch(0.38 0.1 280))";
export const CHART_COLOR_TEMPORAL = "var(--color-chart-2, oklch(0.48 0.1 175))";

/**
 * Insights section — QA Manager dashboard.
 * Ideas per Department: chart-1. Submission Rate: chart-2 (contrasting). Ideas Over Time: chart-2. Donut: chart-donut-*.
 * Fallbacks avoid black charts on first paint before CSS vars resolve (e.g. cold server start).
 */
export const INSIGHTS_BAR_COLOR = "var(--color-chart-1, oklch(0.38 0.1 280))";
export const INSIGHTS_RATE_COLOR = "var(--color-chart-3, oklch(0.42 0.08 250))";
/** Submission Rate chart — light cyan, contrasting with Ideas per Department (chart-1) and Ideas Over Time (chart-2). */
export const INSIGHTS_RATE_CONTRAST = "var(--color-chart-submission-rate, oklch(0.68 0.14 55))";
export const INSIGHTS_LINE_COLOR = "var(--color-chart-2, oklch(0.48 0.1 175))";
export const INSIGHTS_DONUT_COLORS = [
  "var(--color-chart-donut-1, oklch(0.38 0.1 280))",
  "var(--color-chart-donut-2, oklch(0.5 0.12 175))",
  "var(--color-chart-donut-3, oklch(0.55 0.14 70))",
  "var(--color-chart-donut-4, oklch(0.48 0.14 300))",
  "var(--color-chart-donut-5, oklch(0.52 0.14 25))",
  "var(--color-chart-donut-6, oklch(0.5 0.14 145))",
  "var(--color-chart-donut-7, oklch(0.52 0.12 200))",
  "var(--color-chart-donut-8, oklch(0.55 0.14 330))",
  "var(--color-chart-donut-9, oklch(0.58 0.14 100))",
  "var(--color-chart-donut-10, oklch(0.48 0.12 260))",
] as const;

/** Chart tooltip — shared: border/45, shadow-card-hover, backdrop-blur. */
export const CHART_TOOLTIP_CLASS =
  "animate-in fade-in-0 zoom-in-95 duration-150 max-w-[14rem] break-words rounded-xl border border-border/45 bg-background/95 px-3 py-2.5 text-xs shadow-[var(--shadow-card-hover)] backdrop-blur-sm";

/** Chart tooltip label — muted, uppercase. */
export const CHART_TOOLTIP_LABEL_CLASS =
  "text-muted-foreground text-[11px] font-medium uppercase tracking-wider";

/** Chart tooltip value — number display (matches chart.tsx default). */
export const CHART_TOOLTIP_VALUE_CLASS =
  "text-foreground font-mono font-medium tabular-nums";

// ─── Main content area (Staff + Role Manager) — refined, minimal ─────────────
//
// Clean background, subtle padding. Design scale: borders /45–/50, muted /[0.02]–/[0.06].

/** Main scrollable area — clean bg. */
export const MAIN_BG = "bg-background";

/** Main horizontal padding — Management (sidebar layout). Responsive: 1.25rem → 1.5rem (sm) → 2rem (md) → 2.5rem (lg). */
export const MAIN_PX = "px-5 sm:px-6 md:px-8 lg:px-10";

/** Mobile: safe-area-inset for notched devices. Use with pb for bottom nav clearance. */
export const MOBILE_SAFE_BOTTOM = "pb-[env(safe-area-inset-bottom)]";

/** Main vertical padding. */
export const MAIN_PY = "py-8 md:py-10 lg:py-12";

/** Main max-width — Management (sidebar expanded/collapsed). */
export const MAIN_MAX_W = "max-w-[90rem]";
export const MAIN_MAX_W_COLLAPSED = "max-w-screen-2xl";

/** Page content container: bottom padding for scroll. */
export const PAGE_CONTAINER_CLASS = "pb-20";

/** Narrow page wrapper (Ideas): centered, max-width, bottom padding. */
export const PAGE_WRAPPER_NARROW_CLASS = "mx-auto max-w-4xl pb-20";

/** Staff page vertical rhythm (Ideas Hub, idea detail, new proposal). */
export const STAFF_PAGE_SPACING = "space-y-10";

/** Slightly wider page wrapper (Profile): centered, bottom padding. */
export const PAGE_WRAPPER_PROFILE_CLASS = "mx-auto max-w-5xl pb-20";

/** Card: rounded, border/50, minimal. Design scale. */
export const CARD_CLASS =
  "rounded-xl border border-border/50 bg-card";

/** Card hover — subtle border emphasis. */
export const CARD_HOVER_CLASS = "transition-colors duration-200 hover:border-border/55";

/** Idea/feed card — uses CARD_CLASS, minimal hover. */
export const IDEA_CARD_CLASS = `${CARD_CLASS} ${CARD_HOVER_CLASS}`;

/** Card with primary left accent (for highlighted / main content blocks). */
export const CARD_ACCENT_CLASS =
  "rounded-xl border border-border/50 bg-card overflow-hidden";

/** Left accent bar (use inside CARD_ACCENT_CLASS layout). */
export const CARD_ACCENT_BAR_CLASS =
  "w-1 shrink-0 self-stretch rounded-l-xl bg-primary/20";

/** Page/section header block: card with primary left border. */
export const PAGE_HEADER_CARD_CLASS = `${CARD_CLASS} px-6 py-8`;

/** Header left accent (title + description block). */
export const PAGE_HEADER_ACCENT_CLASS = "border-l-4 border-primary/40 pl-5";

/** Section/card left accent (border only). Use with cards/sections for consistency with page headers. */
export const SECTION_LEFT_ACCENT_CLASS = "border-l-4 border-primary/40";

/** Page title (h1). */
export const PAGE_TITLE_CLASS = TYPO_HEADING_LG;

/** Page/section description (muted, relaxed). */
export const PAGE_DESCRIPTION_CLASS =
  "mt-2 max-w-xl " + TYPO_LEAD;

/** Page description with wider max-width (management pages). */
export const PAGE_DESCRIPTION_WIDE_CLASS =
  "mt-2 max-w-2xl " + TYPO_LEAD;

/** Uppercase section label (e.g. Description, Attachments). Also for form labels. */
export const SECTION_LABEL_CLASS = TYPO_CAPTION_STRONG;

/** Dashboard page section heading — text-muted-foreground/95 for subtle hierarchy over card labels. */
export const DASHBOARD_SECTION_HEADING_CLASS =
  "text-xs font-medium uppercase tracking-wider text-muted-foreground/95";

/** Card stat label — inside dashboard stat cards, harmonious with section headings. */
export const CARD_STAT_LABEL_CLASS =
  "text-xs font-medium uppercase tracking-wider text-muted-foreground/90";

/** Section card header (icon + title + description). Design: border/40. */
export const SECTION_CARD_HEADER_CLASS =
  "border-b border-border/40 px-6 pt-5 pb-2";

/** Section card title (h2/h3). */
export const SECTION_CARD_TITLE_CLASS = TYPO_HEADING_SM;

/** Section card description (muted, below title). */
export const SECTION_CARD_DESCRIPTION_CLASS = TYPO_LEAD;

/** Back / secondary link (muted until hover). */
export const BACK_LINK_CLASS =
  "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 " + TYPO_NAV + " text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Primary action button (height + rounding). */
export const BUTTON_PRIMARY_CLASS = "h-9 gap-2 rounded-lg px-4";

/** Loading spinner — subtle, minimal. Track: primary/6. Tip: primary/60. */
export const LOADING_SPINNER_CLASS =
  "loading-spinner size-4 shrink-0 rounded-full border border-primary/[0.06] border-t-primary/60";

/** Loading spinner on primary/dark bg (button) — use primary-foreground. */
export const LOADING_SPINNER_ON_PRIMARY_CLASS =
  "loading-spinner size-4 shrink-0 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground";

/** Loading spinner on primary — small (size-3) for compact buttons. */
export const LOADING_SPINNER_ON_PRIMARY_SM_CLASS =
  "loading-spinner size-3 shrink-0 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground";

/** Root/full-screen loading wrapper — fixed viewport, always centered. */
export const ROOT_LOADING_FULLSCREEN_CLASS =
  "fixed inset-0 z-50 grid min-h-screen min-h-[100dvh] place-items-center bg-background";

/** Loading state block — centered, airy. */
export const LOADING_STATE_WRAPPER_CLASS =
  "flex w-full min-h-[8rem] items-center justify-center px-4 py-10";

/** Loading inner card — soft, minimal. Design: border/40, muted/[0.02]. */
export const LOADING_INNER_CARD_CLASS =
  "flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-muted/[0.02] px-5 py-6";

/** Loading state label — whisper-quiet. */
export const LOADING_STATE_TEXT_CLASS =
  "text-[10px] font-normal tracking-wide text-muted-foreground/50";

/** Loading state content — tight. */
export const LOADING_STATE_CONTENT_CLASS =
  "flex flex-col items-center gap-2";

/** Loading inline (data fetch inside card). */
export const LOADING_INLINE_CLASS =
  "flex min-h-[4rem] flex-col items-center justify-center gap-1.5 py-5";

// ─── Skeleton (unified color scale — muted, primary accent optional) ──────────

/** Skeleton base — subtle. Use for blocks, rows. Design: muted/[0.06]. */
export const SKELETON_BG_SUBTLE = "bg-muted/[0.06]";

/** Skeleton medium — toolbar buttons, header cells. Design: muted/[0.08]. */
export const SKELETON_BG_MEDIUM = "bg-muted/[0.08]";

/** Skeleton strong — emphasis blocks. Design: muted/[0.10]. */
export const SKELETON_BG_STRONG = "bg-muted/[0.10]";

/** Skeleton toolbar/input placeholder. Matches MGMT_BG_TOOLBAR. */
export const SKELETON_BG_INPUT = "bg-muted/[0.03]";

/** Stat/summary card with primary top accent (dashboards). */
export const CARD_STAT_CLASS =
  `${CARD_CLASS} border-t-2 border-t-primary/30`;

/** Staff page header accent line (primary gradient). */
export const STAFF_HEADER_ACCENT_CLASS =
  "h-px w-10 bg-gradient-to-r from-primary/80 to-transparent";

/** Staff page description (slightly larger, muted). */
export const STAFF_DESCRIPTION_CLASS =
  "mt-2 max-w-md text-sm leading-relaxed text-muted-foreground/80";

/** Idea detail article — aligned with Ideas Hub (border/50, same radius). */
export const IDEA_ARTICLE_CLASS =
  "overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-card-subtle)]";

/** Idea article byline — matches hub card structure. */
export const IDEA_ARTICLE_BYLINE_CLASS =
  "flex items-start gap-3 pt-5 pb-3 sm:pt-6 sm:pb-4 px-5 sm:px-6";

/** Idea article byline — author (hub style). */
export const IDEA_ARTICLE_BYLINE_AUTHOR =
  "truncate text-[13px] font-medium text-foreground/92";

/** Idea article byline — meta row (same as IDEAS_HUB_BYLINE_META for consistency). */
export const IDEA_ARTICLE_BYLINE_META =
  "mt-1 flex flex-col gap-0.5 text-[11px] leading-[1.2] text-muted-foreground/55 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1 sm:gap-y-0 sm:leading-normal";

/** Byline/meta vertical separator — consistent across CTA, article, hub cards. */
export const BYLINE_META_SEP =
  "mx-1 h-3 w-px shrink-0 bg-border/50";

/** Idea article body — hub card padding. */
export const IDEA_ARTICLE_BODY_CLASS =
  "pt-0 pb-6 sm:pb-8 px-5 sm:px-6";

/** Idea article title — hub typography scale. */
export const IDEA_ARTICLE_TITLE_CLASS =
  "font-sans text-[22px] font-bold leading-[1.3] tracking-tight text-foreground sm:text-[28px]";

/** Idea article description — hub desc scale. */
export const IDEA_ARTICLE_DESC_CLASS =
  "mt-4 text-sm leading-[1.65] text-muted-foreground/85 sm:text-[15px]";

/** Idea article divider — hub engagement border. */
export const IDEA_ARTICLE_DIVIDER = "border-t border-border/40";

/** Idea article footer (reactions) — hub engagement row. */
export const IDEA_ARTICLE_FOOTER_CLASS =
  "flex flex-wrap items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5";

/** Discussion divider — softer than article divider, in-card flow. */
export const IDEA_DISCUSSION_DIVIDER = "border-t border-border/25";

/** Discussion header — compact, integrated. */
export const IDEA_DISCUSSION_HEADER_CLASS = "pt-5 pb-3 sm:pt-6 sm:pb-4";

/** Discussion content — comment form + list. */
export const IDEA_DISCUSSION_CONTENT_CLASS = "pb-5 sm:pb-6";

/** Article/Discussion section horizontal padding — matches hub. */
export const IDEA_ARTICLE_PX = "px-5 sm:px-6";

/** Article section label (attachments, overlines). */
export const IDEA_ARTICLE_SECTION_LABEL =
  "flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/55";

/** Discussion heading — subtle, integrated. */
export const IDEA_DISCUSSION_HEADING =
  "font-sans text-[15px] font-semibold tracking-tight text-foreground/95";

/** Discussion subtitle — muted, compact. */
export const IDEA_DISCUSSION_SUBTITLE = "mt-0.5 text-[11px] text-muted-foreground/50";

/** Attachment list item — minimal, scannable. */
export const IDEA_ATTACHMENT_ITEM =
  "flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/[0.05] px-4 py-2.5 transition-colors duration-150 hover:bg-muted/[0.08]";

/** Engagement action buttons — shared by idea card and comment actions. Defined early to avoid TDZ. */
export const IDEAS_HUB_ACTION_BASE =
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium tabular-nums transition-colors duration-100";
export const IDEAS_HUB_ACTION_INACTIVE =
  "text-muted-foreground/55 hover:bg-muted/[0.05] hover:text-foreground/70 disabled:cursor-not-allowed";
export const IDEAS_HUB_ACTION_UP = "text-success";
export const IDEAS_HUB_ACTION_DOWN = "text-destructive";

/** Read-only vote buttons — no hover highlight, no tooltip. */
export const IDEAS_HUB_ACTION_READONLY =
  "cursor-default text-muted-foreground/55 opacity-50 hover:bg-transparent hover:text-muted-foreground/55";

/** Comment avatar — subtle, aligned with byline. */
export const IDEA_COMMENT_AVATAR =
  "size-7 shrink-0 rounded-full ring-1 ring-border/20";

/** Comment avatar fallback. */
export const IDEA_COMMENT_AVATAR_FALLBACK =
  "bg-muted/50 text-[9px] font-semibold text-muted-foreground/60";

/** Comment author + time row. */
export const IDEA_COMMENT_HEADER =
  "flex flex-wrap items-baseline gap-x-2 gap-y-0.5";

/** Comment author name. */
export const IDEA_COMMENT_AUTHOR = "text-[13px] font-medium text-foreground/85";

/** Comment timestamp. */
export const IDEA_COMMENT_TIME = "text-[11px] text-muted-foreground/40";

/** Comment body text. */
export const IDEA_COMMENT_BODY =
  "mt-1 whitespace-pre-wrap text-sm leading-[1.7] text-foreground/70";

/** Idea detail: comments section — overflow-visible to avoid clipping rounded corners on nested replies. */
export const IDEA_DETAIL_COMMENTS_WRAP = "pt-1 pb-5 sm:pb-6 overflow-visible";

/** Idea detail: comment row — py-3 uniform (12px) so all gaps = 12+12+12 = 36px. */
export const IDEA_DETAIL_COMMENT_ROW_ROOT = "flex items-start gap-3 py-3";
export const IDEA_DETAIL_COMMENT_ROW_ROOT_NOT_FIRST = "flex items-start gap-3 py-3";
export const IDEA_DETAIL_COMMENT_ROW_REPLY = "flex items-start gap-3 py-3";
export const IDEA_DETAIL_COMMENT_ROW_REPLY_NOT_FIRST = "flex items-start gap-3 py-3";

/** Idea detail: reply indent — uniform for depth 2+ (avatar 36px + gap 12px = 48px). */
export const IDEA_DETAIL_REPLY_INDENT_PX = 48;

/** Light highlight border — apply when comment is targeted (state-driven, not :target). */
export const IDEA_DETAIL_COMMENT_HIGHLIGHT =
  "ring-1 ring-primary/25 ring-inset rounded-xl transition-[box-shadow] duration-300";

/** Idea detail: vertical thread line — small gap below avatar, then down through replies. */
export const IDEA_DETAIL_THREAD_LINE =
  "absolute left-[17px] top-[54px] bottom-0 w-px bg-border/25 pointer-events-none";

/** Idea detail: avatar — root & reply. */
export const IDEA_DETAIL_COMMENT_AVATAR = "size-10 shrink-0 rounded-full";

/** Idea detail: comment bubble — header + body only. overflow-visible so rounded corners aren't clipped. */
export const IDEA_DETAIL_COMMENT_BUBBLE =
  "rounded-2xl bg-muted/30 dark:bg-muted/20 px-3 py-2 w-fit max-w-full text-sm overflow-visible";

/** Idea detail: author + time row — refined, subtle. */
export const IDEA_DETAIL_COMMENT_HEADER_ROW =
  "flex flex-nowrap items-baseline gap-1.5 text-[13px] min-w-0";

/** Comment author name — medium weight, not bold. */
export const IDEA_DETAIL_COMMENT_AUTHOR = "font-medium text-foreground/90 truncate";

/** Comment meta (time, edited) — subtle secondary. */
export const IDEA_DETAIL_COMMENT_META = "shrink-0 text-[11px] text-muted-foreground/55";

/** Separator between meta items. */
export const IDEA_DETAIL_COMMENT_META_SEP = "text-muted-foreground/35 mx-0.5 aria-hidden";

/** Idea detail: "edited" label for comments modified after creation. */
export const IDEA_DETAIL_EDITED_LABEL = "text-[11px] text-muted-foreground/45 italic";

/** Idea detail: comment content text. */
export const IDEA_DETAIL_COMMENT_BODY =
  "mt-2 whitespace-pre-wrap leading-snug text-foreground/90";

/** Idea detail: action row (Like, Dislike, Reply) — outside bubble, single line. */
export const IDEA_DETAIL_COMMENT_ACTIONS_ROW =
  "mt-2 flex flex-nowrap items-center gap-x-1 text-[12px]";

/** Comment action buttons — match engagement bar. */
export const IDEA_DETAIL_COMMENT_ACTION_BASE = IDEAS_HUB_ACTION_BASE;

/** Like — inactive: muted + hover bg; active: success. Stroke only, no fill (match engagement). */
export const IDEA_DETAIL_COMMENT_LIKE_INACTIVE =
  "text-muted-foreground/55 hover:bg-muted/[0.05] hover:text-foreground/70 disabled:cursor-not-allowed";
export const IDEA_DETAIL_COMMENT_LIKE_ACTIVE = "text-success";

/** Dislike — inactive: muted + hover bg; active: destructive. Stroke only, no fill (match engagement). */
export const IDEA_DETAIL_COMMENT_DISLIKE_INACTIVE =
  "text-muted-foreground/55 hover:bg-muted/[0.05] hover:text-foreground/70 disabled:cursor-not-allowed";
export const IDEA_DETAIL_COMMENT_DISLIKE_ACTIVE = "text-destructive";

/** Reply — primary on hover. No background. Cursor pointer. */
export const IDEA_DETAIL_COMMENT_REPLY =
  "cursor-pointer text-muted-foreground/55 hover:text-primary font-medium";

/** ─── Comment & Reply forms (unified, standard layout) ──────────────────────── */
//
// Layout: Textarea full width → Footer row (Anonymous left, Send right).
// Matches YouTube / GitHub / Linear comment pattern.

/** Shared: textarea — matches IDEAS_NEW_TEXTAREA, full width. */
export const IDEA_DETAIL_INPUT =
  "min-h-[88px] w-full resize-none rounded-xl border border-border/80 bg-background px-3 py-2.5 text-sm leading-relaxed transition-colors duration-200 placeholder:text-muted-foreground/80 hover:border-primary/30 focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 focus-visible:outline-none";

/** Shared: post button — text "Post", primary, right-aligned in footer. */
export const IDEA_DETAIL_SEND_BTN =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 disabled:hover:bg-primary";

/** Shared: anonymous label — subtle, left-aligned in footer. */
export const IDEA_DETAIL_ANONYMOUS_LABEL =
  "flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground/50 transition-colors hover:text-muted-foreground/75";

/** Form footer — Anonymous left, Send right. */
export const IDEA_DETAIL_FORM_FOOTER =
  "flex items-center justify-between gap-3 pt-2";

/** Main comment form — minimal wrapper. */
export const IDEA_DETAIL_COMMENT_FORM =
  "flex flex-col gap-4";

/** "Commenting as" — label on first line, avatar + name on second. */
export const IDEA_DETAIL_COMMENT_AS_ROW =
  "flex flex-col gap-2.5 text-sm";

/** Main comment form body — textarea + footer. */
export const IDEA_DETAIL_COMMENT_FORM_BODY =
  "flex flex-col gap-0 rounded-xl";

/** Reply form — same structure. */
export const IDEA_DETAIL_REPLY_FORM =
  "flex flex-col gap-0 rounded-xl";

/** Legacy: input row (textarea now full width, no inline button). */
export const IDEA_DETAIL_INPUT_ROW = "flex flex-col gap-2";

/** Edit form textarea — matches standard input design. */
export const IDEA_DETAIL_EDIT_INPUT =
  "min-h-[80px] w-full resize-none rounded-xl border border-border/80 bg-background px-3 py-2.5 text-sm leading-relaxed transition-colors duration-200 placeholder:text-muted-foreground/80 hover:border-primary/30 focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 focus-visible:outline-none";

/** Legacy alias (edit form uses IDEA_DETAIL_EDIT_INPUT) */
export const IDEA_DETAIL_COMMENT_INPUT = IDEA_DETAIL_EDIT_INPUT;
export const IDEA_DETAIL_REPLY_INPUT_ROW = IDEA_DETAIL_INPUT_ROW;
export const IDEA_DETAIL_REPLY_FORM_INPUT = IDEA_DETAIL_INPUT;
export const IDEA_DETAIL_REPLY_FORM_FOOTER = IDEA_DETAIL_FORM_FOOTER;
export const IDEA_DETAIL_REPLY_SEND_BTN = IDEA_DETAIL_SEND_BTN;

/** Idea detail: replies — pl-[52px] aligns "View replies" with comment bubble (avatar 40px + gap 12px). -mt-1 pulls closer. */
export const IDEA_DETAIL_REPLIES_SPACING = "pl-[52px] -mt-1 flex flex-col items-stretch gap-3 overflow-visible";

/** Idea detail: replies at depth 2+ — no extra indent, keeps width consistent (prevents reply 4+ overflow). */
export const IDEA_DETAIL_REPLIES_SPACING_FLAT = "flex flex-col items-stretch gap-3 overflow-visible";

/** Idea detail: View X replies button — left-aligned, w-fit. */
export const IDEA_DETAIL_VIEW_REPLIES =
  "w-fit text-left text-[13px] font-medium text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer";

/** Attachment file name — compact, truncatable. */
export const IDEA_ATTACHMENT_NAME = "min-w-0 truncate text-[13px] text-foreground/80";

/** Idea detail: category pill — rounded pill (matches image). Truncates long names. pl-0 aligns icon with time/attachments. */
export const IDEA_DETAIL_CATEGORY_PILL =
  "inline-flex max-w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-full bg-muted/[0.06] pl-0 pr-1.5 py-0.5 text-[11px] font-medium text-muted-foreground/80 sm:py-1";

// ─── Ideas Hub (/ideas) — standardized, minimal ─────────────────────────────
//
// Cards, tabs, empty state. Design scale: border/40, muted/[0.04], typography tokens.

/** Ideas Hub content spacing between sections. */
export const IDEAS_HUB_SPACING = "space-y-8";

/** Idea card horizontal padding (byline, content, engagement). */
export const IDEAS_HUB_CARD_PX = "px-5 sm:px-6";

/** Idea card byline — meta row (time, category). Stacked per row on mobile. */
export const IDEAS_HUB_BYLINE_META =
  "mt-1 flex flex-col gap-0.5 text-[11px] leading-[1.2] text-muted-foreground/55 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1 sm:gap-y-0 sm:leading-normal";

/** Idea card engagement row top border. */
export const IDEAS_HUB_ENGAGEMENT_BORDER = "border-t border-border/40";

/** Idea card — modern, refined. Soft corners, subtle hover. */
export const IDEAS_HUB_ARTICLE_CLASS =
  "group relative flex flex-col overflow-visible rounded-2xl border border-border/50 bg-card transition-all duration-200 hover:border-border/60 hover:shadow-[var(--shadow-card-hover)]";

/** Idea card author avatar. */
export const IDEAS_HUB_AVATAR = "size-9 shrink-0 rounded-full ring-1 ring-border/35";

/** Idea card author name. */
export const IDEAS_HUB_AUTHOR = "truncate text-[13px] font-medium text-foreground/92";

/** Idea card title — clean, scannable. */
export const IDEAS_HUB_TITLE =
  "font-sans text-base font-semibold leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary sm:text-[17px]";

/** Idea card description — optimal readability. */
export const IDEAS_HUB_DESC = "text-sm leading-[1.6] text-muted-foreground/80";

/** Idea card expand/collapse (continue reading / show less). Minimal, subtle. */
export const IDEAS_HUB_READ_MORE =
  "mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground/60 transition-colors hover:text-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";

/** Idea card attachment chip (single). Design: border/40, bg/[0.04]. */
export const IDEAS_HUB_ATTACHMENT_CHIP =
  "inline-flex items-center gap-1 rounded-lg border border-border/40 bg-muted/[0.04] px-2 py-1 " + TYPO_CAPTION + " text-muted-foreground/72";

/** Idea card attachments label (muted caption). */
export const IDEAS_HUB_ATTACHMENTS_LABEL =
  "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50";

/** Idea card attachments list container. Design: subtle, minimal. */
export const IDEAS_HUB_ATTACHMENTS_LIST =
  "mt-2 flex flex-col overflow-hidden rounded-lg border border-border/25 bg-muted/[0.02]";

/** Idea card attachment row (inside list). */
export const IDEAS_HUB_ATTACHMENT_ROW =
  "flex min-w-0 items-center gap-2.5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground/65";

/** Ideas Hub view tab — base. */
export const IDEAS_HUB_TAB_BASE =
  "cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors duration-200";

/** Ideas Hub view tab — active. */
export const IDEAS_HUB_TAB_ACTIVE = "bg-primary/10 text-primary";

/** Ideas Hub view tab — inactive. */
export const IDEAS_HUB_TAB_INACTIVE = "text-muted-foreground/45 hover:text-primary hover:bg-muted/[0.03]";

/** Ideas Hub empty state icon container. */
export const IDEAS_HUB_EMPTY_ICON = "flex size-12 items-center justify-center rounded-xl bg-muted/[0.04]";

/** Ideas Hub CTA card — minimal, subtle. Hover: aligned with idea cards below. */
export const IDEAS_HUB_CTA_CARD =
  "flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-4 sm:py-5 transition-all duration-200 hover:border-border/60 hover:shadow-[var(--shadow-card-hover)]";

/** Ideas 3-dot menu — trigger (Edit/Delete). Subtle, appears on hover. */
export const IDEAS_ACTIONS_TRIGGER =
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/30 transition-colors duration-200 hover:text-muted-foreground/70 hover:bg-muted/[0.04] data-[state=open]:text-muted-foreground/70 data-[state=open]:bg-muted/[0.04] focus-visible:outline-none focus-visible:ring-0";

/** Ideas 3-dot menu — dropdown content. align=end, sideOffset=4. */
export const IDEAS_ACTIONS_MENU = "min-w-[8rem] p-1.5";

/** Ideas 3-dot menu — item (Edit). Primary on focus/hover. */
export const IDEAS_ACTIONS_ITEM =
  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-foreground/80 transition-colors duration-150 focus:bg-primary/[0.08] focus:text-primary data-[highlighted]:bg-primary/[0.08] data-[highlighted]:text-primary [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:!text-current focus:[&_svg]:!text-primary data-[highlighted]:[&_svg]:!text-primary";

/** Ideas 3-dot menu — item (Delete). Destructive. */
export const IDEAS_ACTIONS_ITEM_DESTRUCTIVE =
  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-destructive/90 transition-colors duration-150 focus:bg-destructive/[0.08] focus:text-destructive data-[highlighted]:bg-destructive/[0.08] data-[highlighted]:text-destructive [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:!text-current focus:[&_svg]:!text-destructive data-[highlighted]:[&_svg]:!text-destructive";

/** @deprecated Use IDEAS_ACTIONS_TRIGGER */
export const IDEAS_MY_ACTIONS_TRIGGER = IDEAS_ACTIONS_TRIGGER;
/** @deprecated Use IDEAS_ACTIONS_MENU */
export const IDEAS_MY_ACTIONS_MENU = IDEAS_ACTIONS_MENU;
/** @deprecated Use IDEAS_ACTIONS_ITEM */
export const IDEAS_MY_ACTIONS_ITEM = IDEAS_ACTIONS_ITEM;

/** My proposals card — top-right label: voting period (Comment & vote). Active state. */
export const IDEAS_MY_STATUS_VOTING =
  "inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium text-primary/85";

/** My proposals card — top-right: Closed (lock + red text). */
export const IDEAS_MY_STATUS_CLOSED =
  "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-destructive";

/** Ideas Hub CTA icon — minimal. Hover: muted. */
export const IDEAS_HUB_CTA_ICON =
  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground/65 transition-colors duration-200";

/** Ideas Hub CTA title — prominent. */
export const IDEAS_HUB_CTA_TITLE = "text-[15px] font-semibold text-foreground sm:text-base";

/** Ideas Hub CTA subtitle (deadline · countdown inline). */
export const IDEAS_HUB_CTA_SUBTITLE =
  "mt-0.5 text-[11px] text-muted-foreground/55";

/** Ideas Hub feed gap between cards. */
export const IDEAS_HUB_FEED_GAP = "space-y-6";

/** Ideas Hub count label (proposals). */
export const IDEAS_HUB_COUNT = "text-[11px] text-muted-foreground/45";

/** Ideas Hub toolbar — refined bar. Design: border/30, subtle. Count aligned right. */
export const IDEAS_HUB_TOOLBAR =
  "flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/30";

/** Ideas Hub filter/select trigger — fixed size, subtle colors, text-independent.
 *  Height/icon/padding fixed; text truncates. Colors: muted bg, soft border. */
const IDEAS_HUB_SELECT_TRIGGER_BASE =
  "relative flex h-9 min-h-9 min-w-0 overflow-hidden items-center rounded-lg border border-border/50 bg-muted/[0.06] pl-3 pr-9 text-xs font-medium text-foreground/90 transition-colors duration-200 hover:border-border/60 hover:bg-muted/[0.08] focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/[0.06] focus-visible:ring-offset-1 focus-visible:outline-none [&_[data-slot=select-value]]:block [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:whitespace-nowrap [&_[data-slot=select-value]]:pr-4 [&_[data-slot=select-value]]:text-left [&>svg]:absolute [&>svg]:right-2.5 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground/50";

/** Ideas Hub filter trigger — unified width (10.5rem). */
export const IDEAS_HUB_SELECT_TRIGGER =
  `${IDEAS_HUB_SELECT_TRIGGER_BASE} w-[10.5rem] min-w-[10.5rem]`;

/** Ideas Hub filter trigger — same as standard (10.5rem). */
export const IDEAS_HUB_SELECT_TRIGGER_COORDINATOR =
  `${IDEAS_HUB_SELECT_TRIGGER_BASE} w-[10.5rem] min-w-[10.5rem]`;

/** Responsive override for filter trigger — full width on mobile, 10.5rem on desktop. */
export const IDEAS_HUB_SELECT_TRIGGER_RESPONSIVE =
  "w-full min-w-0 sm:w-[10.5rem] sm:min-w-[10.5rem] sm:max-w-[10.5rem]";

/** Responsive override for coordinator filter trigger — same as standard. */
export const IDEAS_HUB_SELECT_TRIGGER_COORDINATOR_RESPONSIVE =
  "w-full min-w-0 sm:w-[10.5rem] sm:min-w-[10.5rem] sm:max-w-[10.5rem]";

/** Filter/toolbar Select dropdown — min = trigger width; if text overflows, grow up to 24rem; beyond that, truncate. Excludes add/edit popups. */
export const FILTER_SELECT_CONTENT_CLASS =
  "!min-w-[var(--radix-select-trigger-width)] !w-max !max-w-[min(24rem,calc(100vw-2rem))]";

/** Ideas Hub toolbar divider (vertical). */
export const IDEAS_HUB_TOOLBAR_DIVIDER = "h-3 w-px shrink-0 bg-border/25";

/** Ideas Hub pagination — minimal, compact. */
export const IDEAS_HUB_PAGINATION = "pt-8";

// ─── New Proposal (/ideas/new) — aligned with Ideas Hub ─────────────────────
//
// Form card = idea card structure. Same padding (IDEAS_HUB_CARD_PX), border scale.

/** New proposal form card — matches idea cards. */
export const IDEAS_NEW_CARD_CLASS =
  "overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-card-subtle)]";

/** New proposal form padding — same as idea cards. */
export const IDEAS_NEW_FORM_PX = IDEAS_HUB_CARD_PX;

/** New proposal form content padding. */
export const IDEAS_NEW_FORM_PY = "py-6 sm:py-8";

/** New proposal overline (Optional, Terms) — subtle. */
export const IDEAS_NEW_OVERLINE =
  "text-[11px] font-medium uppercase tracking-wider text-muted-foreground/55";

/** New proposal label — aligned with form inputs. */
export const IDEAS_NEW_LABEL = "text-[13px] font-medium text-foreground/92";

/** New proposal hint — muted, compact. */
export const IDEAS_NEW_HINT = "mt-1 text-[11px] leading-relaxed text-muted-foreground/55";

/** New proposal input — h-11, unified focus (border/70, ring/08). */
export const IDEAS_NEW_INPUT =
  "h-11 w-full rounded-xl border border-border/80 bg-background text-sm transition-colors duration-200 placeholder:text-muted-foreground/80 hover:border-primary/30 focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 focus-visible:outline-none aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10";

/** New proposal select trigger — matches input. */
export const IDEAS_NEW_SELECT_TRIGGER =
  "!h-11 w-full min-w-0 rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors duration-200 outline-none hover:border-primary/30 focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground/80 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate";

/** New proposal textarea — same scale. */
export const IDEAS_NEW_TEXTAREA =
  "min-h-[11rem] w-full resize-y rounded-xl border border-border/80 bg-background py-3 text-sm leading-relaxed transition-colors duration-200 placeholder:text-muted-foreground/80 hover:border-primary/30 focus-visible:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1 focus-visible:outline-none aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10";

/** New proposal actions row — matches engagement border. */
export const IDEAS_NEW_ACTIONS =
  "flex flex-wrap items-center gap-3 border-t border-border/40 pt-6";

// ─── Navbar (Staff + Role Manager) — refined, minimal, unified ─────────────
//
// Softer border/divider for a lighter, less noisy top bar. Same h-16 for both.

/** Navbar bottom border — subtle, minimal (/45). */
export const NAVBAR_BORDER = "border-border/45";

/** Navbar vertical divider color (used in w-px elements). */
export const NAVBAR_DIVIDER = "bg-border/40";

/** Navbar background — clean, light. */
export const NAVBAR_BG = "bg-background/98 backdrop-blur-sm";

/** Navbar horizontal padding — more space from edges. */
export const NAVBAR_PX = "px-6 md:px-8";

/** Navbar header base — shared by Staff & Role Manager for consistent layout. */
export const NAVBAR_HEADER_BASE =
  "sticky top-0 z-50 flex shrink-0 items-center justify-between gap-4 border-b";

/** Navbar header full — combined tokens for header element (Staff & Role Manager). */
export const NAVBAR_HEADER_CLASS =
  "sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/45 px-6 md:px-8 bg-background/98 backdrop-blur-sm";

/** Navbar left section base — flex-1, min-w-0 for truncation. */
export const NAVBAR_LEFT_BASE = "flex min-w-0 flex-1 items-center";

/** Navbar left section gap — between hamburger/branding and breadcrumbs/context. */
export const NAVBAR_LEFT_GAP = "gap-3";

/** Navbar right section base — icon group + divider + user menu. */
export const NAVBAR_RIGHT_BASE = "flex shrink-0 items-center";

/** Navbar icon size — unified 16.5px for Ideas Hub, My Ideas, Notifications. */
export const NAVBAR_ICON_SIZE = "size-[16.5px]";

/** Navbar right section: gap between icon group, divider, user menu. Balanced spacing. */
export const NAVBAR_RIGHT_GAP = "gap-3";

/** Navbar icon group — shared by Staff & Role Manager. Refined padding. */
export const NAVBAR_ACTION_GROUP =
  "flex items-center gap-2 rounded-lg bg-muted/[0.015] p-1.5";

/** Navbar icon group when only notification (QA Coordinator) — min-width + justify-end so bell aligns with Staff. */
export const NAVBAR_ACTION_GROUP_NOTIFICATION_ONLY =
  "flex min-w-[7.5rem] justify-end items-center gap-2 rounded-lg bg-muted/[0.015] p-1.5";

/** Navbar vertical divider — symmetric margins, subtle. Hidden on mobile. */
export const NAVBAR_DIVIDER_VERTICAL =
  "mx-1 hidden h-5 w-px shrink-0 md:block bg-border/40";

// ─── Notification dropdown — minimal ─────────────────────────────────────────

/** Notification popover width. */
export const NOTIFICATION_POPOVER_W = "w-[320px]";

/** Notification header — thin border, compact. */
export const NOTIFICATION_HEADER_CLASS =
  "flex items-center justify-between gap-2 border-b border-border/40 px-4 py-2.5";

/** Notification list — scroll at 5+ items. */
export const NOTIFICATION_LIST_CLASS =
  "scrollbar-thin-stable overflow-y-auto overscroll-contain max-h-[16rem]";

/** Navbar interactive trigger — bell, user menu. */
export const NAVBAR_TRIGGER_CLASS =
  "cursor-pointer transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Notification header title. */
export const NOTIFICATION_HEADER_TITLE = "text-sm font-medium text-foreground/90";

/** Notification list items container. */
export const NOTIFICATION_LIST_ITEMS_CLASS = "flex flex-col divide-y divide-border/30";

/** Notification row — flat, minimal. */
export const NOTIFICATION_ROW_CLASS =
  "flex w-full cursor-pointer items-start gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-muted/30";

/** Notification row unread — font weight only. */
export const NOTIFICATION_ROW_UNREAD_CLASS = "";

/** Notification row read. */
export const NOTIFICATION_ROW_READ_CLASS = "";

/** Notification row message — unread: medium. */
export const NOTIFICATION_ROW_MESSAGE_UNREAD = "text-sm font-medium text-foreground";

/** Notification empty state — minimal. */
export const NOTIFICATION_EMPTY_CLASS =
  "flex min-h-[7rem] flex-col items-center justify-center gap-1.5 px-4 py-5";

/** Notification empty icon. */
export const NOTIFICATION_EMPTY_ICON = "flex size-9 items-center justify-center";

/** Notification popover sideOffset. */
export const NOTIFICATION_POPOVER_OFFSET = 8;

/** Notification trigger icon. */
export const NOTIFICATION_TRIGGER_ICON_CLASS =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg";

/** Notification bell icon. */
export const NOTIFICATION_ICON_SIZE = "size-[18px]";

/** Notification badge — minimal dot or count. */
export const NOTIFICATION_BADGE_CLASS =
  "absolute -right-0.5 top-0 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-primary-foreground ring-2 ring-background";

/** Navbar left-section divider (e.g. between branding and context label) — shorter. */
export const NAVBAR_DIVIDER_LEFT = "h-4 w-px shrink-0 bg-border/40";

// ─── Staff layout (compact top bar, no sidebar) ───────────────────────────

/** Staff header height — matches Manager Navbar (h-16). */
export const STAFF_HEADER_HEIGHT = "h-16";

/** Staff header: uses NAVBAR_* tokens. */
export const STAFF_HEADER_BG = NAVBAR_BG;

/** Staff header horizontal padding — matches NAVBAR_PX. */
export const STAFF_HEADER_PX = NAVBAR_PX;

/** Staff pill group — alias for unified NAVBAR_ACTION_GROUP. */
export const STAFF_PILL_GROUP_CLASS = NAVBAR_ACTION_GROUP;

/** Staff main max-width — narrow, ideas-focused. */
export const STAFF_MAIN_MAX_W = "max-w-4xl";

/** Staff navbar left gap — branding, divider, context. Refined. */
export const STAFF_NAVBAR_LEFT_GAP = "gap-3";

/** Staff context label (active year) — subtle, nav-level. */
export const STAFF_CONTEXT_LABEL_CLASS =
  "text-sm font-normal text-foreground/75";

// ─── Page spacing (Staff + Role Manager) ───────────────────────────────────

/** Role Manager page vertical rhythm (Admin, QA Manager, QA Coordinator). */
export const MANAGEMENT_PAGE_SPACING = "space-y-10";

/** Role Manager page: spacing + container. Use for Admin, QA Manager, QA Coordinator pages. */
export const MANAGEMENT_PAGE_CLASS = `${MANAGEMENT_PAGE_SPACING} ${PAGE_CONTAINER_CLASS}`;

/** Dashboard stat grid — 1 col mobile, 2 md, 4 xl. Collapses sooner when shrinking. */
export const MANAGEMENT_STAT_GRID_CLASS = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5";

// ─── Focus & interaction ───────────────────────────────────────────────────

/** Standard hover transition for nav/menu items — consistent across sidebar, header, dropdown. */
export const HOVER_TRANSITION_NAV = "transition-colors duration-200 ease-out";

/** Cursor for interactive elements — pointer on hover, not-allowed when disabled. */
export const CURSOR_POINTER = "cursor-pointer";
export const CURSOR_DISABLED = "cursor-not-allowed";

/** Standard focus ring (outline + ring). Use for links, cards, buttons. */
export const FOCUS_RING_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Primary-tinted focus ring. Design scale: ring /[0.08]. */
export const FOCUS_RING_PRIMARY_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-2";

// ─── Sidebar (collapsible menu) — aligned with color opacity scale ───────────

/** Easing for sidebar expand/collapse — smooth decelerate. */
export const SIDEBAR_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

/** Sidebar transition duration. */
export const SIDEBAR_DURATION = "280ms";

/** Sidebar nav: padding when expanded (align 4px grid). */
export const SIDEBAR_NAV_PADDING = "pl-4 pr-4 py-2.5";

/** Sidebar nav: gap icon ↔ text when expanded. */
export const SIDEBAR_NAV_GAP = "gap-3";

/** Sidebar nav: gap between items — expanded. */
export const SIDEBAR_NAV_ITEM_GAP = "gap-1.5";

/** Sidebar nav: gap between items — collapsed. */
export const SIDEBAR_NAV_ITEM_GAP_COLLAPSED = "gap-2";

/** Sidebar scroll: padding top — expanded (space from logo). */
export const SIDEBAR_SCROLL_PT = "pt-8";

/** Sidebar scroll: padding top — collapsed. */
export const SIDEBAR_SCROLL_PT_COLLAPSED = "pt-5";

/** Sidebar scroll: padding bottom. */
export const SIDEBAR_SCROLL_PB = "pb-6";

/** Sidebar scroll: horizontal padding when expanded. */
export const SIDEBAR_SCROLL_PX = "px-3";

/** Sidebar footer: padding. */
export const SIDEBAR_FOOTER_PADDING = "px-3 py-4";

/** Sidebar footer: button padding when expanded. */
export const SIDEBAR_FOOTER_BUTTON_PADDING = "px-3 py-2";

/** Sidebar active pill (left indicator). */
export const SIDEBAR_ACTIVE_PILL = "absolute left-2 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary";

/** Sidebar tooltip offset. */
export const SIDEBAR_TOOLTIP_OFFSET = 8;

/** Label expand delay (ms) — show labels after width is ~90% expanded. */
export const SIDEBAR_LABELS_EXPAND_DELAY_MS = 260;

/** Layout: unified border scale — clear, refined, design: /50 card, /40 between ─ */

/** Main structural edge (sidebar right, navbar bottom). Design: /65. */
export const LAYOUT_BORDER_MAIN = "border-border/65";

/** Sidebar main edge — matches layout. */
export const SIDEBAR_BORDER = "border-sidebar-border/65";

/** Inner dividers (header/footer, vertical sep). Design: /65 — visible, synced with main edge. */
export const LAYOUT_BORDER_DIVIDER = "border-border/65";

/** Sidebar inner — header/footer, section divider. Synced with layout. */
export const SIDEBAR_BORDER_INNER = "border-sidebar-border/65";

/** Vertical/horizontal divider line (w-px, h-px). Synced with layout. */
export const LAYOUT_DIVIDER_LINE = "bg-border/65";

/** Role Manager: card/panel border. Design scale /50. */
export const MGMT_BORDER_CARD = "border-border/50";

/** Role Manager: divider (toolbar, table header, dialog header). */
export const MGMT_BORDER_DIVIDER = "border-border/40";

/** Role Manager: table row divider, subtle. */
export const MGMT_BORDER_ROW = "border-border/40";

/** Role Manager: muted toolbar/header bg. Design: /[0.03]. */
export const MGMT_BG_TOOLBAR = "bg-muted/[0.03]";

/** Role Manager: table header row bg. Design: /[0.05]. */
export const MGMT_BG_TABLE_HEAD = "bg-muted/[0.05]";

/** Role Manager: row hover. Design: /[0.10]. */
export const MGMT_BG_ROW_HOVER = "hover:bg-muted/[0.10]";

/** Role Manager: divide-y between rows (skeleton, list). */
export const MGMT_DIVIDE = "divide-border/40";

/** Error / Try again view: minimal card, gentle fade-in. Aligns with POPUP_* scale. */
export const ERROR_VIEW_WRAPPER_CLASS =
  `flex flex-col items-center justify-center gap-5 max-w-sm rounded-xl border border-border/50 bg-background px-6 py-10 text-center ${TR_PAGE_FADE}`;

/** Error view icon — minimal, subtle. */
export const ERROR_VIEW_ICON_CLASS =
  "flex size-10 items-center justify-center rounded-full bg-muted/[0.05] text-muted-foreground/60";

/** Error view title — clear, not loud. */
export const ERROR_VIEW_TITLE_CLASS =
  "font-sans text-lg font-semibold tracking-tight text-foreground";

/** Error view description — minimal, readable. */
export const ERROR_VIEW_DESCRIPTION_CLASS =
  "max-w-xs text-sm leading-relaxed text-muted-foreground/85";

/** Error view actions — minimal gap, aligned with form actions. */
export const ERROR_VIEW_ACTIONS_CLASS =
  "flex flex-wrap items-center justify-center gap-2.5";

/** Error page wrapper: centers ErrorBoundaryView in content area (use in error.tsx). */
export const ERROR_PAGE_WRAPPER_CLASS =
  "flex min-h-[32rem] w-full items-center justify-center px-4 py-10";

/** Section label typography — caption, readable. */
export const SIDEBAR_SECTION_LABEL_CLASS =
  "text-[11px] font-medium uppercase tracking-[0.08em] text-sidebar-foreground/52";

/** Section label divider — softer than logo line, avoids repetition. */
export const SIDEBAR_SECTION_DIVIDER = "bg-sidebar-border/35";

/** Section label: margin between sections when expanded. */
export const SIDEBAR_SECTION_MARGIN = "mt-6";

/** Section label: grid row height when expanded. */
export const SIDEBAR_SECTION_ROW = "grid-rows-[2.5rem]";

/** Section label: inner gap (label ↔ divider). */
export const SIDEBAR_SECTION_INNER_GAP = "gap-2";

/** Collapsed separator height. */
export const SIDEBAR_COLLAPSED_SEP_HEIGHT = "h-4";

/** Collapsed separator dot size. */
export const SIDEBAR_COLLAPSED_SEP_DOT = "size-1";

/** Collapsed state: subtle dot separator between icon groups. */
export const SIDEBAR_COLLAPSED_SEP = "bg-sidebar-border/45";

/** Collapsed nav: icon size — refined. */
export const SIDEBAR_COLLAPSED_ICON_SIZE = "size-[18px]";

/** Collapsed nav: hit area. Design: 36px standard. */
export const SIDEBAR_COLLAPSED_HIT = "size-9";

/** Nav item: inactive icon. Design: foreground/75 header. */
export const SIDEBAR_NAV_INACTIVE = "text-sidebar-foreground/75";

/** Nav item: inactive icon when collapsed. */
export const SIDEBAR_NAV_ICON_COLLAPSED = "text-sidebar-foreground/52";

/** Nav item: inactive text expanded. Design: /85 secondary. */
export const SIDEBAR_NAV_TEXT_INACTIVE = "text-sidebar-foreground/88";

/** Nav item & footer: hover. Design: subtle. */
export const SIDEBAR_HOVER_BG = "hover:bg-sidebar-accent/45";

/** Nav item: active. Design: /[0.06] ghost hover, /[0.08] action ring. */
export const SIDEBAR_NAV_ACTIVE = "bg-primary/[0.06] ring-1 ring-primary/[0.08]";

/** Footer collapse: icon when collapsed. */
export const SIDEBAR_FOOTER_ICON = "text-sidebar-foreground/52";

/** Footer collapse: "Collapse" text. */
export const SIDEBAR_FOOTER_TEXT = "text-sidebar-foreground/78";

/** Sidebar tooltip — refined. */
export const SIDEBAR_TOOLTIP_CLASS =
  "text-[11px] font-normal text-muted-foreground tracking-wide border-border/40";

/** Input/select focus (border + ring). Design scale: ring /[0.08]. */
export const INPUT_FOCUS_RING_CLASS =
  "focus-visible:ring-2 focus-visible:ring-primary/[0.08] border-border";

// ─── Semantic status badges (use design tokens, not raw colors) ───────────────

/** Base status badge: small pill shape. */
export const STATUS_BADGE_BASE =
  "inline-flex items-center rounded-md border px-2 py-0.5 " + TYPO_LABEL + " select-none";

/** Active / approved status (success). */
export const STATUS_BADGE_SUCCESS_CLASS =
  `${STATUS_BADGE_BASE} border-success/15 bg-success/[0.06] text-success/90`;

/** Inactive / draft status (muted). */
export const STATUS_BADGE_MUTED_CLASS =
  `${STATUS_BADGE_BASE} border-border/35 bg-muted/[0.04] text-muted-foreground/90`;

/** Closed / deadline status (warning). */
export const STATUS_BADGE_WARNING_CLASS =
  `${STATUS_BADGE_BASE} border-warning/15 bg-warning/[0.06] text-warning/90`;

// ─── Icon boxes (section headers, cards) ─────────────────────────────────────

/** Base icon container: size, center, rounded. */
export const ICON_BOX_CLASS =
  "flex size-10 shrink-0 items-center justify-center rounded-lg";

/** Muted icon box (dashboards, secondary sections). */
export const ICON_BOX_MUTED_CLASS = `${ICON_BOX_CLASS} bg-muted/80 text-muted-foreground`;

/** Primary-accent icon box (highlighted sections) — minimal, refined. */
export const ICON_BOX_PRIMARY_CLASS =
  `${ICON_BOX_CLASS} border border-primary/15 bg-primary/8 text-primary`;

// ─── Alerts & inline feedback ───────────────────────────────────────────────

/** Warning/closure alert. Use for submission closed, deadlines. */
export const ALERT_WARNING_CLASS =
  "rounded-xl border border-warning/15 bg-warning/[0.06] text-warning/90";

/** Success/status inline block — form success, completion messages. */
export const FORM_SUCCESS_BLOCK_CLASS =
  "rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary";

/** Inline error block — subtle, minimalist. */
export const DESTRUCTIVE_INLINE_CLASS =
  "rounded-lg border border-destructive/12 bg-destructive/[0.03] px-3 py-2 text-xs leading-relaxed text-destructive/90";

/** Inline error with left accent — form/block errors, refined. */
export const DESTRUCTIVE_INLINE_ACCENT_CLASS =
  "rounded-lg border-l-[3px] border-l-destructive/30 border border-destructive/12 bg-destructive/[0.03] px-3 py-2 text-xs leading-relaxed text-destructive/90";

// ─── Buttons & form actions (refined, consistent) ─────────────────────────────

/** Standard form submit button — h-9, refined. */
export const FORM_SUBMIT_BUTTON_CLASS =
  "h-9 min-w-[6rem] rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground shadow-[var(--shadow-card-subtle)] transition-all duration-200 hover:bg-primary/95";

/** Standard form outline/cancel button — h-9, matches submit height. */
export const FORM_OUTLINE_BUTTON_CLASS =
  "h-9 rounded-lg border border-border/80 px-4 text-sm font-medium transition-colors duration-200 hover:bg-muted/[0.06]";
