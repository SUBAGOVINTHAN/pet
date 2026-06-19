const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const resolveImage = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};