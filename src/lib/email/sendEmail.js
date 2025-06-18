import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASSWORD || 'password',
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Capgemini Management" <noreply@capgemini-management.com>',
    to,
    subject,
    text,
    ...(html && { html })
  };

  return transporter.sendMail(mailOptions);
}


export async function sendPasswordResetEmail({ to, resetUrl, userName = 'User' }) {
  const subject = 'Password Reset Request - Capgemini Management';

  const text = `
    Hello ${userName},

    You requested a password reset for your Capgemini Management account.

    Please click the link below to reset your password:
    ${resetUrl}

    This link will expire in 1 hour.

    If you did not request a password reset, please ignore this email or contact support if you have concerns.

    Regards,
    Capgemini Management Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0070ad; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Capgemini Management</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Hello ${userName},</p>
        <p>You requested a password reset for your Capgemini Management account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0070ad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Regards,<br>Capgemini Management Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Capgemini. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}
