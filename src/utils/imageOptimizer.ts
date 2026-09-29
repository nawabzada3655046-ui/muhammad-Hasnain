/**
 * Client-side canvas image optimization utility.
 * Compresses uploaded images to high-quality, lightweight WebP/JPEG data URLs.
 * Prevents memory issues and storage quota limits when storing hundreds of products.
 */

export async function optimizeImage(
  fileOrDataUrl: File | string,
  maxWidth = 960,
  maxHeight = 960,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // If it's already a non-data URL (e.g. bundled asset /src/assets/... or https://), keep as-is
    if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:image')) {
      return resolve(fileOrDataUrl);
    }

    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Maintain aspect ratio while constraining to maxWidth / maxHeight
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Try webp first for maximum compression & quality, fallback to jpeg
      try {
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData.startsWith('data:image/webp')) {
          return resolve(webpData);
        }
      } catch {
        // ignore and fallback
      }

      try {
        const jpegData = canvas.toDataURL('image/jpeg', quality);
        return resolve(jpegData);
      } catch {
        return resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
      }
    };

    img.onerror = () => {
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
