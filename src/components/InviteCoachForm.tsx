"use client";

import { useActionState, useEffect, useRef } from "react";
import { inviteCoach } from "@/app/dashboard/actions";

export default function InviteCoachForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(inviteCoach, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      const email = formRef.current?.elements.namedItem("coach_email");
      if (email instanceof HTMLInputElement) email.value = "";
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Your coach&apos;s email</span>
          <input
            name="coach_email"
            type="email"
            required
            className="input"
            placeholder="coach@example.com"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Your name, as your coach should see it</span>
          <input name="client_name" className="input" defaultValue={defaultName} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Inviting…" : "Invite coach"}
        </button>
        {state && (
          <span
            className="text-sm"
            style={{ color: state.ok ? "var(--teal-dark)" : "var(--oc)" }}
          >
            {state.ok
              ? "Invitation created. Let your coach know to sign in to ACE Tracker with that email."
              : state.error}
          </span>
        )}
      </div>
    </form>
  );
}
