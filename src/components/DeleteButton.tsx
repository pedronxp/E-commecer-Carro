"use client";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id, type }: { id: string; type: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Tem certeza?")) return;
    await fetch(`/api/${type}s/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 transition-colors">
      Excluir
    </button>
  );
}
