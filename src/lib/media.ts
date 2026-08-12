import type { PostImage } from './types';

/**
 * Media by link rather than by upload.
 *
 * Firebase Storage now requires the paid Blaze plan, so founders paste links to
 * images they already host (and to YouTube/Vimeo for video). The document shape
 * still carries an optional `path`, so switching to real uploads later needs no
 * data migration — only a different picker.
 */

export const MAX_IMAGES_PER_POST = 4;

/** Hosts that hand out image URLs on a free tier, offered as a hint in the UI. */
export const FREE_IMAGE_HOSTS = [
  { name: 'ImgBB', url: 'https://imgbb.com' },
  { name: 'Postimages', url: 'https://postimages.org' },
  { name: 'Cloudinary', url: 'https://cloudinary.com' },
];

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Confirms a URL actually resolves to an image, and returns its dimensions so
 * the feed can reserve space and avoid reflow.
 *
 * Loading the image is the only reliable test: the extension may be absent
 * (plenty of CDNs serve `/image/abc123`) and a HEAD request would be blocked by
 * CORS on most hosts.
 */
export function loadImageMeta(
  url: string,
  timeoutMs = 12000,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!isHttpUrl(url)) {
      reject(new Error('Paste a full image address starting with https://'));
      return;
    }

    const img = new Image();
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      img.src = '';
      reject(new Error('That link took too long to load. Is it public?'));
    }, timeoutMs);

    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(
        new Error(
          "That link didn't load as an image. Use the direct image URL, not the page it sits on.",
        ),
      );
    };

    // Deliberately no crossOrigin: we only need naturalWidth/Height, not pixel
    // access. Requesting CORS would make this check stricter than the <img> that
    // renders the post, so a link that displays fine could fail validation.
    img.referrerPolicy = 'no-referrer';
    img.src = url.trim();
  });
}

export async function imageFromUrl(url: string): Promise<PostImage> {
  const { width, height } = await loadImageMeta(url);
  return { url: url.trim(), width, height };
}
