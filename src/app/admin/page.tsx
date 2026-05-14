export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [carCount, brandCount, categoryCount] = await Promise.all([
    prisma.car.count(),
    prisma.brand.count(),
    prisma.category.count(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Carros" value={carCount} href="/admin/cars" />
        <StatCard label="Marcas" value={brandCount} href="/admin/brands" />
        <StatCard label="Categorias" value={categoryCount} href="/admin/categories" />
      </div>
      <Link href="/admin/cars-new" className="inline-flex bg-zinc-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors">
        + Novo Carro
      </Link>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <p className="text-3xl font-bold text-zinc-900">{value}</p>
      <p className="text-zinc-500 text-sm mt-1">{label}</p>
    </Link>
  );
}

