import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLinksAsCoach } from "@/lib/data";
import { getViewContext } from "@/lib/viewing";
import DashboardHeader from "@/components/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [coachLinks, { viewing, clientLabel }] = await Promise.all([
    getLinksAsCoach(supabase, user),
    getViewContext(),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <DashboardHeader
        email={user.email}
        isCoach={coachLinks.length > 0}
        viewingLabel={viewing ? clientLabel : null}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 print:max-w-none print:p-0">
        {children}
      </div>
    </div>
  );
}
