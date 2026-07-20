import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, User, Mail, Phone, Shield, Calendar, Clock, 
  ShoppingCart, Heart, Package, MapPin, CreditCard 
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
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) setProfile(result.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { loadProfile(); }, []);

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

  if (!profile) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <ProfilePhotoUpload
              currentImage={profile.profileImage ? `${profile.profileImage.startsWith("http") ? profile.profileImage : `http://localhost:5000${profile.profileImage}`}` : ""}
              onUploaded={(image: string) => setProfile({ ...profile, profileImage: image })}
            />
            <div>
              <h1 className="text-3xl font-bold">{profile.fullName}</h1>
              <p className="text-green-100">{profile.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-600 rounded-xl font-semibold hover:bg-red-700 transition">
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Info Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Full Name", value: profile.fullName, icon: User },
              { label: "Email", value: profile.email, icon: Mail, isEmail: true },
              { label: "Phone", value: profile.phone || "N/A", icon: Phone },
              { label: "Role", value: profile.role, icon: Shield }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-hidden">
                <item.icon className="text-green-700 mb-2" size={20} />
                <p className="text-gray-500 text-xs uppercase font-bold">{item.label}</p>
                <h3 className={`font-bold text-gray-800 ${item.isEmail ? "break-all text-sm" : ""}`}>{item.value}</h3>
              </div>
            ))}
          </div>

          {/* Joined & Last Login */}
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl border flex items-center gap-4">
              <Calendar className="text-green-700" size={24} />
              <div>
                <p className="text-gray-500 text-xs">Joined Date</p>
                <h3 className="font-semibold">{new Date(profile.createdAt).toLocaleDateString()}</h3>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border flex items-center gap-4">
              <Clock className="text-green-700" size={24} />
              <div>
                <p className="text-gray-500 text-xs">Last Login</p>
                <h3 className="font-semibold">{profile.lastLogin ?? "Recently"}</h3>
              </div>
            </div>
          </div>

          {/* Completion Bar */}
          <div className="bg-white p-6 rounded-2xl border mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">Profile Completion</h3>
              <span className="text-green-700 font-bold">{calculateCompletion()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full transition-all duration-500" style={{ width: `${calculateCompletion()}%` }} />
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[ 
              {name: "Cart", icon: ShoppingCart, path: "/cart"}, 
              {name: "Wishlist", icon: Heart, path: "/wishlist"}, 
              {name: "Orders", icon: Package, path: "/orders"}, 
              {name: "Addresses", icon: MapPin, path: "/addresses"}, 
              {name: "Payments", icon: CreditCard, path: "/payment-methods"}, 
            ].map((action) => (
              <button key={action.name} onClick={() => navigate(action.path)} className="p-4 bg-white border rounded-xl text-center hover:shadow-md transition">
                <action.icon className="mx-auto mb-2 text-green-700" size={24} />
                <span className="text-sm font-medium text-gray-700">{action.name}</span>
              </button>
            ))}
          </div>
        
      <div className="flex justify-center gap-4 mt-6">
        <button onClick={() => setShowEdit(true)} className="px-6 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition">
          Edit Profile
        </button>
        <button onClick={() => setShowPassword(true)} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition">
          Change Password
        </button>
      </div>
      </div>
      </motion.div>


      {showEdit && <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} reload={loadProfile} />}
      {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}
    </div>
  );
}