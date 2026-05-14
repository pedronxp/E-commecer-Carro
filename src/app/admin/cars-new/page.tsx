"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminCarsNewPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [color, setColor] = useState("");
  const [doors, setDoors] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/brands").then(r => r.json()).then(setBrands);
    fetch("/api/categories").then(r => r.json()).then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const images = imageUrl ? imageUrl.split("\n").map(s => s.trim()).filter(Boolean) : [];

    const res = await fetch("/api/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, description, price, year, mileage: mileage || null,
        fuelType, transmission, color, doors: doors || null,
        capacity: capacity || null, location, brandId, categoryId,
        images, isFeatured,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return setError(data.error || "Erro ao criar");
    }

    router.push("/admin");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Novo Carro</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Título" value={title} onChange={setTitle} required />
          <InputField label="Preço (R$)" type="number" value={price} onChange={setPrice} required />
          <InputField label="Ano" type="number" value={year} onChange={setYear} required />
          <InputField label="Quilometragem" type="number" value={mileage} onChange={setMileage} />
          <InputField label="Combustível" value={fuelType} onChange={setFuelType} placeholder="Ex: Gasolina, Flex, Diesel" />
          <InputField label="Câmbio" value={transmission} onChange={setTransmission} placeholder="Ex: Manual, Automático" />
          <InputField label="Cor" value={color} onChange={setColor} />
          <InputField label="Portas" type="number" value={doors} onChange={setDoors} />
          <InputField label="Lugares" type="number" value={capacity} onChange={setCapacity} />
          <InputField label="Localização" value={location} onChange={setLocation} placeholder="Ex: São Paulo, SP" />

          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900">
            <option value="">Selecione a marca</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900">
            <option value="">Selecione a categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">URLs das Imagens (uma por linha)</label>
          <textarea value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} rows={3} placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
          Carro em destaque
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors">
          Criar Carro
        </button>
      </form>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
    </div>
  );
}

