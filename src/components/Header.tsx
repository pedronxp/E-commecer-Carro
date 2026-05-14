"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("token="));
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({ name: payload.email, role: payload.role });
      } catch { /* ignore */ }
    }
  }, []);

  function handleLogout() {
    document.cookie = "token=; path=/; max-age=0";
    setUser(null);
    router.push("/");
  }

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-zinc-900 tracking-tight">
          CarStore
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link href="/cars" className="hover:text-zinc-900 transition-colors">Carros</Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-zinc-900 transition-colors">Admin</Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-zinc-500">{user.name}</span>
              <button onClick={handleLogout} className="text-sm text-zinc-600 hover:text-zinc-900">Sair</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900">Entrar</Link>
              <Link href="/register" className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors">Cadastrar</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-3">
          <Link href="/cars" className="block text-sm text-zinc-600" onClick={() => setMenuOpen(false)}>Carros</Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="block text-sm text-zinc-600" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-sm text-zinc-600">Sair</button>
          ) : (
            <>
              <Link href="/login" className="block text-sm text-zinc-600" onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link href="/register" className="block text-sm text-zinc-600" onClick={() => setMenuOpen(false)}>Cadastrar</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
