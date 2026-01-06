/**
 * System Test Script
 * Run with: npx tsx scripts/test-systems.ts
 * 
 * Tests all critical systems and reports status
 */

import 'dotenv/config';

const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  results.push(result);
  const icon = result.status === 'pass' ? PASS : result.status === 'fail' ? FAIL : WARN;
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
}

async function testEmailService() {
  console.log('\n📧 TESTING EMAIL SERVICE (Resend)...\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    log({
      name: 'Resend API Key',
      status: 'fail',
      message: 'RESEND_API_KEY not set in environment',
      details: 'Get your API key from https://resend.com/api-keys'
    });
    return;
  }
  
  log({
    name: 'Resend API Key',
    status: 'pass',
    message: `Found (starts with ${apiKey.substring(0, 8)}...)`
  });
  
  // Test API connection
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    
    // Try to get domains (validates API key)
    const { data, error } = await resend.domains.list();
    
    if (error) {
      log({
        name: 'Resend API Connection',
        status: 'fail',
        message: `API error: ${error.message}`,
        details: 'Check your API key is valid'
      });
    } else {
      log({
        name: 'Resend API Connection',
        status: 'pass',
        message: 'Connected successfully'
      });
      
      if (data?.data && data.data.length > 0) {
        const verifiedDomains = data.data.filter((d: any) => d.status === 'verified');
        if (verifiedDomains.length > 0) {
          log({
            name: 'Verified Domains',
            status: 'pass',
            message: verifiedDomains.map((d: any) => d.name).join(', ')
          });
        } else {
          log({
            name: 'Verified Domains',
            status: 'warn',
            message: 'No verified domains',
            details: 'Emails will send from onboarding@resend.dev. Add your domain in Resend dashboard.'
          });
        }
      } else {
        log({
          name: 'Verified Domains',
          status: 'warn',
          message: 'No domains configured',
          details: 'Emails will be sent from Resend\'s default domain'
        });
      }
    }
  } catch (err: any) {
    log({
      name: 'Resend API Connection',
      status: 'fail',
      message: err.message
    });
  }
  
  // Check FROM_EMAIL
  const fromEmail = process.env.FROM_EMAIL || 'bookings@besthotelrates.co.uk';
  log({
    name: 'FROM_EMAIL',
    status: 'pass',
    message: fromEmail
  });
  
  // Check ADMIN_EMAIL
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@besthotelrates.co.uk';
  log({
    name: 'ADMIN_EMAIL',
    status: 'pass',
    message: adminEmail
  });
}

async function testStripe() {
  console.log('\n💳 TESTING STRIPE...\n');
  
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!secretKey) {
    log({
      name: 'Stripe Secret Key',
      status: 'fail',
      message: 'STRIPE_SECRET_KEY not set'
    });
    return;
  }
  
  const isTestMode = secretKey.startsWith('sk_test_');
  log({
    name: 'Stripe Secret Key',
    status: 'pass',
    message: `Found (${isTestMode ? 'TEST MODE' : 'LIVE MODE'})`
  });
  
  if (!webhookSecret) {
    log({
      name: 'Stripe Webhook Secret',
      status: 'warn',
      message: 'STRIPE_WEBHOOK_SECRET not set',
      details: 'Webhooks won\'t work without this. Run: stripe listen --forward-to localhost:3002/api/stripe/webhook'
    });
  } else {
    log({
      name: 'Stripe Webhook Secret',
      status: 'pass',
      message: `Found (starts with ${webhookSecret.substring(0, 10)}...)`
    });
  }
  
  // Test API connection
  try {
    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(secretKey);
    
    const balance = await stripeClient.balance.retrieve();
    log({
      name: 'Stripe API Connection',
      status: 'pass',
      message: `Connected (${balance.livemode ? 'LIVE' : 'TEST'} mode)`
    });
  } catch (err: any) {
    log({
      name: 'Stripe API Connection',
      status: 'fail',
      message: err.message
    });
  }
}

async function testDatabase() {
  console.log('\n🗄️ TESTING DATABASE...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log({
      name: 'Database URL',
      status: 'fail',
      message: 'DATABASE_URL not set'
    });
    return;
  }
  
  const isSQLite = databaseUrl.startsWith('file:');
  const isPostgres = databaseUrl.includes('postgres');
  
  log({
    name: 'Database URL',
    status: 'pass',
    message: `Found (${isSQLite ? 'SQLite' : isPostgres ? 'PostgreSQL' : 'Unknown'})`
  });
  
  // Test connection
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    log({
      name: 'Database Connection',
      status: 'pass',
      message: 'Connected successfully'
    });
    
    // Check tables exist
    const userCount = await prisma.user.count();
    const bookingCount = await prisma.booking.count();
    
    log({
      name: 'Database Tables',
      status: 'pass',
      message: `Users: ${userCount}, Bookings: ${bookingCount}`
    });
    
    await prisma.$disconnect();
  } catch (err: any) {
    log({
      name: 'Database Connection',
      status: 'fail',
      message: err.message,
      details: 'Run: npx prisma db push'
    });
  }
}

