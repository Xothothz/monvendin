import { CenteredPageHeader } from "@/components/CenteredPageHeader";

export const metadata = {
  title: "Tourisme"
};

export default function TourismePage() {
  return (
    <div className="space-y-4">
      <CenteredPageHeader
        label="Tourisme"
        title="Tourisme"
        description="Decouvrir la ville, ses parcours et son patrimoine."
      />
      <p className="text-slate">Site en construction.</p>
    </div>
  );
}
