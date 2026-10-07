import Navbar from "./Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FFF8EE] text-[#111111]">
      <Navbar />

      <main className="w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}