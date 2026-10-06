import React from "react";

const WhatsAppButton: React.FC = () => {
  const phoneNumber = "94768989027";

  const message = encodeURIComponent(
    "Hello Purely Ceylon Organic, I would like to know more about your products."
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Purely Ceylon Organic on WhatsApp"
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      {/* Tooltip */}
      <div
        style={{
          background: "#1f2937",
          color: "#ffffff",
          padding: "10px 14px",
          borderRadius: "10px",
          fontSize: "13px",
          fontWeight: 600,
          lineHeight: "1.3",
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          whiteSpace: "nowrap",
          opacity: 0,
          transform: "translateX(8px)",
          transition: "all 0.25s ease",
          pointerEvents: "none",
        }}
        className="whatsapp-tooltip"
      >
        Chat with us
        <br />
        on WhatsApp!
      </div>

      {/* WhatsApp Button */}
      <div
        style={{
          width: "62px",
          height: "62px",
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 6px 20px rgba(0, 0, 0, 0.22)",
          border: "3px solid #ffffff",
          transition:
            "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        className="whatsapp-circle"
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.54 0 .24 5.3.24 11.82c0 2.08.54 4.11 1.57 5.9L.14 24l6.43-1.64a11.77 11.77 0 0 0 5.49 1.4h.01c6.52 0 11.82-5.3 11.82-11.82 0-3.16-1.23-6.13-3.37-8.46ZM12.07 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.82.98 1.02-3.72-.23-.38a9.78 9.78 0 0 1-1.5-5.28c0-5.42 4.42-9.83 9.85-9.83 2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.88 6.97c0 5.43-4.42 9.85-9.84 9.85Zm5.4-7.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Hover CSS */}
      <style>
        {`
          a:hover .whatsapp-circle {
            transform: scale(1.08);
            box-shadow: 0 8px 28px rgba(37, 211, 102, 0.45);
          }

          a:hover .whatsapp-tooltip {
            opacity: 1 !important;
            transform: translateX(0) !important;
          }

          @media (max-width: 640px) {
            a[aria-label="Chat with Purely Ceylon Organic on WhatsApp"] {
              right: 16px !important;
              bottom: 16px !important;
            }

            .whatsapp-circle {
              width: 56px !important;
              height: 56px !important;
            }

            .whatsapp-circle svg {
              width: 30px !important;
              height: 30px !important;
            }

            .whatsapp-tooltip {
              display: none !important;
            }
          }
        `}
      </style>
    </a>
  );
};

export default WhatsAppButton;