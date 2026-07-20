import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await res.json();

      setMessage(result.message);

      if (result.success) {
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">

        <h1 className="text-3xl font-bold text-[#0E4B32] mb-6">
          Forgot Password
        </h1>

        <p className="text-gray-500 mb-6">
          Enter your registered email address.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border rounded-lg p-3 mb-5"
          />

          <button
            className="w-full bg-[#0E4B32] text-white py-3 rounded-lg"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        {message && (
          <p className="text-green-600 mt-5">
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-[#0E4B32]"
          >
            Back to Login
          </Link>
        </div>

      </div>

    </div>
  );
}