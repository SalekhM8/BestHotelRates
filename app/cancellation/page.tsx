export const metadata = {
  title: 'Cancellation Policy',
};

export default function CancellationPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6 text-white/80">
        <h1 className="text-3xl font-bold text-white">Cancellation Policy</h1>
        <p className="text-sm leading-relaxed">
          Cancellation terms depend on the rate plan you select. Flexible rates may allow
          free cancellation until the cutoff shown at checkout; non-refundable rates do
          not. This placeholder will be replaced with your full policy text.
        </p>
      </div>
    </main>
  );
}

