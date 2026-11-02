'use client';

import { useEffect, useRef, useState } from 'react';
import type { Regulator } from '@/lib/regulations';
import { REGULATOR_LOGO, REGULATOR_MONOGRAM } from '@/lib/regulatorLogos';
import styles from './RegulatorLogo.module.css';

/** A regulator's logo, or its short code in a plain circle when there is none. */
export default function RegulatorLogo({
  reg, size = 36,
}: { reg: Regulator; size?: number }) {
  const src = REGULATOR_LOGO[reg];
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // A file that 404s before hydration never fires onError, so check once here too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) Promise.resolve().then(() => setFailed(true));
  }, []);

  if (!src || failed) {
    const text = REGULATOR_MONOGRAM[reg] ?? reg.slice(0, 4);
    return (
      <span className={styles.mono} style={{ width: size, height: size }} aria-hidden="true">
        {text}
      </span>
    );
  }
  return (
    <span className={styles.frame} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static logos, no resizing needed */}
      <img ref={ref} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
    </span>
  );
}
