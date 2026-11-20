import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // A stray package-lock.json in a parent folder makes Turbopack guess the
    // workspace root wrongly; pin it to this project.
    root: path.resolve(__dirname),
  },
  // /leaderboard (Techzim's Choice) has been retired outright. Redirect it
  // rather than 404ing whatever still links to it — old bookmarks, search
  // results, shares. The directory now lives at /startups; / is the
  // knowledge hub for founders.
  async redirects() {
    return [
      { source: '/leaderboard', destination: '/', permanent: true },
      // Regulations moved under the Tools section.
      { source: '/regulations', destination: '/tools/regulations', permanent: true },
      { source: '/regulations/:path*', destination: '/tools/regulations/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
