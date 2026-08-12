'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/firebase';

/**
 * Firebase Analytics can only start in the browser, and only once the page is
 * interactive — loading it here keeps it out of the critical path and off the
 * server render entirely.
 */
export default function Analytics() {
  useEffect(() => {
    void initAnalytics();
  }, []);

  return null;
}
