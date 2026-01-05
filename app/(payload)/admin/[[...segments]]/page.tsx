import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import configPromise from "@payload-config";
import { importMap } from "../payloadImportMap";

type PageProps = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = ({ params, searchParams }: { params: PageProps["params"]; searchParams: PageProps["searchParams"] }) =>
  generatePageMetadata({ config: configPromise, params, searchParams });

export default async function AdminPage({ params, searchParams }: PageProps) {
  const safeParams = (async () => {
    const p = await params;
    return { segments: p.segments ?? [] };
  })();
  return RootPage({ config: configPromise, importMap, params: safeParams, searchParams });
}
