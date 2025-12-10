export const metadata = {
  title: 'Booking Policy',
};

export default function BookingPolicyPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6 text-white/80">
        <h1 className="text-3xl font-bold text-white">Booking Policy</h1>
        <p className="text-sm leading-relaxed">
          This placeholder outlines key booking rules: rates are subject to availability
          at checkout, taxes/fees shown at payment, and confirmation is issued after
          successful payment. Final supplier-specific rules will be added here.
        </p>
      </div>
    </main>
  );
}

