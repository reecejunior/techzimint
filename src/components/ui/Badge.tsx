import clsx from 'clsx';
import styles from './Badge.module.css';

type Variant =
  | 'category'
  | 'region'
  | 'week'
  | 'trending'
  | 'founder'
  | 'trusted'
  | 'pending'
  | 'onBrand'
  | 'onBrandMuted';

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'category', children, className }: BadgeProps) {
  return <span className={clsx(styles.badge, styles[variant], className)}>{children}</span>;
}
