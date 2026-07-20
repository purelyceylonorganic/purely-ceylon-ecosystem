import { useEffect, useState } from "react";
import { addressService, type Address } from "../../services/address.service";
import AddAddressModal from "./AddAddressModal";

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
   
  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      const response = await addressService.getMyAddresses();
      setAddresses(response.data ?? response ?? []);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (address: Address) => {
    setCurrentAddress(address);
    setOpenModal(true);
  };

  const handleDelete = async (address: Address) => {
    // இங்கே id அல்லது _id என்பதைச் சரியாகக் கையாளுகிறோம்
    const id = address.id; 
    if (!id) return;
    
    if (!window.confirm("இந்த முகவரியை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?")) return;
    
    try {
      await addressService.deleteAddress(id as string);
      await loadAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert("முகவரியை நீக்க முடியவில்லை!");
    }
  };

  const handleMakeDefault = async (address: Address) => {
    const id = address.id;
    if (!id) return;
    
    try {
      await addressService.setDefaultAddress(id as string);
      await loadAddresses();
    } catch (error) {
      console.error("Failed to set default address:", error);
      alert("முதன்மை முகவரியாக மாற்ற முடியவில்லை!");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px", color: "#666", fontWeight: 600 }}>
        Loading addresses...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#0E4B32", marginBottom: "30px" }}>📍 Address Book</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>My Delivery Addresses</h2>
        <button 
          onClick={() => {
            setCurrentAddress(null);
            setOpenModal(true);
          }} 
          style={{ background: "#0E4B32", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          + Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", border: "2px dashed #ccc", borderRadius: "12px" }}>
          <p>📍 No saved addresses found. Add your first delivery address.</p>
          <button onClick={() => setOpenModal(true)} style={{ marginTop: "15px", background: "#0E4B32", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>
            + Add Address
          </button>
        </div>
      ) : (
        addresses.map((address) => (
          // key-விலும் id அல்லது _id என்பதைப் பயன்படுத்தவும்
          <div key={address.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 20, marginBottom: 15, boxShadow: "0 2px 8px rgba(0,0,0,.08)", background: "#fff" }}>
            <div>
              <strong style={{ fontSize: "16px", color: "#333" }}>{address?.street}</strong>
              <p style={{ margin: "5px 0" }}>{address?.city}, {address?.country}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
              {address.isDefault ? (
                <span style={{ background: "#0E4B32", color: "#fff", padding: "6px 12px", borderRadius: "20px", fontSize: "12px" }}>🏠 Default</span>
              ) : (
                <button onClick={() => handleMakeDefault(address)} style={{ background: "#f3f4f6", border: "1px solid #d1d5db", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "12px" }}>
                  ⭐ Set Default
                </button>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleEdit(address)} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(address)} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <AddAddressModal
        open={openModal}
        address={currentAddress ?? undefined}
        onClose={() => {
          setOpenModal(false);
          setCurrentAddress(null);
          loadAddresses();
        }}
      />
    </div>
  );
}