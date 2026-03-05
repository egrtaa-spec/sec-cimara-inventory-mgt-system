import { cookies } from "next/headers";
import { type SiteKey as AppSiteKey } from "./sites";
import { redirect } from "next/navigation";

// ✅ Dynamic Site Key: 'WAREHOUSE' is now a valid internal site for Admins
export type SiteKey = AppSiteKey | "WAREHOUSE";

export type Session = {
  user: {
    id: string;
    name: string;
    username: string;
    site: SiteKey; 
  };
  role: "ENGINEER" | "ADMIN"; 
  name: string;      
  username: string;  
  site: SiteKey;     
};

export const SESSION_COOKIE_NAME = "cimara_session";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionData) return null;

  try {
    const parsed = JSON.parse(sessionData);
    // ✅ Standardization: Ensures the frontend 'Header' and 'API' both see the same user object
    return {
      ...parsed,
      user: parsed.user || { 
        name: parsed.name, 
        username: parsed.username, 
        site: parsed.site || "WAREHOUSE" 
      }
    };
  } catch (e) {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  // ✅ Access Control: Only 'ADMIN' can write to the WAREHOUSE database directly
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }
  return session;
}

export async function requireEngineer() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}