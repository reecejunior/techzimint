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
 * When there is a real logo we show it. When there isn't, the fallback is a
 * near-neutral tile with dark initials rather than a saturated orange square —
 * a wall of identical brand-coloured tiles reads as filler, and it steals the
 * accent colour from the controls that actually need it.
 */
export default function Logo({ name, url, initials, size = 'md', className }: LogoProps) {
  return (
    <div className={clsx(styles.logo, styles[size], className)} aria-hidden="true">
      {url ? (
        /* Hidden from assistive tech because the name always sits beside it as
           real text — but the alt still gives sighted users something readable
           if the image 404s. next/image is skipped deliberately: it would need
           every Storage bucket host allow-listed for no gain at 28–72px. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className={styles.img}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
}
