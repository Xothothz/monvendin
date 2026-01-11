import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getMarkdown } from "@/lib/content";
import { AProposContent } from "./AProposContent";

export const metadata = {
  title: "A propos / mentions",
  description: "Presentation du projet monvendin.fr et mentions d'independance."
};

export const dynamic = "force-dynamic";

export default async function AProposPage() {
  let content = getMarkdown("a-propos");
  let contentId: string | null = null;

  try {
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "page-contents",
      depth: 0,
      limit: 1,
      where: {
        slug: {
          equals: "a-propos"
        }
      }
    });
    const doc = response.docs?.[0] as { id?: string | number; content?: string } | undefined;
    if (doc?.content) {
      content = doc.content;
    }
    if (doc?.id) {
      contentId = String(doc.id);
    }
  } catch {
    content = getMarkdown("a-propos");
    contentId = null;
  }
  return (
    <div className="space-y-8 section-stack">
      <AProposContent
        slug="a-propos"
        initialContent={content}
        initialContentId={contentId}
      />
    </div>
  );
}
