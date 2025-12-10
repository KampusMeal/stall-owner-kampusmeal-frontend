import DashboardPage from '@/components/pages/dashboard/DashboardPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - KampusMeal',
  description: 'Ringkasan penjualan dan statistik',
};

export default function Page() {
  return <DashboardPage />;
}
