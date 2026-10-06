import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  const menu = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      name: "Products",
      path: "/admin/products",
    },
    {
      name: "Orders",
      path: "/admin/orders",
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
    },
    {
      name: "Customers",
      path: "/admin/customers",
    },
    {
      name: "Finance",
      path: "/admin/finance",
    },
    {
      name: "Newsletter",
      path: "/admin/newsletter",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r p-4">
          <h2 className="mb-6 text-xl font-bold">
            Purely Ceylon Admin
          </h2>

          <nav className="space-y-2">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg ${
                    isActive
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}