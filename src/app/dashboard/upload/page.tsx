import { getViewContext } from "@/lib/viewing";
import { stopViewingClient } from "@/app/dashboard/actions";
import UploadFlow from "@/components/UploadFlow";

export default async function UploadPage() {
  const { user, viewing, clientLabel } = await getViewContext();

  // A coach viewing a client's account can't add reports to it.
  if (viewing) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <h1 className="text-2xl font-semibold">Upload a report</h1>
        <p className="mx-auto mt-2 max-w-sm text-[var(--muted)]">
          You&apos;re viewing {clientLabel}&apos;s account. Only {clientLabel}{" "}
          can add reports to it.
        </p>
        <form action={stopViewingClient} className="mt-6">
          <button type="submit" className="btn btn-primary">
            Back to my account
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload a report</h1>
        <p className="text-sm text-[var(--muted)]">
          Add a Confidence Profile PDF. We&apos;ll read it, then let you confirm
          the values before saving.
        </p>
      </div>
      <UploadFlow userId={user.id} />
    </div>
  );
}
