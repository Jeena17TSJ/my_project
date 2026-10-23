import PatientSidebar from '@/components/layout/PatientSidebar';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
