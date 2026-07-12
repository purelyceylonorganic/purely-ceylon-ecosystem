import { useEffect, useState } from "react"; 
// 1. react-hot-toast-ஐ Import செய்துள்ளோம்
import toast from "react-hot-toast";

type Props = {
  onSubmit: (data: {
    fullName: string;      
    phone: string;         
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }) => void;
  initialData?: any;
};

export default function AddressForm({ onSubmit, initialData }: Props) {
  // அனைத்து ஸ்டேட்களும் (States)
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [street, setStreet] = useState(initialData?.street || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [province, setProvince] = useState(initialData?.province || "");
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || "");
  const [country, setCountry] = useState(initialData?.country || "Sri Lanka");
  const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);

  // எடிட் செய்யும்போது பழைய தரவுகளை லோடு செய்ய
  useEffect(() => {
    if (!initialData) {
      setFullName("");
      setPhone("");
      setStreet("");
      setCity("");
      setProvince("");
      setPostalCode("");
      setCountry("Sri Lanka");
      setIsDefault(false);
      return;
    }

    setFullName(initialData.fullName || "");
    setPhone(initialData.phone || "");
    setStreet(initialData.street || "");
    setCity(initialData.city || "");
    setProvince(initialData.province || "");
    setPostalCode(initialData.postalCode || "");
    setCountry(initialData.country || "Sri Lanka");
    setIsDefault(initialData.isDefault || false);
  }, [initialData]);

  // சப்மிட் ஃபங்ஷன் மற்றும் வேலிடேஷன்
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 2. ஒவ்வொரு ஃபீல்டுக்கும் தனித்தனி டோஸ்ட் வேலிடேஷன் (Step 2)
    if (!fullName.trim()) {
      toast.error("Full Name Required");
      return;
    }

    if (!phone.trim()) {
      toast.error("Phone Number Required");
      return;
    }

    // போன் நம்பர் வேலிடேஷன் (குறைந்தது 7 முதல் 15 எண்கள் வரை இருக்க வேண்டும்)
    const phoneClean = phone.replace(/\s+/g, ""); // இடைவெளிகளை நீக்க
    if (!/^\+?\d{7,15}$/.test(phoneClean)) {
      toast.error("Enter a valid Phone Number");
      return;
    }

    if (!street.trim()) {
      toast.error("Street Address Required");
      return;
    }

    if (!city.trim()) {
      toast.error("City Name Required");
      return;
    }

    if (!province.trim()) {
      toast.error("Province/State Required");
      return;
    }

    if (!postalCode.trim()) {
      toast.error("Postal Code Required");
      return;
    }

    if (!country.trim()) {
      toast.error("Country Name Required");
      return;
    }

    // அனைத்து வேலிடேஷன்களும் பாஸ் ஆனால் தரவை சப்மிட் செய்யும்
    onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      isDefault,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      
      {/* 👤 Full Name Input */}
      <div>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Full Name *</label>
        <input
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* 📞 Phone Number Input with Country Code */}
      <div>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Phone Number *</label>
        <div style={{ display: "flex", gap: "5px" }}>
          <select 
            style={{ ...inputStyle, width: "90px", background: "#f5f5f5" }}
            onChange={(e) => {
              if (!phone.startsWith(e.target.value)) {
                setPhone(e.target.value + " " + phone.replace(/^\+\d+\s*/, ""));
              }
            }}
          >
            <option value="+94">🇱🇰 +94</option>
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
          </select>
          
          <input
            type="tel"
            placeholder="771234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </div>

      {/* 🏠 Street Input */}
      <div>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Street Address *</label>
        <input
          type="text"
          placeholder="No. 12, Main Street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* 🏙️ City & Province Inputs */}
      <div style={{ display: "flex", gap: "15px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>City *</label>
          <input
            type="text"
            placeholder="Colombo"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={inputStyle}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Province *</label>
          <input
            type="text"
            placeholder="Western"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* 📮 Postal Code & Country Inputs */}
      <div style={{ display: "flex", gap: "15px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Postal Code *</label>
          <input
            type="text"
            placeholder="00100"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px" }}>Country *</label>
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* ☑️ Default Address Checkbox */}
      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "5px" }}>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
        />
        <span style={{ fontSize: "14px", color: "#444" }}>Set as default delivery address</span>
      </label>

      {/* 💾 Submit Button */}
      <button 
        type="submit" 
        style={{
          background: "#0E4B32",
          color: "#fff",
          border: "none",
          padding: "12px",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "15px",
          marginTop: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
        }}
      >
        {initialData ? "🔄 Update Address" : "💾 Save Address"}
      </button>

    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box" as const,
  outline: "none"
};