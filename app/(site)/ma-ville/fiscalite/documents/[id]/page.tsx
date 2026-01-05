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

const typeLabel = (value?: string | null) => {
  switch (value) {
    case "dob":
      return "DOB";
    case "bp":
      return "BP";
    case "ca":
      return "CA";
    case "deliberation":
      return "Deliberation";
    case "rapport":
      return "Rapport";
    case "annexe":
      return "Annexe";
    case "vendinfos":
      return "Vendinfos";
    default:
      return "Autre";
  }
};

const isPdf = (doc: DocumentItem) => {
  if (doc.mimeType === "application/pdf") return true;
  if (doc.filename) {
    return doc.filename.toLowerCase().endsWith(".pdf");
  }
  return false;
};

export default async function FiscaliteDocumentPage({ params }: PageProps) {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });
  const doc = (await payload.findByID({
    collection: "documents",
    id
  })) as DocumentItem | null;

  if (!doc) return notFound();
  if (!doc.url) return notFound();
  if (!isPdf(doc)) {
    redirect(doc.url);
  }

  return (
    <div className="space-y-6 section-stack">
      <header className="space-y-2">
        <PageTitle title={doc.title} watermark="Document" />
        <div className="flex flex-wrap gap-4 text-sm text-slate">
          <span>Type: {typeLabel(doc.documentType)}</span>
          <span>Date du document: {formatDate(doc.documentDate)}</span>
          <span>Date d'upload: {formatDate(doc.createdAt)}</span>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-card">
        <iframe
          title={doc.title}
          src={`${doc.url}#view=FitH`}
          className="h-[70vh] w-full"
        />
      </div>

      <a
        href={doc.url}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
        download
      >
        Telecharger le document
      </a>
    </div>
  );
}
