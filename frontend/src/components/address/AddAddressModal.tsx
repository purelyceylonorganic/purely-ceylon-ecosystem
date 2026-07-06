import { useState } from "react";
/* ✅ STEP 15.4 — Import Service */
import { addressService } from "../../services/address.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddAddressModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Sri Lanka",
    isDefault: false,
  });

  if (!open) return null;

  /* ✅ STEP 15.4 & 15.5 — Submit New Address & Close Modal After Save */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await addressService.addAddress({
        street: formData.street,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        isDefault: formData.isDefault,
      });
      
      // ரீசெட் மற்றும் மூடுதல்
      setFormData({ street: "", city: "", province: "", postalCode: "", country: "Sri Lanka", isDefault: false });
      onClose(); 
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
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
      <div style={{ width: 500, background: "#fff", padding: 30, borderRadius: 12, position: "relative", boxSizing: "border-box" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#666" }}>
          ✕
        </button>

        <h2 style={{ margin: "0 0 20px 0", color: "#0E4B32", fontSize: "22px" }}>
          📍 Add Delivery Address
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={labelStyle}>Street Address *</label>
            <input type="text" required style={inputStyle} value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>City *</label>
            <input type="text" required style={inputStyle} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Province / State *</label>
            <input type="text" required style={inputStyle} value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Postal / ZIP Code *</label>
            <input type="text" required style={inputStyle} value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Country *</label>
            <input type="text" required style={inputStyle} value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" id="modalIsDefault" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
            <label htmlFor="modalIsDefault" style={{ fontSize: "14px", color: "#444", cursor: "pointer" }}>Set as default delivery address</label>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: "10px", background: "#0E4B32", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "15px" }}>
            {loading ? "Saving..." : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "13px", fontWeight: "bold" as const, color: "#555", marginBottom: "5px" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const, outline: "none" };