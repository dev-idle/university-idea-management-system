/**
 * Theme class names applied by next-themes to the document root (<html>).
 * Keep in sync with globals.css (.dark) and next-themes ThemeProvider attribute="class".
 */
export const THEME_CLASS = {
  LIGHT: "",
  DARK: "dark",
} as const;

/** CSS selectors for chart theme scoping (light = root, dark = .dark ancestor). */
export const CHART_THEME_SELECTORS = {
  light: "",
  dark: `.${THEME_CLASS.DARK}`,
} as const;
