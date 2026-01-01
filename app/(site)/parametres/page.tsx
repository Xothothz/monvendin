import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { PageTitle } from "@/components/PageTitle";
import { ParametresAccess } from "./ParametresAccess";
import { ParametresShell } from "./ParametresShell";

export const metadata = {
  title: "Parametres"
};

export const dynamic = "force-dynamic";

type ParametresPageProps = {
  searchParams?: Promise<{
    access?: string;
  }>;
};

export default async function ParametresPage({ searchParams }: ParametresPageProps) {
  const payload = await getPayload({ config: configPromise });
  const h = await headers();
  const requestHeaders = new Headers(h as any);


  let role: string | undefined;

  try {
    const authResult = await payload.auth({ headers: requestHeaders });
    if (authResult.user && typeof authResult.user === "object") {
      role = (authResult.user as { role?: string }).role;
    }
  } catch {
    role = undefined;
  }

  const isAdmin = role === "admin";

  // Next 15: searchParams peut être async selon le typing du projet
  const sp = searchParams ? await searchParams : undefined;
  const accessDenied = sp?.access === "denied";

  if (isAdmin && accessDenied) {
    redirect("/parametres");
  }

  if (!isAdmin && !accessDenied) {
    redirect("/parametres?access=denied");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <PageTitle title="Parametres" watermark="Configuration" />
        <p className="text-slate max-w-2xl">
          Administration des acces, contenus et reglages generaux.
        </p>
      </header>

      {isAdmin ? <ParametresShell /> : <ParametresAccess />}
    </div>
  );
}
