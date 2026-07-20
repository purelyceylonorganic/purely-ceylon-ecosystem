import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { addressService, type Address } from "../../services/address.service";

// 1. TypeScript வகை வரையறை (Types)
type FormFields = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

type Props = {
  open: boolean;
  onClose: () => void;
  address?: Address | null;
};

export default function AddAddressModal({ open, onClose, address }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormFields>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Sri Lanka",
    isDefault: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Form-ஐ Reset செய்யும் வசதி
  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Sri Lanka",
      isDefault: false,
    });
    setErrors({});
  };

  useEffect(() => {
    if (!open) return;

    if (address) {
      setFormData({
        fullName: address.fullName || "",
        phone: address.phone || "",
        street: address.street || "",
        city: address.city || "",
        province: address.province || "",
        postalCode: address.postalCode || "",
        country: address.country || "Sri Lanka",
        isDefault: address.isDefault || false,
      });
    } else {
      resetForm();
    }
  }, [address, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const requiredFields: (keyof FormFields)[] = ["fullName", "phone", "street", "city", "province", "postalCode", "country"];
    
    requiredFields.forEach((field) => {
      if (!formData[field] || typeof formData[field] === 'string' && !formData[field].trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      if (address?.id) {
        await addressService.updateAddress(address.id, formData);
        toast.success("✅ Address updated successfully!");
      } else {
        await addressService.addAddress(formData);
        toast.success("✅ Address saved successfully!");
      }
      onClose();
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error?.response?.data?.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
      <div style={{ width: 500, background: "#fff", padding: 30, borderRadius: 12, position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
        <h2 style={{ margin: "0 0 20px 0", color: "#0E4B32" }}>{address ? "✏️ Edit Delivery Address" : "📍 Add Delivery Address"}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {[
            { label: "Full Name", key: "fullName" },
            { label: "Phone Number", key: "phone" },
            { label: "Street Address", key: "street" },
            { label: "City", key: "city" },
            { label: "Province / State", key: "province" },
            { label: "Postal / ZIP Code", key: "postalCode" },
            { label: "Country", key: "country" },
          ].map((field) => (
            <div key={field.key}>
              <label style={labelStyle}>{field.label} *</label>
              <input
                type="text"
                style={{ ...inputStyle, border: errors[field.key as keyof FormFields] ? "1px solid #dc2626" : "1px solid #ccc" }}
                value={formData[field.key as keyof FormFields] as string}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              />
              {errors[field.key as keyof FormFields] && <p style={errorStyle}>{errors[field.key as keyof FormFields]}</p>}
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
            <label style={{ fontSize: "14px" }}>Set as default delivery address</label>
          </div>

          <button type="submit" disabled={loading} style={{ background: "#0E4B32", color: "#fff", padding: "12px", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Saving..." : address ? "Update Address" : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles
const labelStyle = { display: "block", fontSize: "13px", fontWeight: "bold" as const, color: "#555", marginBottom: "5px" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const, outline: "none" };
const errorStyle = { color: "#dc2626", fontSize: "12px", margin: "4px 0 0 0" };