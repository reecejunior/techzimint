import type { PostImage } from './types';

/**
 * Uploading images straight from a device.
 *
 * Firebase Storage needs the paid Blaze plan, so files go to ImgBB instead:
 * free, no card, and it accepts browser uploads directly.
 *
 * The API key ships in the browser bundle — unavoidable for a client-side
 * upload, and the same tradeoff every host with an unsigned upload flow makes.
 * It is a quota key, not an account credential: the worst case is someone
 * burning your upload allowance, not reaching your data. Rotate it in the ImgBB
 * dashboard if that ever happens.
 */

const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';
const API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? '';

export const uploadsEnabled = Boolean(API_KEY);

export const MAX_UPLOAD_BYTES = 32 * 1024 * 1024; // ImgBB's own ceiling
export const ACCEPTED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Longest edge after downscaling. Comfortably sharp at feed and detail sizes. */
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
/** Below this, re-encoding usually costs more bytes than it saves. */
const SKIP_RESIZE_UNDER = 300 * 1024;

const mb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export function validateUpload(file: File): string | null {
  if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
    return 'Images must be JPEG, PNG, WebP or GIF.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That image is ${mb(file.size)}. The limit is ${mb(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
}

/**
 * Shrinks an oversized photo before it goes over the wire.
 *
 * A phone camera JPEG is routinely 4–8 MB, which is a slow upload on a mobile
 * connection and pointless for a 1600px-wide card. GIFs are passed through
 * untouched — re-encoding one through a canvas would flatten the animation.
 *
 * Falls back to the original file if anything goes wrong: a bigger upload is
 * better than a failed one.
 */
async function downscale(file: File): Promise<Blob> {
  if (file.type === 'image/gif' || file.size < SKIP_RESIZE_UNDER) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const longest = Math.max(width, height);

    if (longest <= MAX_DIMENSION) {
      bitmap.close();
      return file;
    }

    const scale = MAX_DIMENSION / longest;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // PNGs with transparency stay PNG; everything else compresses better as JPEG.
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, type, JPEG_QUALITY),
    );

    // Only keep the re-encode if it actually saved something.
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

interface ImgbbResponse {
  success?: boolean;
  data?: { url?: string; display_url?: string; width?: string | number; height?: string | number };
  error?: { message?: string };
}

const toNum = (v: string | number | undefined) => {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
};

/**
 * Uploads one image and returns the record stored on the post.
 *
 * Uses XMLHttpRequest rather than fetch purely for upload progress — fetch has
 * no equivalent, and on a slow connection a progress bar is the difference
 * between waiting and giving up.
 */
export function uploadImageFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<PostImage> {
  const problem = validateUpload(file);
  if (problem) return Promise.reject(new Error(problem));
  if (!uploadsEnabled) {
    return Promise.reject(
      new Error('Uploads are not configured. Add NEXT_PUBLIC_IMGBB_API_KEY to .env.local.'),
    );
  }

  return downscale(file).then(
    blob =>
      new Promise<PostImage>((resolve, reject) => {
        const form = new FormData();
        form.append('key', API_KEY);
        form.append('image', blob, file.name);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', IMGBB_ENDPOINT);
        xhr.timeout = 120000;

        xhr.upload.onprogress = e => {
          if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          let body: ImgbbResponse;
          try {
            body = JSON.parse(xhr.responseText);
          } catch {
            reject(new Error('The image host returned something unreadable.'));
            return;
          }

          const url = body.data?.display_url ?? body.data?.url;
          if (xhr.status >= 200 && xhr.status < 300 && body.success && url) {
            resolve({ url, width: toNum(body.data?.width), height: toNum(body.data?.height) });
            return;
          }

          reject(
            new Error(
              body.error?.message ??
                (xhr.status === 400
                  ? 'The image host rejected that file. Check the API key is valid.'
                  : `Upload failed (${xhr.status}).`),
            ),
          );
        };

        xhr.onerror = () => reject(new Error('Upload failed — check your connection.'));
        xhr.ontimeout = () => reject(new Error('Upload timed out. Try a smaller image.'));

        xhr.send(form);
      }),
  );
}
