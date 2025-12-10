export const metadata = {
  title: 'FAQ',
};

export default function FaqPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6 text-white/80">
        <h1 className="text-3xl font-bold text-white">Frequently Asked Questions</h1>
        <ul className="space-y-3 text-sm leading-relaxed">
          <li>
            <strong>How do I book?</strong> Choose a hotel, select a rate, and follow the
            checkout flow.
          </li>
          <li>
            <strong>Can I cancel?</strong> Depends on the rate plan; see the cancellation
            policy shown during booking.
          </li>
          <li>
            <strong>Do you save my card?</strong> Payments are processed via Stripe;
            sensitive card data is not stored on our servers.
          </li>
        </ul>
      </div>
    </main>
  );
}

