import 'server-only';
import type { DigestStartup } from './digest';

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

function rankRow(rank: number, s: DigestStartup, siteUrl: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${HAIRLINE};font:600 14px ${FONT};color:${INK_400};width:28px;">#${rank}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${HAIRLINE};">
        <a href="${siteUrl}/startups/${encodeURIComponent(s.slug)}" style="font:600 15px ${FONT};color:${INK_900};text-decoration:none;">${escapeHtml(s.name)}</a>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${HAIRLINE};text-align:right;font:600 14px ${FONT};color:${BRAND};white-space:nowrap;">${s.score.toLocaleString()} pts</td>
    </tr>`;
}

function launchRow(s: DigestStartup, siteUrl: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${HAIRLINE};">
        <a href="${siteUrl}/startups/${encodeURIComponent(s.slug)}" style="font:600 15px ${FONT};color:${INK_900};text-decoration:none;">${escapeHtml(s.name)}</a>
        ${s.tagline ? `<div style="font:400 13px ${FONT};color:${INK_400};margin-top:2px;">${escapeHtml(s.tagline)}</div>` : ''}
      </td>
    </tr>`;
}

export function renderDigestEmail(params: {
  siteUrl: string;
  unsubscribeUrl: string;
  topFive: DigestStartup[];
  newLaunches: DigestStartup[];
}): string {
  const { siteUrl, unsubscribeUrl, topFive, newLaunches } = params;

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
            <span style="font:400 14px ${FONT};color:${INK_400};">This week's standings, in one email.</span>
          </td></tr>

          ${
            topFive.length
              ? `<tr><td style="padding:0 32px 4px;">
                  <span style="font:700 12px ${FONT};color:${INK_900};text-transform:uppercase;letter-spacing:.04em;">Top 5 this week</span>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
                    ${topFive.map((s, i) => rankRow(i + 1, s, siteUrl)).join('')}
                  </table>
                </td></tr>`
              : ''
          }

          ${
            newLaunches.length
              ? `<tr><td style="padding:22px 32px 4px;">
                  <span style="font:700 12px ${FONT};color:${INK_900};text-transform:uppercase;letter-spacing:.04em;">New this week</span>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
                    ${newLaunches.map(s => launchRow(s, siteUrl)).join('')}
                  </table>
                </td></tr>`
              : ''
          }

          <tr><td style="padding:26px 32px 28px;">
            <a href="${siteUrl}/leaderboard" style="display:inline-block;background:${BRAND};color:#FFFFFF;font:600 14px ${FONT};text-decoration:none;padding:10px 22px;border-radius:999px;">See the full leaderboard</a>
          </td></tr>

          <tr><td style="padding:16px 32px 26px;border-top:1px solid ${HAIRLINE};">
            <span style="font:400 12px ${FONT};color:#A69C92;">
              You're getting this because you subscribed at startups.techzim.co.zw.
              <a href="${unsubscribeUrl}" style="color:#A69C92;">Unsubscribe</a>
            </span>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
