'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2 } from 'lucide-react';
import { submitStartup } from '@/lib/firestore';
import { imageFromUrl } from '@/lib/media';
import { ACCEPTED_UPLOAD_TYPES, uploadImageFile, uploadsEnabled } from '@/lib/upload';
import {
    categories,
    regions,
    type PostVideo,
    type StartupSubmission,
    type PostImage,
} from '@/lib/types';
import MediaPicker from '@/components/ui/MediaPicker';
import Logo from '@/components/ui/Logo';
import { initialsOf } from '@/lib/ranking';
import styles from './page.module.css';

const STEPS = ['Basic info', 'Category & links', 'Media', 'Review & post'];

const GUIDELINES = [
    'Must be Zimbabwean-founded or Africa-based',
    'Must be a live product, not just a concept',
    'Only founders or authorised team may submit',
    'No fake startups or duplicates',
    'Goes live immediately — spam gets removed',
];

const EMPTY: StartupSubmission = {
    name: '',
    tagline: '',
    description: '',
    website: '',
    demo: '',
    apk: '',
    founders: '',
    category: '',
    region: '',
    logo: null,
    images: [],
    video: null,
};

/** Accepts anything that parses as an http(s) URL, so people can paste freely. */
function isUrl(value: string) {
    if (!value.trim()) return false;
    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export default function SubmitPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<StartupSubmission>(EMPTY);
    const [agreed, setAgreed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const [slug, setSlug] = useState('');
    const [checkingMedia, setCheckingMedia] = useState(false);
    const [logoBusy, setLogoBusy] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');

    const set = (k: 'name' | 'tagline' | 'description' | 'website' | 'demo' | 'apk' | 'founders' | 'category' | 'region', v: string) =>
        setForm(f => ({ ...f, [k]: v }));

    const websiteValid = isUrl(form.website);
    const demoValid = !form.demo.trim() || isUrl(form.demo);
    const apkValid = !form.apk.trim() || isUrl(form.apk);

    const canContinue =
        step === 0
            ? Boolean(form.name.trim() && form.tagline.trim() && form.founders.trim())
            : step === 1
              ? Boolean(form.category && form.region && websiteValid && demoValid && apkValid)
              : step === 2
                // Media is encouraged but not required — a good product with no
                // screenshot shouldn't be blocked from being posted.
                ? !checkingMedia && !logoBusy
                : agreed;

    async function applyLogo() {
        const url = logoUrl.trim();
        if (!url) {
            setForm(f => ({ ...f, logo: null }));
            return;
        }
        setLogoBusy(true);
        setError(null);
        try {
            // Loading the image proves the link really is one before we store it.
            const image = await imageFromUrl(url);
            setForm(f => ({ ...f, logo: image }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'That logo link could not be used.');
        } finally {
            setLogoBusy(false);
        }
    }

    async function uploadLogo(file: File | undefined) {
        if (!file) return;
        setLogoBusy(true);
        setError(null);
        try {
            const image = await uploadImageFile(file);
            setForm(f => ({ ...f, logo: image }));
            setLogoUrl('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'That logo could not be uploaded.');
        } finally {
            setLogoBusy(false);
        }
    }

    async function handleSubmit() {
        if (!canContinue || saving) return;
        setSaving(true);
        setError(null);
        try {
            // Keep the slug so we can send them straight to their own page,
            // which is reachable immediately even while it is pending.
            setSlug(await submitStartup(form));
            setDone(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong sending your submission. Please try again.',
            );
            setSaving(false);
        }
    }

    if (done) {
        return (
            <div className={styles.page}>
                <div className={`wrap ${styles.successWrap}`}>
                    <div className={styles.success}>
                        <CheckCircle2 size={50} className={styles.successIcon} strokeWidth={1.5} />
                        <h1>You&apos;re live</h1>
                        <p>
                            <strong>{form.name}</strong> is in the feed now. Share the link and
                            the community can start liking, commenting and reviewing — that&apos;s
                            what sets your place on the leaderboard.
                        </p>
                        {slug && (
                            <Link href={`/startups/${slug}`} className={styles.successCta}>
                                View your page
                            </Link>
                        )}
                        <Link href="/" className={styles.successSecondary}>
                            Back to the feed
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="wrap">
                <header className={styles.header}>
                    <p className={styles.eyebrow}>Founders</p>
                    <h1 className={styles.title}>Post your startup</h1>
                    <p className={styles.subtitle}>
                        Share what you&apos;re building. The community tries it, and their likes, comments and reviews set your place on the leaderboard.
                    </p>
                </header>

                <div className={styles.layout}>
                    {/* ── FORM ── */}
                    <div className={styles.formCard}>
                        {/* Progress: an ordered list, so the sequence is conveyed
                            without relying on the visual connector alone. */}
                        <ol className={styles.progress}>
                            {STEPS.map((s, i) => (
                                <li
                                    key={s}
                                    className={styles.step}
                                    data-state={i === step ? 'active' : i < step ? 'done' : undefined}
                                    aria-current={i === step ? 'step' : undefined}
                                >
                                    <span className={styles.stepNum}>
                                        {i < step ? <CheckCircle2 size={15} /> : i + 1}
                                    </span>
                                    <span className={styles.stepLabel}>{s}</span>
                                </li>
                            ))}
                        </ol>

                        {step === 0 && (
                            <>
                                <h2 className={styles.stepTitle}>Tell us about your startup</h2>
                                <div className={styles.fields}>
                                    <Field label="Startup name" id="f-name" required>
                                        <input
                                            id="f-name"
                                            className={styles.input}
                                            placeholder="e.g. PayFlow ZW"
                                            maxLength={80}
                                            value={form.name}
                                            onChange={e => set('name', e.target.value)}
                                        />
                                    </Field>

                                    <Field
                                        label="One-liner tagline"
                                        id="f-tagline"
                                        required
                                        hint={`${form.tagline.length}/100 characters`}
                                    >
                                        <input
                                            id="f-tagline"
                                            className={styles.input}
                                            placeholder="Send money across Zimbabwe in seconds"
                                            value={form.tagline}
                                            onChange={e => set('tagline', e.target.value)}
                                            maxLength={100}
                                        />
                                    </Field>

                                    <Field label="Description" id="f-desc">
                                        <textarea
                                            id="f-desc"
                                            className={styles.textarea}
                                            rows={4}
                                            maxLength={2000}
                                            placeholder="What problem do you solve, and who are you building for?"
                                            value={form.description}
                                            onChange={e => set('description', e.target.value)}
                                        />
                                    </Field>

                                    <Field
                                        label="Founder(s)"
                                        id="f-founders"
                                        required
                                        hint="Separate multiple founders with commas"
                                    >
                                        <input
                                            id="f-founders"
                                            className={styles.input}
                                            placeholder="e.g. Rutendo Zvavamwe, Brian Chikomo"
                                            value={form.founders}
                                            onChange={e => set('founders', e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <h2 className={styles.stepTitle}>Category, region &amp; links</h2>
                                <div className={styles.fields}>
                                    <fieldset className={styles.field}>
                                        <legend className={styles.label}>
                                            Category <span className={styles.req}>*</span>
                                        </legend>
                                        <div className={styles.chips}>
                                            {categories.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    id={`cat-${c.toLowerCase()}`}
                                                    className={styles.chip}
                                                    data-active={form.category === c || undefined}
                                                    aria-pressed={form.category === c}
                                                    onClick={() => set('category', c)}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </fieldset>

                                    <Field label="Region" id="f-region" required>
                                        <select
                                            id="f-region"
                                            className={styles.select}
                                            value={form.region}
                                            onChange={e => set('region', e.target.value)}
                                        >
                                            <option value="">Select a region…</option>
                                            {regions.map(r => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field
                                        label="Website"
                                        id="f-website"
                                        required
                                        error={
                                            form.website.trim() && !websiteValid
                                                ? 'Enter a full address, including https://'
                                                : undefined
                                        }
                                    >
                                        <input
                                            id="f-website"
                                            type="url"
                                            inputMode="url"
                                            className={styles.input}
                                            placeholder="https://yourstartup.co.zw"
                                            value={form.website}
                                            onChange={e => set('website', e.target.value)}
                                        />
                                    </Field>

                                    <Field
                                        label="Demo link"
                                        id="f-demo"
                                        error={!demoValid ? 'Enter a full address, including https://' : undefined}
                                    >
                                        <input
                                            id="f-demo"
                                            type="url"
                                            inputMode="url"
                                            className={styles.input}
                                            placeholder="https://demo.yourstartup.co.zw (optional)"
                                            value={form.demo}
                                            onChange={e => set('demo', e.target.value)}
                                        />
                                    </Field>

                                    <Field
                                        label="APK download"
                                        id="f-apk"
                                        error={!apkValid ? 'Enter a full address, including https://' : undefined}
                                    >
                                        <input
                                            id="f-apk"
                                            type="url"
                                            inputMode="url"
                                            className={styles.input}
                                            placeholder="https://…/app.apk (optional)"
                                            value={form.apk}
                                            onChange={e => set('apk', e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className={styles.stepTitle}>Logo, screenshots &amp; video</h2>
                                <p className={styles.stepHint}>
                                    This is what people see in the feed. A logo and one good
                                    screenshot make far more difference than a long description.
                                    Paste links to images you already host — there are free
                                    hosts linked below.
                                </p>

                                <div className={styles.fields}>
                                    <fieldset className={styles.field}>
                                        <legend className={styles.label}>Logo link</legend>
                                        <div className={styles.logoRow}>
                                            <Logo
                                                name={form.name || 'Your startup'}
                                                url={form.logo?.url}
                                                initials={initialsOf(form.name || 'AN')}
                                                size="lg"
                                            />
                                            <div className={styles.logoActions}>
                                                {uploadsEnabled && (
                                                    <label className={styles.logoUpload}>
                                                        {logoBusy ? 'Working…' : 'Choose from device'}
                                                        <input
                                                            type="file"
                                                            accept={ACCEPTED_UPLOAD_TYPES.join(',')}
                                                            className="sr-only"
                                                            disabled={logoBusy}
                                                            onChange={e => void uploadLogo(e.target.files?.[0])}
                                                        />
                                                    </label>
                                                )}
                                                <div className={styles.logoInputRow}>
                                                    <input
                                                        id="f-logo"
                                                        className={styles.input}
                                                        placeholder={
                                                            uploadsEnabled
                                                                ? '…or paste a logo link'
                                                                : 'https://i.ibb.co/…/logo.png'
                                                        }
                                                        value={logoUrl}
                                                        onChange={e => setLogoUrl(e.target.value)}
                                                        onBlur={() => void applyLogo()}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                void applyLogo();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={styles.logoAdd}
                                                        onClick={() => void applyLogo()}
                                                        disabled={logoBusy}
                                                    >
                                                        {logoBusy ? 'Checking…' : 'Add'}
                                                    </button>
                                                </div>
                                                <span className={styles.charHint}>
                                                    Square works best. Without one we&apos;ll use your initials.
                                                </span>
                                            </div>
                                        </div>
                                    </fieldset>

                                    <fieldset className={styles.field}>
                                        <legend className={styles.label}>Screenshots &amp; video</legend>
                                        <MediaPicker
                                            images={form.images}
                                            video={form.video}
                                            onImagesChange={(images: PostImage[]) =>
                                                setForm(f => ({ ...f, images }))
                                            }
                                            onVideoChange={(video: PostVideo | null) =>
                                                setForm(f => ({ ...f, video }))
                                            }
                                            onBusyChange={setCheckingMedia}
                                        />
                                    </fieldset>
                                </div>

                                {error && (
                                    <p className={styles.formError} role="alert">
                                        {error}
                                    </p>
                                )}
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 className={styles.stepTitle}>Review &amp; confirm</h2>
                                <dl className={styles.reviewTable}>
                                    {(
                                        [
                                            ['Name', form.name],
                                            ['Tagline', form.tagline],
                                            ['Founders', form.founders],
                                            ['Category', form.category],
                                            ['Region', form.region],
                                            ['Website', form.website],
                                            ['Demo', form.demo],
                                            ['APK', form.apk],
                                            ['Logo', form.logo ? 'Added' : ''],
                                            [
                                                'Screenshots',
                                                form.images.length
                                                    ? `${form.images.length} image${form.images.length === 1 ? '' : 's'}`
                                                    : '',
                                            ],
                                            ['Video', form.video ? 'Added' : ''],
                                        ] as [string, string][]
                                    )
                                        .filter(([, v]) => v.trim())
                                        .map(([l, v]) => (
                                            <div key={l} className={styles.reviewRow}>
                                                <dt className={styles.rrLabel}>{l}</dt>
                                                <dd className={styles.rrVal}>{v}</dd>
                                            </div>
                                        ))}
                                </dl>

                                <div className={styles.agree}>
                                    <input
                                        type="checkbox"
                                        id="agree"
                                        className={styles.checkbox}
                                        checked={agreed}
                                        onChange={e => setAgreed(e.target.checked)}
                                    />
                                    <label htmlFor="agree" className={styles.agreeLabel}>
                                        I confirm this startup is real, Africa-based, and I am
                                        authorised to submit it per the submission guidelines.
                                    </label>
                                </div>

                                {error && (
                                    <p className={styles.formError} role="alert">
                                        {error}
                                    </p>
                                )}
                            </>
                        )}

                        <div className={styles.formActions}>
                            {step > 0 && (
                                <button
                                    type="button"
                                    className={styles.btnBack}
                                    onClick={() => setStep(s => s - 1)}
                                    disabled={saving}
                                    id="form-back-btn"
                                >
                                    <ChevronLeft size={15} aria-hidden="true" />
                                    Back
                                </button>
                            )}

                            {step < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    className={styles.btnNext}
                                    disabled={!canContinue}
                                    onClick={() => setStep(s => s + 1)}
                                    id="form-next-btn"
                                >
                                    Continue
                                    <ChevronRight size={15} aria-hidden="true" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.btnNext}
                                    onClick={handleSubmit}
                                    disabled={!canContinue || saving}
                                    id="form-submit-btn"
                                    title={agreed ? undefined : 'Confirm the guidelines first'}
                                >
                                    {saving && (
                                        <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                                    )}
                                    {saving ? 'Posting…' : 'Post startup'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <aside className={styles.sidebar}>
                        <div className={styles.sideCard}>
                            <p className={styles.sideTitle}>
                                <Info size={14} aria-hidden="true" />
                                Submission guidelines
                            </p>
                            <ol className={styles.guideList}>
                                {GUIDELINES.map((text, i) => (
                                    <li key={i} className={styles.guideItem}>
                                        <span className={styles.guideNum}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className={styles.sideCallout}>
                            <strong>What happens next?</strong>
                            After approval your startup goes live on the leaderboard — the community
                            can start voting and reviewing immediately.
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    id,
    hint,
    error,
    required,
    children,
}: {
    label: string;
    id: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.field} data-invalid={error ? true : undefined}>
            <label htmlFor={id} className={styles.label}>
                {label}
                {required && (
                    <span className={styles.req} aria-hidden="true">
                        {' '}
                        *
                    </span>
                )}
                {required && <span className="sr-only"> (required)</span>}
            </label>
            {children}
            {error ? (
                <span className={styles.fieldError} role="alert">
                    {error}
                </span>
            ) : (
                hint && <span className={styles.charHint}>{hint}</span>
            )}
        </div>
    );
}
