"use client"

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <h1 className="text-3xl font-bold text-foreground">Algo deu errado</h1>
      <p className="mt-2 text-muted">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Tentar novamente
      </button>
    </div>
  )
}
