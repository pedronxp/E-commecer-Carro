export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Marcas</h1>
        <Link href="/admin" className="text-sm text-zinc-600 hover:text-zinc-900">← Voltar</Link>
      </div>

      <form action="/api/brands" method="POST" className="flex gap-2 mb-6">
        <input name="name" placeholder="Nova marca..." required className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
        <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800">Adicionar</button>
      </form>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 last:border-0">
            <span className="font-medium">{brand.name}</span>
            <DeleteButton id={brand.id} type="brand" />
          </div>
        ))}
      </div>
    </div>
  );
}

