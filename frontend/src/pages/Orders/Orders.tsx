import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import { Link } from "react-router-dom";
export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading Orders...</h2>;
  }

  if (orders.length === 0) {
    return <h2 style={{ textAlign: "center" }}>No Orders Found</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
      }}
    >
      <h1>My Orders</h1>

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
        >
          <h3>Order ID : {order.id}</h3>

<Link
  to={`/orders/${order.id}`}
  style={{
    color: "#0E4B32",
    fontWeight: "bold",
  }}
>
  View Details →
</Link>


          <p>Status : {order.status}</p>

          <p>Payment : {order.paymentStatus}</p>

          <p>Total : USD {order.totalFinal}</p>

          <p>Items : {order.items.length}</p>
        </div>
      ))}
    </div>
  );
}