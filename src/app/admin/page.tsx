import type { Metadata } from 'next';
import AdminClient from './AdminClient';

// Keep this out of search results — it's not a page anyone should land on
// from Google, only from knowing the URL.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
