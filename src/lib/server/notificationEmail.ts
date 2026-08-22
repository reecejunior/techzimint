import 'server-only';
import { messageFor } from '@/lib/notificationText';
import type { Notification } from '@/lib/types';

/** Email clients strip most CSS, so every rule here is inline by necessity. */
const INK_900 = '#1D1A17';
const INK_400 = '#7C756E';
const HAIRLINE = '#E8E4E0';
const BRAND = '#E85D04';
const BG = '#FFF9F5';
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

function escapeHtml(s: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return s.replace(/[&<>"']/g, c => map[c]);
}

function row(n: Notification, siteUrl: string): string {
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${HAIRLINE};">
        <a href="${siteUrl}/startups/${encodeURIComponent(n.startupSlug)}" style="font:400 14px ${FONT};color:${INK_900};text-decoration:none;">
          ${escapeHtml(messageFor(n))}
        </a>
      </td>
    </tr>`;
}

export function renderNotificationEmail(params: {
  siteUrl: string;
  notifications: Notification[];
}): string {
  const { siteUrl, notifications } = params;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BG};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:28px 32px 4px;">
            <span style="font:700 17px ${FONT};color:${INK_900};">Techzim <span style="color:${BRAND};">Startups</span></span>
          </td></tr>
          <tr><td style="padding:0 32px 20px;">
            <span style="font:400 14px ${FONT};color:${INK_400};">${notifications.length} thing${notifications.length === 1 ? '' : 's'} you'd want to see.</span>
          </td></tr>

          <tr><td style="padding:0 32px 4px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${notifications.map(n => row(n, siteUrl)).join('')}
            </table>
          </td></tr>

          <tr><td style="padding:26px 32px 28px;">
            <a href="${siteUrl}" style="display:inline-block;background:${BRAND};color:#FFFFFF;font:600 14px ${FONT};text-decoration:none;padding:10px 22px;border-radius:999px;">Open Techzim Startups</a>
          </td></tr>

          <tr><td style="padding:16px 32px 26px;border-top:1px solid ${HAIRLINE};">
            <span style="font:400 12px ${FONT};color:#A69C92;">
              You turned this on from the notification bell at startups.techzim.co.zw.
              Turn it off any time from that same bell — there's no separate unsubscribe link for this one.
            </span>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
