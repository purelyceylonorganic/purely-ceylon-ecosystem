import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
  Users,
  Wallet,
  Mail,
  ChevronRight,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

const menu = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Inventory",
    path: "/admin/inventory",
    icon: Warehouse,
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    name: "Finance",
    path: "/admin/finance",
    icon: Wallet,
  },
  {
    name: "Newsletter",
    path: "/admin/newsletter",
    icon: Mail,
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const location = useLocation();
 
  useEffect(() => {
  setSidebarOpen(false);
}, [location.pathname]);

useEffect(() => {
  if (!sidebarOpen) return;

  const previousOverflow = document.body.style.overflow;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setSidebarOpen(false);
    }
  };

  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.overflow = previousOverflow;
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [sidebarOpen]);


  const currentMenu = [...menu]
  .sort((a, b) => b.path.length - a.path.length)
  .find(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FFF8EE]">

      {/* =====================================
          MOBILE TOP BAR
      ===================================== */}

      <header className="sticky top-0 z-40 flex min-h-[64px] items-center justify-between border-b border-[#D4AF37]/20 bg-[#0E4B32] px-4 text-white shadow-md lg:hidden">
        <button
          type="button"
          onClick={() =>
            setSidebarOpen(true)
          }
          className="flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-white/10"
          aria-label="Open admin menu"
        >
          <Menu size={23} />
        </button>

        <div className="text-center">
          <p className="text-sm font-extrabold tracking-wide">
            Purely <span className="text-[#D4AF37]">Ceylon</span> Organic (Pvt) Ltd
          </p>

          <p className="text-[9px] uppercase tracking-[0.18em] text-green-100">
            Admin Portal
          </p>
        </div>

        <div className="h-11 w-11" />
      </header>

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <div className="flex min-h-[calc(100vh-64px)] lg:min-h-screen">

        {/* =====================================
            SIDEBAR
        ===================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[#D4AF37]/20 bg-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:w-64 lg:translate-x-0 lg:shadow-none ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >

          {/* Sidebar Header */}
          <div className="flex min-h-[76px] items-center justify-between border-b border-gray-100 px-5">
            <div>
              <h2 className="text-lg font-extrabold text-[#0E4B32]">
                Purely <span className="text-[#D4AF37]">Ceylon</span>
              </h2>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                Admin Portal
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 lg:hidden"
              aria-label="Close admin menu"
            >
              <X size={21} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-400">
              Administration
            </p>

            <div className="space-y-1.5">
              {menu.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() =>
                      setSidebarOpen(false)
                    }
                    className={({ isActive }) =>
                      `group flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                        isActive
                          ? "bg-[#0E4B32] text-white shadow-sm"
                          : "text-gray-600 hover:bg-[#FFF8EE] hover:text-[#0E4B32]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={19}
                          className={
                            isActive
                              ? "text-[#D4AF37]"
                              : "text-gray-400 group-hover:text-[#0E4B32]"
                          }
                        />

                        <span className="flex-1">
                          {item.name}
                        </span>

                        <ChevronRight
                          size={15}
                          className={
                            isActive
                              ? "text-[#D4AF37]"
                              : "text-gray-300"
                          }
                        />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-100 p-4">
            <div className="rounded-2xl bg-[#FFF8EE] p-4">
              <p className="text-xs font-bold text-[#0E4B32]">
                PCO Admin
              </p>

              <p className="mt-1 text-[11px] leading-5 text-gray-500">
                Purely Ceylon Organic
                <br />
                Management Portal
              </p>
            </div>
          </div>
        </aside>

        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <main className="min-w-0 flex-1 overflow-x-hidden">

          {/* Desktop Page Header */}
          <div className="hidden border-b border-gray-100 bg-white px-6 py-5 lg:block">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  Admin Portal
                </p>

                <h1 className="mt-1 text-2xl font-extrabold text-[#0E4B32]">
                  {currentMenu?.name ||
                    "Administration"}
                </h1>
              </div>

              <div className="rounded-full border border-[#D4AF37]/30 bg-[#FFF8EE] px-4 py-2 text-xs font-bold text-[#0E4B32]">
                Enterprise Management
              </div>
            </div>
          </div>

          {/* Mobile Page Title */}
          <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6 lg:hidden">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
              Admin Portal
            </p>

            <h1 className="mt-1 text-xl font-extrabold text-[#0E4B32]">
              {currentMenu?.name ||
                "Administration"}
            </h1>
          </div>

          {/* Page */}
          <div className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}