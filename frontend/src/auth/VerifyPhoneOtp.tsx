import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

export default function VerifyPhoneOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone = location.state?.phone || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    if (!phone) {
      setError("Phone number not found. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await authService.verifyPhoneOtp(
        phone,
        otp
      );

      console.log("Phone OTP Response:", response);

      setMessage(
        response.message ||
          "Phone number verified successfully."
      );

      // Registration completed
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error: any) {
      console.error(
        "Phone OTP Verification Error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!phone) {
      setError(
        "Phone number not found. Please register again."
      );
      return;
    }

    try {
      setResending(true);
      setError("");
      setMessage("");

      const response =
        await authService.resendPhoneOtp(phone);

      setMessage(
        response.message ||
          "OTP sent successfully."
      );

    } catch (error: any) {
      console.error(
        "Resend Phone OTP Error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to resend OTP."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#fff",
          padding: "40px",
          borderRadius: "18px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.10)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#0E4B32",
            marginBottom: "10px",
          }}
        >
          Verify Phone Number
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "25px",
          }}
        >
          We sent a 6-digit OTP to
        </p>

        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#0E4B32",
            marginBottom: "25px",
          }}
        >
          {phone}
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Enter OTP
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(/\D/g, "")
              )
            }
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              fontSize: "22px",
              textAlign: "center",
              letterSpacing: "8px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              background: "#0E4B32",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Verifying..."
              : "Verify Phone"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "13px",
            background: "#fff",
            color: "#0E4B32",
            border: "1px solid #0E4B32",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: resending
              ? "not-allowed"
              : "pointer",
          }}
        >
          {resending
            ? "Sending..."
            : "Resend OTP"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "13px",
            color: "#777",
          }}
        >
          OTP expires after a few minutes.
        </p>
      </div>
    </div>
  );
}