'use client';

import Script from 'next/script';

// GA4 Measurement ID - Replace with client's actual ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Default to denied until user accepts cookies
          gtag('consent', 'default', {
            'analytics_storage': 'denied'
          });
          
          // Check if user has previously accepted
          if (localStorage.getItem('cookie-consent') === 'accepted') {
            gtag('consent', 'update', {
              'analytics_storage': 'granted'
            });
          }
          
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Sentry Error Tracking
export function SentryInit() {
  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!SENTRY_DSN) return null;

  return (
    <Script id="sentry-init" strategy="afterInteractive">
      {`
        // Sentry lazy loading for production error tracking
        // Full Sentry SDK should be installed for comprehensive tracking
        // This is a lightweight alternative for basic error reporting
        window.onerror = function(message, source, lineno, colno, error) {
          if ('${SENTRY_DSN}') {
            fetch('https://sentry.io/api/0/envelope/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                dsn: '${SENTRY_DSN}',
                message: message,
                source: source,
                lineno: lineno,
                error: error?.stack
              })
            }).catch(() => {});
          }
          return false;
        };
      `}
    </Script>
  );
}


