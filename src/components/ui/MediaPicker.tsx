'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Film, ImagePlus, Link2, Loader2, X } from 'lucide-react';
import { MAX_IMAGES_PER_POST, imageFromUrl } from '@/lib/media';
import { ACCEPTED_UPLOAD_TYPES, uploadImageFile, uploadsEnabled } from '@/lib/upload';
import { parseVideoUrl } from '@/lib/ranking';
import type { PostImage, PostVideo } from '@/lib/types';
import styles from './MediaPicker.module.css';

interface MediaPickerProps {
  images: PostImage[];
  video: PostVideo | null;
  onImagesChange: (images: PostImage[]) => void;
  onVideoChange: (video: PostVideo | null) => void;
  /** Lets the parent block submit while something is still in flight. */
  onBusyChange?: (busy: boolean) => void;
}

interface Job {
  id: number;
  name: string;
  percent: number;
}

let jobSeq = 0;

/**
 * Picks images for a post — from the device, or by link.
 *
 * Uploading is the main path. Pasting a link stays available because a founder
 * whose screenshots already live somewhere shouldn't have to re-upload them,
 * and because it is the fallback if the upload host is not configured.
 *
 * Video is always a YouTube/Vimeo link: hosting video is a different order of
 * cost, and both platforms already solve playback and bandwidth.
 */
