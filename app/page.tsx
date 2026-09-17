import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else {
    redirect("/portal/dashboard");
  }
}

