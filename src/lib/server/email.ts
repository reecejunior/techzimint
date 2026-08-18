import 'server-only';

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * A thin fetch wrapper rather than the Resend SDK — one dependency avoided
 * for a single POST request with a stable, documented shape.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DIGEST_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY or DIGEST_FROM_EMAIL is not set — email sending is not configured.');
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: params.to, subject: params.subject, html: params.html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend rejected the email (${res.status}): ${body.slice(0, 300)}`);
  }
}
