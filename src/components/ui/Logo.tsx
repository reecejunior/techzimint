'use client';

import { useState } from 'react';
import clsx from 'clsx';
import styles from './Logo.module.css';

interface LogoProps {
  name: string;
  /** Uploaded logo. When absent, falls back to a quiet monogram. */
  url?: string;
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * A startup's mark.
 *
 * When there is a real logo we show it. When there isn't, or the link no
 * longer loads, the fallback is a near-neutral tile with dark initials rather
 * than a broken-image icon.
 */
export default function Logo({ name, url, initials, size = 'md', className }: LogoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;
  return (
    <div className={clsx(styles.logo, styles[size], className)} aria-hidden="true">
      {showImage ? (
        /* Hidden from assistive tech because the name always sits beside it as
           real text. next/image is skipped deliberately: it would need every
           image host allow-listed for no gain at 28–72px.
           no-referrer: many free image hosts refuse images embedded on other
           sites, which they detect from the Referer header. The link check
           when a founder adds a logo also sends none, so what passed the check
           now loads the same way on the page. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className={styles.img}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(url ?? null)}
        />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
}
