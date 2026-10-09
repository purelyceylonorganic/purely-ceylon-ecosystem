
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ImagePlus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";

import { productImageService } from "../../../services/productImage.service";

type ProductImage = {
  id: string;
  url: string;
  isPrimary: boolean;
};

export default function ProductImages() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. முதலில் எல்லா state-களையும் declare செய்யவும்
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [processingImageId, setProcessingImageId] =
    useState<string | null>(null);

  // 2. State-க்கு பிறகு preview URLs உருவாக்கவும்
  const selectedPreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  // 3. Component மாறும்போது பழைய URLs-ஐ நீக்கவும்
  useEffect(() => {
    return () => {
      selectedPreviews.forEach(({ url }) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [selectedPreviews]);

  async function loadImages() {
    if (!id) {
      setLoadingImages(false);
      return;
    }

    try {
      const data = await productImageService.getImages(id);
      setImages(data);
    } catch (error) {
      console.error("Failed to load product images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  }

  useEffect(() => {
    void loadImages();
  }, [id]);

  async function handleUpload() {
    if (!id || uploading) return;

    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      setUploading(true);

      await productImageService.uploadImage(id, selectedFiles);

      toast.success("Images uploaded successfully");
      setSelectedFiles([]);
      await loadImages();
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      setProcessingImageId(imageId);

      await productImageService.deleteImage(imageId);

      toast.success("Image deleted");
      await loadImages();
    } catch (error) {
      console.error("Image deletion failed:", error);
      toast.error("Delete failed");
    } finally {
      setProcessingImageId(null);
    }
  }

  async function handleSetPrimary(imageId: string) {
    try {
      setProcessingImageId(imageId);

      await productImageService.setPrimary(imageId);

      toast.success("Primary image updated");
      await loadImages();
    } catch (error) {
      console.error("Failed to set primary image:", error);
      toast.error("Failed to update primary image");
    } finally {
      setProcessingImageId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl min-w-0 p-3 sm:p-5 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-800">
            <ImagePlus size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Product Images
            </h1>
            <p className="mt-1 break-all text-sm text-gray-500">
              Product ID: {id ?? "Unavailable"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
        >
          <ArrowLeft size={17} />
          Back to Products
        </button>
      </div>

      <section className="mb-7 min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          Upload Images
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Select one or more product images from your device.
        </p>

        <label
          htmlFor="product-image-files"
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center transition hover:border-green-600 hover:bg-green-50"
        >
          <Upload size={28} className="mb-2 text-green-700" />
          <span className="text-sm font-semibold text-gray-800">
            Choose product images
          </span>
          <span className="mt-1 text-xs text-gray-500">
            JPG, PNG, WebP or other supported image formats
          </span>

          <input
            id="product-image-files"
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              setSelectedFiles(
                Array.from(event.target.files ?? [])
              );
              event.target.value = "";
            }}
          />
        </label>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-700">
                {selectedFiles.length} image(s) selected
              </p>

              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="self-start text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear selection
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {selectedPreviews.map(({ file, url }, index) => (
  <div
    key={`${file.name}-${file.size}-${index}`}
    className="min-w-0 overflow-hidden rounded-lg border border-gray-200"
  >
    <img
      src={url}
      alt={`Selected image ${index + 1}`}
      className="h-28 w-full object-cover sm:h-36"
    />

    <p className="truncate p-2 text-xs text-gray-600">
      {file.name}
    </p>
  </div>
))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0 || !id}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Upload size={17} />
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </section>

      <section className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">Image Gallery</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {images.length} image(s)
          </span>
        </div>

        {loadingImages ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading images...
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-12">
            <ImagePlus
              size={36}
              className="mx-auto mb-3 text-gray-400"
            />
            <p className="font-medium text-gray-700">
              No images available
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Upload images to display them in your product gallery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => {
              const processing =
                processingImageId === image.id;

              return (
                <article
                  key={image.id}
                  className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt="Product"
                      loading="lazy"
                      className="h-48 w-full bg-gray-50 object-contain p-2 sm:h-56"
                    />

                    {image.isPrimary && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow">
                        <Star size={13} fill="currentColor" />
                        Primary Image
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 p-3">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => void handleSetPrimary(image.id)}
                        disabled={processing}
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-50 disabled:opacity-50"
                      >
                        <Star size={16} />
                        {processing ? "Please wait..." : "Set as Primary"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleDelete(image.id)}
                      disabled={processing}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {processing ? "Please wait..." : "Delete Image"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
