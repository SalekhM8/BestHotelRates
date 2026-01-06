import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Best Hotel Rates <onboarding@resend.dev>';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store token hash in database (we'll add this field)
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Create or update verification token
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token: 'password-reset',
        },
      },
      update: {
        token: tokenHash,
        expires: resetTokenExpiry,
      },
      create: {
        identifier: email.toLowerCase(),
        token: tokenHash,
        expires: resetTokenExpiry,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');
    
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email
    if (resend) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Reset Your Password - Best Hotel Rates',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Best Hotel Rates</h1>
      <p style="color: #94a3b8; margin: 10px 0 0 0;">Password Reset Request</p>
    </div>
    
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px;">
      <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 20px 0;">Reset Your Password</h2>
      <p style="color: #64748b; line-height: 1.6;">
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #94a3b8; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        If the button doesn't work, copy and paste this link:<br>
        <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>
        `,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

