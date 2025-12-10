'use client';

import { logout } from '@/utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdDashboard,
  MdLogout,
  MdPerson,
  MdReceiptLong,
  MdRestaurantMenu,
  MdReviews,
  MdStore,
} from 'react-icons/md';

const MENU_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: MdDashboard,
  },
  {
    name: 'Pesanan',
    path: '/dashboard/orders',
    icon: MdReceiptLong,
  },
  {
    name: 'Menu Saya',
    path: '/dashboard/menu',
    icon: MdRestaurantMenu,
  },
  {
    name: 'Ulasan',
    path: '/dashboard/reviews',
    icon: MdReviews,
  },
  {
    name: 'Profil Warung',
    path: '/dashboard/profile',
    icon: MdStore,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <div className="relative w-42 h-16">
          <Image
            src="/logo.png"
            alt="KampusMeal Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-orange-200'
                    : 'text-text-dark hover:bg-gray-50 hover:text-primary'
                }
              `}
            >
              <Icon
                size={22}
                className={
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-primary'
                }
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Section */}
      <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <MdPerson className="text-gray-500 text-xl" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-text-dark truncate">
              Admin Warung
            </p>
            <p className="text-xs text-gray-500 truncate">
              admin@kampusmeal.com
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-dark border border-red-200 hover:border-red-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 font-medium text-sm group cursor-pointer"
          onClick={() => {
            logout();
          }}
        >
          <MdLogout
            size={22}
            className="text-gray-400 group-hover:text-red-500"
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
