import type { Metadata } from 'next';
import StartupDirectory from '@/components/StartupDirectory';

export const metadata: Metadata = { title: 'Startups' };

/**
 * The startup directory: search, filter and sort the whole approved set. It
 * used to be the home page; home is now the knowledge hub for founders.
 */
export default function StartupsPage() {
  return (
    <StartupDirectory
      title="Startups"
      description="Every Zimbabwean and African product on the platform. Search, filter, or sort by what matters to you, and open one to see what its founders have been shipping."
      sortSelectId="startups-sort"
    />
  );
}
