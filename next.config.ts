import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // A stray package-lock.json in a parent folder makes Turbopack guess the
    // workspace root wrongly; pin it to this project.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
