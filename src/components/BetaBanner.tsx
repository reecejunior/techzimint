'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import styles from './BetaBanner.module.css';

/**
 * Bump this when the message changes materially — it's the localStorage key,
 * so a new value makes the banner reappear for everyone who dismissed the old
 * one, rather than silently hiding an announcement they never saw.
 */
const DISMISS_KEY = 'beta-banner-dismissed-v1';

/**
 * A quiet, dismissible notice that the product is still being shaped.
 *
 * Rendered unconditionally on the server so there's no layout jump, then
 * hidden client-side if this visitor already dismissed it. Reading
 * localStorage during render would mismatch the server output, so the check
 * happens in an effect instead and the banner starts visually present either
 * way — a one-frame flash beats a hydration warning.
 */
export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Deferred a tick so the setState isn't the direct, synchronous body of
    // the effect — same shape as every other "read a browser API once on
    // mount" case elsewhere in this app.
    Promise.resolve().then(() => {
      if (localStorage.getItem(DISMISS_KEY) === '1') setDismissed(true);
    });
  }, []);

  if (dismissed) return null;

  return (
    <div className={styles.banner} role="status">
      <div className={`wrap ${styles.inner}`}>
        <p className={styles.text}>
          <strong>Beta.</strong> Techzim Startups is early and still changing — features, rankings
          and even startups listed here may shift as we experiment. Something broken or missing?{' '}
          <a href="mailto:chimutashureece@gmail.com" className={styles.link}>
            Tell us
          </a>
          .
        </p>
        <button
          type="button"
          className={styles.close}
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, '1');
            setDismissed(true);
          }}
          aria-label="Dismiss"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
