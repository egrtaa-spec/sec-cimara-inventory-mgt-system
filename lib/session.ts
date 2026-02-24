import { cookies } from "next/headers";

export type SiteKey = "ENAM" | "MINFOPRA" | "SUPPTIC" | "ISMP" | "SDP" | "WAREHOUSE";

export type Session = {
  user: any;
  role: "ENGINEER" | "ADMIN"; 
  name: string;
  username: string;
  site: SiteKey;
};

export const SESSION_COOKIE_NAME = "cimara_session";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return sessionData ? JSON.parse(sessionData) : null;
}

// ✅ FIX: Add these exported helper functions
export async function requireEngineer() {
  const session = await getSession(); // or however you retrieve your session
  if (!session || session.role !== 'ENGINEER') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}