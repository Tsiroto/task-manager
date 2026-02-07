export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <section className="container mx-auto px-4 py-32">
          <h1 className="text-6xl font-bold">Commercial</h1>
          <p className="mt-3 text-2xl text-gray-800">Capture, organize, and manage your business data efficiently.</p>
          <div className="mt-8">
            <button>Engage</button>
          </div>
        </section>
      </main>
    </div>
  );
}
