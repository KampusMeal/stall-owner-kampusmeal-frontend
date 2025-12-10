import OrdersPage from '@/components/pages/dashboard/OrdersPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pesanan - KampusMeal',
  description: 'Manajemen pesanan masuk',
};

export default function Page() {
  return <OrdersPage />;
}
