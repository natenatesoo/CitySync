/**
 * Compresses an image file to a JPEG base64 data URL suitable for localStorage.
 * Resizes to at most `maxSize × maxSize` pixels while preserving aspect ratio.
 */
export async function compressPhotoToBase64(file: File, maxSize = 256, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSize) {
            h = Math.round((h * maxSize) / w);
            w = maxSize;
          }
        } else {
          if (h > maxSize) {
            w = Math.round((w * maxSize) / h);
            h = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context unavailable"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Image failed to load"));
      img.src = e.target!.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}
