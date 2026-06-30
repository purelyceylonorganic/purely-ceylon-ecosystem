import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orderService } from "../../services/order.service";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  async function loadOrder(orderId: string) {
    try {
      const response = await orderService.getOrder(orderId);
      setOrder(response.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading Order...</h2>;
  }

  if (!order) {
    return <h2 style={{ textAlign: "center" }}>Order Not Found</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
      }}
    >
      <h1>Order Details</h1>

      <hr />

      <p>
        <strong>Order ID :</strong> {order.id}
      </p>

      <p>
        <strong>Status :</strong> {order.status}
      </p>

      <p>
        <strong>Payment :</strong> {order.paymentStatus}
      </p>

      <p>
        <strong>Total :</strong> USD {order.totalFinal}
      </p>

      <hr />

      <h2>Products</h2>

      {order.items.map((item: any) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 15,
            borderRadius: 8,
          }}
        >
          <p>SKU : {item.productVariant.sku}</p>

          <p>Weight : {item.productVariant.weight}</p>

          <p>Price : USD {item.price}</p>

          <p>Quantity : {item.quantity}</p>

          <p>Total : USD {item.price * item.quantity}</p>
        </div>
      ))}
    </div>
  );
}