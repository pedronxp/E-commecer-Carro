"use client";

import { useEffect, useState } from "react";

export default function CarActions({ carId }: { carId: string }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    fetch("/api/favorites")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        setIsFavorited(data.some((favorite: { carId: string }) => favorite.carId === carId));
      })
      .catch(() => {});

    fetch("/api/cart")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        setIsInCart(data.some((item: { carId: string }) => item.carId === carId));
      })
      .catch(() => {});
  }, [carId]);

  async function toggleFavorite() {
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId }),
    });
    if (response.ok) {
      setIsFavorited((current) => !current);
    }
  }

  async function toggleCart() {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId }),
    });
    if (response.ok) {
      setIsInCart((current) => !current);
    }
  }

  return (
    <div className="mb-6 flex gap-3">
      <button
        onClick={toggleCart}
        className={`flex-1 rounded-lg py-3 text-sm font-medium transition-colors ${
          isInCart ? "bg-zinc-200 text-zinc-900" : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        {isInCart ? "Remover do carrinho" : "Adicionar ao carrinho"}
      </button>
      <button
        onClick={toggleFavorite}
        className={`rounded-lg border px-4 py-3 transition-colors ${
          isFavorited ? "border-red-300 bg-red-50 text-red-500" : "border-zinc-300 text-zinc-600 hover:border-zinc-900"
        }`}
      >
        {isFavorited ? "♥" : "♡"}
      </button>
    </div>
  );
}
