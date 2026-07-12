import { useEffect, useState } from "react";
import { addressService, type Address } from "../../services/address.service";
import AddressForm from "../../components/address/AddressForm"; 
// 1. react-hot-toast-ஐ Import செய்துள்ளோம்
import toast from "react-hot-toast";

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false); 
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);
  
  async function removeAddress(id: string) {
    const ok = window.confirm("Are you sure you want to delete this address?");
    if (!ok) return;

    try {
      await addressService.deleteAddress(id);
      // Delete வெற்றிகரமாக முடிந்தால்
      toast.success("Address Deleted Successfully");
      loadAddresses();
    } catch (err) {
      console.error(err);
      // Delete தோல்வியடைந்தால்
      toast.error("Failed to Delete Address");
    }
  }

  async function loadAddresses() {
    try {
      const response = await addressService.getMyAddresses();
      setAddresses(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load addresses");
    }
  }

  async function handleAddAddress(data: any) {
    try {
      await addressService.addAddress(data);
      await loadAddresses();
      setShowForm(false); 
      // Add வெற்றிகரமாக முடிந்தால்
      toast.success("Address Added Successfully");
    } catch (error) {
      console.error(error);
      // Add தோல்வியடைந்தால்
      toast.error("Failed to Add Address");
    }
  }

  async function handleUpdateAddress(data: any) {
    if (!editingAddress) return;

    try {
      await addressService.updateAddress(editingAddress.id, data);
      await loadAddresses();
      setEditingAddress(null); 
      setShowForm(false);
      // Update வெற்றிகரமாக முடிந்தால்
      toast.success("Address Updated Successfully");
    } catch (error) {
      console.error(error);
      // Update தோல்வியடைந்தால்
      toast.error("Failed to Update Address");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await addressService.setDefaultAddress(id);
      await loadAddresses(); 
      // Set Default வெற்றிகரமாக முடிந்தால்
      toast.success("Default Address Updated Successfully");
    } catch (error) {
      console.error(error);
      // Set Default தோல்வியடைந்தால்
      toast.error("Failed to update default address");
    }
  }

  const toggleForm = () => {
    if (showForm) {
      setEditingAddress(null);
    }
    setShowForm(!showForm);
  };

  return (
    <div
      style={{
        width: "100%", 
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "stretch" as const, 
        maxWidth: "1100px",
        margin: "50px auto",
        padding: "0 20px",
        textAlign: "left" as const, 
        minHeight: "60vh"
      }}
    >
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px",
          borderBottom: "2px solid #eee",
          paddingBottom: "15px",
          width: "100%"
        }}
      >
        <h1 style={{ margin: 0, color: "#333", fontSize: "28px" }}>📍 My Addresses</h1>
        
        <button
          onClick={toggleForm}
          style={{
            background: showForm ? "#dc3545" : "#0E4B32",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease"
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add New Address"}
        </button>
      </div>

      {showForm && (
        <div 
          style={{ 
            marginBottom: "40px",
            background: "#fdfdfd",
            padding: "25px",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
            maxWidth: "500px",
            width: "100%"
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>
            {editingAddress ? "Edit Address" : "Create New Address"}
          </h3>

          <AddressForm
            initialData={editingAddress}
            onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
          />
        </div>
      )}

      {addresses.length === 0 ? (
        <div 
          style={{ 
            textAlign: "center" as const, 
            padding: "50px 20px", 
            color: "#666", 
            background: "#fff", 
            borderRadius: "12px", 
            border: "1px dashed #ccc",
            width: "100%",
            boxSizing: "border-box" as const
          }}
        >
          <p style={{ fontSize: "16px", margin: 0, fontWeight: "500" }}>
            No Address Found. Click "+ Add New Address" to create one.
          </p>
        </div>
      ) : (
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: "20px",
            width: "100%"
          }}
        >
          {addresses.map((address) => (
            <div
              key={address.id}
              style={{
                border: "1px solid #ddd",
                padding: 22,
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0", color: "#333", fontSize: "18px" }}>{address.fullName}</h3>
                <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "14px", fontWeight: "500" }}>📱 {address.phone}</p>
                
                <p style={{ margin: "6px 0", color: "#0E4B32", fontWeight: "bold" }}>{address.street}</p>
                <p style={{ margin: "6px 0", color: "#555" }}>{address.city}, {address.province}</p>
                <p style={{ margin: "6px 0", color: "#555" }}>{address.postalCode}</p>
                <p style={{ margin: "6px 0", color: "#777", fontWeight: "500" }}>{address.country}</p>

                {address.isDefault && (
                  <div style={{ marginTop: "15px" }}>
                    <span style={{ background: "#E6F4EA", color: "#137333", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                      ✓ Default Address
                    </span>
                  </div>
                )}
              </div>

              {/* 🛠️ Action Buttons Wrapper */}
              <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px", alignItems: "center" }}>
                
                <button
                  onClick={() => {
                    setEditingAddress(address);
                    setShowForm(true);
                  }}
                  style={{
                    flex: 1,
                    background: "#fff",
                    border: "1px solid #ccc",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#555"
                  }}
                >
                  ✏ Edit
                </button>

                <button
                  style={{
                    flex: 1,
                    background: "#fff",
                    border: "1px solid #dc3545",
                    color: "#dc3545",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                  onClick={() => removeAddress(address.id)}
                >
                  🗑 Delete
                </button>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    style={{
                      flex: 1,
                      background: "#0E4B32",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px"
                    }}
                  >
                    ⭐ Set Default
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}