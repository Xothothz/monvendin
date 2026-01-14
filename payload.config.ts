import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import sharp from "sharp";

import { Events } from "./payload/collections/Events";
import { Media } from "./payload/collections/Media";
import { Users } from "./payload/collections/Users";
import { Officials } from "./payload/collections/Officials";
import { Delegates } from "./payload/collections/Delegates";
import { Sectors } from "./payload/collections/Sectors";
import { Documents } from "./payload/collections/Documents";
import { CouncilReports } from "./payload/collections/CouncilReports";
import { PageHeroes } from "./payload/collections/PageHeroes";
import { HistorySections } from "./payload/collections/HistorySections";
import { HomeBanners } from "./payload/collections/HomeBanners";
import { SchoolMenus } from "./payload/collections/SchoolMenus";
import { SchoolMenuSettings } from "./payload/collections/SchoolMenuSettings";
import { Actualites } from "./payload/collections/Actualites";
import { Annuaire } from "./payload/collections/Annuaire";
import { PageTexts } from "./payload/collections/PageTexts";
import { PageContents } from "./payload/collections/PageContents";
import { Files } from "./payload/collections/Files";
import { ProPages } from "./payload/collections/ProPages";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users"
  },
  routes: {
    admin: "/admin",
    api: "/api"
  },
  collections: [
    Users,
    Media,
    Files,
    Documents,
    Events,
    Officials,
    Delegates,
    Sectors,
    CouncilReports,
    PageHeroes,
    HistorySections,
    HomeBanners,
    SchoolMenus,
    SchoolMenuSettings,
    Actualites,
    Annuaire,
    PageTexts,
    PageContents,
    ProPages
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI
    }
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts")
  }
});
