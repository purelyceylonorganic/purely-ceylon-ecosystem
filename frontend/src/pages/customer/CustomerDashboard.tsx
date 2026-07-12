import { useEffect, useState } from "react";

export default function CustomerDashboard() {

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          "http://localhost:5000/api/v1/customer/dashboard",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const result =
        await response.json();

      if(result.success){
        setStats(result.data);
      }

    } catch(error){
      console.error(error);
    }

  };

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        👤 Customer Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded shadow">
          <h3>Total Orders</h3>
          <p className="text-3xl font-bold">
            {stats?.orders || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h3>Active Orders</h3>
          <p className="text-3xl font-bold">
            {stats?.activeOrders || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h3>Wishlist</h3>
          <p className="text-3xl font-bold">
            {stats?.wishlist || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h3>Total Spent</h3>
          <p className="text-3xl font-bold">
            USD {stats?.spent || 0}
          </p>
        </div>

      </div>

    </div>

  );
}