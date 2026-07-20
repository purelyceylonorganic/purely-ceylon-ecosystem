import { useEffect, useState, useCallback } from "react";
import { FaCcVisa, FaCcMastercard, FaCreditCard } from "react-icons/fa";
import toast from "react-hot-toast";
import AddCardModal from "../components/payment/AddCardModal";

// Interface-ஐ வரையறுப்பது Professional-ஆக இருக்கும்
interface PaymentCard {
  id: string;
  cardBrand: string;
  cardLast4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

// தனி Component-ஆக மாற்றுவது Code readability-ஐ கூட்டும்
const CardBrandIcon = ({ brand }: { brand: string }) => {
  const brandUpper = brand?.toUpperCase();
  if (brandUpper === "VISA") return <FaCcVisa size={34} className="text-blue-900" />;
  if (brandUpper === "MASTERCARD") return <FaCcMastercard size={34} className="text-orange-600" />;
  return <FaCreditCard size={28} className="text-gray-400" />;
};

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const getHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/payment-methods", {
        headers: getHeaders(),
      });
      const result = await response.json();
      if (result.success) setCards(result.data);
    } catch (error) {
      toast.error("Failed to load cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCard = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/payment-methods/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if ((await response.json()).success) {
        toast.success("Card deleted successfully");
        loadCards();
      }
    } catch {
      toast.error("Failed to delete card");
    }
  };

  const setDefault = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/payment-methods/default/${id}`, {
        method: "PUT",
        headers: getHeaders(),
      });
      if ((await response.json()).success) {
        toast.success("Default card updated");
        loadCards();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💳 Saved Payment Methods</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md"
        >
          + Add New Card
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading your cards...</div>
      ) : (
        <div className="grid gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between hover:border-green-500 transition-colors">
              <div className="flex items-center gap-4">
                <CardBrandIcon brand={card.cardBrand} />
                <div>
                  <div className="font-semibold text-gray-700">**** {card.cardLast4}</div>
                  <div className="text-xs text-gray-400">Expires: {card.expiryMonth}/{card.expiryYear}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {card.isDefault ? (
                  <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">DEFAULT</span>
                ) : (
                  <button onClick={() => setDefault(card.id)} className="text-blue-600 text-sm hover:underline">Set as Default</button>
                )}
                <button onClick={() => deleteCard(card.id)} className="text-red-500 text-sm hover:underline">Delete</button>
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
              No saved payment methods.
            </div>
          )}
        </div>
      )}

      {showModal && <AddCardModal onClose={() => setShowModal(false)} onSaved={loadCards} />}
    </div>
  );
}