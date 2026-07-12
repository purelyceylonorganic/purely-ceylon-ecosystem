import { useState } from "react";
import toast from "react-hot-toast";
/* ✅ STEP 15.4 — Import Service */
import { addressService } from "../../services/address.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddAddressModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  
  // 📝 படிவத்திற்கான ஒருங்கிணைக்கப்பட்ட ஸ்டேட்
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Sri Lanka",
    isDefault: false,
  });

  // 📝 Step 1 (State) — பிழைகளைச் சேமிப்பதற்கான ஸ்டேட்
  const [errors, setErrors] = useState<any>({});

  if (!open) return null;

  // 📝 Step 1 (Validation Function) — படிவத்தைச் சரிபார்க்கும் செயல்பாடு
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full Name is required";
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone Number is required";
    }
    if (!formData.street?.trim()) {
      newErrors.street = "Street Address is required";
    }
    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.province?.trim()) {
      newErrors.province = "Province / State is required";
    }
    if (!formData.postalCode?.trim()) {
      newErrors.postalCode = "Postal / ZIP Code is required";
    }
    if (!formData.country?.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ✅ STEP 15.4 & 15.5 — Submit New Address & Close Modal After Save */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // சரிபார்ப்பு தோல்வியுற்றால் செயல்பாட்டை நிறுத்தவும்
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      await addressService.addAddress({
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        isDefault: formData.isDefault,
      });
      
      toast.success("✅ Address saved successfully!");
      
      // ரீசெட் மற்றும் மூடுதல்
      setFormData({ 
        fullName: "", 
        phone: "", 
        street: "", 
        city: "", 
        province: "", 
        postalCode: "", 
        country: "Sri Lanka", 
        isDefault: false 
      });
      setErrors({});
      onClose(); 
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error?.response?.data?.message || "Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div style={{ width: 500, background: "#fff", padding: 30, borderRadius: 12, position: "relative", boxSizing: "border-box", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#666" }}>
          ✕
        </button>

        <h2 style={{ margin: "0 0 20px 0", color: "#0E4B32", fontSize: "22px" }}>
          📍 Add Delivery Address
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          
          {/* 👤 Full Name */}
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input 
              type="text" 
              style={{ ...inputStyle, border: errors.fullName ? "1px solid #dc2626" : "1px solid #ccc" }} 
              value={formData.fullName} 
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
            />
            {errors.fullName && (
              <p style={errorStyle}>{errors.fullName}</p>
            )}
          </div>

          {/* 📞 Phone Number */}
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input 
              type="text" 
              style={{ ...inputStyle, border: errors.phone ? "1px solid #dc2626" : "1px solid #ccc" }} 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
            />
            {errors.phone && (
              <p style={errorStyle}>{errors.phone}</p>
            )}
          </div>

          {/* 🏠 Street Address */}
          <div>
            <label style={labelStyle}>Street Address *</label>
            <input 
              type="text" 
              style={{ ...inputStyle, border: errors.street ? "1px solid #dc2626" : "1px solid #ccc" }} 
              value={formData.street} 
              onChange={(e) => setFormData({ ...formData, street: e.target.value })} 
            />
            {errors.street && (
              <p style={errorStyle}>{errors.street}</p>
            )}
          </div>

          {/* 🏙️ City */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold" as const, color: "#555", marginBottom: "5px" }}>City *</label>
            <input 
              type="text" 
              style={{ ...inputStyle, border: errors.city ? "1px solid #dc2626" : "1px solid #ccc" }} 
              value={formData.city} 
              onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
            />
            {errors.city && (
              <p style={errorStyle}>{errors.city}</p>
            )}
          </div>

          {/* 📍 Province / State */}
          <div>
            <label style={labelStyle}>Province / State *</label>
            <input 
              type="text" 
              style={{ ...inputStyle, border: errors.province ? "1px solid #dc2626" : "1px solid #ccc" }} 
              value={formData.province} 
              onChange={(e) => setFormData({ ...formData, province: e.target.value })} 
            />
            {errors.province && (
              <p style={errorStyle}>{errors.province}</p>
            )}
          </div>

          {/* 📮 Postal / ZIP Code */}
          <div>
            <label style={labelStyle}>Postal / ZIP Code *</label>
            <input 
              type="text" 
              style={{ ...inputStyle, border: errors.postalCode ? "1px solid #dc2626" : "1px solid #ccc" }} 
              value={formData.postalCode} 
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} 
            />
            {errors.postalCode && (
              <p style={errorStyle}>{errors.postalCode}</p>
            )}
          </div>

          {/* 🏳️ Country */}
          <div>
            <label style={labelStyle}>Country *</label>
            <input 
              type="text" 
              style={{ ...inputStyle, border: errors.country ? "1px solid #dc2626" : "1px solid #ccc" }} 
              value={formData.country} 
              onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
            />
            {errors.country && (
              <p style={errorStyle}>{errors.country}</p>
            )}
          </div>

          {/* 🔘 Default Checkbox */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
            <input type="checkbox" id="modalIsDefault" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
            <label htmlFor="modalIsDefault" style={{ fontSize: "14px", color: "#444", cursor: "pointer" }}>Set as default delivery address</label>
          </div>

          {/* 🚀 Submit Button */}
          <button type="submit" disabled={loading} style={{ marginTop: "10px", background: "#0E4B32", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "15px" }}>
            {loading ? "Saving..." : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 🎨 Styles Configuration
const labelStyle = { display: "block", fontSize: "13px", fontWeight: "bold" as const, color: "#555", marginBottom: "5px" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const, outline: "none", transition: "border 0.2s" };
const errorStyle = { color: "#dc2626", fontSize: "12px", margin: "4px 0 0 0", fontWeight: "500" };