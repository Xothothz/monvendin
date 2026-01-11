import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { PageTitle } from "@/components/PageTitle";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

type DocumentItem = {
  id: string | number;
  title: string;
  documentType?: string | null;
  documentDate?: string | null;
  createdAt?: string | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  calameoId?: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

const isPdf = (doc: DocumentItem) => {
  if (doc.mimeType === "application/pdf") return true;
  if (doc.filename) {
    return doc.filename.toLowerCase().endsWith(".pdf");
  }
  return false;
};

export default async function VendinfosDocumentPage({ params }: PageProps) {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });
  const doc = (await payload.findByID({
    collection: "documents",
    id
  })) as DocumentItem | null;

  if (!doc) return notFound();
  if (doc.documentType !== "vendinfos") return notFound();
  const hasCalameo = Boolean(doc.calameoId);
  const docUrl = doc.url ?? undefined;
  if (!hasCalameo && !docUrl) return notFound();
  if (!hasCalameo && !isPdf(doc) && docUrl) {
    redirect(docUrl);
  }

  return (
    <div className="space-y-6 section-stack">
      <header className="space-y-2">
        <PageTitle title={doc.title} watermark="Vendinfos" />
        <div className="flex flex-wrap gap-4 text-sm text-slate">
          <span>Publication: {formatDate(doc.documentDate)}</span>
          <span>Date d'upload: {formatDate(doc.createdAt)}</span>
        </div>
      </header>

      {hasCalameo ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-card">
            <iframe
              title={doc.title}
              src={`https://v.calameo.com/?bkcode=${doc.calameoId}`}
              className="h-[70vh] w-full"
              allowFullScreen
            />
          </div>
          <a
            href={`https://www.calameo.com/books/${doc.calameoId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
            target="_blank"
            rel="noreferrer"
          >
            Voir sur Calameo
          </a>
        </>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-card">
            <iframe
              title={doc.title}
              src={`${docUrl}#view=FitH`}
              className="h-[70vh] w-full"
            />
          </div>
          <a
            href={docUrl}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
            download
          >
            Telecharger le document
          </a>
        </>
      )}
    </div>
  );
}
