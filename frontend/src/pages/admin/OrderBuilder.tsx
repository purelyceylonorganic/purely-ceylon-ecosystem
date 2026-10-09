import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../../services/order.service";
import ProductSearch from "../../components/admin/order/ProductSearch";

export default function OrderBuilder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  const addProduct = async (variantId: string) => {
    if (!order) return;

    try {
      await orderService.addProduct(
        order.id,
        variantId,
        1
      );

      const updated = await orderService.getOrderDetails(order.id);
      setOrder(updated);
    } catch (error) {
      console.error(error);
      alert("Unable to add product");
    }
  };

  // அளவை (Quantity) அதிகரிக்க அல்லது குறைக்கப் பயன்படும் செயல்பாடு (Handler)
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!order) return;

    if (newQuantity < 1) return;

    try {
      await orderService.updateOrderItemQuantity(itemId, newQuantity);
      const updated = await orderService.getOrderDetails(order.id);
      setOrder(updated);
    } catch (error) {
      console.error(error);
      alert("Unable to update quantity");
    }
  };

  // பொருளை ஆர்டரிலிருந்து நீக்கப் பயன்படும் செயல்பாடு (Remove Product Handler)
  const removeProduct = async (orderItemId: string) => {
    try {
      await orderService.removeProduct(orderItemId);

      const updated = await orderService.getOrderDetails(order.id);
      setOrder(updated);
    } catch (error) {
      console.error(error);
      alert("Unable to remove product");
    }
  };

  // ஆர்டரை உறுதிப்படுத்தும் செயல்பாடு (Confirm Order Handler)
  const confirmOrder = async () => {
  if (!order) return;

  if (!order.items || order.items.length === 0) {
    alert("Please add at least one product.");
    return;
  }

  try {
    await orderService.confirmOrder(order.id);

    alert("Order Confirmed Successfully");

    // Confirm ஆனதும் நேரடியாக Customer Search
    navigate("/admin/customers", {
      replace: true,
    });

  } catch (error) {
    console.error("Confirm Order Error:", error);
    alert("Unable to confirm order");
  }
};

  const loadOrder = async () => {
    try {
      if (!orderId) return;
      const data = await orderService.getOrderDetails(orderId);
      setOrder(data);
    } catch {
      alert("Unable to load order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!order) {
    return <div className="p-8">Order not found</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:p-8">
      <h1 className="break-words text-2xl font-bold sm:text-3xl">
        Order Builder
      </h1>

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <p>
          <strong>Order ID :</strong> {order.id}
        </p>
        <p>
          <strong>Status :</strong> {order.status}
        </p>
        <p>
          <strong>Payment :</strong> {order.paymentStatus}
        </p>
      </div>

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-xl font-bold">
          Customer
        </h2>
        <p>{order.user.fullName}</p>
        <p>{order.user.phone}</p>
        <p>{order.user.email}</p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">
          Shipping Address
        </h2>
        <p>{order.address?.fullName}</p>
        <p>{order.address?.phone}</p>
        <p>{order.address?.street}</p>
        <p>{order.address?.city}</p>
        <p>{order.address?.province}</p>
        <p>{order.address?.postalCode}</p>
        <p>{order.address?.country}</p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow space-y-4">
        <h2 className="text-xl font-bold">
          Products
        </h2>

        {/* Product Search Component */}
        <div className="w-full min-w-0 overflow-x-auto">
          <ProductSearch onSelect={addProduct} />
        </div>

        {
          order.items.length === 0 ? (
            <p>No Products Added</p>
          ) : (
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left pb-3">Product</th>
                  <th className="text-left pb-3">Weight</th>
                  <th className="text-left pb-3">Qty</th>
                  <th className="text-left pb-3">Price</th>
                  <th className="text-left pb-3">Total</th>
                  <th className="text-left pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  order.items.map((item: any) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-3">{item.productVariant.product.name}</td>
                      <td className="py-3">{item.productVariant.weight}</td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3">{item.price}</td>
                      <td className="py-3">{item.lineTotal}</td>
                      <td className="py-3">
                        <button
                          onClick={() => removeProduct(item.id)}
                          className="rounded bg-red-600 px-3 py-2 text-white text-sm font-medium hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )
        }
      </div>

      <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-2xl font-bold">
            Total
          </h2>
          <h2 className="break-words text-3xl font-bold sm:text-4xl">
            {order.currency} {order.totalFinal}
          </h2>
        </div>

        {/* Confirm Order Button */}
        <button
          onClick={confirmOrder}
          className="w-full rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800 sm:w-auto"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
}