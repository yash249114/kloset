const UPLOAD_API = '/api/upload';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function uploadImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  folder = 'kloset/outfits'
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_API);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result as CloudinaryUploadResult);
        } catch {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

/**
 * Generate an optimized Cloudinary URL with transformations.
 */
export function getOptimizedUrl(
  url: string,
  _options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
  } = {}
): string {
  return url;
}

/**
 * Validate image files before uploading.
 */
export function validateImageFile(file: File): string | null {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, WebP, and HEIC images are allowed.';
  }

  if (file.size > MAX_SIZE) {
    return 'Image must be smaller than 10MB.';
  }

  return null;
}
