import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCreditCard,
} from "react-icons/fa";
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import AddCardModal from "../components/payment/AddCardModal";

interface PaymentCard {
  id: string;
  cardBrand: string;
  cardLast4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

const CardBrandIcon = ({ brand }: { brand: string }) => {
  const brandUpper = brand?.toUpperCase();

  if (brandUpper === "VISA") {
    return (
      <FaCcVisa
        size={38}
        className="text-blue-900"
      />
    );
  }

  if (brandUpper === "MASTERCARD") {
    return (
      <FaCcMastercard
        size={38}
        className="text-orange-600"
      />
    );
  }

  return (
    <FaCreditCard
      size={32}
      className="text-gray-400"
    />
  );
};

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);


  const loadCards = useCallback(async () => {
  setIsLoading(true);

  try {
    const response = await api.get(
      "/payment-methods"
    );

    const result = response.data;

    if (result.success) {
      setCards(result.data || []);
    } else {
      toast.error(
        result.message ||
          "Failed to load cards"
      );
    }
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to load cards"
    );
  } finally {
    setIsLoading(false);
  }
}, []);

  const deleteCard = async (id: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this card?"
  );

  if (!confirmed) return;

  try {
    const response = await api.delete(
      `/payment-methods/${id}`
    );

    const result = response.data;

    if (result.success) {
      toast.success(
        "Card deleted successfully"
      );

      await loadCards();
    } else {
      toast.error(
        result.message ||
          "Failed to delete card"
      );
    }
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to delete card"
    );
  }
};

  const setDefault = async (id: string) => {
  try {
    const response = await api.put(
      `/payment-methods/default/${id}`
    );

    const result = response.data;

    if (result.success) {
      toast.success(
        "Default card updated"
      );

      await loadCards();
    } else {
      toast.error(
        result.message ||
          "Update failed"
      );
    }
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
        "Update failed"
    );
  }
};

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-[#FFF8EE] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E4B32] text-white shadow-sm">
                <CreditCard size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Payment Methods
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your saved payment cards securely.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#111111] active:scale-[0.98] sm:w-auto"
          >
            <Plus size={18} />
            Add New Card
          </button>
        </div>

        {/* Security Notice */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0 text-[#0E4B32]"
          />

          <div>
            <p className="text-sm font-bold text-[#0E4B32]">
              Secure Payment Information
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
              Your saved card details are protected and only the last four digits are displayed.
            </p>
          </div>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <CreditCard
                size={30}
                className="text-gray-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-gray-800">
              No Saved Payment Methods
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add a card for faster checkout in the future.
            </p>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white"
            >
              <Plus size={17} />
              Add Card
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-16 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                      <CardBrandIcon brand={card.cardBrand} />
                    </div>

                    <div>
                      <p className="font-bold text-gray-800">
                        •••• {card.cardLast4}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Expires:{" "}
                        {card.expiryMonth}/{card.expiryYear}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                    {card.isDefault ? (
                      <span className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700">
                        <Star size={14} className="fill-current" />
                        DEFAULT
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDefault(card.id)}
                        className="min-h-[42px] rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                      >
                        Set as Default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteCard(card.id)}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <AddCardModal
            onClose={() => setShowModal(false)}
            onSaved={loadCards}
          />
        )}
      </div>
    </div>
  );
}