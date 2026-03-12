import { NextResponse } from "next/server";
import { handleLoginRequest } from "@/lib/api/login";

const JSON_CONTENT_TYPE = "application/json";

/**
 * Route Handler for login. Logic lives in lib/api/login.ts.
 * Avoids Server Action revalidation → no full-page loading on wrong password.
 */
export async function POST(request: Request) {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.includes(JSON_CONTENT_TYPE)) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  const result = await handleLoginRequest(body);
  if (result.ok) {
    return NextResponse.json({ ok: true, data: result.data });
  }
  return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
}
