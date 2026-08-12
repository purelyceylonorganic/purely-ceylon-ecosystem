import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authService } from "../services/auth.service";

export default function PhoneRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    // =========================
    // Basic validation
    // =========================

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
  await authService.registerWithPhone(
    fullName.trim(),
    phone.trim(),
    password
  );

console.log(
  "PHONE REGISTER RESPONSE:",
  response
);

console.log(
  "NAVIGATING TO PHONE OTP:",
  phone.trim()
);

navigate("/verify-phone-otp", {
  replace: true,
  state: {
    phone: phone.trim(),
  },
});

    } catch (err: any) {
      console.error(
        "Phone Registration Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Phone registration failed."
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
        background: "#f7f8f6",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "45px",
          boxShadow:
            "0 15px 40px rgba(0,0,0,.12)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#0E4B32",
            fontSize: "38px",
            marginBottom: "10px",
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            marginBottom: "30px",
          }}
        >
          Register with your phone number 📱
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>

          {/* Full Name */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                fontWeight: "600",
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              placeholder="Enter your full name"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginTop: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Phone */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                fontWeight: "600",
              }}
            >
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="0767686670"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginTop: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />

            <p
              style={{
                fontSize: "12px",
                color: "#777",
                marginTop: "6px",
              }}
            >
              You will receive a verification OTP
              by SMS.
            </p>
          </div>

          {/* Password */}
          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <label
              style={{
                fontWeight: "600",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 8 characters"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginTop: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Register */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: "#0E4B32",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Creating..."
              : "Register with Phone"}
          </button>
        </form>

        {/* Email Registration */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#666",
          }}
        >
          Want to register with Email?{" "}

          <Link
            to="/register"
            style={{
              color: "#0E4B32",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Email Registration
          </Link>
        </p>

        {/* Login */}
        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#666",
          }}
        >
          Already have an account?{" "}

          <Link
            to="/login"
            style={{
              color: "#D4A017",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}