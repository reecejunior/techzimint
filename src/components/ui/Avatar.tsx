import clsx from 'clsx';
import styles from './Avatar.module.css';

interface AvatarProps {
  initials: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Supply when the avatar is the only thing naming its subject. Without it
   *  the avatar is treated as decoration and hidden from screen readers. */
  name?: string;
  className?: string;
}

export default function Avatar({
  initials,
  color = '#E85D04',
  size = 'md',
  name,
  className,
}: AvatarProps) {
  return (
    <div
      className={clsx(styles.avatar, styles[size], className)}
      style={{ background: color }}
      role={name ? 'img' : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
    >
      {initials}
    </div>
  );
}
