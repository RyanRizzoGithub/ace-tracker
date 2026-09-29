import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { getActiveCoachLink, getCurrentUser } from "./data";
import type { CoachLink } from "./types";

/**
 * "Viewing a client's account": a coach opens a client from the Clients page
 * and every dashboard tab (Overview, Reports, Compare, Profiles) then shows
 * that client's data, read-only, until they exit.
 *
 * The cookie only records which client was opened. It is re-checked against
 * an active coaching link on every request, and row-level security is what
 * actually grants (or denies) read access to the client's rows.
 */
export const VIEWING_COOKIE = "ace_viewing_client";

export interface ViewContext {
  user: User;
  /** Whose reports the dashboard shows: the user's own, or the client's. */
  subjectId: string;
  /** Set while a coach is viewing a client's account. */
  viewing: CoachLink | null;
  /** Display name for the client being viewed. */
  clientLabel: string;
}

export function clientLabelOf(link: CoachLink | null): string {
  return link?.client_name || link?.client_email || "your client";
}

async function load(): Promise<ViewContext> {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  const clientId = (await cookies()).get(VIEWING_COOKIE)?.value;
  const viewing =
    clientId && clientId !== user.id
      ? await getActiveCoachLink(supabase, user.id, clientId)
      : null;
  return {
    user,
    subjectId: viewing ? viewing.client_id : user.id,
    viewing,
    clientLabel: clientLabelOf(viewing),
  };
}

/** Memoised per request, so the layout and page share one lookup. */
export const getViewContext = cache(load);
