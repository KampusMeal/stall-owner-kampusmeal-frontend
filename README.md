# 🍽️ Admin Dashboard - KampusMeal Warung

![KampusMeal Banner](https://img.shields.io/badge/KampusMeal-Admin_Dashboard-orange?style=for-the-badge)

> **Platform manajemen warung yang modern, cepat, dan intuitif untuk mitra KampusMeal.**

![Next.js](https://img.shields.io/badge/next.js-v16.0.8-000000?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/react-v19.2.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/typescript-v5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Status](https://img.shields.io/badge/status-development-yellow?style=for-the-badge)

---

## 📖 Tentang Project

**Admin Frontend KampusMeal** adalah aplikasi web berbasis **Next.js** yang dirancang khusus untuk pemilik warung (mitra) di ekosistem **KampusMeal**. Aplikasi ini berfungsi sebagai pusat kendali bagi pemilik warung untuk mengelola operasional bisnis mereka secara digital dengan mudah dan efisien.

Dengan antarmuka yang bersih dan responsif, mitra dapat memantau pesanan, mengelola menu makanan, melihat ulasan pelanggan, dan memperbarui profil warung mereka secara _real-time_.

## ✨ Fitur Utama

Aplikasi ini dilengkapi dengan berbagai fitur untuk mendukung produktivitas mitra:

- **📊 Dashboard Interaktif**: Ringkasan performa warung, grafik pendapatan (coming soon), dan notifikasi penting.
- **🍛 Manajemen Menu**: Tambah, edit, dan hapus menu makanan dengan mudah. Atur ketersediaan stok dalam satu klik.
- **🛍️ Manajemen Pesanan**: Terima dan proses pesanan masuk dari mahasiswa secara _real-time_.
- **🏪 Profil Warung**: Kelola informasi warung, jam operasional, dan foto profil.
- **⭐ Ulasan & Rating**: Pantau ulasan dari pelanggan untuk meningkatkan kualitas layanan.
- **🔐 Autentikasi Aman**: Sistem login yang aman untuk melindungi data mitra.
- **📱 Responsif**: Tampilan yang optimal di perangkat desktop maupun tablet.

## 🛠️ Teknologi (Tech Stack)

Project ini dibangun menggunakan teknologi web modern terkini untuk memastikan performa yang cepat dan _developer experience_ yang baik.

| Kategori           | Teknologi                                                        | Deskripsi                                                      |
| :----------------- | :--------------------------------------------------------------- | :------------------------------------------------------------- |
| **Core Framework** | [Next.js 16](https://nextjs.org/)                                | Framework React full-stack dengan App Router terbaru.          |
| **UI Library**     | [React 19](https://react.dev/)                                   | Library untuk membangun antarmuka pengguna yang dinamis.       |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                    | JavaScript dengan tipe data statis untuk kode yang lebih aman. |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/)                      | Framework CSS utility-first untuk styling cepat & modern.      |
| **Code Quality**   | [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) | Menjaga konsistensi dan kualitas kode.                         |
| **Git Hooks**      | [Husky](https://typicode.github.io/husky/)                       | Menjalankan script otomatis sebelum commit (pre-commit).       |

## 🚀 Cara Menjalankan (Local Development)

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokal Anda:

### 1. Prasyarat

Pastikan Anda sudah menginstal:

- [Node.js](https://nodejs.org/) (Versi LTS disarankan, min v18+)
- Package manager (npm, yarn, pnpm, atau bun). Disarankan menggunakan **npm** atau **pnpm**.

### 2. Instalasi Dependensi

Clone repository ini (jika belum) dan install dependensi:

```bash
# Menggunakan npm
npm install

# Atau menggunakan pnpm
pnpm install
```

### 3. Setup Environment Variable

Duplikasi file `.env.local.example` (jika ada) menjadi `.env.local` dan sesuaikan variabel environtment-nya.
_(Hubungi tim backend jika memerlukan API URL spesifik)_.

### 4. Jalankan Development Server

Mulai server lokal:

```bash
npm run dev
# atau
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

## 📂 Struktur Project

Struktur folder utama menggunakan **Next.js App Router**:

```
src/
├── app/                 # Halaman & Routing (App Router)
│   ├── dashboard/       # Halaman utama Admin (Protected)
│   │   ├── menu/        # Halaman Manajemen Menu
│   │   ├── orders/      # Halaman Pesanan
│   │   ├── profile/     # Halaman Profil Warung
│   │   └── reviews/     # Halaman Ulasan
│   └── login/           # Halaman Login
├── components/          # Komponen UI Reusable
├── utils/               # Fungsi utilitas & helper
└── ...
```

## 🤝 Kontribusi

Project ini bersifat **Open Source** dan dikembangkan untuk keperluan Tugas Akhir / Product Development KampusMeal. Kontribusi terbatas pada tim pengembang yang berwenang.

1. Pastikan branch Anda _up-to-date_.
2. Gunakan [Conventional Commits](https://www.conventionalcommits.org/) saat melakukan commit.
3. Pastikan tidak ada _linting error_ sebelum push.

---

<p align="center">
  Dibuat dengan ❤️ oleh Tim KampusMeal
</p>
