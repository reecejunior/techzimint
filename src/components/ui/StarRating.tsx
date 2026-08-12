import { Star } from 'lucide-react';
import clsx from 'clsx';
import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  showNumber?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  max = 5,
  size = 14,
  showNumber = false,
  className,
}: StarRatingProps) {
  const filled = Math.round(value);

  return (
    <span
      className={clsx(styles.wrap, className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          // Colour comes from CSS so the stars follow the theme rather than a
          // hard-coded hex, and inherit correctly on tinted surfaces.
          className={i < filled ? styles.on : styles.off}
          fill={i < filled ? 'currentColor' : 'none'}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      ))}
      {showNumber && <span className={styles.num}>{value.toFixed(1)}</span>}
    </span>
  );
}
