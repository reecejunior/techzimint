import styles from './FormattedText.module.css';

// Matches a ```fenced block``` — not a Markdown parser, deliberately: this
// looks for exactly one thing (a pair of triple backticks) and treats
// everything else as plain text, the same way the rest of the community
// section already renders a post/comment body (white-space: pre-wrap, no
// other markup). Lazy (*?) so "```a``` and ```b```" splits into two blocks
// rather than swallowing the plain text between them into one.
const FENCE_RE = /```([\s\S]*?)```/g;

interface Part {
  type: 'text' | 'code';
  value: string;
}

function splitFences(text: string): Part[] {
  const parts: Part[] = [];
  let lastIndex = 0;
  FENCE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FENCE_RE.exec(text))) {
    if (match.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    // Trims one leading/trailing newline — ```\ncode\n``` is how people
    // naturally type a fence, and that newline is formatting, not content.
    parts.push({ type: 'code', value: match[1].replace(/^\n/, '').replace(/\n$/, '') });
    lastIndex = FENCE_RE.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) });
  return parts;
}

/**
 * Renders a post/comment body with one piece of formatting recognised:
 * ```fenced code blocks```, as <pre><code> in --font-mono. Nothing else —
 * no inline backticks, no bold/italic/links, no Markdown library. A caller
 * needs a block-level wrapper (a <div>, not a <p>) since a code block can't
 * legally nest inside a paragraph.
 */
export default function FormattedText({ text }: { text: string }) {
  const parts = splitFences(text);
  if (parts.length === 0) return null;

  return (
    <>
      {parts.map((p, i) =>
        p.type === 'code' ? (
          <pre key={i} className={styles.code}>
            <code>{p.value}</code>
          </pre>
        ) : (
          p.value && <span key={i}>{p.value}</span>
        ),
      )}
    </>
  );
}
