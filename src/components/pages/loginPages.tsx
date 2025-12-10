'use client';

import Image from 'next/image';
import LoginForm from '../login/LoginForm';

export default function LoginPages() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-white p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center">
        {/* Logo Section */}
        <div className="relative w-32 h-32">
          <Image
            src="/logo.png"
            alt="KampusMeal Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-2xl font-bold text-text-dark mb-2">
            Selamat Datang
          </h1>
          <p className="text-gray-500 text-sm">
            Silakan masuk untuk mengelola warung Anda
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} KampusMeal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
