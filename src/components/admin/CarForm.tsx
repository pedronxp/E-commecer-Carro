"use client";

import { useState } from "react";

type Brand = { id: string; name: string };
type Category = { id: string; name: string };

export function CarForm({
  action,
  brands,
  categories,
}: {
  action: (formData: FormData) => Promise<string | void>;
  brands: Brand[];
  categories: Category[];
}) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await action(formData);

    setSubmitting(false);
    if (result) {
      setError(result);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Título" name="title" required placeholder="Ex: Honda Civic EXL 2024" />
        <InputField label="Preço (R$)" name="price" type="number" required placeholder="Ex: 150000" />
        <InputField label="Ano" name="year" type="number" required placeholder="Ex: 2024" />
        <InputField label="Quilometragem" name="mileage" type="number" placeholder="Ex: 0" />
        <InputField label="Combustível" name="fuelType" placeholder="Ex: Gasolina, Flex, Diesel, Elétrico" />
        <InputField label="Câmbio" name="transmission" placeholder="Ex: Manual, Automático, CVT" />
        <InputField label="Cor" name="color" placeholder="Ex: Preto, Branco, Prata" />
        <InputField label="Portas" name="doors" type="number" placeholder="Ex: 4" />
        <InputField label="Lugares" name="capacity" type="number" placeholder="Ex: 5" />
        <InputField label="Localização" name="location" placeholder="Ex: São Paulo, SP" />

        <SelectField label="Marca" name="brandId" required>
          <option value="">Selecione a marca</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </SelectField>
        <SelectField label="Categoria" name="categoryId" required>
          <option value="">Selecione a categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectField>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          name="description"
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Descreva o veículo, seus diferenciais e condições..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URLs das Imagens (uma por linha)</label>
        <textarea
          name="imageUrls"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder={"https://exemplo.com/imagem1.jpg\nhttps://exemplo.com/imagem2.jpg"}
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="isFeatured"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-gray-700">Carro em destaque</span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Criando..." : "Criar Carro"}
        </button>
      </div>
    </form>
  );
}

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {children}
      </select>
    </div>
  );
}
