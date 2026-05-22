'use client';

import React, { useState } from 'react';

export default function MultiRoleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // Default Role ஆக வாடிக்கையாளர் (Customer) வைக்கப்பட்டுள்ளது

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logging in as ${role}...\nEmail: ${email}`);
    // இங்கு நமது பேக்கண்ட் Role-Based Routing எஞ்சினுடன் இணையும்
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-[#e6e4dc] shadow-md w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-[#1e3322] tracking-wide">PURELY CEYLON ORGANIC</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Enterprise Portal Login</p>
        </div>

        {/* 🎭 தற்போதைய திருத்தப்பட்ட ரோல் செலக்டர் (Farmer நீக்கப்பட்டு Customer சேர்க்கப்பட்டுள்ளது) */}
        <div className="grid grid-cols-3 gap-1 bg-[#fcfbf7] p-1 rounded-xl border border-[#e6e4dc]">
          {['CUSTOMER', 'ADMIN', 'OFFICE_BOY'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`text-[10px] font-black py-2.5 rounded-lg transition-all ${
                role === r 
                  ? 'bg-[#2e5435] text-white shadow-sm' 
                  : 'text-[#5a6e5d] hover:bg-[#e8f0e9]'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-[#5a6e5d]">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#e6e4dc] bg-[#fcfbf7] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e5435]"
              placeholder="name@purelyceylon.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-[#5a6e5d]">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#e6e4dc] bg-[#fcfbf7] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e5435]"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#1e3322] text-white font-black text-xs uppercase py-3.5 rounded-xl tracking-wider hover:bg-[#2e5435] transition-all shadow-sm"
          >
            Sign In As {role.replace('_', ' ')} 🔑
          </button>
        </form>
      </div>
    </div>
  );
}