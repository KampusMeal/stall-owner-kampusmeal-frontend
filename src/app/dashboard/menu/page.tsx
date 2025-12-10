import MenuPage from '@/components/pages/dashboard/MenuPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu Saya - KampusMeal',
  description: 'Manajemen menu makanan dan minuman',
};

export default function Page() {
  return <MenuPage />;
}
