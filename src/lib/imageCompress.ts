const TARGET_MAX_BYTES = 100 * 1024;
const MIN_QUALITY = 0.4;

async function encode(bitmap: ImageBitmap, w: number, h: number, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality)
  );
}

export async function compressImageToJpeg(file: File, maxDimension = 256, quality = 0.7): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  let q = quality;
  let blob = await encode(bitmap, w, h, q);
  while (blob.size > TARGET_MAX_BYTES && q > MIN_QUALITY) {
    q -= 0.1;
    blob = await encode(bitmap, w, h, q);
  }
  return blob;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
