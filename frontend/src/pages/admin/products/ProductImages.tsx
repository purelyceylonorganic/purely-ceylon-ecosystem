import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { productImageService } from "../../../services/productImage.service";

export default function ProductImages() {
  const { id } = useParams();
  
  const [images, setImages] = useState<any[]>([]);
  // Step 7.1.9: single file state-க்கு பதிலாக array state ஆக மாற்றப்பட்டுள்ளது
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  async function loadImages() {
    if (!id) return;
    try {
      const data = await productImageService.getImages(id);
      setImages(data);
    } catch {
      toast.error("Failed to load images");
    }
  }
  
  async function handleUpload() {
    // Array-க்கு ஏற்ப validation மாற்றப்பட்டுள்ளது
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      setUploading(true);
      // ஒரே நேரத்தில் பல ஃபைல்களை அனுப்பும் வகையில் சேவைக்கு (service) மாற்றி அனுப்பப்படுகிறது
      await productImageService.uploadImage(id!, selectedFiles);
      toast.success("Images uploaded successfully");
      setSelectedFiles([]); // ஃபைல்களைக் காலி செய்கிறது
      loadImages();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return;

    try {
      await productImageService.deleteImage(imageId);
      toast.success("Image deleted");
      loadImages();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  }

  async function handleSetPrimary(imageId: string) {
    try {
      await productImageService.setPrimary(imageId);
      toast.success("Primary image updated");
      loadImages();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update primary image");
    }
  }

  useEffect(() => {
    loadImages();
  }, [id]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Product Images</h1>

      <div className="bg-gray-100 p-4 rounded mt-2 mb-6">
        Product ID: {id}
      </div>

      {/* Upload UI */}
      <div className="mb-6 space-y-3">
        {/* Step 7.1.10 & 7.1.11: multiple attribute மற்றும் Array.from() சேர்க்கப்பட்டுள்ளது */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            setSelectedFiles(Array.from(e.target.files || []));
          }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
        {selectedFiles.length > 0 && (
          <p className="text-sm text-gray-600">{selectedFiles.length} file(s) selected</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Images</h2>
        
        {/* Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-xl shadow overflow-hidden"
            >
              <img
                src={image.url}
                alt="Product"
                className="w-full h-48 object-cover"
              />

              <div className="p-3">
                {image.isPrimary && (
                  <div className="text-green-600 text-sm font-semibold mb-2">
                    ⭐ Primary Image
                  </div>
                )}

                {!image.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg mb-2 hover:bg-green-700 transition"
                  >
                    Set Primary
                  </button>
                )}

                <button
                  onClick={() => handleDelete(image.id)}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && <p className="mt-4 text-gray-500">No Images Available</p>}
      </div>
    </div>
  );
}