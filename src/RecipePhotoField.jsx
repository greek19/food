import { useEffect, useId, useState } from 'react';
import { validatePhoto } from './photos.js';

export function RecipePhotoField({ url, file, managed, disabled, onFile, onUrl }) {
  const id = useId();
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (!file) { setPreview(''); return; } const objectUrl = URL.createObjectURL(file); setPreview(objectUrl); return () => URL.revokeObjectURL(objectUrl); }, [file]);
  return <fieldset className="recipe-photo-field" disabled={disabled}><legend>Foto della ricetta</legend>
    {(preview || url) && <img src={preview || url} alt="Anteprima foto della ricetta" className="recipe-photo-preview" />}
    <label className="photo-upload-label" htmlFor={id}>Scegli una foto dal dispositivo<input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = event.target.files?.[0]; if (!selected) return; try { validatePhoto(selected); setError(''); onFile(selected); } catch (failure) { setError(failure.message); } event.target.value = ''; }} /></label>
    <small>JPEG, PNG o WebP, fino a 5 MB. La foto viene caricata quando salvi la ricetta.</small>
    {file && <p>{file.name}</p>}{error && <p role="alert" className="photo-error">{error}</p>}
    {(file || url) && <button type="button" className="text-button" onClick={() => { onFile(null); onUrl(''); setError(''); }}>Rimuovi foto dalla ricetta</button>}
    <label>Oppure usa un URL esterno<input type="url" value={file || managed ? '' : url || ''} onChange={(event) => { onFile(null); onUrl(event.target.value); }} placeholder="https://…" disabled={Boolean(file)} /></label>
  </fieldset>;
}
