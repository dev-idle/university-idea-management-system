import {
  LOADING_SPINNER_LG_CLASS,
  LOADING_STATE_CONTENT_CLASS,
  LOADING_STATE_TEXT_CLASS,
} from "@/config/design";

export default function RootLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className={LOADING_STATE_CONTENT_CLASS}>
        <div className={LOADING_SPINNER_LG_CLASS} aria-hidden />
        <p className={LOADING_STATE_TEXT_CLASS}>Loading…</p>
      </div>
    </div>
  );
}
