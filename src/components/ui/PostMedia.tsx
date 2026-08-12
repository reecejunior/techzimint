'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { embedSrc } from '@/lib/ranking';
import type { PostVideo, PostImage } from '@/lib/types';
import styles from './PostMedia.module.css';

/**
 * A post's media block: up to four images in a mosaic, plus an optional video.
 *
 * Embedded players are click-to-load. Mounting an iframe per post would pull a
 * third-party player bundle for every card in the feed, whether or not anyone
 * watches — so until the poster is clicked there is only an image and a button.
 */
export default function PostMedia({
  images,
  video,
  startupName,
}: {
  images: PostImage[];
  video: PostVideo | null;
  startupName: string;
}) {
  const [playing, setPlaying] = useState(false);
  const shown = images.slice(0, 4);
  const hasMedia = shown.length > 0 || video;
  if (!hasMedia) return null;

  return (
    <div className={styles.media}>
      {video && (
        <div className={styles.videoWrap}>
          {video.kind === 'upload' ? (
            <video className={styles.video} src={video.url} controls preload="metadata" />
          ) : playing && video.provider && video.embedId ? (
            <iframe
              className={styles.video}
              src={`${embedSrc(video.provider, video.embedId)}&autoplay=1`}
              title={`${startupName} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className={styles.poster}
              onClick={() => setPlaying(true)}
              aria-label={`Play ${startupName} video`}
            >
              {video.provider === 'youtube' && video.embedId && (
                // eslint-disable-next-line @next/next/no-img-element -- third-party thumbnail
                <img
                  src={`https://i.ytimg.com/vi/${video.embedId}/hqdefault.jpg`}
                  alt=""
                  className={styles.posterImg}
                  loading="lazy"
                />
              )}
              <span className={styles.playBadge}>
                <Play size={18} fill="currentColor" aria-hidden="true" />
              </span>
            </button>
          )}
        </div>
      )}

      {shown.length > 0 && (
        <div className={styles.grid} data-count={shown.length}>
          {shown.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- remote Storage URLs
            <img
              key={img.url}
              src={img.url}
              alt={`${startupName} screenshot ${i + 1}`}
              className={styles.image}
              loading="lazy"
              decoding="async"
              /* Intrinsic size reserves the row so the feed doesn't jump as
                 images arrive. */
              width={img.width}
              height={img.height}
            />
          ))}
        </div>
      )}
    </div>
  );
}
