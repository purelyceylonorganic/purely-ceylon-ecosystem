import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import { cartService } from "../../services/cart.service";
import { addressService } from "../../services/address.service";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [orderRes, cartRes, addressRes] = await Promise.all([
        orderService.getMyOrders(),
        cartService.getCart(),
        addressService.getAddresses(),
      ]);

      setOrders(orderRes.orders || []);
      setCart(cartRes);
      setAddresses(addressRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>Customer Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
          marginTop: 30,
        }}
      >
        <div style={card}>
          <h2>{orders.length}</h2>
          <p>My Orders</p>
        </div>

        <div style={card}>
          <h2>{cart?.items?.length || 0}</h2>
          <p>Cart Items</p>
        </div>

        <div style={card}>
          <h2>{addresses.length}</h2>
          <p>Addresses</p>
        </div>

        <div style={card}>
          <h2>
            USD {cart?.totalConverted || 0}
          </h2>
          <p>Cart Value</p>
        </div>
      </div>
    </div>
  );
}

const card = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 25,
  textAlign: "center" as const,
  background: "#fff",
};