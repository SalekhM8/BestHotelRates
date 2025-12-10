export const metadata = {
  title: 'Terms & Conditions',
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6 text-white/80">
        <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
        <p className="text-sm leading-relaxed">
          This is a placeholder Terms & Conditions page. Your full legal copy will go
          here. For now, it outlines that bookings are subject to supplier availability,
          payment terms follow the checkout flow, and cancellations or amendments depend
          on the rate plan selected at purchase.
        </p>
      </div>
    </main>
  );
}

