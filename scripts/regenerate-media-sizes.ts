import fs from "fs/promises";
import path from "path";
import { getPayload } from "payload";
import configPromise from "@payload-config";

type MediaDoc = {
  id: string | number;
  filename?: string | null;
  mimeType?: string | null;
};

const PAGE_SIZE = 50;
const mediaDir = path.resolve(process.cwd(), "public", "media");

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const run = async () => {
  const payload = await getPayload({ config: configPromise });

  let page = 1;
  let totalPages = 1;
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  while (page <= totalPages) {
    const result = await payload.find({
      collection: "media",
      limit: PAGE_SIZE,
      page,
      depth: 0
    });

    totalPages = result.totalPages ?? 1;

    for (const doc of result.docs as MediaDoc[]) {
      const filename = doc.filename;
      if (!filename) {
        skipped += 1;
        continue;
      }

      const filePath = path.join(mediaDir, filename);
      if (!(await fileExists(filePath))) {
        payload.logger.warn(`Missing file: ${filePath}`);
        skipped += 1;
        continue;
      }

      try {
        const data = await fs.readFile(filePath);
        const stat = await fs.stat(filePath);
        await payload.update({
          collection: "media",
          id: doc.id,
          data: {},
          file: {
            data,
            mimetype: doc.mimeType ?? "application/octet-stream",
            name: filename,
            size: stat.size
          },
          overwriteExistingFiles: true
        });
        processed += 1;
      } catch (err) {
        failed += 1;
        payload.logger.error(err);
      }
    }

    page += 1;
  }

  payload.logger.info(
    `Regenerated sizes for ${processed} files. Skipped: ${skipped}. Failed: ${failed}.`
  );
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
