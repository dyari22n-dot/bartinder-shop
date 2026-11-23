import { connection } from "next/server";
import { netlifyBlobsEnabled, readMediaFromNetlifyBlobs } from "@/lib/netlify-storage";

const CONTENT_TYPES: Record<string, string> = {
  gif: "image/gif",
  jpg: "image/jpeg",
  mp4: "video/mp4",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  await connection();
  if (!netlifyBlobsEnabled()) return new Response("Not found", { status: 404 });

  const { filename } = await context.params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:gif|jpg|mp4|webp)$/i.test(
      filename,
    )
  ) {
    return new Response("Not found", { status: 404 });
  }

  const media = await readMediaFromNetlifyBlobs(filename);
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(media.data, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type":
        media.contentType || CONTENT_TYPES[filename.split(".").pop() ?? ""] ||
        "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
