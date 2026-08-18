'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';
import styles from './Nav.module.css';

const LINKS = [
  { href: '/', label: 'Find products' },
  { href: '/leaderboard', label: "Techzim's Choice" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A menu that covers the page shouldn't leave the page scrolling behind it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className={styles.root}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="Techzim Startups home">
          <span className={styles.logoMark}>Techzim</span>
          <span className={styles.logoBrand}>Startups</span>
        </Link>

        <nav className={styles.links} aria-label="Main">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.link}
              data-active={isActive(l.href) || undefined}
              aria-current={isActive(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/submit" className={styles.cta} id="nav-submit-btn">
          Submit a startup
        </Link>

        <NotificationBell />

        <button
          type="button"
          className={styles.menuBtn}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={styles.mobilePanel}
        data-open={open || undefined}
      >
        {/* Closing on click rather than on a route-change effect: navigation is
            what the tap means, so dismiss it there and skip the extra render. */}
        <nav className={styles.mobileLinks} aria-label="Mobile">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.mobileLink}
              data-active={isActive(l.href) || undefined}
              aria-current={isActive(l.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/submit" className={styles.mobileCta} onClick={() => setOpen(false)}>
            Submit a startup
          </Link>
        </nav>
      </div>
    </header>
  );
}
