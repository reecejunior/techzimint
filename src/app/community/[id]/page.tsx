import type { Metadata } from 'next';
import { fetchCommunityPostById } from '@/lib/firestore';
import { isFirebaseConfigured } from '@/lib/firebase';
import CommunityThreadClient from './CommunityThreadClient';

type Props = { params: Promise<{ id: string }> };

/**
 * Community posts are created at runtime, so there is no fixed set of paths
 * to prerender — same reasoning as /startups/[slug]. Metadata still reads the
 * record server-side so links unfurl with the real title and an excerpt.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isFirebaseConfigured) return {};

  try {
    const post = await fetchCommunityPostById(id);
    if (!post) return { title: 'Post not found' };
    const description = post.body.slice(0, 200);
    return {
      title: `${post.title} — Techzim Community`,
      description,
      openGraph: {
        title: post.title,
        description,
      },
    };
  } catch {
    // Never let a metadata lookup take the page down with it.
    return {};
  }
}

export default async function CommunityThreadPage({ params }: Props) {
  const { id } = await params;
  return <CommunityThreadClient postId={id} />;
}
