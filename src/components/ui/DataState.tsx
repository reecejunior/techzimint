import { AlertCircle, DatabaseZap, SearchX } from 'lucide-react';
import styles from './DataState.module.css';

/**
 * Firestore's own error text ("Missing or insufficient permissions") is
 * accurate but tells nobody what to do about it. On a project that has not
 * finished its Firebase setup that message is the whole screen, so translate
 * the two setup failures into the steps that actually fix them.
 */
function isSetupError(message: string) {
  return (
    /insufficient permissions|permission-denied/i.test(message) ||
    /configuration-not-found/i.test(message) ||
    /not configured/i.test(message)
  );
}

const SETUP_STEPS = [
  <>
    In the Firebase console, open <strong>Build → Firestore Database</strong> and create a
    database if there isn&apos;t one.
  </>,
  <>
    Under <strong>Build → Authentication → Sign-in method</strong>, enable{' '}
    <strong>Anonymous</strong>. Likes, comments and reviews are attributed to an anonymous
    account.
  </>,
  <>
    Publish the access rules from <code>firestore.rules</code>, or run{' '}
    <code>firebase deploy --only firestore:rules</code>.
  </>,
  <>
    Build the feed index with <code>firebase deploy --only firestore:indexes</code>.
  </>,
  <>
    Load the starting content with <code>npm run seed</code>.
  </>,
];

/**
 * A missing Firestore index is a one-click fix, and the error text already
 * carries the console link that creates it — so surface the link rather than
 * the paragraph of prose wrapped around it.
 */
function indexUrl(message: string): string | null {
  if (!/requires an?.*index/i.test(message)) return null;
  return message.match(/https:\/\/console\.firebase\.google\.com\/\S+/)?.[0] ?? null;
}

export function ErrorState({ message }: { message: string }) {
  const createIndex = indexUrl(message);

  if (createIndex) {
    return (
      <div className={styles.box} role="alert">
        <DatabaseZap size={30} className={styles.icon} strokeWidth={1.6} />
        <p className={styles.title}>This view needs a database index</p>
        <p className={styles.body}>
          Firestore needs an index before it can answer this query. Creating it takes
          one click and a minute or two to build, then reload this page.
        </p>
        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <span>
              <a href={createIndex} target="_blank" rel="noopener noreferrer">
                Create the index in the Firebase console
              </a>
            </span>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <span>
              Or deploy it from the repo: <code>firebase deploy --only firestore:indexes</code>
            </span>
          </li>
        </ol>
      </div>
    );
  }

  if (isSetupError(message)) {
    return (
      <div className={styles.box} role="status">
        <DatabaseZap size={30} className={styles.icon} strokeWidth={1.6} />
        <p className={styles.title}>Firebase needs a moment of setup</p>
        <p className={styles.body}>
          The app is connected to your project, but the database turned this request away.
          These steps and it fills itself in.
        </p>
        <ol className={styles.steps}>
          {SETUP_STEPS.map((step, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className={styles.box} role="alert">
      <AlertCircle size={30} className={styles.icon} strokeWidth={1.6} />
      <p className={styles.title}>Couldn&apos;t load that just now</p>
      <p className={styles.body}>{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.box}>
      <SearchX size={30} className={styles.icon} strokeWidth={1.6} />
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.body}>{children}</p>}
    </div>
  );
}
