import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ProPageRenderer } from "@/components/pro/ProPageRenderer";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProPage({ params }: PageProps) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "pro-pages",
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: slug
      }
    }
  });

  const page = result.docs?.[0];
  if (!page) {
    return notFound();
  }

  return <ProPageRenderer site={page} pageKey="home" />;
}
