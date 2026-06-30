import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authService } from "../services/auth.service";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    try {
      setLoading(true);
      setError("");

      await authService.register(
        fullName,
        email,
        password
      );

      // OTP page-க்கு Email அனுப்புகிறோம்
      navigate("/verify-otp", {
        state: { email },
      });

    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Registration Failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8EE]">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border-t-4 border-[#0E4B32]">

        <h1 className="text-3xl font-bold text-center text-[#0E4B32]">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Join Purely Ceylon 🌿
        </p>

        {error && (
          <div className="mt-4 p-3 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="mt-5">
          <label className="text-sm font-medium">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="Full Name"
          />
        </div>

        {/* Email */}
        <div className="mt-4">
          <label className="text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="Email"
          />
        </div>

        {/* Password */}
        <div className="mt-4">
          <label className="text-sm font-medium">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
            placeholder="Password"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-6 bg-[#0E4B32] text-white py-3 rounded-lg hover:bg-black disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-center mt-5 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#D4AF37] font-semibold"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}