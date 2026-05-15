import AdminShell from "@/components/AdminShell";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const displayName = user.name?.trim() || user.email.split("@")[0];

  return (
    <AdminShell
      user={{
        name: displayName,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
