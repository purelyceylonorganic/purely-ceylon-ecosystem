import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { authService } from "../services/auth.service";

export default function VerifyPhonePasswordResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone = location.state?.phone;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!phone) {
      setError(
        "Phone number is missing. Please start again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await authService.verifyPhonePasswordResetOtp(
          phone,
          otp
        );

      const resetToken =
        response.resetToken;

      if (!resetToken) {
        setError(
          "Reset token was not received."
        );
        return;
      }

      navigate(
        "/reset-phone-password",
        {
          state: {
            phone,
            resetToken,
          },
        }
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#fff",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 15px 40px rgba(0,0,0,.12)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#0E4B32",
            fontSize: "30px",
            fontWeight: "bold",
          }}
        >
          Verify OTP
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            marginTop: "10px",
          }}
        >
          Enter the 6-digit OTP sent to
        </p>

        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginTop: "5px",
          }}
        >
          {phone}
        </p>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleVerify}
          style={{ marginTop: "30px" }}
        >
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(/\D/g, "")
              )
            }
            placeholder="Enter 6-digit OTP"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              fontSize: "22px",
              textAlign: "center",
              letterSpacing: "8px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "25px",
              padding: "15px",
              background: "#0E4B32",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}