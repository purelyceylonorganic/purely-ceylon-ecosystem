interface OrderTimelineProps {
  status: string;
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  // 1. உங்களது பேக்கெண்ட்/டேட்டாபேஸ் நிலைகளின் வரிசை
  const steps = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
  ];

  // 2. பேக்கெண்ட் ஸ்டேட்டஸ்களை நார்மலைஸ் செய்ய (எ.கா: PENDING வந்தால் PLACED ஆகக் காட்டும்)
  const statusMap: Record<string, string> = {
    PENDING: "PLACED",
    PLACED: "PLACED",
    CONFIRMED: "CONFIRMED",
    PROCESSING: "PROCESSING",
    PACKED: "PACKED",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
  };

  // 3. பயனர்களுக்குக் காட்ட விரும்பும் எளிமையான தமிழ்/ஆங்கிலப் பெயர்கள்
  const labels: Record<string, string> = {
    PLACED: "Order Placed",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    PACKED: "Packed & Ready",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
  };

  const normalizedStatus = statusMap[status?.toUpperCase()] || "PLACED";
  const currentIdx = steps.indexOf(normalizedStatus);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        marginTop: "20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h3 style={{ marginBottom: "25px", color: "#0E4B32", margin: "0 0 25px 0" }}>
        📦 Order Tracking Timeline
      </h3>

      {steps.map((step, idx) => {
        const completed = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "15px",
              position: "relative",
              paddingBottom: idx !== steps.length - 1 ? "25px" : "0",
            }}
          >
            {/* Vertical Progress Line */}
            {idx !== steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "24px",
                  width: "2px",
                  height: "100%",
                  background: idx < currentIdx ? "#22c55e" : "#e5e7eb",
                  zIndex: 1,
                }}
              />
            )}

            {/* Status Circle indicator */}
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: completed ? "#22c55e" : "#fff",
                border: completed ? "none" : "2px solid #d1d5db",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
                flexShrink: 0,
                zIndex: 2,
              }}
            >
              {completed ? "✓" : ""}
            </div>

            {/* Status Text Info */}
            <div style={{ transform: "translateY(2px)" }}>
              <div
                style={{
                  fontWeight: isCurrent ? "bold" : 500,
                  color: completed ? "#111827" : "#9ca3af",
                  fontSize: "15px",
                }}
              >
                {labels[step]}
              </div>

              {isCurrent && (
                <div
                  style={{
                    color: "#d97706",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginTop: "2px",
                    background: "#fef3c7",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    display: "inline-block"
                  }}
                >
                  Current Status
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}