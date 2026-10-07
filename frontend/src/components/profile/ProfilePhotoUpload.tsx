import { useEffect, useState } from "react";
import { FaCamera, FaTrash } from "react-icons/fa";
import { Loader2, UserRound } from "lucide-react";
import api from "../../api/axios";


interface Props {
  currentImage?: string;
  onUploaded: (image: string) => void;
}

export default function ProfilePhotoUpload({
  currentImage,
  onUploaded,
}: Props) {
  const [preview, setPreview] = useState(currentImage || "");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setPreview(currentImage || "");
  }, [currentImage]);

  const handleUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image.");
    e.target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Image size must be less than 2MB.");
    e.target.value = "";
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  setPreview(objectUrl);

  const formData = new FormData();
  formData.append("photo", file);

  try {
    setLoading(true);

    const response = await api.post(
      "/profile/upload-photo",
      formData
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(
        result.message || "Upload failed"
      );
    }

    const newImageUrl = `${import.meta.env.VITE_API_BASE_URL.replace(
      "/api/v1",
      ""
    )}/${result.image}?t=${Date.now()}`;

    setPreview(newImageUrl);
    onUploaded(result.image);

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  } catch (err: any) {
    console.error(err);

    setPreview(currentImage || "");

    alert(
      err?.response?.data?.message ||
        err?.message ||
        "Upload failed"
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
    setLoading(false);
    e.target.value = "";
  }
};

 const removePhoto = async () => {
  if (
    !window.confirm(
      "Are you sure you want to remove your profile photo?"
    )
  ) {
    return;
  }

  try {
    setLoading(true);

    const response = await api.delete(
      "/profile/remove-photo"
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(
        result.message ||
          "Failed to remove photo."
      );
    }

    setPreview("");
    onUploaded("");
  } catch (err: any) {
    console.error(err);

    alert(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to remove photo."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex w-full flex-col items-center">
      {/* Profile Image */}
      <div className="relative">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#D4AF37] bg-white shadow-xl sm:h-40 sm:w-40">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#FFF8EE] text-[#0E4B32]">
              <UserRound
                size={58}
                strokeWidth={1.5}
                className="sm:h-[70px] sm:w-[70px]"
              />
            </div>
          )}

          {/* Upload Overlay */}
          <label
            htmlFor="profile-photo-upload"
            className={`absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 transition ${
              loading
                ? "opacity-100"
                : "opacity-0 hover:opacity-100"
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center text-center">
                <Loader2
                  size={30}
                  className="animate-spin text-white"
                />

                <span className="mt-2 text-xs font-bold text-white">
                  Uploading...
                </span>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0E4B32] shadow-lg">
                <FaCamera
                  className="text-white"
                  size={19}
                />
              </div>
            )}
            
          </label>
        </div>

        {/* Camera Badge */}
        {!loading && (
          <label
            htmlFor="profile-photo-upload"
            className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[#0E4B32] text-white shadow-lg transition hover:bg-[#111111] active:scale-95 sm:h-11 sm:w-11"
          >
            <FaCamera size={15} />

            <input
              id="profile-photo-upload"
              hidden
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={loading}
            />
          </label>
        )}
      </div>

      {/* Success */}
      {showSuccess && (
        <div className="mt-3 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700 sm:text-sm">
          ✓ Photo Updated
        </div>
      )}

      {/* Help Text */}
      <p className="mt-3 text-center text-[11px] leading-5 text-white/70 sm:text-xs">
        JPG, PNG or WEBP • Maximum 2MB
      </p>

      {/* Remove */}
      {preview && (
        <button
          type="button"
          onClick={removePhoto}
          disabled={loading}
          className="mt-3 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          <FaTrash size={12} />
          Remove Photo
        </button>
      )}
    </div>
  );
}