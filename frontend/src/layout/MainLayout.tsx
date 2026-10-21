import { Suspense } from "react";
import Navbar from "./Navbar";
import PageLoader from "../components/PageLoader";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FFF8EE] text-[#111111]">
      <Navbar />

      <main className="w-full overflow-x-hidden">
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
    </div>
  );
}