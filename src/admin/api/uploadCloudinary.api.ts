import axios from 'axios';

const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;

export const uploadImagesToCloudinary = async (files: File[]): Promise<string[]> => {
    try {
        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const response = await axios.post(CLOUDINARY_URL, formData);
            return response.data.secure_url;
        });

        return await Promise.all(uploadPromises);
    } catch (error: any) {
        console.error(error.response?.data);
        throw new Error("Lỗi khi tải ảnh lên.");
    }
};