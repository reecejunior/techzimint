'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useMyLikes, useVideoFeed } from '@/lib/hooks';
import PageHeader from '@/components/PageHeader';
import VideoCard from '@/components/VideoCard';
import VideoReel from '@/components/VideoReel';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './page.module.css';

export default function VideosPage() {
  const { data: posts, loading, error, hasMore, loadingMore, loadMore } = useVideoFeed();
  const likes = useMyLikes();
  /** Index the reel opened at, or null when the grid is showing. */
  const [reelAt, setReelAt] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Watch" title="Videos">
        Demos, walkthroughs and launch clips from Zimbabwean and African founders — see the
        product working before you try it.
      </PageHeader>

      {reelAt !== null && (
        <VideoReel
          posts={posts}
          startIndex={reelAt}
          likedIds={likes}
          onClose={() => setReelAt(null)}
        />
      )}

      <div className={`wrap ${styles.body}`}>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 4 }, (_, i) => (
              <VideoSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState title="No videos yet">
            Founders can add a YouTube or Vimeo link when they{' '}
            <Link href="/submit">post a startup</Link> or share an update.
          </EmptyState>
        ) : (
          <>
            <div className={styles.grid}>
              {posts.map((post, i) => (
                <VideoCard
                  key={post.id}
                  post={post}
                  liked={likes.has(post.id)}
                  onOpen={() => setReelAt(i)}
                />
              ))}
            </div>

            {hasMore && (
              <button className={styles.more} onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <>
                    <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                    Loading
                  </>
                ) : (
                  'Show older videos'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className={styles.skelCard} aria-hidden="true">
      <div className={`skel ${styles.skelFrame}`} />
      <div className={styles.skelBody}>
        <div className={`skel ${styles.skelTag}`} />
        <div className={`skel ${styles.skelLine}`} />
      </div>
    </div>
  );
}
