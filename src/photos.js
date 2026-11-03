export const PHOTO_BUCKET = 'recipe-images';
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export function validatePhoto(file) {
  if (!file || !extensions[file.type]) throw new Error('Scegli una foto JPEG, PNG o WebP.');
  if (!file.size || file.size > MAX_PHOTO_BYTES) throw new Error('La foto deve essere più piccola di 5 MB.');
  return extensions[file.type];
}

export function demoPhoto(file) {
  validatePhoto(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Impossibile leggere la foto.'));
    reader.readAsDataURL(file);
  });
}
