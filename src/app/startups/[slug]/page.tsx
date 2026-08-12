import type { Metadata } from 'next';
import { fetchStartupBySlug } from '@/lib/firestore';
import { isFirebaseConfigured } from '@/lib/firebase';
import StartupDetailClient from './StartupDetailClient';

type Props = { params: Promise<{ slug: string }> };

/**
 * Startups are added and approved at runtime, so there is no fixed set of
 * paths to prerender — pages render on demand. Metadata still reads the record
 * server-side so links unfurl with the real name and description.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    if (!isFirebaseConfigured) return {};

    try {
        const startup = await fetchStartupBySlug(slug);
        if (!startup) return { title: 'Startup not found' };
        return {
            title: `${startup.name} — ${startup.tagline}`,
            description: startup.description,
            openGraph: {
                title: `${startup.name} — ${startup.tagline}`,
                description: startup.description,
            },
        };
    } catch {
        // Never let a metadata lookup take the page down with it.
        return {};
    }
}

export default async function StartupDetailPage({ params }: Props) {
    const { slug } = await params;
    return <StartupDetailClient slug={slug} />;
}
