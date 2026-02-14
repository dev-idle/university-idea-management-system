/**
 * Shared design tokens for the application (Staff + Role Managers).
 * Use for consistent, professional UI: cards, headers, spacing, typography.
 *
 * Color opacity scale (use consistently across Academic, User, Department, Profile, Dashboard):
 * - Borders: border/20 (hairline), border/40 (subtle), border/60 (medium), border/80 (strong)
 * - Muted bg: muted/10, muted/20, muted/25, muted/40, muted/50
 * - Primary accents: primary/5 (hover), primary/10 (bg), primary/20 (border), primary/30 (accent)
 * - Text: foreground, foreground/85, foreground/90; muted-foreground, muted-foreground/90
 * - Destructive: destructive/5 (bg), destructive/20 (border)
 * - Use semantic tokens (primary, muted, destructive, etc.) — never raw colors.
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
  "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 " + TYPO_NAV + " text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Primary action button (height + rounding). */
export const BUTTON_PRIMARY_CLASS = "h-9 gap-2 rounded-lg px-4";

/** Loading state wrapper (centered, min height). */
export const LOADING_WRAPPER_CLASS =
  "flex min-h-[40vh] items-center justify-center";

/** Loading / empty state text. */
export const LOADING_TEXT_CLASS = TYPO_BODY_SM;

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

/** Standard focus ring (outline + ring). Use for links, cards, buttons. */
export const FOCUS_RING_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Primary-tinted focus ring for buttons and interactive elements. */
export const FOCUS_RING_PRIMARY_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2";

/** Input/select focus (border + ring). Use with rounded-lg inputs. */
export const INPUT_FOCUS_RING_CLASS =
  "focus-visible:ring-2 focus-visible:ring-primary/20 border-border";

// ─── Semantic status badges (use design tokens, not raw colors) ───────────────

/** Base status badge: small pill shape. */
export const STATUS_BADGE_BASE =
  "inline-flex items-center rounded-md border px-2 py-0.5 " + TYPO_LABEL + " select-none";

/** Active / approved status (success). */
export const STATUS_BADGE_SUCCESS_CLASS =
  `${STATUS_BADGE_BASE} border-success/30 bg-success/10 text-success`;

/** Inactive / draft status (muted). */
export const STATUS_BADGE_MUTED_CLASS =
  `${STATUS_BADGE_BASE} border-border bg-muted/50 text-muted-foreground`;

/** Closed / deadline status (warning). */
export const STATUS_BADGE_WARNING_CLASS =
  `${STATUS_BADGE_BASE} border-warning/30 bg-warning/10 text-warning-foreground`;

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

/** Warning/closure alert. Use for submission closed, deadlines. Uses semantic --warning. */
export const ALERT_WARNING_CLASS =
  "rounded-xl border border-warning/30 bg-warning/10 text-warning";

/** Inline destructive block (validation, errors). */
export const DESTRUCTIVE_INLINE_CLASS =
  "rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm leading-relaxed text-destructive";

/** Inline destructive with left accent (form/block errors). */
export const DESTRUCTIVE_INLINE_ACCENT_CLASS =
  "rounded-lg border-l-4 border-destructive/50 border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm leading-relaxed text-destructive";

// ─── Buttons & form actions (refined, consistent) ─────────────────────────────

/** Standard form submit button — h-9, refined. */
export const FORM_SUBMIT_BUTTON_CLASS =
  "h-9 min-w-[6rem] rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground shadow-sm shadow-primary/5 transition-all duration-150 hover:bg-primary/90";

/** Standard form outline/cancel button — h-9, matches submit height. */
export const FORM_OUTLINE_BUTTON_CLASS =
  "h-9 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted/10";
