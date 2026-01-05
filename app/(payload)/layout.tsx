import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import configPromise from "@payload-config";
import { importMap } from "./admin/importMap";

type LayoutProps = {
  children: React.ReactNode;
};

const serverFunction = async (args: { name: string; args: Record<string, unknown> }) => {
  "use server";
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap
  });
};

export default async function PayloadLayout({ children }: LayoutProps) {
  return RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction
  });
}