export default function MediaPicker({
  images,
  video,
  onImagesChange,
  onVideoChange,
  onBusyChange,
}: MediaPickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(video?.kind === 'embed' ? video.url : '');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [checking, setChecking] = useState(false);
  const [linkOpen, setLinkOpen] = useState(!uploadsEnabled);
  const [error, setError] = useState<string | null>(null);
  const imageId = useId();
  const videoId = useId();

  const atLimit = images.length >= MAX_IMAGES_PER_POST;
  const busy = jobs.length > 0 || checking;

  /* Busy is derived from our own state and reported to the parent from an
     effect. Calling the parent's setter inline — especially from inside a
     setJobs updater, which runs during render — is a setState-while-rendering
     bug. The ref keeps the latest callback without making `busy` re-fire just
     because the parent passed a fresh arrow function. */
  const onBusyRef = useRef(onBusyChange);
  useEffect(() => {
    onBusyRef.current = onBusyChange;
  });
  useEffect(() => {
    onBusyRef.current?.(busy);
  }, [busy]);

  /* ── Upload from the device ── */
  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const room = MAX_IMAGES_PER_POST - images.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_IMAGES_PER_POST} images.`);
      return;
    }

    const chosen = Array.from(files).slice(0, room);
    if (chosen.length < files.length) {
      setError(`Only the first ${room} image${room === 1 ? '' : 's'} were added.`);
    }

    const started = chosen.map(file => ({ id: ++jobSeq, name: file.name, percent: 0 }));
    setJobs(prev => [...prev, ...started]);

    // Upload together and append once — appending per file would need the
    // newest list inside each callback, which a captured closure can't give.
    const results = await Promise.allSettled(
      chosen.map((file, i) =>
        uploadImageFile(file, percent =>
          setJobs(prev => prev.map(j => (j.id === started[i].id ? { ...j, percent } : j))),
        ),
      ),
    );

    const done = new Set(started.map(j => j.id));
    setJobs(prev => prev.filter(j => !done.has(j.id)));

    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<PostImage> => r.status === 'fulfilled')
      .map(r => r.value);
    if (uploaded.length) onImagesChange([...images, ...uploaded]);

    const failed = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
    if (failed.length) {
      setError(
        failed[0].reason instanceof Error
          ? failed[0].reason.message
          : `${failed.length} image${failed.length === 1 ? '' : 's'} could not be uploaded.`,
      );
    }

    if (fileInput.current) fileInput.current.value = '';
  }

  /* ── Add by link ── */
  async function addImageLink() {
    const url = imageUrl.trim();
    if (!url || checking) return;

    if (atLimit) {
      setError(`You can add up to ${MAX_IMAGES_PER_POST} images.`);
      return;
    }
    if (images.some(i => i.url === url)) {
      setError('That image is already on this post.');
      return;
    }

    // `checking` feeds the derived `busy` above, so the parent is told without
    // anyone calling its setter from here.
    setChecking(true);
    setError(null);
    try {
      const image = await imageFromUrl(url);
      onImagesChange([...images, image]);
      setImageUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That link could not be used.');
    } finally {
      setChecking(false);
    }
  }

  function applyVideo() {
    const url = videoUrl.trim();
    if (!url) {
      onVideoChange(null);
      setError(null);
      return;
    }
    const parsed = parseVideoUrl(url);
    if (!parsed) {
      setError('Paste a YouTube or Vimeo link.');
      return;
    }
    onVideoChange({ kind: 'embed', url, ...parsed });
    setError(null);
  }

  return (
    <div className={styles.picker}>
      {/* ── Images ── */}
      <div className={styles.group}>
        <span className={styles.label}>
          <ImagePlus size={15} aria-hidden="true" />
          Screenshots
          <span className={styles.count}>
            {images.length}/{MAX_IMAGES_PER_POST}
          </span>
        </span>

        <div className={styles.actions}>
          {uploadsEnabled && (
            <button
              type="button"
              className={styles.upload}
              onClick={() => fileInput.current?.click()}
              disabled={atLimit || busy}
            >
              <ImagePlus size={15} aria-hidden="true" />
              Choose from device
            </button>
          )}

          <button
            type="button"
            className={styles.linkToggle}
            onClick={() => setLinkOpen(o => !o)}
            aria-expanded={linkOpen}
            disabled={atLimit}
          >
            <Link2 size={15} aria-hidden="true" />
            {uploadsEnabled ? 'Or paste a link' : 'Paste an image link'}
          </button>

          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED_UPLOAD_TYPES.join(',')}
            multiple
            className="sr-only"
            onChange={e => void handleFiles(e.target.files)}
          />
        </div>

        {linkOpen && (
          <div className={styles.row}>
            <label htmlFor={imageId} className="sr-only">
              Image link
            </label>
            <input
              id={imageId}
              className={styles.input}
              placeholder="https://…/screenshot.png"
              value={imageUrl}
              disabled={atLimit}
              onChange={e => setImageUrl(e.target.value)}
              /* Added on blur too, so typing a link and moving on doesn't
                 silently discard it. */
              onBlur={() => void addImageLink()}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void addImageLink();
                }
              }}
            />
            <button
              type="button"
              className={styles.add}
              onClick={() => void addImageLink()}
              disabled={!imageUrl.trim() || checking || atLimit}
            >
              {checking ? <Loader2 size={14} className={styles.spin} aria-hidden="true" /> : 'Add'}
            </button>
          </div>
        )}

        {!uploadsEnabled && (
          <p className={styles.hint}>
            Device uploads are off — add <code>NEXT_PUBLIC_IMGBB_API_KEY</code> to{' '}
            <code>.env.local</code> to turn them on.
          </p>
        )}
      </div>

      {/* ── Progress ── */}
      {jobs.length > 0 && (
        <ul className={styles.jobs}>
          {jobs.map(j => (
            <li key={j.id} className={styles.job}>
              <Loader2 size={13} className={styles.spin} aria-hidden="true" />
              <span className={styles.jobName}>{j.name}</span>
              <span className={styles.jobPct}>{j.percent}%</span>
              <span className={styles.bar}>
                <span className={styles.barFill} style={{ width: `${j.percent}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* ── Video ── */}
      <div className={styles.group}>
        <label htmlFor={videoId} className={styles.label}>
          <Film size={15} aria-hidden="true" />
          Demo video
        </label>

        <div className={styles.row}>
          <input
            id={videoId}
            className={styles.input}
            placeholder="https://youtube.com/watch?v=…"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            onBlur={applyVideo}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyVideo();
              }
            }}
          />
          <button type="button" className={styles.add} onClick={applyVideo} disabled={!videoUrl.trim()}>
            Add
          </button>
        </div>

        <p className={styles.hint}>YouTube or Vimeo. Upload there, paste the link here.</p>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {/* ── Previews ── */}
      {(images.length > 0 || video) && (
        <div className={styles.previews}>
          {images.map((img, i) => (
            <div key={img.url} className={styles.preview}>
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote host */}
              <img src={img.url} alt="" className={styles.previewImg} />
              <button
                type="button"
                className={styles.remove}
                onClick={() => onImagesChange(images.filter((_, n) => n !== i))}
                aria-label={`Remove image ${i + 1}`}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
          ))}

          {video && (
            <div className={styles.preview} data-video>
              <span className={styles.videoTag}>
                <Film size={15} aria-hidden="true" />
                {video.provider ?? 'Video'}
              </span>
              <button
                type="button"
                className={styles.remove}
                onClick={() => {
                  onVideoChange(null);
                  setVideoUrl('');
                }}
                aria-label="Remove video"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
