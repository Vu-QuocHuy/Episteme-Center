// Cloudinary upload service
const CLOUDINARY_CLOUD_NAME = 'dcbwhzsu9'; // Replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = 'test'; // Replace with your upload preset

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Lỗi khi tải ảnh lên Cloudinary');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Không thể tải ảnh lên. Vui lòng thử lại sau.');
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Note: This requires server-side implementation with API key and secret
  // For now, we'll just log the public ID that should be deleted
  console.log('Should delete image with public ID:', publicId);
};
