import styles from './PageHeader.module.css';

/**
 * The masthead every top-level page opens with. Shared so /videos, /startups
 * and the feed don't each invent their own type scale and spacing — the
 * repetition is what makes the site feel like one place.
 */
export default function PageHeader({
  eyebrow,
  title,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  /** One line of context. Keep it to a sentence. */
  children?: React.ReactNode;
  /** Optional right-hand slot — counts, a control, a link. */
  aside?: React.ReactNode;
}) {
  return (
    <header className={styles.root}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.text}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 className={styles.title}>{title}</h1>
          {children && <p className={styles.desc}>{children}</p>}
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
    </header>
  );
}
