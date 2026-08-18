import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.root}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.brand}>
          <p className={styles.brandName}>
            <span>Techzim</span> Startups
          </p>
          <p className={styles.brandText}>
            Zimbabwean and African startups, ranked by the people who actually use them.
          </p>
          <span className={styles.flag}>Built for Africa</span>
        </div>

        <div className={styles.col}>
          <span className={styles.colTitle}>Platform</span>
          <Link href="/" className={styles.colLink}>Find products</Link>
          <Link href="/leaderboard" className={styles.colLink}>Techzim&apos;s Choice</Link>
          <Link href="/submit" className={styles.colLink}>Post your startup</Link>
        </div>

        <div className={styles.col}>
          <span className={styles.colTitle}>Techzim</span>
          <a href="https://techzim.co.zw" rel="noopener noreferrer" target="_blank" className={styles.colLink}>Main site</a>
          <a href="https://techzim.co.zw/advertise" rel="noopener noreferrer" target="_blank" className={styles.colLink}>Advertise</a>
          <a href="https://techzim.co.zw/contact" rel="noopener noreferrer" target="_blank" className={styles.colLink}>Contact</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`wrap ${styles.bottomInner}`}>
          <span>© {new Date().getFullYear()} Techzim. All rights reserved.</span>
          <Link href="/submit" className={styles.bottomCta}>
            Post your startup <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
