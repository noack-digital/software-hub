import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Passwort zurücksetzen - Software Hub",
    html: `
      <h1>Passwort zurücksetzen</h1>
      <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
      <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Dieser Link ist 24 Stunden gültig.</p>
      <p>Falls Sie keine Anfrage zum Zurücksetzen Ihres Passworts gestellt haben, können Sie diese E-Mail ignorieren.</p>
    `,
  });
}
