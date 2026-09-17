import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "ADMIN" | "CUSTOMER";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  customerId?: string;
  name?: string;
  customerCode?: string;
}

const COOKIE_NAME = "isp_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default-fallback-super-secret-key-at-least-32-chars-long"
);

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function decryptSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await decryptSession(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    redirect("/portal/dashboard");
  }
  return session;
}

export async function requireCustomer(): Promise<SessionPayload & { customerId: string }> {
  const session = await requireAuth();
  if (session.role !== "CUSTOMER" || !session.customerId) {
    redirect("/admin/dashboard");
  }
  return session as SessionPayload & { customerId: string };
}

