'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import clsx from 'clsx';
import SubscribeForm from '@/components/SubscribeForm';
import { useHomeItems } from '@/lib/homeData';
import {
  SCENE_GROUPS, STAGES, starterItems, type HomeItem, type HomeKind, type StageKey,
} from '@/lib/homeContent';
import { embedSrc, parseVideoUrl } from '@/lib/ranking';
import styles from './home.module.css';

/* ─── Helpers ── */

const DAY = 24 * 60 * 60 * 1000;

function daysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / DAY);
}

function shortDate(date: string): { day: string; month: string } {
  const d = new Date(`${date}T00:00:00`);
  return {
    day: String(d.getDate()),
    month: d.toLocaleString('en-GB', { month: 'short' }),
  };
}

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

/* ─── Page ── */

export default function HomeClient() {
  const { items, loading } = useHomeItems();
  const starter = useMemo(() => starterItems(), []);

  const videos = pick(items, starter, 'video');
  const guides = pick(items, starter, 'guide');
  const stories = pick(items, starter, 'story');
  const scene = pick(items, starter, 'scene');
  const opportunities = pick(items, starter, 'opportunity')
    .filter(o => o.date && daysUntil(o.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const events = pick(items, starter, 'event')
    .filter(e => e.date && daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));

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
      {/* ── Top ── */}
      <section className={`wrap ${styles.top}`}>
        <h1 className={styles.title}>Building a startup in Zimbabwe</h1>
        <p className={styles.intro}>
          Videos, guides, funding calls and founder stories from Techzim and other media,
          arranged by what you need to do next.
        </p>

        <div className={styles.topGrid}>
          {lead && (
            <article className={styles.lead}>
              <VideoFrame video={lead} large />
              <p className={styles.kicker}>{lead.topic}</p>
              <h2 className={styles.leadTitle}>{lead.title}</h2>
              <p className={styles.meta}>
                {[lead.source, lead.duration].filter(Boolean).join(' · ')}
              </p>
              {lead.summary && <p className={styles.leadSummary}>{lead.summary}</p>}
            </article>
          )}

          <aside className={styles.closing} aria-labelledby="closing-h">
            <h2 id="closing-h" className={styles.asideTitle}>Closing soon</h2>
            {opportunities.length === 0 && <p className={styles.none}>Nothing open right now.</p>}
            <ol className={styles.closingList}>
              {opportunities.slice(0, 4).map(o => (
                <li key={o.id}>
                  <MaybeLink href={o.url} className={styles.closingItem}>
                    <span className={styles.closingWhen}>
                      {daysUntil(o.date) === 0 ? 'Today' : `${daysUntil(o.date)} days`}
                    </span>
                    <span className={styles.closingTitle}>{o.title}</span>
                    <span className={styles.closingMeta}>
                      {o.type} · {o.organiser}
                    </span>
                  </MaybeLink>
                </li>
              ))}
            </ol>
            <Link href="#opportunities" className={styles.more}>
              All opportunities
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      {/* ── Start here ── */}
      <Section id="start" title="Start here" note="Pick the stage you're at.">
        <StartHere videos={videos} guides={guides} />
      </Section>

      {/* ── Opportunities ── */}
      <Section id="opportunities" title="Opportunities" note="Grants, competitions, accelerators and hackathons, by closing date.">
        {opportunities.length === 0 ? (
          <p className={styles.none}>Nothing open right now. Check back next week.</p>
        ) : (
          <ul className={styles.opps}>
            {opportunities.map(o => {
              const days = daysUntil(o.date);
              const { day, month } = shortDate(o.date);
              return (
                <li key={o.id} className={styles.opp}>
                  <span className={styles.oppDate}>
                    <span className={styles.oppDay}>{day}</span>
                    <span className={styles.oppMonth}>{month}</span>
                  </span>
                  <span className={styles.oppMain}>
                    <span className={styles.oppTitle}>{o.title}</span>
                    <span className={styles.oppMeta}>
                      {o.type} from {o.organiser}
                      {o.forWho ? `. For ${o.forWho.charAt(0).toLowerCase()}${o.forWho.slice(1)}.` : ''}
                    </span>
                  </span>
                  <span className={styles.oppValue}>{o.value}</span>
                  <span className={clsx(styles.oppLeft, days <= 7 && styles.oppSoon)}>
                    {days === 0 ? 'Closes today' : days === 1 ? '1 day left' : `${days} days left`}
                  </span>
                  {o.url ? (
                    <a className={styles.oppApply} href={o.url} target="_blank" rel="noopener noreferrer">
                      Apply
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    <span className={styles.oppApply} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── Videos ── */}
      <Section id="videos" title="Videos">
        <ul className={styles.videos}>
          {moreVideos.slice(0, 6).map(v => (
            <li key={v.id}>
              <VideoCard video={v} />
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Stories ── */}
      <Section id="stories" title="Founder stories">
        <ul className={styles.stories}>
          {stories.slice(0, 3).map(s => (
            <li key={s.id}>
              <MaybeLink href={s.url} className={styles.story}>
                <span className={clsx(styles.storyType, s.storyType === 'lesson' && styles.storyLesson)}>
                  {s.storyType === 'lesson' ? 'What went wrong' : 'How they did it'}
                </span>
                <span className={styles.storyTitle}>{s.title}</span>
                {s.quote && <span className={styles.storyQuote}>“{s.quote}”</span>}
                <span className={styles.meta}>
                  {[s.founder && s.startup ? `${s.founder}, ${s.startup}` : s.founder || s.startup, year(s.date), s.minutes ? `${s.minutes} min read` : '']
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </MaybeLink>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Guides and events ── */}
      <div className={`wrap ${styles.twoCol}`}>
        <section id="guides" className={styles.colSection} aria-labelledby="guides-h">
          <h2 id="guides-h" className={styles.sectionTitle}>Guides</h2>
          <ol className={styles.guides}>
            {guides.slice(0, 6).map((g, i) => (
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

        <section id="events" className={styles.colSection} aria-labelledby="events-h">
          <h2 id="events-h" className={styles.sectionTitle}>Events</h2>
          {events.length === 0 ? (
            <p className={styles.none}>No events listed yet.</p>
          ) : (
            <ul className={styles.events}>
              {events.slice(0, 5).map(e => {
                const { day, month } = shortDate(e.date);
                return (
                  <li key={e.id}>
                    <MaybeLink href={e.url} className={styles.event}>
                      <span className={styles.eventDate}>
                        {day} {month}
                      </span>
                      <span>
                        <span className={styles.eventTitle}>{e.title}</span>
                        <span className={styles.meta}>
                          {[e.type, e.town].filter(Boolean).join(', ')}
                        </span>
                      </span>
                    </MaybeLink>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ── Who's who ── */}
      <Section id="scene" title="Who's who" note="Hubs, programmes, funders and the public bodies founders deal with.">
        <div className={styles.scene}>
          {SCENE_GROUPS.map(g => {
            const entries = scene.filter(e => e.group === g.key);
            if (entries.length === 0) return null;
            return (
              <div key={g.key} className={styles.sceneGroup}>
                <h3 className={styles.sceneTitle}>{g.label}</h3>
                <ul className={styles.sceneList}>
                  {entries.map(e => (
                    <li key={e.id}>
                      <MaybeLink href={e.url} className={styles.sceneItem}>
                        <span className={styles.sceneName}>{e.title}</span>
                        {e.description && <span className={styles.sceneDesc}>{e.description}</span>}
                      </MaybeLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Tools ── */}
      <Section id="tools" title="Tools">
        <ul className={styles.tools}>
          <li>
            <Link href="/tools/regulations" className={styles.tool}>
              <span className={styles.toolName}>Regulations</span>
              <span className={styles.toolText}>Which licences and registrations your idea needs.</span>
            </Link>
          </li>
          <li>
            <Link href="/tools/spaces" className={styles.tool}>
              <span className={styles.toolName}>Spaces</span>
              <span className={styles.toolText}>Co-working spaces and internet cafés by town.</span>
            </Link>
          </li>
          <li>
            <Link href="/tools/finder" className={styles.tool}>
              <span className={styles.toolName}>Finder</span>
              <span className={styles.toolText}>Co-founders, employees and freelancers.</span>
            </Link>
          </li>
        </ul>
      </Section>

      {/* ── Email ── */}
      <section className="wrap" aria-labelledby="email-h">
        <div className={styles.email}>
          <div>
            <h2 id="email-h" className={styles.sectionTitle}>Every Monday, by email</h2>
            <p className={styles.emailText}>New opportunities, videos and guides from the week.</p>
          </div>
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}

/* ─── Pieces ── */

function Section({
  id, title, note, children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`wrap ${styles.section}`} aria-labelledby={`${id}-h`}>
      <div className={styles.sectionHead}>
        <h2 id={`${id}-h`} className={styles.sectionTitle}>{title}</h2>
        {note && <p className={styles.sectionNote}>{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** A link when there's somewhere to go; plain text otherwise (sample items). */
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

function StartHere({ videos, guides }: { videos: HomeItem[]; guides: HomeItem[] }) {
  const [active, setActive] = useState<StageKey>('idea');
  const index = STAGES.findIndex(s => s.key === active);
  const stage = STAGES[index];
  const resources = [
    ...videos.filter(v => v.stage === active).slice(0, 2),
    ...guides.filter(g => g.stage === active).slice(0, 2),
  ];

  return (
    <div className={styles.stages}>
      <ol className={styles.stageList} role="tablist" aria-label="Your stage">
        {STAGES.map((s, i) => (
          <li key={s.key}>
            <button
              type="button"
              role="tab"
              aria-selected={active === s.key}
              className={clsx(styles.stageBtn, active === s.key && styles.stageOn)}
              onClick={() => setActive(s.key)}
            >
              <span className={styles.stageNum}>{i + 1}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.stagePanel} role="tabpanel">
        <h3 className={styles.stageQuestion}>{stage.question}</h3>
        <p className={styles.stageSummary}>{stage.summary}</p>

        <ul className={styles.stageLinks}>
          {resources.map(r => (
            <li key={r.id}>
              <MaybeLink href={r.url} className={styles.stageLink}>
                <span className={styles.stageLinkKind}>{r.kind === 'video' ? 'Video' : 'Guide'}</span>
                <span className={styles.stageLinkTitle}>{r.title}</span>
                <span className={styles.meta}>
                  {r.kind === 'video'
                    ? [r.source, r.duration].filter(Boolean).join(' · ')
                    : r.minutes ? `${r.minutes} min read` : ''}
                </span>
              </MaybeLink>
            </li>
          ))}
          <li>
            <Link href={stage.tool.href} className={styles.stageLink}>
              <span className={styles.stageLinkKind}>Tool</span>
              <span className={styles.stageLinkTitle}>{stage.tool.title}</span>
            </Link>
          </li>
        </ul>

        {index < STAGES.length - 1 && (
          <button type="button" className={styles.stageNext} onClick={() => setActive(STAGES[index + 1].key)}>
            Next: {STAGES[index + 1].label}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
