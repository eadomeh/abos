export async function cropImageFile(
  file: File,
  aspectRatio: number,
  zoom: number,
  positionX: number,
  positionY: number,
): Promise<Blob> {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
      image.src = sourceUrl;
    });

    const width = 1200;
    const height = Math.round(width / aspectRatio);
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) *
      Math.max(1, zoom);
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const overflowX = Math.max(0, renderedWidth - width);
    const overflowY = Math.max(0, renderedHeight - height);
    const left = -overflowX * (Math.min(100, Math.max(0, positionX)) / 100);
    const top = -overflowY * (Math.min(100, Math.max(0, positionY)) / 100);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image editing is not supported in this browser.');

    context.drawImage(image, left, top, renderedWidth, renderedHeight);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Could not prepare the edited image.')),
        'image/webp',
        0.88,
      );
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
