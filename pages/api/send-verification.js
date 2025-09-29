// pages/api/send-verification.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  // 🔐 Authenticate: only your main app can call this
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, id } = req.body;

  if (!email || !id) {
    return res.status(400).json({ error: 'email and id are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const verifyLink = `https://thebiolink.lol/verify?id=${encodeURIComponent(id)}`;

  try {
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"The BioLink" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '✅ Verify Your Email for The BioLink',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto;">
          <h2>Verify Your Email</h2>
          <p>Hello!</p>
          <p>Please click the button below to verify your email address and activate your BioLink account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p><strong>This link is valid forever.</strong></p>
          <p>If you didn’t create an account, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="color: #777; font-size: 14px;">
            © ${new Date().getFullYear()} The BioLink. All rights reserved.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
