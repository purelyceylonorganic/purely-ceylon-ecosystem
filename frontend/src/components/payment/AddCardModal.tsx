import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function AddCardModal({ onClose, onSaved }: Props) {
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [brand, setBrand] = useState("VISA");

  async function saveCard() {
    // Basic validation
    if (cardLast4.length !== 4 || cvc.length < 3) {
      toast.error("Please enter valid card details");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardHolderName,
          cardLast4,
          brand,
          expiryMonth,
          expiryYear,
          cvc, // நிஜமான சர்வரில் இதை பாதுகாப்பாக கையாளவும்
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Card Added Successfully");
        onSaved();
        onClose();
      } else {
        toast.error(data.message || "Failed to add card");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Payment Method</h2>

        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Card Holder Name"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
          />

          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Last 4 Digits"
            maxLength={4}
            value={cardLast4}
            onChange={(e) => setCardLast4(e.target.value)}
          />

          <div className="flex gap-4">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="MM"
              maxLength={2}
              value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value)}
            />
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="YY"
              maxLength={2}
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value)}
            />
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="CVC"
              maxLength={3}
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
            />
          </div>

          <select
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none bg-white"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="VISA">Visa</option>
            <option value="MASTERCARD">MasterCard</option>
          </select>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50">Cancel</button>
          <button onClick={saveCard} className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">Save Card</button>
        </div>
      </div>
    </div>
  );
}