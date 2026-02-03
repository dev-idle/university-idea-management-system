import Link from "next/link";
import { ErrorBoundaryView } from "@/components/ui/error-boundary-view";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 font-sans">
      <ErrorBoundaryView
        title="Page not found"
        description="This page could not be found."
        primaryLink={{ href: "/", label: "Back to home" }}
      />
    </div>
  );
}
