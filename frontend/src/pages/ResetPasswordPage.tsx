import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/v1/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Password changed successfully.");

        navigate("/login");
      } else {
        alert(result.message);
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
          Reset Password
        </h1>

        <form onSubmit={handleSubmit}>

          <input
            type="password"
            placeholder="New Password"
            className="w-full border rounded-lg p-3 mb-4"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border rounded-lg p-3 mb-6"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
          />

          <button
            className="w-full bg-[#0E4B32] text-white py-3 rounded-lg"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

        </form>

    </div>
  </div>
  );
}