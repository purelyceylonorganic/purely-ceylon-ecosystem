import { placeOrder } from "../services/orderService";

export default function Checkout() {
  const handleOrder = async () => {
    const orderData = {
      productId: "123",
      quantity: 2,
      address: "Matara",
    };

    await placeOrder(orderData);
  };

  return (
    <button
      onClick={handleOrder}
      className="bg-green-500 text-white px-4 py-2"
    >
      Place Order
    </button>
  );
}