import { useState, useEffect } from "react";
import { FaCamera, FaTrash } from "react-icons/fa";

interface Props {
  currentImage?: string;
  onUploaded: (image: string) => void;
}

export default function ProfilePhotoUpload({ currentImage, onUploaded }: Props) {
  const [preview, setPreview] = useState(currentImage || "");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setPreview(currentImage || "");
  }, [currentImage]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/v1/profile/upload-photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      if (result.success) {
        const newImageUrl = `http://localhost:5000/${result.image}?t=${Date.now()}`;
        setPreview(newImageUrl);
        onUploaded(result.image);
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setLoading(false);
    }
  };

  const removePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/v1/profile/remove-photo", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (result.success) {
        setPreview("");
        onUploaded("");
      } else {
        alert("Failed to remove photo.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to remove photo.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <img
          src={preview || "/images/default-avatar.png"}
          alt="Profile"
          className="w-40 h-40 rounded-full object-cover border-4 border-[#0E4B32] shadow-xl transition duration-300 group-hover:scale-105"
        />

        <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
              <p className="text-white text-xs mt-2">Uploading...</p>
            </div>
          ) : (
            <div className="bg-[#0E4B32] rounded-full p-3 shadow-lg">
              <FaCamera className="text-white" size={20} />
            </div>
          )}
          <input hidden type="file" accept="image/*" onChange={handleUpload} />
        </label>
      </div>

      {showSuccess && (
        <div className="mt-3 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
          ✓ Photo Updated
        </div>
      )}

      <button
        onClick={removePhoto}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 mt-3 text-sm transition"
      >
        <FaTrash /> Remove Photo
      </button>
    </div>
  );
}