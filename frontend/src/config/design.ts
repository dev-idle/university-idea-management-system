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
 * - Primary: /[0.06] ghost hover, /[0.08] action ring, /[0.12] accent bar, /30 border hover, /80 focus
 * - Text: foreground/78 header, /88 secondary, /92–95 primary; muted-foreground/80 hint
 * - Transitions: duration-200 standard
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

/** Stat: dashboard numbers, metrics. */
export const TYPO_STAT =
  "text-2xl font-bold tabular-nums tracking-tight text-primary";

/** Nav item: sidebar, breadcrumbs. */
export const TYPO_NAV =
  "text-sm font-medium";

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

/** Page content container: bottom padding for scroll. */
export const PAGE_CONTAINER_CLASS = "pb-24";

/** Narrow page wrapper (Ideas): centered, max-width, bottom padding. */
export const PAGE_WRAPPER_NARROW_CLASS = "mx-auto max-w-4xl pb-24";

/** Staff page vertical rhythm (Ideas Hub, idea detail, new proposal). Use with PAGE_WRAPPER_NARROW_CLASS. */
export const STAFF_PAGE_SPACING = "space-y-12";

/** Slightly wider page wrapper (Profile): centered, bottom padding. */
export const PAGE_WRAPPER_PROFILE_CLASS = "mx-auto max-w-5xl pb-24";

/** Card: rounded, border, background, subtle shadow. Use for content blocks. */
export const CARD_CLASS =
  "rounded-xl border border-border bg-card shadow-sm";

/** Card with primary left accent (for highlighted / main content blocks). */
export const CARD_ACCENT_CLASS =
  "rounded-xl border border-border bg-card shadow-sm overflow-hidden";

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

/** Section card header (icon + title + description). */
export const SECTION_CARD_HEADER_CLASS =
  "border-b border-border px-6 pt-5 pb-2";

/** Section card title (h2/h3). */
export const SECTION_CARD_TITLE_CLASS = TYPO_HEADING_SM;

/** Section card description (muted, below title). */
export const SECTION_CARD_DESCRIPTION_CLASS = TYPO_LEAD;

/** Back / secondary link (muted until hover). */
export const BACK_LINK_CLASS =
  "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 " + TYPO_NAV + " text-muted-foreground transition-colors duration-200 hover:bg-muted/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Primary action button (height + rounding). */
export const BUTTON_PRIMARY_CLASS = "h-9 gap-2 rounded-lg px-4";

/** Loading state wrapper (centered, min height). */
export const LOADING_WRAPPER_CLASS =
  "flex min-h-[40vh] items-center justify-center";

/** Loading / empty state text. */
export const LOADING_TEXT_CLASS = TYPO_BODY_SM;

/** Loading spinner — design scale primary/[0.08] track, full primary tip. Smooth ease-in-out via .loading-spinner. */
export const LOADING_SPINNER_CLASS =
  "loading-spinner size-4 shrink-0 rounded-full border border-primary/[0.08] border-t-primary";

/** Loading spinner large (root, full-page) — size-8. */
export const LOADING_SPINNER_LG_CLASS =
  "loading-spinner size-8 shrink-0 rounded-full border-2 border-primary/[0.08] border-t-primary";

/** Loading spinner on primary/dark bg (button) — use primary-foreground. */
export const LOADING_SPINNER_ON_PRIMARY_CLASS =
  "loading-spinner size-4 shrink-0 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground";

/** Loading spinner on primary — small (size-3) for compact buttons. */
export const LOADING_SPINNER_ON_PRIMARY_SM_CLASS =
  "loading-spinner size-3 shrink-0 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground";

/** Loading state block (spinner + optional label). Tighter, minimal. */
export const LOADING_STATE_WRAPPER_CLASS =
  "flex min-h-[8rem] items-center justify-center py-12";

/** Loading state content — compact vertical stack. */
export const LOADING_STATE_CONTENT_CLASS =
  "flex flex-col items-center gap-3";

/** Loading state label — design: muted-foreground/80 hint. */
export const LOADING_STATE_TEXT_CLASS =
  "text-xs font-medium text-muted-foreground/80";

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

// ─── Page spacing (Staff + Role Manager) ───────────────────────────────────

/** Role Manager page vertical rhythm (Admin, QA Manager, QA Coordinator). */
export const MANAGEMENT_PAGE_SPACING = "space-y-10";

// ─── Focus & interaction ───────────────────────────────────────────────────

/** Standard hover transition for nav/menu items — consistent across sidebar, header, dropdown. */
export const HOVER_TRANSITION_NAV = "transition-colors duration-200 ease-out";

/** Standard focus ring (outline + ring). Use for links, cards, buttons. */
export const FOCUS_RING_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Primary-tinted focus ring for buttons and interactive elements. */
export const FOCUS_RING_PRIMARY_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2";

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

/** Role Manager: card/panel border. Matches layout scale. */
export const MGMT_BORDER_CARD = "border-border/55";

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

/** Input/select focus (border + ring). Use with rounded-lg inputs. */
export const INPUT_FOCUS_RING_CLASS =
  "focus-visible:ring-2 focus-visible:ring-primary/20 border-border";

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
