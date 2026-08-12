import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { authService } from "../services/auth.service";

export default function ResetPhonePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const phone = location.state?.phone;
  const resetToken =
    location.state?.resetToken;

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReset(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!phone || !resetToken) {
      setError(
        "Reset session is invalid. Please start again."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await authService.resetPasswordWithPhone(
        phone,
        resetToken,
        newPassword
      );

      alert(
        "✅ Password reset successfully. Please login."
      );

      navigate("/login");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Password reset failed."
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
          Create New Password
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            marginTop: "10px",
          }}
        >
          Enter your new password
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
          onSubmit={handleReset}
          style={{ marginTop: "30px" }}
        >
          <label>New Password</label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            placeholder="New password"
            style={{
              width: "100%",
              padding: "15px",
              marginTop: "8px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          />

          <label
            style={{
              display: "block",
              marginTop: "20px",
            }}
          >
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            placeholder="Confirm password"
            style={{
              width: "100%",
              padding: "15px",
              marginTop: "8px",
              borderRadius: "10px",
              border: "1px solid #ddd",
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
              ? "Updating..."
              : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}