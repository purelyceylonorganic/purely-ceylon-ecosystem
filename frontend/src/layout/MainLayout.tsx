import Navbar from "./Navbar";

export default function MainLayout({ children }: any) {
  return (
    <div className="min-h-screen bg-[#FFF8EE]">

      {/* NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="flex justify-center items-center min-h-[80vh]">
        {children}
      </main>

    </div>
  );
}