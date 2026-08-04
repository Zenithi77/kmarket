// Resizes an image file down to a max dimension and re-encodes it as JPEG before
// upload. Uploads go over the wire as base64 JSON, which (a) inflates the payload
// ~33% over the raw file size and (b) Vercel's serverless functions hard-cap
// request bodies at ~4.5MB regardless of anything the server does — so a several-
// MB photo straight from a phone/camera reliably 413s. Shrinking client-side is
// the only real fix, and it also skips needless upload bandwidth.
export function resizeImageForUpload(file: File, maxDimension = 2000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      // Leave GIFs (animated) and non-images untouched.
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}
