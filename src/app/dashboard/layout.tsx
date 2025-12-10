import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-white flex">
      {/* Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Content - Offset by sidebar width */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
