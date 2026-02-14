import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

/** Greenwich primary — matches layout themeColor & globals.css --primary (#28224B). */
const PRIMARY_HEX = "#28224B";

export const size = { width: 36, height: 36 };
export const contentType = "image/png";

export default async function Icon() {
  const iconPath = join(process.cwd(), "public", "greenwich-icon.png");
  const buffer = await readFile(iconPath);

  const scaled = await sharp(buffer)
    .trim({ threshold: 10 })
    .resize(42, 42, { fit: "cover" })
    .tint(PRIMARY_HEX)
    .png()
    .toBuffer();

  const png = await sharp(scaled)
    .extract({ left: 3, top: 3, width: 36, height: 36 })
    .png()
    .toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
}
