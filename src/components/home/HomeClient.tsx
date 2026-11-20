'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import clsx from 'clsx';
import { useHomeItems } from '@/lib/homeData';
import { starterItems, type HomeItem, type HomeKind } from '@/lib/homeContent';
import { embedSrc, parseVideoUrl } from '@/lib/ranking';
import styles from './home.module.css';

/**
 * The home page shows two things for now: videos and guides. Opportunities,
 * stories, events and who's-who can still be posted from the admin panel and
 * are kept in Firestore, ready to come back (see HOME_VISIBLE_KINDS).
 */

function withAutoplay(src: string): string {
  return `${src}${src.includes('?') ? '&' : '?'}autoplay=1`;
}

function external(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/** Posted items of a kind if any exist, otherwise the starter items. */
function pick(posted: HomeItem[], starter: HomeItem[], kind: HomeKind): HomeItem[] {
  const own = posted.filter(i => i.kind === kind);
  return own.length > 0 ? own : starter.filter(i => i.kind === kind);
}

function year(date: string): string {
  return /^\d{4}/.test(date) ? date.slice(0, 4) : '';
}

export default function HomeClient() {
  const { items, loading } = useHomeItems();
  const starter = useMemo(() => starterItems(), []);

  const videos = pick(items, starter, 'video');
  const guides = pick(items, starter, 'guide');
  const [lead, ...moreVideos] = videos;

  if (loading) {
    return (
      <div className={`wrap ${styles.loading}`}>
        <div className={`skel ${styles.skelTitle}`} />
        <div className={`skel ${styles.skelLead}`} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={`wrap ${styles.top}`}>
        <h1 className={styles.title}>Building a startup in Zimbabwe</h1>
        <p className={styles.intro}>
          Videos and practical guides from Techzim and other media, for founders at any stage.
        </p>
      </section>

      {/* ── Videos ── */}
      <section id="videos" className={`wrap ${styles.section}`} aria-labelledby="videos-h">
        <div className={styles.sectionHead}>
          <h2 id="videos-h" className={styles.sectionTitle}>Videos</h2>
        </div>

        {lead && (
          <article className={styles.leadRow}>
            <VideoFrame video={lead} large />
            <div className={styles.leadText}>
              {lead.topic && <p className={styles.kicker}>{lead.topic}</p>}
              <h3 className={styles.leadTitle}>{lead.title}</h3>
              <p className={styles.meta}>{[lead.source, lead.duration].filter(Boolean).join(' · ')}</p>
              {lead.summary && <p className={styles.leadSummary}>{lead.summary}</p>}
            </div>
          </article>
        )}

        {moreVideos.length > 0 && (
          <ul className={styles.videos}>
            {moreVideos.slice(0, 9).map(v => (
              <li key={v.id}>
                <VideoCard video={v} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Guides ── */}
      <section id="guides" className={`wrap ${styles.section}`} aria-labelledby="guides-h">
        <div className={styles.sectionHead}>
          <h2 id="guides-h" className={styles.sectionTitle}>Guides</h2>
          <p className={styles.sectionNote}>Step-by-step help with registering, tax, payments, hiring and funding.</p>
        </div>

        <ol className={styles.guidesGrid}>
          {guides.slice(0, 12).map((g, i) => (
            <li key={g.id}>
              <MaybeLink href={g.url} className={styles.guide}>
                <span className={styles.guideNum}>{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className={styles.guideTitle}>{g.title}</span>
                  <span className={styles.meta}>
                    {[g.topic, year(g.date), g.minutes ? `${g.minutes} min read` : ''].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </MaybeLink>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** A link when there's somewhere to go; plain text otherwise. */
function MaybeLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  if (!href) return <span className={className}>{children}</span>;
  if (external(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * A video thumbnail that becomes the player when clicked, so nothing streams
 * until someone asks for it. YouTube links use YouTube's thumbnail; other
 * links open in a new tab.
 */
function VideoFrame({ video, large = false }: { video: HomeItem; large?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const parsed = video.url ? parseVideoUrl(video.url) : null;
  const thumb =
    parsed?.provider === 'youtube' && !thumbFailed ? `https://i.ytimg.com/vi/${parsed.embedId}/hqdefault.jpg` : null;

  if (playing && parsed) {
    return (
      <div className={clsx(styles.frame, large && styles.frameLarge)}>
        <iframe
          src={withAutoplay(embedSrc(parsed.provider, parsed.embedId))}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const face = (
    <>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" loading="lazy" onError={() => setThumbFailed(true)} />
      ) : (
        <span className={styles.placeholder}>{video.source || 'Video'}</span>
      )}
      <span className={styles.playBtn} aria-hidden="true">
        <Play size={large ? 24 : 18} fill="currentColor" />
      </span>
      {video.duration && <span className={styles.duration}>{video.duration}</span>}
    </>
  );

  if (parsed) {
    return (
      <button
        type="button"
        className={clsx(styles.frame, large && styles.frameLarge)}
        onClick={() => setPlaying(true)}
        aria-label={`Play: ${video.title}`}
      >
        {face}
      </button>
    );
  }
  if (video.url) {
    return (
      <a
        className={clsx(styles.frame, large && styles.frameLarge)}
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch: ${video.title}`}
      >
        {face}
      </a>
    );
  }
  return <div className={clsx(styles.frame, large && styles.frameLarge)}>{face}</div>;
}

function VideoCard({ video: v }: { video: HomeItem }) {
  return (
    <article className={styles.video}>
      <VideoFrame video={v} />
      {v.topic && <p className={styles.kicker}>{v.topic}</p>}
      <h3 className={styles.videoTitle}>{v.title}</h3>
      <p className={styles.meta}>{[v.source, v.duration].filter(Boolean).join(' · ')}</p>
      {v.summary && (
        <details className={styles.summary}>
          <summary>Read the summary</summary>
          <p>{v.summary}</p>
        </details>
      )}
    </article>
  );
}
