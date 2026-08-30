import { createClient } from "@/lib/supabase/server";
import UploadFlow from "@/components/UploadFlow";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload a report</h1>
        <p className="text-sm text-[var(--muted)]">
          Add a Confidence Profile PDF. We&apos;ll read it, then let you confirm
          the values before saving.
        </p>
      </div>
      <UploadFlow userId={user!.id} />
    </div>
  );
}
