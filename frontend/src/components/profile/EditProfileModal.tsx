import { useState } from "react";

export default function EditProfileModal({ profile, onClose, reload }: any) {
  const [fullName, setFullName] = useState(profile.fullName);
  // ஏற்கனவே உள்ள போன் நம்பரை பிரித்தெடுக்க (தேவையெனில்), அல்லது வெறும் எண்ணாக வைத்துக்கொள்ளலாம்
  const [phone, setPhone] = useState(profile.phone || "");
  const [countryCode, setCountryCode] = useState("+94");

  const saveProfile = async () => {
    const token = localStorage.getItem("token");

    // இரண்டு மதிப்புகளையும் இணைத்து அனுப்புதல்
    const fullPhoneNumber = `${countryCode}${phone}`;

    const response = await fetch("http://localhost:5000/api/v1/profile/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        fullName, 
        phone: fullPhoneNumber 
      }),
    });

    const result = await response.json();
    if (result.success) {
      alert("✅ Profile Updated Successfully!");
      reload();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h3>

        {/* Full Name Input */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition duration-200"
            value={fullName}
            placeholder="Enter your full name"
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Phone Number with Country Code */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Phone Number</label>
          <div className="flex gap-2">
            <select 
              className="border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-green-600"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+94">+94 (SL)</option>
              <option value="+91">+91 (IN)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
            </select>
            <input
              className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition duration-200"
              value={phone}
              placeholder="771234567"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveProfile}
            className="flex-1 bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-800 shadow-lg transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}