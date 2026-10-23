import DoctorSidebar from '@/components/layout/DoctorSidebar';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
