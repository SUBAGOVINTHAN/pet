const BASE_URL = import.meta.env.VITE_API_URL || 'https://pet-diuj.onrender.com';

export const resolveImage = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const clean = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
  return `${BASE_URL}${clean}`;
};