import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfileModal({
  profile,
  onClose,
  reload,
}: any) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile.fullName || "");

  const [phone, setPhone] = useState(
    profile.phone
      ? profile.phone.replace(/^94/, "")
      : ""
  );

  const [countryCode, setCountryCode] = useState("+94");

  const [email, setEmail] = useState(
    profile.email || ""
  );

  const [emailLoading, setEmailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      if (!fullName.trim()) {
        alert("Please enter your full name.");
        return;
      }

      const fullPhoneNumber = `${countryCode}${phone}`;

      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/v1/profile/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName,
            phone: fullPhoneNumber,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "Profile update failed."
        );
        return;
      }

      alert("✅ Profile Updated Successfully!");

      reload();
      onClose();
    } catch (error) {
      console.error(
        "Profile Update Error:",
        error
      );

      alert(
        "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // ADD EMAIL
  // ==========================================

  const addEmail = async () => {
    try {
      if (!email.trim()) {
        alert("Please enter your email address.");
        return;
      }

      const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email.trim())) {
        alert("Please enter a valid email address.");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      setEmailLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/v1/auth/profile/add-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "Failed to send email OTP."
        );
        return;
      }

      alert(
        "📧 OTP sent to your email."
      );
    
      navigate("/verify-profile-email", {
  state: {
    email: email.trim().toLowerCase(),
  },
});

      /*
       * IMPORTANT:
       * அடுத்த step-ல் இங்கே Verify Email OTP page-க்கு
       * navigate செய்வோம்.
       *
       * Example:
       *
       * navigate("/verify-profile-email", {
       *   state: { email: email.trim().toLowerCase() }
       * });
       */

    } catch (error) {
      console.error(
        "Add Email Error:",
        error
      );

      alert(
        "Unable to send email OTP."
      );
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">

        <h3 className="text-2xl font-bold mb-6 text-gray-800">
          Edit Profile
        </h3>

        {/* ======================================
            FULL NAME
        ====================================== */}

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Full Name
          </label>

          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
            value={fullName}
            placeholder="Enter your full name"
            onChange={(e) =>
              setFullName(e.target.value)
            }
          />
        </div>

        {/* ======================================
            PHONE
        ====================================== */}

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Phone Number
          </label>

          <div className="flex gap-2">

            <select
              className="border border-gray-300 p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-green-600"
              value={countryCode}
              onChange={(e) =>
                setCountryCode(e.target.value)
              }
            >
              <option value="+94">
                +94 (SL)
              </option>

              <option value="+91">
                +91 (IN)
              </option>

              <option value="+1">
                +1 (US)
              </option>

              <option value="+44">
                +44 (UK)
              </option>
            </select>

            <input
              className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              value={phone}
              placeholder="771234567"
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

          </div>
        </div>

        {/* ======================================
            EMAIL
        ====================================== */}

        <div className="mb-8">

          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Email Address
          </label>

          <div className="flex gap-2">

            <input
              type="email"
              className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              value={email}
              placeholder="example@gmail.com"
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <button
              type="button"
              onClick={addEmail}
              disabled={emailLoading}
              className="px-4 bg-[#0E4B32] text-white rounded-lg font-semibold disabled:bg-gray-400"
            >
              {emailLoading
                ? "Sending..."
                : profile.email
                ? "Change"
                : "Add"}
            </button>

          </div>

          {/* Email status */}

          {profile.email && (
            <p className="text-sm text-green-700 mt-2">
              ✓ Email already added
            </p>
          )}

        </div>

        {/* ======================================
            ACTION BUTTONS
        ====================================== */}

        <div className="flex gap-4">

          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex-1 bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-800 shadow-lg transition disabled:bg-gray-400"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>
    </div>
  );
}