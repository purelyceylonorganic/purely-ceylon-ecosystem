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
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Customer Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3>Total Customers</h3>
          <p className="text-3xl font-bold">
            {stats.totalCustomers}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3>Active Customers</h3>
          <p className="text-3xl font-bold">
            {stats.activeCustomers}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3>Total Orders</h3>
          <p className="text-3xl font-bold">
            {stats.totalOrders}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3>Total Revenue</h3>
          <p className="text-3xl font-bold">
            {stats.totalRevenue}
          </p>
        </div>

      </div>
    </div>
  );
}