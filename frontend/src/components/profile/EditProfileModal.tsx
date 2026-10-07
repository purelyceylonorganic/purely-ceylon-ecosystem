import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, X, Save, Loader2, Check } from "lucide-react";

export default function EditProfileModal({
  profile,
  onClose,
  reload,
}: any) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(
    profile?.fullName || ""
  );

  const [phone, setPhone] = useState(
    profile?.phone
      ? profile.phone.replace(/^94/, "")
      : ""
  );

  const [countryCode, setCountryCode] = useState("+94");

  const [email, setEmail] = useState(
    profile?.email || ""
  );

  const [emailLoading, setEmailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
  if (!fullName.trim()) {
    alert("Please enter your full name.");
    return;
  }

  const fullPhoneNumber = `${countryCode}${phone}`;

  try {
    setSaving(true);

    const response = await api.put("/profile/update", {
      fullName: fullName.trim(),
      phone: fullPhoneNumber,
    });

    const result = response.data;

    if (!result.success) {
      alert(result.message || "Profile update failed.");
      return;
    }

    alert("✅ Profile Updated Successfully!");

    reload();
    onClose();
  } catch (error: any) {
    console.error("Profile Update Error:", error);

    alert(
      error?.response?.data?.message ||
        "Unable to update profile."
    );
  } finally {
    setSaving(false);
  }
};

  // ==========================================
  // ADD / CHANGE EMAIL
  // ==========================================

  const addEmail = async () => {
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

  try {
    setEmailLoading(true);

    const response = await api.post(
      "/auth/profile/add-email",
      {
        email: email.trim().toLowerCase(),
      }
    );

    const result = response.data;

    if (!result.success) {
      alert(
        result.message ||
          "Failed to send email OTP."
      );
      return;
    }

    alert("📧 OTP sent to your email.");

    navigate("/verify-profile-email", {
      state: {
        email: email.trim().toLowerCase(),
      },
    });
  } catch (error: any) {
    console.error("Add Email Error:", error);

    alert(
      error?.response?.data?.message ||
        "Unable to send email OTP."
    );
  } finally {
    setEmailLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">

        {/* Header */}
        <div className="shrink-0 border-b border-gray-100 bg-[#FFF8EE] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                <User size={22} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-extrabold leading-tight text-[#111111] sm:text-xl">
                  Edit Profile
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  Update your personal information.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving || emailLoading}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={21} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">

          {/* Personal Information */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <User
                size={17}
                className="text-[#0E4B32]"
              />

              <h3 className="text-sm font-extrabold text-gray-800">
                Personal Information
              </h3>
            </div>

            {/* Full Name */}
            <div className="mb-5">
              <label
                htmlFor="profile-full-name"
                className="mb-1.5 block text-sm font-bold text-gray-700"
              >
                Full Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="profile-full-name"
                type="text"
                value={fullName}
                placeholder="Enter your full name"
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                autoComplete="name"
                disabled={saving}
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="profile-phone"
                className="mb-1.5 block text-sm font-bold text-gray-700"
              >
                Phone Number
              </label>

              <div className="flex w-full gap-2">
                <select
                  aria-label="Country code"
                  value={countryCode}
                  onChange={(e) =>
                    setCountryCode(e.target.value)
                  }
                  disabled={saving}
                  className="min-h-[50px] w-[105px] shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-2 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 sm:w-[120px]"
                >
                  <option value="+94">
                    🇱🇰 +94 (SL)
                  </option>

                  <option value="+91">
                    🇮🇳 +91 (IN)
                  </option>

                  <option value="+1">
                    🇺🇸 +1 (US)
                  </option>

                  <option value="+44">
                    🇬🇧 +44 (UK)
                  </option>
                </select>

                <div className="relative min-w-0 flex-1">
                  <Phone
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="profile-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    placeholder="771234567"
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    autoComplete="tel"
                    disabled={saving}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Mail
                size={17}
                className="text-[#0E4B32]"
              />

              <div>
                <h3 className="text-sm font-extrabold text-gray-800">
                  Email Address
                </h3>

                <p className="mt-0.5 text-xs text-gray-500">
                  Email verification is required.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  placeholder="example@gmail.com"
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  disabled={emailLoading}
                  className={`${inputClass} pl-10`}
                />
              </div>

              <button
                type="button"
                onClick={addEmail}
                disabled={emailLoading}
                className="inline-flex min-h-[50px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {emailLoading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={17} />
                    {profile?.email
                      ? "Change"
                      : "Add"}
                  </>
                )}
              </button>
            </div>

            {profile?.email && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
                <Check size={15} />
                Email already added
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || emailLoading}
              className="min-h-[50px] w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving || emailLoading}
              className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#111111] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "min-h-[50px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 disabled:cursor-not-allowed disabled:bg-gray-100";