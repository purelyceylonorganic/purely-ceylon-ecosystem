import Navbar from "./Navbar";

export default function Layout({ children }: any) {
  return (
    <div>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}