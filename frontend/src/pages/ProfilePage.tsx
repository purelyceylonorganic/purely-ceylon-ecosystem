import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  ShoppingCart,
  Heart,
  Package,
  MapPin,
  CreditCard,
  Edit3,
  LockKeyhole,
  ChevronRight,
} from "lucide-react";

import EditProfileModal from "../components/profile/EditProfileModal";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";
import ProfilePhotoUpload from "../components/profile/ProfilePhotoUpload";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const loadProfile = async () => {
  try {
    const response = await api.get("/profile/me");

    const result = response.data;

    if (result.success) {
      setProfile(result.data);
    } else {
      console.error(
        "Profile loading failed:",
        result.message || "Unknown error"
      );
    }
  } catch (error: any) {
    console.error("Profile loading error:", error);

    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }
};

useEffect(() => {
  loadProfile();
}, []);

 const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login");
}; 



  const calculateCompletion = () => {
    if (!profile) return 0;

    let count = 0;

    if (profile.fullName) count += 25;
    if (profile.email) count += 25;
    if (profile.phone) count += 25;
    if (profile.profileImage) count += 25;

    return count;
  };

  const quickActions = [
    {
      name: "Cart",
      icon: ShoppingCart,
      path: "/cart",
    },
    {
      name: "Wishlist",
      icon: Heart,
      path: "/wishlist",
    },
    {
      name: "Orders",
      icon: Package,
      path: "/orders",
    },
    {
      name: "Addresses",
      icon: MapPin,
      path: "/addresses",
    },
    {
      name: "Payments",
      icon: CreditCard,
      path: "/payment-methods",
    },
  ];

  const profileInfo = [
    {
      label: "Full Name",
      value: profile?.fullName || "Not added",
      icon: User,
    },
    {
      label: "Email",
      value: profile?.email || "Not added",
      icon: Mail,
      isEmail: true,
    },
    {
      label: "Phone",
      value: profile?.phone || "Not added",
      icon: Phone,
    },
    {
      label: "Account Role",
      value: profile?.role || "CUSTOMER",
      icon: Shield,
    },
  ];

  if (!profile) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-[#FFF8EE] px-4">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0E4B32]/20 border-t-[#0E4B32]" />

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  const completion = calculateCompletion();

  const API_ORIGIN = import.meta.env.VITE_API_BASE_URL.replace(
  "/api/v1",
  ""
);

const profileImageUrl = profile.profileImage
  ? profile.profileImage.startsWith("http")
    ? profile.profileImage
    : `${API_ORIGIN}${profile.profileImage}`
  : "";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FFF8EE] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl sm:rounded-3xl"
        >
          {/* Hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0E4B32] via-[#0E4B32] to-[#083722] px-4 py-7 text-white sm:px-8 sm:py-10 lg:px-10">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/10" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative z-10 flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* Profile Identity */}
              <div className="flex w-full min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center lg:w-auto">
                <div className="shrink-0">
                  <ProfilePhotoUpload
                    currentImage={profileImageUrl}
                    onUploaded={(image: string) =>
                      setProfile({
                        ...profile,
                        profileImage: image,
                      })
                    }
                  />
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    {profile.role || "CUSTOMER"}
                  </div>

                  <h1 className="break-words text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                    {profile.fullName}
                  </h1>

                  <p className="mt-2 break-all text-sm text-green-100">
                    {profile.email || "Email not added"}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 active:scale-[0.98] sm:w-auto"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-7 lg:p-10">

            {/* Account Information */}
            <section>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0E4B32]">
                  Account
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {profileInfo.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-[#0E4B32]/20 hover:shadow-sm"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                        <Icon size={18} />
                      </div>

                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        {item.label}
                      </p>

                      <p
                        className={`mt-1 break-words font-bold text-gray-800 ${
                          item.isEmail
                            ? "text-sm"
                            : "text-sm sm:text-base"
                        }`}
                      >
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Dates */}
            <section className="mt-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                    <Calendar size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400">
                      Joined Date
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-800">
                      {profile.createdAt
                        ? new Date(
                            profile.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32]">
                    <Clock size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400">
                      Last Login
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-gray-800">
                      {profile.lastLogin || "Recently"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Completion */}
            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#0E4B32]">
                    Account Setup
                  </p>

                  <h3 className="mt-1 text-base font-extrabold text-gray-900 sm:text-lg">
                    Profile Completion
                  </h3>
                </div>

                <span className="text-lg font-extrabold text-[#0E4B32]">
                  {completion}%
                </span>
              </div>

              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#0E4B32] transition-all duration-500"
                  style={{
                    width: `${completion}%`,
                  }}
                />
              </div>

              {completion < 100 && (
                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Complete your profile to make checkout and
                  account management easier.
                </p>
              )}
            </section>

            {/* Quick Actions */}
            <section className="mt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0E4B32]">
                  Shortcuts
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
                  Quick Actions
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.name}
                      type="button"
                      onClick={() =>
                        navigate(action.path)
                      }
                      className="group flex min-h-[110px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 text-center transition hover:border-[#0E4B32]/30 hover:shadow-md active:scale-[0.98]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0E4B32]/10 text-[#0E4B32] transition group-hover:bg-[#0E4B32] group-hover:text-white">
                        <Icon size={21} />
                      </div>

                      <span className="mt-3 text-xs font-bold text-gray-700 sm:text-sm">
                        {action.name}
                      </span>

                      <ChevronRight
                        size={14}
                        className="mt-1 text-gray-300"
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Profile Actions */}
            <section className="mt-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(true)}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#111111] active:scale-[0.98]"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(true)
                  }
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-6 py-3 text-sm font-extrabold text-gray-800 transition hover:bg-gray-200 active:scale-[0.98]"
                >
                  <LockKeyhole size={18} />
                  Change Password
                </button>
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          reload={loadProfile}
        />
      )}

      {/* Change Password Modal */}
      {showPassword && (
        <ChangePasswordModal
          onClose={() => setShowPassword(false)}
        />
      )}
    </div>
  );
}