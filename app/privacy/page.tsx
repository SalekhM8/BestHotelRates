import { GlassCard } from '@/components/ui/GlassCard';

export const metadata = {
  title: 'Privacy Policy - Best Hotel Rates',
  description: 'How Best Hotel Rates collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-white/70 mb-8">Last updated: January 2025</p>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              Best Hotel Rates ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our website and services. We comply with 
              the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="text-white/80 leading-relaxed mb-4">We collect the following types of information:</p>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• <strong>Personal Information:</strong> Name, email address, phone number, and payment details when you make a booking.</li>
              <li>• <strong>Booking Information:</strong> Travel dates, hotel preferences, guest details, and special requests.</li>
              <li>• <strong>Account Information:</strong> Login credentials, profile information, and booking history.</li>
              <li>• <strong>Technical Data:</strong> IP address, browser type, device information, and cookies for website functionality.</li>
              <li>• <strong>Usage Data:</strong> How you interact with our website, search history, and preferences.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• To process and confirm hotel bookings.</li>
              <li>• To send booking confirmations, updates, and important travel information.</li>
              <li>• To process payments securely through our payment provider (Stripe).</li>
              <li>• To provide customer support and respond to enquiries.</li>
              <li>• To improve our website and services based on usage patterns.</li>
              <li>• To send marketing communications (only with your consent).</li>
              <li>• To comply with legal obligations and prevent fraud.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">4. Data Sharing</h2>
            <p className="text-white/80 leading-relaxed mb-4">We share your information only when necessary:</p>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• <strong>Hotels and Suppliers:</strong> To complete your booking reservation.</li>
              <li>• <strong>Payment Processors:</strong> Stripe processes payments on our behalf.</li>
              <li>• <strong>Service Providers:</strong> Email services (Resend) for booking confirmations.</li>
              <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              We do not sell your personal information to third parties.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">5. Data Security</h2>
            <p className="text-white/80 leading-relaxed">
              We implement appropriate security measures to protect your personal information, including:
            </p>
            <ul className="text-white/80 leading-relaxed space-y-3 mt-4">
              <li>• SSL/TLS encryption for all data transmission.</li>
              <li>• PCI-DSS compliant payment processing through Stripe.</li>
              <li>• Secure password hashing for user accounts.</li>
              <li>• Regular security audits and updates.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights (GDPR)</h2>
            <p className="text-white/80 leading-relaxed mb-4">Under UK GDPR, you have the right to:</p>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• <strong>Access:</strong> Request a copy of your personal data.</li>
              <li>• <strong>Rectification:</strong> Correct inaccurate or incomplete data.</li>
              <li>• <strong>Erasure:</strong> Request deletion of your data ("right to be forgotten").</li>
              <li>• <strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li>• <strong>Object:</strong> Object to processing of your data for marketing purposes.</li>
              <li>• <strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@besthotelrates.co.uk" className="text-blue-400 hover:underline">
                privacy@besthotelrates.co.uk
              </a>
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">7. Cookies</h2>
            <p className="text-white/80 leading-relaxed">
              We use cookies to enhance your experience. Essential cookies are required for the website to function. 
              Analytics cookies help us understand how visitors use our site. You can manage your cookie preferences 
              through the cookie consent banner or your browser settings. See our{' '}
              <a href="/cookies" className="text-blue-400 hover:underline">Cookie Policy</a> for more details.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">8. Data Retention</h2>
            <p className="text-white/80 leading-relaxed">
              We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, 
              including legal, accounting, or reporting requirements. Booking records are typically retained for 7 years 
              for legal compliance. Account data is retained until you request deletion.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">9. Contact Us</h2>
            <p className="text-white/80 leading-relaxed">
              For privacy-related enquiries or to exercise your rights, contact our Data Protection team:{' '}
              <a href="mailto:privacy@besthotelrates.co.uk" className="text-blue-400 hover:underline">
                privacy@besthotelrates.co.uk
              </a>
            </p>
            <p className="text-white/80 leading-relaxed mt-4">
              You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at{' '}
              <a href="https://ico.org.uk" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                ico.org.uk
              </a>
            </p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
