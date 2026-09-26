import { Resend } from 'resend';

let resend = null;

function getClient() {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('RESEND_API_KEY not set — emails will be skipped.');
    return null;
  }
  resend = new Resend(key);
  return resend;
}

export async function sendPasswordResetEmail({ to, resetUrl, userName }) {
  const client = getClient();
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (!client) {
    console.warn(`[dev] Password reset link for ${to}: ${resetUrl}`);
    return { skipped: true };
  }

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;padding:8px 14px;border-radius:9999px;background:#eef2ff;color:#4f46e5;font-weight:600;font-size:14px;">
          BCS Compass
        </div>
      </div>

      <h1 style="font-size:22px;margin:0 0 12px 0;color:#0f172a;">Reset your password</h1>
      <p style="font-size:14px;line-height:1.6;color:#334155;">
        Hi ${userName || 'there'},
      </p>
      <p style="font-size:14px;line-height:1.6;color:#334155;">
        We received a request to reset the password for your BCS Compass account.
        Click the button below to choose a new password.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">
          Reset Password
        </a>
      </div>

      <p style="font-size:13px;color:#64748b;line-height:1.6;">
        This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.
      </p>

      <p style="font-size:12px;color:#94a3b8;line-height:1.6;word-break:break-all;margin-top:24px;">
        Or copy this URL into your browser:<br/>
        <span style="color:#64748b;">${resetUrl}</span>
      </p>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px 0;" />

      <p style="font-size:12px;color:#94a3b8;text-align:center;">
        BCS Compass — Study Smarter. Practice Better.
      </p>
    </div>
  `;

  const { error } = await client.emails.send({
    from,
    to,
    subject: 'Reset your BCS Compass password',
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  return { ok: true };
}