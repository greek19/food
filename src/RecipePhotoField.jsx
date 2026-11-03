import { t } from './i18n.js';
import { useEffect, useId, useState } from 'react';
import { validatePhoto } from './photos.js';

export function RecipePhotoField({ url, file, managed, disabled, onFile, onUrl }) {
  const id = useId();
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {if (!file) {setPreview('');return;}const objectUrl = URL.createObjectURL(file);setPreview(objectUrl);return () => URL.revokeObjectURL(objectUrl);}, [file]);
  return <fieldset className="recipe-photo-field" disabled={disabled}><legend>{t("Recipe photo")}</legend>
    {(preview || url) && <img src={preview || url} alt={t("Recipe photo preview")} className="recipe-photo-preview" />}
    <label className="photo-upload-label" htmlFor={id}>{t("Choose a photo from your device")}<input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {const selected = event.target.files?.[0];if (!selected) return;try {validatePhoto(selected);setError('');onFile(selected);} catch (failure) {setError(failure.message);}event.target.value = '';}} /></label>
    <small>{t("JPEG, PNG, or WebP, up to 5 MB. The photo uploads when you save the recipe.")}</small>
    {file && <p>{file.name}</p>}{error && <p role="alert" className="photo-error">{t(error)}</p>}
    {(file || url) && <button type="button" className="text-button" onClick={() => {onFile(null);onUrl('');setError('');}}>{t("Remove recipe photo")}</button>}
    <label>{t("Or use an external URL")}<input type="url" value={file || managed ? '' : url || ''} onChange={(event) => {onFile(null);onUrl(event.target.value);}} placeholder={t("https://\u2026")} disabled={Boolean(file)} /></label>
  </fieldset>;
}
