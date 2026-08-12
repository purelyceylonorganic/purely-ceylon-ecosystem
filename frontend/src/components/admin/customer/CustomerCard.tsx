import type { Customer } from "../../../types/customer.types";

// CustomerCard-க்கான Props
interface CustomerCardProps {
  customer: Customer;
}

// CustomerSummaryCards-க்கான Props
interface CustomerSummaryCardsProps {
  totalOrders: number;
  totalSpent: number;
  totalAddresses: number;
  totalNotes: number;
}

// 1. CustomerCard Component
export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow">
      <h2 className="text-xl font-bold">
        {customer.fullName}
      </h2>

      <p className="mt-2">
        📞 {customer.phone}
      </p>

      <p>
        ✉ {customer.email}
      </p>

      <p>
        Status :
        {customer.isActive ? " Active" : " Inactive"}
      </p>
    </div>
  );
}

// 2. CustomerSummaryCards Component
export function CustomerSummaryCards({
  totalOrders,
  totalSpent,
  totalAddresses,
  totalNotes,
}: CustomerSummaryCardsProps) {
  const cards = [
    {
      title: "Total Orders",
      value: totalOrders,
    },
    {
      title: "Total Spent",
      value: totalSpent,
    },
    {
      title: "Addresses",
      value: totalAddresses,
    },
    {
      title: "Notes",
      value: totalNotes,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border bg-white p-5 shadow"
        >
          <p className="text-sm text-gray-500">
            {card.title}
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {card.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
export default CustomerCard;