import LoginPages from '@/components/pages/loginPages';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login Penjual - KampusMeal',
  description: 'Halaman login untuk penjual KampusMeal',
};

export default function Page() {
  return <LoginPages />;
}
