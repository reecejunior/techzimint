'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CommunityComposer from '@/components/CommunityComposer';
import styles from './page.module.css';

export default function NewCommunityPostPage() {
  return (
    <div className={styles.page}>
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/community" className={styles.back}>
          <ArrowLeft size={14} aria-hidden="true" />
          Community
        </Link>

        <h1 className={styles.title}>New post</h1>
        <p className={styles.subtitle}>
          Ask the community for help, or share what you&apos;re building. Anyone signed in can
          post — you don&apos;t need a startup listed here.
        </p>

        <CommunityComposer />
      </div>
    </div>
  );
}
