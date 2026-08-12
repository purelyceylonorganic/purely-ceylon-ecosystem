import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authService } from "../services/auth.service";

type RegistrationMode = "email" | "phone";

export default function Register() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<RegistrationMode>("email");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    // ============================
    // COMMON VALIDATION
    // ============================

    if (!fullName.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      // ==================================================
      // EMAIL REGISTRATION
      // ==================================================

      if (mode === "email") {
        if (!email.trim()) {
          setError("Email address is required.");
          return;
        }

        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
          setError("Please enter a valid email address.");
          return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        await authService.register(
          fullName.trim(),
          normalizedEmail,
          password
        );

        // Email OTP verification
        navigate("/verify-otp", {
          state: {
            email: normalizedEmail,
          },
        });

        return;
      }

      // ==================================================
      // PHONE REGISTRATION
      // ==================================================

      if (mode === "phone") {
        if (!phone.trim()) {
          setError("Phone number is required.");
          return;
        }

        // Sri Lankan phone validation
        const cleanedPhone = phone
          .trim()
          .replace(/\s+/g, "");

        const phoneRegex =
          /^(?:0|94|\+94)(7\d{8})$/;

        if (!phoneRegex.test(cleanedPhone)) {
          setError(
            "Please enter a valid Sri Lankan phone number."
          );
          return;
        }

        // Convert to 947XXXXXXXX
        let normalizedPhone = cleanedPhone;

        if (normalizedPhone.startsWith("+94")) {
          normalizedPhone =
            normalizedPhone.substring(1);
        } else if (normalizedPhone.startsWith("0")) {
          normalizedPhone =
            "94" + normalizedPhone.substring(1);
        }

        await authService.registerWithPhone(
          fullName.trim(),
          normalizedPhone,
          password
        );

        // Phone OTP verification
        navigate("/verify-phone-otp", {
          state: {
            phone: normalizedPhone,
          },
        });

        return;
      }
    } catch (err: any) {
      console.error("Registration Error:", err);

      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff9f0",
        padding: "40px 20px",
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
        {/* ============================
            HEADER
        ============================ */}

        <h1
          style={{
            textAlign: "center",
            color: "#0E4B32",
            fontSize: "36px",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            marginBottom: "25px",
          }}
        >
          Join Purely Ceylon 🌿
        </p>

        {/* ============================
            EMAIL / PHONE TOGGLE
        ============================ */}

        <div
          style={{
            display: "flex",
            background: "#f1f1f1",
            borderRadius: "10px",
            padding: "4px",
            marginBottom: "25px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("email");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background:
                mode === "email"
                  ? "#0E4B32"
                  : "transparent",
              color:
                mode === "email"
                  ? "#ffffff"
                  : "#555",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Email
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("phone");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background:
                mode === "phone"
                  ? "#0E4B32"
                  : "transparent",
              color:
                mode === "phone"
                  ? "#ffffff"
                  : "#555",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Phone
          </button>
        </div>

        {/* ============================
            ERROR
        ============================ */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* ============================
            FORM
        ============================ */}

        <form onSubmit={handleRegister}>
          {/* Full Name */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "7px",
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
              placeholder="Full Name"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "15px",
              }}
            />
          </div>

          {/* ============================
              EMAIL FIELD
          ============================ */}

          {mode === "email" && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  fontSize: "14px",
                  marginBottom: "7px",
                }}
              >
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Email address"
                disabled={loading}
                autoComplete="email"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  fontSize: "15px",
                }}
              />

              <p
                style={{
                  fontSize: "12px",
                  color: "#777",
                  marginTop: "6px",
                }}
              >
                We'll send a verification OTP to your
                email.
              </p>
            </div>
          )}

          {/* ============================
              PHONE FIELD
          ============================ */}

          {mode === "phone" && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  fontSize: "14px",
                  marginBottom: "7px",
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
                placeholder="0771234567"
                disabled={loading}
                autoComplete="tel"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  fontSize: "15px",
                }}
              />

              <p
                style={{
                  fontSize: "12px",
                  color: "#777",
                  marginTop: "6px",
                }}
              >
                We'll send a 6-digit OTP by SMS.
              </p>
            </div>
          )}

          {/* Password */}

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "7px",
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
              placeholder="Password"
              disabled={loading}
              autoComplete="new-password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "15px",
              }}
            />

            <p
              style={{
                fontSize: "12px",
                color: "#777",
                marginTop: "6px",
              }}
            >
              Minimum 8 characters.
            </p>
          </div>

          {/* ============================
              REGISTER BUTTON
          ============================ */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading
                ? "#999"
                : "#0E4B32",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "17px",
              fontWeight: "700",
            }}
          >
            {loading
              ? "Creating Account..."
              : mode === "email"
              ? "Register with Email"
              : "Register with Phone"}
          </button>
        </form>

        {/* ============================
            LOGIN
        ============================ */}

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#D4A017",
              fontWeight: "700",
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