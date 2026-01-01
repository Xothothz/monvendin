import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");

export const getMarkdown = (slug: string) => {
  const file = path.join(contentDir, `${slug}.md`);
  return fs.readFileSync(file, "utf8");
};
