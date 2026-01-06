import { GlassCard } from '@/components/ui/GlassCard';

export const metadata = {
  title: 'Cookie Policy - Best Hotel Rates',
  description: 'Information about how Best Hotel Rates uses cookies.',
};

export default function CookiesPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
        <p className="text-white/70 mb-8">Last updated: January 2025</p>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">What Are Cookies?</h2>
            <p className="text-white/80 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit our website. They help us 
              provide you with a better experience by remembering your preferences, keeping you logged in, and 
              understanding how you use our site.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Essential Cookies</h3>
                <p className="text-white/80 leading-relaxed mb-2">
                  These cookies are necessary for the website to function properly. They enable core features like:
                </p>
                <ul className="text-white/70 space-y-1 ml-4">
                  <li>• User authentication and session management</li>
                  <li>• Shopping basket and booking functionality</li>
                  <li>• Security features</li>
                </ul>
                <p className="text-white/60 text-sm mt-2">These cookies cannot be disabled.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Analytics Cookies</h3>
                <p className="text-white/80 leading-relaxed mb-2">
                  These cookies help us understand how visitors interact with our website:
                </p>
                <ul className="text-white/70 space-y-1 ml-4">
                  <li>• Google Analytics (anonymised data)</li>
                  <li>• Page views and navigation patterns</li>
                  <li>• Search and booking funnel analysis</li>
                </ul>
                <p className="text-white/60 text-sm mt-2">You can opt out of these via the cookie consent banner.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Functional Cookies</h3>
                <p className="text-white/80 leading-relaxed mb-2">
                  These cookies enhance your experience:
                </p>
                <ul className="text-white/70 space-y-1 ml-4">
                  <li>• Remembering your preferences (currency, language)</li>
                  <li>• Recently viewed hotels</li>
                  <li>• Saved searches</li>
                </ul>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Third-Party Cookies</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We use services from third parties that may set their own cookies:
            </p>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• <strong>Stripe:</strong> For secure payment processing</li>
              <li>• <strong>Google Maps:</strong> For hotel location maps</li>
              <li>• <strong>Google Analytics:</strong> For website analytics (with your consent)</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Managing Cookies</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              You can manage your cookie preferences in several ways:
            </p>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• <strong>Cookie Banner:</strong> Use our cookie consent banner when you first visit to set your preferences.</li>
              <li>• <strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies. See your browser's help section for instructions.</li>
              <li>• <strong>Clear Cookies:</strong> You can clear all cookies from your browser at any time.</li>
            </ul>
            <p className="text-white/70 mt-4 text-sm">
              Note: Blocking essential cookies may prevent some features from working correctly.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-white/80 leading-relaxed">
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@besthotelrates.co.uk" className="text-blue-400 hover:underline">
                privacy@besthotelrates.co.uk
              </a>
            </p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
