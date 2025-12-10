import ProfilePage from '@/components/pages/dashboard/ProfilePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil Warung - KampusMeal',
  description: 'Pengaturan informasi warung',
};

export default function Page() {
  return <ProfilePage />;
}
