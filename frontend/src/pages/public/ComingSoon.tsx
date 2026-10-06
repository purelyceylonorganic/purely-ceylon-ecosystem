import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock3, Globe2, Leaf, ShoppingBag } from "lucide-react";

interface ComingSoonProps {
  type: "b2b" | "export" | "traceability";
}

const pageData = {
  b2b: {
    icon: ShoppingBag,
    title: "B2B Marketplace",
    description:
      "Our B2B marketplace is currently under development. Soon you will be able to manage RFQs, quotations, bulk orders, payments and more.",
  },

  export: {
    icon: Globe2,
    title: "Export Management",
    description:
      "Our export management features are currently under development. Export documentation, invoices, shipments and international trade tools will be available soon.",
  },

  traceability: {
    icon: Leaf,
    title: "Product Traceability",
    description:
      "Our product traceability system is currently under development. Soon you will be able to trace products from farm to final shipment.",
  },
};

export default function ComingSoon({ type }: ComingSoonProps) {
  const navigate = useNavigate();

  const data = pageData[type];
  const Icon = data.icon;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#f8faf9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          textAlign: "center",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "60px 40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "90px",
            height: "90px",
            margin: "0 auto 25px",
            borderRadius: "50%",
            background: "#eef6f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={42} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "15px",
            color: "#1f2937",
          }}
        >
          {data.title}
        </h1>

        {/* Coming Soon Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "999px",
            background: "#fef3c7",
            color: "#92400e",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "25px",
          }}
        >
          <Clock3 size={16} />
          Coming Soon
        </div>

        {/* Description */}
        <p
          style={{
            maxWidth: "560px",
            margin: "0 auto 35px",
            color: "#6b7280",
            fontSize: "16px",
            lineHeight: 1.7,
          }}
        >
          {data.description}
        </p>

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            borderRadius: "10px",
            padding: "12px 22px",
            background: "#1f2937",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>
      </div>
    </div>
  );
}