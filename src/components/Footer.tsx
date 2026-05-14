export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p className="font-medium text-zinc-300 mb-1">CarStore</p>
        <p>&copy; {new Date().getFullYear()} CarStore. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
