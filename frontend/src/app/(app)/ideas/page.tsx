import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Ideas. Backend enforces all authorization.",
};

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Ideas</h1>
      <p className="text-sm text-muted-foreground">
        Backend enforces all authorization.
      </p>
    </div>
  );
}
