import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // A stray package-lock.json in a parent folder makes Turbopack guess the
    // workspace root wrongly; pin it to this project.
    root: path.resolve(__dirname),
  },
  // /startups and / used to render the same directory from two separate
  // pages; the home page is now the only copy. /leaderboard (Techzim's
  // Choice) has been retired outright. Redirect both rather than 404ing
  // whatever still links to them — old bookmarks, search results, shares.
  async redirects() {
    return [
      { source: '/startups', destination: '/', permanent: true },
      { source: '/leaderboard', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
