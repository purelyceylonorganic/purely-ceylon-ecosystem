interface DeliveryTimelineProps {
  status: string;
}

export default function DeliveryTimeline({ status }: DeliveryTimelineProps) {
  const steps = [
    "ORDER_PLACED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const labels: Record<string, string> = {
    ORDER_PLACED: "Order Placed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out For Delivery",
    DELIVERED: "Delivered",
  };

  // Safe mapping & fallback
  const normalizedStatus = status?.toUpperCase() || "ORDER_PLACED";
  const currentStep = steps.indexOf(normalizedStatus);

  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #eee",
        marginTop: "20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h3 style={{ margin: 0, color: "#0E4B32" }}>🚚 Delivery Timeline</h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
          position: "relative",
        }}
      >
        {/* Progress Line Background */}
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "0",
            right: "0",
            height: "4px",
            background: "#e5e7eb",
            zIndex: 0,
          }}
        />

        {/* Dynamic Green Progress Line */}
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "0",
            height: "4px",
            background: "#22c55e",
            width: `${currentStep >= 0 ? (currentStep / (steps.length - 1)) * 100 : 0}%`,
            zIndex: 1,
            transition: "all 0.5s ease-in-out",
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step}
              style={{
                textAlign: "center",
                zIndex: 2,
                width: "100%",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  margin: "0 auto",
                  borderRadius: "50%",
                  background: isCompleted ? "#22c55e" : "#fff",
                  border: isCompleted ? "none" : "2px solid #d1d5db",
                  color: isCompleted ? "#fff" : "#d1d5db",
                  lineHeight: "28px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  transition: "background 0.3s"
                }}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  color: isCompleted ? "#111827" : "#9ca3af",
                  fontWeight: isCurrent ? "bold" : "500",
                }}
              >
                {labels[step]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}