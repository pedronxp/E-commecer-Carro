"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type SearchFiltersProps = {
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
};

export default function SearchFilters({ brands, categories }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [brandId, setBrandId] = useState(searchParams.get("brandId") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  function handleFilter() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (brandId) params.set("brandId", brandId);
    if (categoryId) params.set("categoryId", categoryId);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/carros?${params.toString()}`);
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Buscar carros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900">
          <option value="">Todas as marcas</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900">
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input
          type="number" placeholder="Preço mín."
          value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          type="number" placeholder="Preço máx."
          value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <button onClick={handleFilter} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
        Filtrar
      </button>
    </div>
  );
}
