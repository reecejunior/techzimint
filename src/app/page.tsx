import Link from 'next/link';
import {
  ArrowRight, BookOpen, CalendarDays, Coffee, FileCheck2, FileText, Flag, Lightbulb, MapPin,
  Play, Quote, Users,
} from 'lucide-react';
import clsx from 'clsx';
import StartHere from '@/components/home/StartHere';
import SubscribeForm from '@/components/SubscribeForm';
import {
  EVENTS, GUIDES, OPPORTUNITIES, SAMPLE_CONTENT, SCENE, STORIES, VIDEOS, type Video,
} from '@/lib/homeContent';
import styles from '@/components/home/home.module.css';

/**
 * Home is the knowledge hub: what a founder needs to know about building a
 * startup in Zimbabwe, in videos, guides, opportunities and stories. The
 * startup directory lives at /startups. Content comes from src/lib/homeContent.ts.
 */

const TOPICS = ['Registering', 'Payments', 'Funding', 'Hiring', 'Pricing', 'Founder stories'];

export default function HomePage() {
  const [featured, ...moreVideos] = VIDEOS;

  return (
    <div className={styles.page}>
      {SAMPLE_CONTENT && (
        <p className={styles.sample} role="note">
          Preview: everything on this page is sample content to show the layout.
        </p>
      )}

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>For Zimbabwean founders</span>
            <h1 className={styles.heroTitle}>Learn how the Zimbabwean startup scene works.</h1>
            <p className={styles.heroSub}>
              Videos, guides, opportunities and stories from Techzim and other media, organised by
              where you are, so you know what to do next.
            </p>
            <div className={styles.heroCtas}>
              <Link href="#start" className={styles.ctaPrimary}>
                Start here
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="#opportunities" className={styles.ctaSecondary}>
                Opportunities closing soon
              </Link>
            </div>
            <ul className={styles.topics} aria-label="Popular topics">
              {TOPICS.map(t => (
                <li key={t}>
                  <Link href="#videos" className={styles.topic}>{t}</Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="#videos" className={styles.featured}>
            <VideoThumb video={featured} large />
            <span className={styles.featuredText}>
              <span className={styles.featuredLabel}>Watch this week</span>
              <span className={styles.featuredTitle}>{featured.title}</span>
              <span className={styles.videoMeta}>
                {featured.source} · {featured.duration}
                {featured.hasSummary && ' · Written summary'}
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* ── Start here ── */}
      <section id="start" className={styles.section}>
        <div className="wrap">
          <SectionHead
            eyebrow="Start here"
            title="Where are you right now?"
            sub="Pick your stage to see what matters most, with the videos, guides and tools for it."
          />
          <StartHere />
        </div>
      </section>

      {/* ── Opportunities ── */}
      <section id="opportunities" className={clsx(styles.section, styles.sectionTint)}>
        <div className="wrap">
          <SectionHead
            eyebrow="Opportunities"
            title="Closing soon"
            sub="Grants, competitions, accelerators and hackathons open to Zimbabwean founders, by deadline."
            link={{ href: '#opportunities', label: 'See all opportunities' }}
          />
          <ul className={styles.opps}>
            {OPPORTUNITIES.map(o => (
              <li key={o.id}>
                <Link href="#opportunities" className={styles.opp}>
                  <span className={clsx(styles.oppType, styles[`opp_${o.type.toLowerCase()}`])}>{o.type}</span>
                  <span className={styles.oppMain}>
                    <span className={styles.oppTitle}>{o.title}</span>
                    <span className={styles.oppMeta}>
                      {o.organiser} · {o.forWho}
                    </span>
                  </span>
                  <span className={styles.oppValue}>{o.value}</span>
                  <span className={clsx(styles.oppDeadline, o.daysLeft <= 10 && styles.oppUrgent)}>
                    <span className={styles.oppDays}>{o.daysLeft} days left</span>
                    <span className={styles.oppDate}>Closes {o.closes}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Videos ── */}
      <section id="videos" className={styles.section}>
        <div className="wrap">
          <SectionHead
            eyebrow="Watch"
            title="Latest videos"
            sub="Each video has a short written summary, for when data is tight."
            link={{ href: '#videos', label: 'All videos' }}
          />
          <ul className={styles.videos}>
            {moreVideos.map(v => (
              <li key={v.id}>
                <Link href="#videos" className={styles.video}>
                  <VideoThumb video={v} />
                  <span className={styles.videoTopic}>{v.topic}</span>
                  <span className={styles.videoTitle}>{v.title}</span>
                  <span className={styles.videoMeta}>
                    {v.source} · {v.duration}
                    {v.hasSummary && (
                      <>
                        {' · '}
                        <FileText size={12} aria-hidden="true" /> Summary
                      </>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Scene map ── */}
      <section id="scene" className={clsx(styles.section, styles.sectionDark)}>
        <div className="wrap">
          <SectionHead
            eyebrow="The scene"
            title="Who's who in Zimbabwean startups"
            sub="The hubs, programmes, funders and communities you should know, and how to approach each."
            link={{ href: '#scene', label: 'Explore the full map' }}
            dark
          />
          <ul className={styles.scene}>
            {SCENE.map(g => (
              <li key={g.key}>
                <Link href="#scene" className={styles.sceneCard}>
                  <span className={styles.sceneCount}>{g.count}</span>
                  <span className={styles.sceneLabel}>{g.label}</span>
                  <span className={styles.sceneDesc}>{g.description}</span>
                  <span className={styles.sceneExamples}>{g.examples.join(' · ')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Stories ── */}
      <section id="stories" className={styles.section}>
        <div className="wrap">
          <SectionHead
            eyebrow="Founder stories"
            title="What worked, and what didn't"
            sub="Honest accounts from founders who have done it, including the ones that failed."
            link={{ href: '#stories', label: 'All stories' }}
          />
          <ul className={styles.stories}>
            {STORIES.map(s => (
              <li key={s.id}>
                <Link href="#stories" className={clsx(styles.story, s.kind === 'lesson' && styles.storyLesson)}>
                  <span className={styles.storyKind}>
                    {s.kind === 'lesson' ? <Flag size={14} aria-hidden="true" /> : <Lightbulb size={14} aria-hidden="true" />}
                    {s.kind === 'lesson' ? 'Lessons from a shutdown' : 'How they did it'}
                  </span>
                  <Quote size={22} className={styles.storyQuoteMark} aria-hidden="true" />
                  <span className={styles.storyQuote}>{s.quote}</span>
                  <span className={styles.storyTitle}>{s.title}</span>
                  <span className={styles.storyMeta}>
                    {s.founder}, {s.startup} · {s.minutes} min read
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Guides and events ── */}
      <section id="guides" className={clsx(styles.section, styles.sectionTint)}>
        <div className={`wrap ${styles.split}`}>
          <div>
            <SectionHead
              eyebrow="Guides"
              title="Practical guides"
              sub="The Zimbabwe-specific details generic startup advice leaves out."
              link={{ href: '#guides', label: 'All guides' }}
            />
            <ul className={styles.guides}>
              {GUIDES.map(g => (
                <li key={g.id}>
                  <Link href="#guides" className={styles.guide}>
                    <BookOpen size={18} className={styles.guideIcon} aria-hidden="true" />
                    <span className={styles.guideText}>
                      <span className={styles.guideTitle}>{g.title}</span>
                      <span className={styles.guideMeta}>
                        {g.topic} · {g.minutes} min read
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div id="events">
            <SectionHead
              eyebrow="Events"
              title="Coming up"
              link={{ href: '#events', label: 'Calendar' }}
            />
            <ul className={styles.events}>
              {EVENTS.map(e => (
                <li key={e.id}>
                  <Link href="#events" className={styles.event}>
                    <span className={styles.eventDate}>
                      <span className={styles.eventDay}>{e.day}</span>
                      <span className={styles.eventMonth}>{e.month}</span>
                    </span>
                    <span className={styles.eventText}>
                      <span className={styles.eventTitle}>{e.title}</span>
                      <span className={styles.eventMeta}>
                        <MapPin size={12} aria-hidden="true" /> {e.town} · {e.kind}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className={styles.eventsNote}>
              <CalendarDays size={14} aria-hidden="true" /> Running an event? Tell us and we&apos;ll list it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tools ── */}
      <section className={styles.section}>
        <div className="wrap">
          <SectionHead
            eyebrow="Tools"
            title="Tools for founders"
            link={{ href: '/tools', label: 'All tools' }}
          />
          <ul className={styles.tools}>
            <ToolCard href="/tools/regulations" icon={<FileCheck2 size={20} />} name="Regulations" text="The licences and registrations your idea needs." />
            <ToolCard href="/tools/spaces" icon={<Coffee size={20} />} name="Spaces" text="Co-working spaces and cafés to work from." />
            <ToolCard href="/tools/finder" icon={<Users size={20} />} name="Finder" text="Find a co-founder, employees or freelancers." />
          </ul>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className={styles.newsletter}>
        <div className={`wrap ${styles.newsletterInner}`}>
          <div>
            <h2 className={styles.newsletterTitle}>This week in Zimbabwean startups</h2>
            <p className={styles.newsletterSub}>
              New opportunities, videos and guides in your inbox every Monday. Free, and easy to
              unsubscribe.
            </p>
          </div>
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  eyebrow, title, sub, link, dark = false,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  link?: { href: string; label: string };
  dark?: boolean;
}) {
  return (
    <div className={clsx(styles.sectionHead, dark && styles.sectionHeadDark)}>
      <div>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {sub && <p className={styles.sectionSub}>{sub}</p>}
      </div>
      {link && (
        <Link href={link.href} className={styles.sectionLink}>
          {link.label}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function VideoThumb({ video, large = false }: { video: Video; large?: boolean }) {
  return (
    <span className={clsx(styles.thumb, styles[`tone${video.tone % 6}`], large && styles.thumbLarge)}>
      <span className={styles.thumbTopic}>{video.topic}</span>
      <span className={styles.play} aria-hidden="true">
        <Play size={large ? 26 : 18} fill="currentColor" />
      </span>
      <span className={styles.duration}>{video.duration}</span>
    </span>
  );
}

function ToolCard({ href, icon, name, text }: { href: string; icon: React.ReactNode; name: string; text: string }) {
  return (
    <li>
      <Link href={href} className={styles.tool}>
        <span className={styles.toolIcon} aria-hidden="true">{icon}</span>
        <span className={styles.toolName}>{name}</span>
        <span className={styles.toolText}>{text}</span>
      </Link>
    </li>
  );
}
