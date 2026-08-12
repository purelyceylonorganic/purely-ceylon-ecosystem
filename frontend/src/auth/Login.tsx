import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Email OR Phone
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  if (!identifier.trim() || !password) {
    alert("Please enter your Email/Phone and Password");
    return;
  }

  try {
    setLoading(true);

    // ✅ Email OR Phone + Password
    const response = await authService.login(
      identifier.trim(),
      password
    );

    console.log("Login Response:", response);

    // ==========================================
    // ✅ SAVE JWT TOKEN
    // ==========================================

    login(response.token);

    console.log(
      "Saved Token:",
      localStorage.getItem("token")
    );

    // ==========================================
    // 🔐 FORCE PASSWORD CHANGE
    // ==========================================

    if (
      response.user?.mustChangePassword === true
    ) {
      navigate("/change-password", {
        replace: true,
      });

      return;
    }

    // ==========================================
    // ✅ NORMAL LOGIN
    // ==========================================

    alert("✅ Login Successful");

    const role = response.user.role;

    if (
      role === "SUPER_ADMIN" ||
      role === "ADMIN"
    ) {
      navigate("/admin/dashboard", {
        replace: true,
      });
    } else {
      navigate("/products", {
        replace: true,
      });
    }

  } catch (error: any) {
    console.error("Login Error:", error);

    alert(
      error?.response?.data?.message ||
        "Login Failed"
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "520px",
        background: "#ffffff",
        borderRadius: "20px",
        padding: "45px",
        boxShadow: "0 15px 40px rgba(0,0,0,.12)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#0E4B32",
          fontSize: "48px",
          marginBottom: "10px",
        }}
      >
        Purely Ceylon
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#777",
          marginBottom: "35px",
        }}
      >
        Welcome back to your organic world 🌿
      </p>

      <form onSubmit={handleLogin}>

        {/* Email OR Phone */}
        <div style={{ marginBottom: "20px" }}>
          <label>
            Email or Phone Number
          </label>

          <input
            type="text"
            placeholder="Enter email or phone number"
            value={identifier}
            onChange={(e) =>
              setIdentifier(e.target.value)
            }
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

        {/* Password */}
        <div style={{ marginBottom: "30px" }}>
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
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

          {/* Forgot Password */}
          <div
            style={{
              marginTop: "10px",
              textAlign: "right",
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                fontSize: "14px",
                color: "#0E4B32",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Login Button */}
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
            ? "Logging in..."
            : "Login"}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          marginTop: "25px",
          color: "#666",
        }}
      >
        Don't have an account?{" "}

        <Link
          to="/register"
          style={{
            color: "#D4A017",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Register
        </Link>
      </p>
    </div>
  );
}