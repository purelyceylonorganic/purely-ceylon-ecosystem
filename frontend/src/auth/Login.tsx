import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await authService.login(email, password);

      console.log("Login Response:", response);

      // ✅ Save JWT Token
      login(response.token);

      // ✅ Verify Token Saved
      console.log(
        "Saved Token:",
        localStorage.getItem("token")
      );

      alert("✅ Login Successful");

      // ✅ Redirect to Home Page
      navigate("/products");

    } catch (error: any) {
      console.error(error);

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
        <div style={{ marginBottom: "20px" }}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              marginTop: "8px",
              fontSize: "16px",
            }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              marginTop: "8px",
              fontSize: "16px",
            }}
          />
        </div>

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
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Logging in..." : "Login"}
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