export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-md border border-line bg-white p-6">
        <h1 className="text-2xl font-semibold">No account needed</h1>
        <p className="mt-2 text-sm text-stone-600">Context Doc Builder is now local-first and free. Use the app without signing in.</p>
        <a className="mt-6 inline-flex min-h-10 items-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-white" href="/app">
          Open app
        </a>
      </section>
    </main>
  );
}
