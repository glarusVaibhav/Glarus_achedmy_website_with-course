import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: "Admin Dashboard | EduAI Platform",
  description: "Advanced AI-powered admin dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text flex">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen">
        <main className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
