import api from "../api/axios";

export const productImageService = {

  async getImages(productId: string) {
    const response = await api.get(
      `/product-images/${productId}`
    );

    return response.data.data;
  },

  // Step 7.1.13: Function signature `file: File` இலிருந்து `files: File[]` ஆக மாற்றப்பட்டுள்ளது
  async uploadImage(
  productId: string,
  files: File[]
) {

  const formData = new FormData();

  // Product ID
  formData.append("productId", productId);

  // Images
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post(
    "/product-images/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
},

  async deleteImage(id: string) {
    const response = await api.delete(
      `/product-images/${id}`
    );

    return response.data;
  },

  async setPrimary(id: string) {
    const response = await api.put(
      `/product-images/${id}/primary`
    );

    return response.data;
  },
};