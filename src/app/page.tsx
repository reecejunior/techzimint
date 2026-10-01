import StartupDirectory from '@/components/StartupDirectory';

/**
 * Home is the startup directory itself — search, filter and sort the whole
 * approved set. It used to be a chronological post feed with a "Techzim's
 * Choice" sidebar; both are gone in favour of one focused view, so a first-time
 * visitor sees what's out there rather than whatever happened to post today.
 */
export default function HomePage() {
  return (
    <StartupDirectory
      title="Startups"
      description="Every Zimbabwean and African product on the platform. Search, filter, or sort by what matters to you, and open one to see what its founders have been shipping."
      sortSelectId="home-sort"
    />
  );
}
