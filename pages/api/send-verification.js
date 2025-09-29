// pages/api/send-verification.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { email, id } = req.body;

  if (!email || !id) {
    return res.status(400).json({ error: 'email and id are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const verifyLink = `https://thebiolink.lol/verify?id=${encodeURIComponent(id)}`;

  try {
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,        // e.g., yourname@gmail.com
        pass: process.env.APP_PASSWORD, // 16-char Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"The BioLink" <${process.env.EMAIL}>`,
      to: email,
      subject: 'Verify Your Email for The BioLink',
      html: `
        <p>Hello!</p>
        <p>Please verify your email to activate your account:</p>
        <p><a href="${verifyLink}" target="_blank">Verify Email</a></p>
        <p>This link is valid forever.</p>
        <p>— The BioLink Team</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('SMTP Error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
