import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8EE]">

      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border-t-4 border-[#0E4B32]">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-center text-[#0E4B32]">
          Purely Ceylon
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Welcome back to your organic world 🌿
        </p>

        {/* EMAIL */}
        <div className="mt-6">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="mt-4">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button className="w-full mt-6 bg-[#0E4B32] text-white py-3 rounded-lg hover:bg-black transition">
          Login
        </button>

        {/* FOOTER */}
        <p className="text-center text-sm mt-4 text-gray-500">
          Don’t have an account?{" "}
          <a href="/register" className="text-[#D4AF37] font-semibold">
            Register
          </a>
        </p>

      </div>
    </div>
  );
}