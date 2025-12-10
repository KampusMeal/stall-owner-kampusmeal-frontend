import ReviewsPage from '@/components/pages/dashboard/ReviewsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ulasan - KampusMeal',
  description: 'Lihat ulasan dari pembeli',
};

export default function Page() {
  return <ReviewsPage />;
}
