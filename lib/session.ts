import { cookies } from "next/headers";

// ✅ Define the type here to fix the missing module error
export type SiteKey = "ENAM" | "MINFOPRA" | "SUPPTIC" | "ISMP" | "SDP" | "WAREHOUSE";

export type Session = {
  user: any;
  role: "ENGINEER" | "ADMIN"; // ✅ Match the uppercase roles
  name: string;
  username: string;
  site: SiteKey;
};

export const SESSION_COOKIE_NAME = "cimara_session";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionData) {
    return null;
  }
  return JSON.parse(sessionData);
}
