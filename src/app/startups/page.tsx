import StartupDirectory from '@/components/StartupDirectory';

export default function StartupsPage() {
  return (
    <StartupDirectory
      title="Startups"
      description="Every product on the platform, A–Z. Open one to read what its founders have been shipping."
      sortSelectId="startups-sort"
    />
  );
}
