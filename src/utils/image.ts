export async function compressImageFile(file: File, options?: { maxWidth?: number; maxHeight?: number; initialQuality?: number; }): Promise<string> {
  const maxWidth = options?.maxWidth ?? 1200;
  const maxHeight = options?.maxHeight ?? 1200;
  let quality = options?.initialQuality ?? 0.85;

  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  const bitmap = await createImageBitmap(file);

  // Try progressively reducing dimensions and quality until under threshold
  const supportsWebP = (() => {
    try {
      return HTMLCanvasElement.prototype.toDataURL.call(document.createElement('canvas'), 'image/webp').indexOf('data:image/webp') === 0;
    } catch { return false; }
  })();
  const targetType = supportsWebP ? 'image/webp' : mime;

  // Start with full ratio up to max dims
  let width = Math.min(bitmap.width, maxWidth);
  let height = Math.min(bitmap.height, maxHeight);

  // Cap attempts
  for (let pass = 0; pass < 6; pass++) {
    // reduce size progressively each pass
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    // try multiple quality levels for this dimension
    for (let qStep = 0; qStep < 6; qStep++) {
      const q = Math.max(0.25, quality - qStep * 0.12);
      const dataUrl = canvas.toDataURL(targetType, q);
      const head = 'data:' + targetType + ';base64,';
      const base64 = dataUrl.startsWith(head) ? dataUrl.slice(head.length) : dataUrl.split(',')[1] || '';
      const estimatedBytes = Math.ceil((base64.length * 3) / 4);
      // target ~900KB
      if (estimatedBytes <= 950 * 1024) {
        return dataUrl;
      }
      // if low quality reached, continue to next dimension reduction
    }

    // reduce dimensions for next pass
    width = Math.max(200, width * 0.7);
    height = Math.max(200, height * 0.7);
    // if already small, decrease quality baseline
    quality = Math.max(0.25, quality - 0.08);
  }

  // final fallback: smallest quality and small canvas
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = Math.min(800, Math.max(100, Math.round(bitmap.width * 0.5)));
  finalCanvas.height = Math.min(800, Math.max(100, Math.round(bitmap.height * 0.5)));
  const fctx = finalCanvas.getContext('2d');
  if (!fctx) throw new Error('Canvas not supported');
  fctx.drawImage(bitmap, 0, 0, finalCanvas.width, finalCanvas.height);
  return finalCanvas.toDataURL(targetType, 0.2);
}

export function dataUrlSize(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
}
