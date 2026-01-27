import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'Best Hotel Rates <onboarding@resend.dev>';
  
  // Debug info
  const debug = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + '...' : 'NOT SET',
    fromEmail,
    nodeEnv: process.env.NODE_ENV,
  };
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY not configured',
      debug,
    });
  }
  
  try {
    const resend = new Resend(apiKey);
    
    // Send test email to Resend's test address (always succeeds)
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: 'delivered@resend.dev', // Resend's test email
      subject: 'Test Email from Best Hotel Rates',
      html: '<h1>Email is working!</h1><p>If you see this in Resend logs, emails are configured correctly.</p>',
    });
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        debug,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent! Check Resend dashboard.',
      emailId: data?.id,
      debug,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      debug,
    });
  }
}


