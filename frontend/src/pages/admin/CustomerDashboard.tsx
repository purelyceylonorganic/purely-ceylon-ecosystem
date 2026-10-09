import { useEffect, useState } from "react";
import { customerService } from "../../services/customer.service";

export default function CustomerDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data =
        await customerService.getDashboardStats();

      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-w-0 space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">

      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        Customer Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h3>Total Customers</h3>
          <p className="text-3xl font-bold">
            {stats.totalCustomers}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h3>Active Customers</h3>
          <p className="text-3xl font-bold">
            {stats.activeCustomers}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h3>Total Orders</h3>
          <p className="text-3xl font-bold">
            {stats.totalOrders}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h3>Total Revenue</h3>
          <p className="text-3xl font-bold">
            {stats.totalRevenue}
          </p>
        </div>

      </div>
    </div>
  );
}