/**
 * Quick Email Test Script
 * Run: npx tsx scripts/test-email.ts
 */

import 'dotenv/config';
import { Resend } from 'resend';

async function testEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  
  console.log('🧪 Testing Resend Email Service...\n');
  
  if (!apiKey) {
    console.log('❌ RESEND_API_KEY not found in environment');
    console.log('   Set it in .env file or Vercel environment variables');
    process.exit(1);
  }
  
  console.log(`✅ API Key found: ${apiKey.substring(0, 12)}...`);
  
  const resend = new Resend(apiKey);
  
  // Test 1: Check API connection by listing domains
  console.log('\n📡 Testing API connection...');
  try {
    const { data: domains, error: domainError } = await resend.domains.list();
    
    if (domainError) {
      console.log(`❌ API Error: ${domainError.message}`);
      process.exit(1);
    }
    
    console.log('✅ API connection successful!');
    
    if (domains?.data && domains.data.length > 0) {
      console.log('\n📧 Verified domains:');
      domains.data.forEach((d: any) => {
        console.log(`   - ${d.name} (${d.status})`);
      });
    } else {
      console.log('\n⚠️  No custom domains verified');
      console.log('   Emails will be sent from: onboarding@resend.dev');
      console.log('   To use your own domain, add it at: https://resend.com/domains');
    }
  } catch (err: any) {
    console.log(`❌ Connection failed: ${err.message}`);
    process.exit(1);
  }
  
  // Test 2: Send a test email
  console.log('\n📤 Sending test email to Resend test address...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default sender for testing
      to: 'delivered@resend.dev', // Resend's test email that always succeeds
      subject: 'Best Hotel Rates - Email Test',
      html: '<h1>Email system is working!</h1><p>This is a test from Best Hotel Rates.</p>',
    });
    
    if (error) {
      console.log(`❌ Failed to send: ${error.message}`);
      process.exit(1);
    }
    
    console.log(`✅ Test email sent successfully!`);
    console.log(`   Email ID: ${data?.id}`);
  } catch (err: any) {
    console.log(`❌ Send failed: ${err.message}`);
    process.exit(1);
  }
  
  console.log('\n═══════════════════════════════════════════');
  console.log('✅ EMAIL SYSTEM IS FULLY OPERATIONAL!');
  console.log('═══════════════════════════════════════════');
  console.log('\nNote: Without a verified domain, emails will come from');
  console.log('"onboarding@resend.dev" which may go to spam.');
  console.log('\nTo fix this:');
  console.log('1. Go to https://resend.com/domains');
  console.log('2. Add your domain: besthotelrates.co.uk');
  console.log('3. Add the DNS records they provide');
  console.log('4. Update FROM_EMAIL in Vercel to: bookings@besthotelrates.co.uk');
}

testEmail().catch(console.error);


