import { cookies } from "next/headers";
import { type SiteKey as AppSiteKey } from "./sites";
import { redirect } from "next/navigation";

export type SiteKey = AppSiteKey | "WAREHOUSE";

export type Session = {
  user: any;
  role: "ENGINEER" | "ADMIN"; 
  name: string;
  username: string;
  site: SiteKey;
};

export const SESSION_COOKIE_NAME = "cimara_session";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return sessionData ? JSON.parse(sessionData) : null;
}

export async function requireEngineer() {
  const session = await getSession();
  if (!session || (session.role !== 'ENGINEER' && session.role !== 'ADMIN')) {
    redirect('/login');
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}