'use client';

import React, { useState } from 'react';

export default function EnterpriseControlCenter() {
  // 📊 அட்மின் டேஷ்போர்டுக்கான மாதிரி நிதித் தரவுகள் (Mock Analytics Data)
  const stats = {
    totalRevenue: "$18,450.00",
    totalOrders: 142,
    activeVendors: 12,
    stockAlerts: 2,
    vatCollected: "$3,321.00" // 18% இலங்கை VAT & SSCL
  };

  // 📦 தற்போதைய புதிய ஆர்டர்களின் பட்டியல் (Order Management Layer)
  const [orders, setOrders] = useState([
    { id: "PCO-2026-001", customer: "M.R.M. Perera", items: "Premium Cinnamon (500g)", amount: "$72.50", status: "PENDING", date: "2026-05-22" },
    { id: "PCO-2026-002", customer: "Ahmed Nizam", items: "Pure Cardamom Powder (1kg)", amount: "$182.00", status: "SHIPPED", date: "2026-05-21" },
    { id: "PCO-2026-003", customer: "Global Spices LLC", items: "Bulk Whole Cloves (10kg)", amount: "$1,100.00", status: "DELIVERED", date: "2026-05-20" }
  ]);

  // 🛡️ இராணுவத் தரத்திலான தணிக்கை பதிவுகள் (Immutable Audit Logs UI)
  const auditLogs = [
    { id: "LOG-991", user: "super_admin@purelyceylon.com", action: "UPDATE_PRICE", details: "Cardamom price updated to $18.20", ip: "192.168.1.45", time: "10 mins ago" },
    { id: "LOG-990", user: "admin_tester", action: "FAILED_LOGIN_ALERT", details: "Suspicious login attempt blocked from IP 45.112.x.x", ip: "45.112.82.11", time: "1 hour ago" },
    { id: "LOG-989", user: "system_gateway", action: "ORDER_AUTO_CONFIRM", details: "Order PCO-2026-001 secured via Secure API Layer", ip: "10.0.0.1", time: "2 hours ago" }
  ];

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] font-sans text-[#2c3e2e]">
      
      {/* பிரீமியம் எண்டர்பிரைஸ் நேவிகேஷன் பார் */}
      <nav className="bg-[#1e3322] text-white p-5 border-b-4 border-[#2e5435] shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-xl font-bold tracking-widest text-[#e8f0e9]">PCO CONTROL CENTER</h1>
            <p className="text-[10px] text-[#8fa393] uppercase tracking-wider">Purely Ceylon Organic (Pvt) Ltd — Enterprise Ecosystem</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">
              🛡️ Zero-Trust Active
            </span>
            <span className="bg-[#2e5435] text-[#e8f0e9] text-xs font-bold px-4 py-2 rounded-lg border border-[#52795d]">
              Role: SUPER_ADMIN ⚙️
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">

        {/* 📊 1. நிதி மற்றும் செயல்பாட்டு புள்ளிவிவரங்கள் (Executive Analytics Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-[#e6e4dc] shadow-sm space-y-2">
            <p className="text-xs font-bold text-[#5a6e5d] uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-[#1e3322]">{stats.totalRevenue}</p>
            <span className="text-[10px] text-green-600 font-bold">↑ 14% This Week</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e6e4dc] shadow-sm space-y-2">
            <p className="text-xs font-bold text-[#5a6e5d] uppercase tracking-wider">Gross Orders</p>
            <p className="text-2xl font-black text-[#1e3322]">{stats.totalOrders}</p>
            <span className="text-[10px] text-[#2e5435] font-semibold">100% Verified Secure</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e6e4dc] shadow-sm space-y-2">
            <p className="text-xs font-bold text-[#5a6e5d] uppercase tracking-wider">VAT & SSCL (18%)</p>
            <p className="text-2xl font-black text-blue-800">{stats.vatCollected}</p>
            <span className="text-[10px] text-gray-500 font-medium">Sri Lanka Tax Safe</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e6e4dc] shadow-sm space-y-2">
            <p className="text-xs font-bold text-[#5a6e5d] uppercase tracking-wider">Active Sourcing Vendors</p>
            <p className="text-2xl font-black text-[#2e5435]">{stats.activeVendors}</p>
            <span className="text-[10px] text-[#52795d] font-medium">Certified Bio-Farmers</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-sm space-y-2">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Stock Alerts</p>
            <p className="text-2xl font-black text-red-600">{stats.stockAlerts}</p>
            <span className="text-[10px] text-red-500 font-bold">Requires Action 🚨</span>
          </div>

        </section>

        {/* 📦 2. ஆர்டர் மேலாண்மை பகுதி (Order Tracking Management) */}
        <section className="bg-white rounded-2xl border border-[#e6e4dc] shadow-md overflow-hidden">
          <div className="bg-[#e8f0e9] p-5 border-b border-[#e6e4dc]">
            <h3 className="font-bold text-base text-[#1e3322] tracking-wide">📦 Live Order Fulfillment Engine</h3>
            <p className="text-xs text-[#5a6e5d]">வாடிக்கையாளர்களின் புதிய ஆர்டர்களைக் கண்காணித்து அவற்றின் நிலையை மாற்றும் பகுதி.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#fcfbf7] text-[#5a6e5d] border-b border-[#e6e4dc] uppercase text-[11px] font-bold tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Products Ordered</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e4dc]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fcfbf7] transition-all">
                    <td className="p-4 font-mono font-bold text-[#2e5435]">{order.id}</td>
                    <td className="p-4 font-semibold">{order.customer}</td>
                    <td className="p-4 text-xs text-[#5a6e5d]">{order.items}</td>
                    <td className="p-4 font-black text-[#1e3322]">{order.amount}</td>
                    <td className="p-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`p-1.5 rounded-lg text-xs font-bold border ${
                          order.status === 'DELIVERED' ? 'bg-green-50 border-green-300 text-green-700' :
                          order.status === 'SHIPPED' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                          'bg-amber-50 border-amber-300 text-amber-700'
                        }`}
                      >
                        <option value="PENDING">⏳ PENDING</option>
                        <option value="SHIPPED">🚀 SHIPPED</option>
                        <option value="DELIVERED">✅ DELIVERED</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 🛡️ 3. அழிக்க முடியாத பாதுகாப்பு தணிக்கை பகுதி (Immutable Audit Logs View) */}
        <section className="bg-white rounded-2xl border border-red-200 shadow-md overflow-hidden">
          <div className="bg-red-50/50 p-5 border-b border-red-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-red-900 tracking-wide">🛡️ Immutable Security & Core Audit Logs</h3>
              <p className="text-xs text-red-700/80">நிறுவனத்தின் பாதுகாப்பு மற்றும் விலை மாற்றங்களை கண்காணிக்கும் அழிக்க முடியாத நேரடிப் பதிவுகள்.</p>
            </div>
            <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              ISO 27001 Secure
            </span>
          </div>

          <div className="p-4 divide-y divide-red-50 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2 hover:bg-red-50/20 px-2 rounded-lg transition-all">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded font-sans font-bold">{log.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${log.action.includes('ALERT') ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800'}`}>{log.action}</span>
                    <span className="text-[#2e5435] font-bold text-xs">{log.user}</span>
                  </div>
                  <p className="text-[#5a6e5d] text-xs pt-1">{log.details}</p>
                </div>
                <div className="text-left md:text-right text-[11px] text-gray-400 space-y-0.5">
                  <p className="font-bold text-gray-600">IP: {log.ip}</p>
                  <p className="text-[10px]">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* எண்டர்பிரைஸ் ஃபுட்டர் */}
      <footer className="bg-[#1e3322] text-[#8fa393] text-center py-6 text-xs border-t border-[#2e5435] mt-12">
        <p>© 2026 PURELY CEYLON ORGANIC (PVT) LTD. Global Infrastructure Dashboard.</p>
        <p className="mt-1 text-[10px] text-[#5a6e5d]">Authorized Access Only. All transactions and IP handshakes are encrypted via AES-256.</p>
      </footer>

    </div>
  );
}