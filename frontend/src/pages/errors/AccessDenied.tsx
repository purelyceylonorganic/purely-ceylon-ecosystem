import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "50px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontSize: "70px" }}>🔒</div>

        <h1
          style={{
            fontSize: "42px",
            color: "#d32f2f",
            marginTop: "20px",
          }}
        >
          403
        </h1>

        <h2
          style={{
            color: "#333",
            marginTop: "10px",
          }}
        >
          Access Denied
        </h2>

        <p
          style={{
            color: "#666",
            marginTop: "15px",
            lineHeight: "1.7",
          }}
        >
          You don't have permission to access this page.
        </p>

        <div
          style={{
            marginTop: "35px",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >
          <Link
            to="/"
            style={{
              padding: "12px 24px",
              background: "#0E4B32",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            Go Home
          </Link>

          <Link
            to="/dashboard"
            style={{
              padding: "12px 24px",
              background: "#D4A017",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}