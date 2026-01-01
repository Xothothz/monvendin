import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true
});

export const renderMarkdown = (content: string) => {
  const rendered = marked.parse(content);
  return typeof rendered === "string" ? rendered : "";
};
