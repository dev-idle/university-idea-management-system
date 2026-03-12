import { cookies } from "next/headers";

/**
 * Copy refresh cookie from backend response into Next.js cookie store.
 * Server-only: use from Route Handlers or Server Actions.
 */
export async function setCookieFromBackendResponse(res: Response): Promise<void> {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return;
  const cookieStore = await cookies();
  const [first] = setCookie.split(",").map((s) => s.trim());
  const nameValue = first.split(";")[0] ?? "";
  const eq = nameValue.indexOf("=");
  const name = nameValue.slice(0, eq).trim();
  const value = nameValue.slice(eq + 1).trim();
  const options: {
    path: string;
    httpOnly: boolean;
    secure?: boolean;
    sameSite: "strict";
    maxAge?: number;
  } = {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  };
  const rest = first.split(";").slice(1);
  rest.forEach((part) => {
    const [k, v] = part.split("=").map((s) => s?.trim());
    const key = k?.toLowerCase();
    if (key === "max-age" && v) options.maxAge = parseInt(v, 10);
    else if (key === "secure") options.secure = true;
  });
  cookieStore.set(name, value, options);
}
