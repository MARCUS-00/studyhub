// SETUP(human): configure SMTP env vars before deploying (see .env.example).
//   Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//
// In dev (SMTP_HOST unset) the OTP is logged to the server console instead.

import nodemailer from "nodemailer";

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  if (!process.env.SMTP_HOST) {
    // Dev fallback — never reaches production when SMTP is configured.
    console.warn(`[mailer] SMTP not configured. OTP for ${to}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: "StudyHub — Your password reset OTP",
    text: `Your one-time password is: ${otp}\n\nIt expires in 10 minutes. Do not share it.`,
    html: `<p>Your one-time password is: <strong>${otp}</strong></p><p>It expires in 10 minutes. Do not share it.</p>`,
  });
}
