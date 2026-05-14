"use client";
import { useState, useEffect } from "react";

export default function CarActions({ carId }: { carId: string }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("token="));
    if (!token) return;
    fetch(`/api/favorites`).then(r => r.json()).then(data => {
      setIsFavorited(data.some((f: { carId: string }) => f.carId === carId));
    }).catch(() => {});
    fetch(`/api/cart`).then(r => r.json()).then(data => {
      setIsInCart(data.some((c: { carId: string }) => c.carId === carId));
    }).catch(() => {});
  }, [carId]);

  async function toggleFavorite() {
    await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carId }) });
    setIsFavorited(!isFavorited);
  }

  async function toggleCart() {
    await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carId }) });
    setIsInCart(!isInCart);
  }

  return (
    <div className="flex gap-3 mb-6">
      <button onClick={toggleCart} className={`flex-1 py-3 rounded-lg font-medium text-sm transition-colors ${isInCart ? "bg-zinc-200 text-zinc-900" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}>
        {isInCart ? "Remover do carrinho" : "Adicionar ao carrinho"}
      </button>
      <button onClick={toggleFavorite} className={`px-4 py-3 rounded-lg border transition-colors ${isFavorited ? "border-red-300 text-red-500 bg-red-50" : "border-zinc-300 text-zinc-600 hover:border-zinc-900"}`}>
        {isFavorited ? "♥" : "♡"}
      </button>
    </div>
  );
}
