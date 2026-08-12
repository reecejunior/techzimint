import type { Metadata } from 'next';
import { getReviewerByUsername } from '@/lib/firestore';
import { isFirebaseConfigured } from '@/lib/firebase';
import ProfileClient from './ProfileClient';

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    if (!isFirebaseConfigured) return {};

    try {
        const reviewer = await getReviewerByUsername(username);
        if (!reviewer) return { title: 'Reviewer not found' };
        return {
            title: `${reviewer.name} — Reviewer profile`,
            description: `${reviewer.name} reviews Zimbabwean and African startups on Techzim Startups.`,
        };
    } catch {
        return {};
    }
}

export default async function ProfilePage({ params }: Props) {
    const { username } = await params;
    return <ProfileClient username={username} />;
}
