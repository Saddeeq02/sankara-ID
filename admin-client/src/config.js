// Centralized API configuration and image resolution helper for Sankara ID Admin Client

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sankara-id.vercel.app';

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80';

/**
 * Resolves a picture path to a full accessible URL.
 * Handles absolute URLs, data URLs, relative upload paths, and fallback defaults.
 */
export function getImageUrl(picturePath) {
  if (!picturePath) {
    return DEFAULT_AVATAR;
  }
  if (picturePath.startsWith('http://') || picturePath.startsWith('https://') || picturePath.startsWith('data:')) {
    return picturePath;
  }
  const cleanPath = picturePath.startsWith('/') ? picturePath.slice(1) : picturePath;
  return `${API_BASE_URL}/${cleanPath}?t=${Date.now()}`;
}
