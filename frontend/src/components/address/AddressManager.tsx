import { useEffect, useState } from "react";
/* ✅ STEP 15.2 — Import Service */
import { addressService, type Address } from "../../services/address.service";
import AddAddressModal from "./AddAddressModal";

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  /* ✅ STEP 15.3 — Load Addresses via API */
  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      const response = await addressService.getMyAddresses();
      // API response அமைப்பைப் பொறுத்து response.data அல்லது response பயன்படுத்தப்படும்
      setAddresses(response.data ?? response ?? []);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // ✏️ HANDLER: EDIT ADDRESS
  // ==========================================
  const handleEdit = (address: Address) => {
    // குறிப்பு: உங்களின் எடிட் மோடல் அல்லது எடிட் ஸ்டேட் லாஜிக்கை இங்கே இணைக்கலாம்
    console.log("Editing Address:", address);
    alert(`Editing functionality for ${address.street}`);
  };

  // ==========================================
  // ❌ HANDLER: DELETE ADDRESS & REFRESH
  // ==========================================
  const handleDelete = async (id: string) => {
    if (!window.confirm("இந்த முகவரியை நிச்சயமாக நீக்க வேண்டுமா?")) return;

    try {
      await addressService.deleteAddress(id);
      /* ✅ Step 9 — Context Refresh */
      await loadAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert("முகவரியை நீக்க முடியவில்லை!");
    }
  };

  // ==========================================
  // 📍 HANDLER: SET DEFAULT ADDRESS & REFRESH
  // ==========================================
  const handleMakeDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      /* ✅ Step 9 — Context Refresh */
      await loadAddresses();
    } catch (error) {
      console.error("Failed to set default address:", error);
      alert("முதன்மை முகவரியாக மாற்ற முடியவில்லை!");
    }
  };

  if (loading) {
    return <h3 style={{ textAlign: "center", color: "#666" }}>Loading Addresses...</h3>;
  }

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "#0E4B32", marginBottom: "30px" }}>📍 Address Book</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>My Delivery Addresses</h2>
        <button onClick={() => setOpenModal(true)} style={{ background: "#0E4B32", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          + Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        /* ✅ STEP 15.7 — Empty State */
        <div style={{ textAlign: "center", padding: "50px", border: "2px dashed #ccc", borderRadius: "12px" }}>
          <h3>No saved addresses found.</h3>
          <p>Please add your first delivery address.</p>
          <button onClick={() => setOpenModal(true)} style={{ marginTop: "15px", background: "#0E4B32", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>
            + Add Address
          </button>
        </div>
      ) : (
        addresses.map((address) => (
          <div key={address.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 20, marginBottom: 15, maxWidth: "700px", margin: "15px auto", boxShadow: "0 2px 8px rgba(0,0,0,.08)", background: "#fff" }}>
            <div style={{ marginBottom: "10px" }}>
              <strong style={{ fontSize: "16px", color: "#333" }}>{address.street}</strong>
              <p style={{ margin: "5px 0" }}>{address.city}</p>
              <p style={{ margin: "5px 0" }}>{address.province}</p>
              <p style={{ margin: "5px 0" }}>{address.postalCode}</p>
              <p style={{ margin: "5px 0", marginBottom: "12px" }}>{address.country}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              {/* ✅ STEP 15.8 — Default Badge */}
              {address.isDefault ? (
                <span style={{ background: "#0E4B32", color: "#fff", padding: "6px 12px", borderRadius: "20px", fontWeight: "bold", fontSize: "12px", display: "inline-block" }}>
                  🏠 Default
                </span>
              ) : (
                /* ⭐ Step 8 — Set Default Button (கார்டு default ஆக இல்லாத போது மட்டும் காட்டும்) */
                <button onClick={() => handleMakeDefault(address.id)} style={{ background: "#f3f4f6", color: "#1f2937", border: "1px solid #d1d5db", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>
                  ⭐ Set Default
                </button>
              )}

              {/* 🛠️ Step 8 — Edit & Delete UI Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleEdit(address)} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(address.id)} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      /* ✅ STEP 15.6 — Refresh Address List on Close */
      <AddAddressModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          loadAddresses();
        }}
      />
    </div>
  );
}