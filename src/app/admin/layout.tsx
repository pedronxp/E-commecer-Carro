import AdminShell from "@/components/AdminShell";
import { isRecoverableDatabaseError, withDatabaseTimeout } from "@/lib/database-resilience";
import { getCurrentUser, getSession } from "@/lib/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminLayoutUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "USER") {
    redirect("/");
  }

  const displayName = user.name?.trim() || user.email.split("@")[0];
  const headerStore = await headers();
  const forwardedIp = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerStore.get("x-real-ip")?.trim();
  const ipAddress = normalizeIpAddress(forwardedIp || realIp);
  const city = formatHeaderLocation(
    headerStore.get("x-vercel-ip-city"),
    headerStore.get("x-vercel-ip-country-region"),
  );

  return (
    <AdminShell
      user={{
        name: displayName,
        email: user.email,
        role: user.role,
      }}
      ipAddress={ipAddress}
      city={city}
    >
      {children}
    </AdminShell>
  );
}

async function getAdminLayoutUser() {
  try {
    return await withDatabaseTimeout(getCurrentUser());
  } catch (error) {
    if (process.env.NODE_ENV === "production" || !isRecoverableDatabaseError(error)) {
      throw error;
    }

    const session = await getSession();
    if (!session) return null;

    console.error("[admin/layout] Failed to load current user from database", error);
    return {
      id: session.sub,
      name: session.name,
      email: session.email,
      role: session.role,
    };
  }
}

function normalizeIpAddress(value?: string | null): string {
  const ip = value?.trim();
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return "IP local";
  }

  return ip;
}

function formatHeaderLocation(city?: string | null, region?: string | null): string {
  const decodedCity = safeDecode(city);
  const decodedRegion = safeDecode(region);

  if (decodedCity && decodedRegion) {
    return `${decodedCity}, ${decodedRegion}`;
  }

  return decodedCity || "Localização";
}

function safeDecode(value?: string | null): string {
  if (!value) return "";

  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}