async function testHotelbedsAPI() {
  console.log('\n🏨 TESTING HOTELBEDS API...\n');
  
  const apiKey = process.env.HOTELBEDS_API_KEY;
  const apiSecret = process.env.HOTELBEDS_API_SECRET;
  const baseUrl = process.env.HOTELBEDS_BASE_URL || 'https://api.test.hotelbeds.com';
  
  if (!apiKey || !apiSecret) {
    log({
      name: 'HotelBeds Credentials',
      status: 'fail',
      message: 'HOTELBEDS_API_KEY or HOTELBEDS_API_SECRET not set'
    });
    return;
  }
  
  log({
    name: 'HotelBeds Credentials',
    status: 'pass',
    message: `Found (key: ${apiKey.substring(0, 8)}...)`
  });
  
  log({
    name: 'HotelBeds Base URL',
    status: 'pass',
    message: baseUrl.includes('test') ? 'SANDBOX' : 'PRODUCTION'
  });
  
  // Test API connection
  try {
    const crypto = await import('crypto');
    const ts = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha256')
      .update(`${apiKey}${apiSecret}${ts}`)
      .digest('hex');
    
    const response = await fetch(`${baseUrl}/hotel-content-api/1.0/types/accommodations`, {
      headers: {
        'Api-key': apiKey,
        'X-Signature': signature,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
      },
    });
    
    if (response.ok) {
      log({
        name: 'HotelBeds API Connection',
        status: 'pass',
        message: 'Connected successfully'
      });
    } else if (response.status === 403) {
      log({
        name: 'HotelBeds API Connection',
        status: 'warn',
        message: 'API quota may be exceeded (403)',
        details: 'Sandbox has limited quota. Try again later.'
      });
    } else {
      log({
        name: 'HotelBeds API Connection',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`
      });
    }
  } catch (err: any) {
    log({
      name: 'HotelBeds API Connection',
      status: 'fail',
      message: err.message
    });
  }
}

async function testGoogleMaps() {
  console.log('\n🗺️ TESTING GOOGLE MAPS...\n');
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    log({
      name: 'Google Maps API Key',
      status: 'fail',
      message: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set',
      details: 'Map view will not work without this'
    });
    return;
  }
  
  log({
    name: 'Google Maps API Key',
    status: 'pass',
    message: `Found (starts with ${apiKey.substring(0, 10)}...)`
  });
  
  // Test API (geocode a known location)
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=London&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.status === 'OK') {
      log({
        name: 'Google Maps API Connection',
        status: 'pass',
        message: 'Connected successfully'
      });
    } else if (data.error_message) {
      log({
        name: 'Google Maps API Connection',
        status: 'fail',
        message: data.error_message
      });
    } else {
      log({
        name: 'Google Maps API Connection',
        status: 'warn',
        message: `Status: ${data.status}`
      });
    }
  } catch (err: any) {
    log({
      name: 'Google Maps API Connection',
      status: 'fail',
      message: err.message
    });
  }
}

async function testAnalytics() {
  console.log('\n📊 TESTING ANALYTICS...\n');
  
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!gaId) {
    log({
      name: 'Google Analytics',
      status: 'warn',
      message: 'NEXT_PUBLIC_GA_MEASUREMENT_ID not set',
      details: 'No analytics tracking. Get ID from analytics.google.com'
    });
  } else {
    log({
      name: 'Google Analytics',
      status: 'pass',
      message: gaId
    });
  }
  
  if (!sentryDsn) {
    log({
      name: 'Sentry Error Tracking',
      status: 'warn',
      message: 'NEXT_PUBLIC_SENTRY_DSN not set (optional)',
      details: 'Error tracking is optional but recommended for production'
    });
  } else {
    log({
      name: 'Sentry Error Tracking',
      status: 'pass',
      message: 'Configured'
    });
  }
}

async function testAuth() {
  console.log('\n🔐 TESTING AUTHENTICATION...\n');
  
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  
  if (!nextAuthSecret) {
    log({
      name: 'NextAuth Secret',
      status: 'fail',
      message: 'NEXTAUTH_SECRET not set',
      details: 'Generate with: openssl rand -base64 32'
    });
  } else {
    log({
      name: 'NextAuth Secret',
      status: 'pass',
      message: 'Configured'
    });
  }
  
  if (!nextAuthUrl) {
    log({
      name: 'NextAuth URL',
      status: 'warn',
      message: 'NEXTAUTH_URL not set',
      details: 'Set to your production URL in Vercel'
    });
  } else {
    log({
      name: 'NextAuth URL',
      status: 'pass',
      message: nextAuthUrl
    });
  }
  
  // Google OAuth
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!googleClientId || !googleClientSecret) {
    log({
      name: 'Google OAuth',
      status: 'warn',
      message: 'Google OAuth not configured',
      details: '"Sign in with Google" will not work'
    });
  } else {
    log({
      name: 'Google OAuth',
      status: 'pass',
      message: 'Configured'
    });
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                  BEST HOTEL RATES - SYSTEM TEST                ');
  console.log('═══════════════════════════════════════════════════════════════');
  
  await testEmailService();
  await testStripe();
  await testDatabase();
  await testHotelbedsAPI();
  await testGoogleMaps();
  await testAnalytics();
  await testAuth();
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                           SUMMARY                              ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warned = results.filter(r => r.status === 'warn').length;
  
  console.log(`${PASS} Passed: ${passed}`);
  console.log(`${FAIL} Failed: ${failed}`);
  console.log(`${WARN} Warnings: ${warned}`);
  
  if (failed > 0) {
    console.log('\n❌ CRITICAL ISSUES FOUND! Fix the failures above before going live.\n');
    process.exit(1);
  } else if (warned > 0) {
    console.log('\n⚠️ Some optional services not configured. Review warnings above.\n');
    process.exit(0);
  } else {
    console.log('\n✅ ALL SYSTEMS OPERATIONAL!\n');
    process.exit(0);
  }
}

main().catch(console.error);

