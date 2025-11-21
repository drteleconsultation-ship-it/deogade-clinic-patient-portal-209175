import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Utility: convert a File to a data URL (for preview).
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Utility: compress an image on the client using canvas.
 * - Maintains aspect ratio.
 * - maxWidth/maxHeight caps.
 * - quality is JPEG/WebP quality (0-1).
 * Returns a Blob (defaults to image/jpeg).
 */
async function compressImageBlob(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.8, mimeType = 'image/jpeg' } = {}) {
  const dataUrl = await fileToDataUrl(file);
  const img = document.createElement('img');
  img.src = dataUrl;

  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  const { width, height } = img;
  let targetW = width;
  let targetH = height;

  // Scale within bounds
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    targetW = Math.round(width * ratio);
    targetH = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const blob = await new Promise((resolve) => {
    // Prefer image/webp if supported and requested
    canvas.toBlob(
      (b) => resolve(b),
      mimeType,
      quality
    );
  });

  if (!blob) return file;
  // Create a new File to preserve name and type context
  const ext = mimeType.split('/')[1] || 'jpg';
  const newName = (file.name || 'image').replace(/\.(png|jpg|jpeg|webp|gif)$/i, '') + `-compressed.${ext}`;
  return new File([blob], newName, { type: mimeType, lastModified: Date.now() });
}

/**
 * Accepts helper: test file against allowed types and size.
 */
function validateFile(file, { accept, maxSizeBytes }) {
  const errors = [];
  if (accept && accept.length > 0) {
    // accept can include MIME types like 'image/*' or extensions like '.pdf'
    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    const pass = accept.some((rule) => {
      rule = rule.trim().toLowerCase();
      if (rule.endsWith('/*')) {
        const prefix = rule.replace('/*', '');
        return type.startsWith(prefix);
      }
      if (rule.startsWith('.')) {
        return name.endsWith(rule);
      }
      // exact mime match
      return type === rule;
    });
    if (!pass) errors.push('type');
  }
  if (maxSizeBytes && file.size > maxSizeBytes) {
    errors.push('size');
  }
  return errors;
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

// PUBLIC_INTERFACE
export default function FileDropzone({
  label = 'Upload files',
  description = 'Drag & drop or choose files',
  accept = ['image/*', 'application/pdf'],
  maxFiles = 5,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB default
  compressImages = false,
  compressOptions = { maxWidth: 1600, maxHeight: 1600, quality: 0.8, mimeType: 'image/jpeg' },
  value = [],
  onChange,
  ariaLabel = 'File uploader',
}) {
  /**
   * Accessible dropzone supporting:
   * - Drag-and-drop
   * - Click-to-open file dialog
   * - Keyboard activation: Enter/Space to open dialog, Delete/Backspace to clear focus item
   * - Validation: file types and max size
   * - Optional client-side image compression via canvas
   * - Previews for images (data URL), readable info for others
   */

  const [isDragging, setDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef(null);
  const dzRef = useRef(null);

  // Build accept attribute string for input
  const acceptAttr = accept && accept.length ? accept.join(',') : undefined;

  // Generate/cleanup previews
  useEffect(() => {
    let active = true;

    async function buildPreviews() {
      const items = await Promise.all(
        (value || []).map(async (file, idx) => {
          const isImage = (file.type || '').startsWith('image/');
          if (isImage) {
            try {
              const url = await fileToDataUrl(file);
              return { idx, url, name: file.name, size: file.size, type: file.type, isImage: true };
            } catch {
              return { idx, url: '', name: file.name, size: file.size, type: file.type, isImage: true };
            }
          }
          return { idx, url: '', name: file.name, size: file.size, type: file.type, isImage: false };
        })
      );
      if (active) setPreviews(items);
    }

    buildPreviews();

    return () => {
      active = false;
      // FileReader data URLs do not require revoke; if we used ObjectURLs we would revoke here.
    };
  }, [value]);

  const notifyChange = useCallback(
    (files) => {
      onChange && onChange(files);
    },
    [onChange]
  );

  const handleFiles = useCallback(
    async (filesList) => {
      const files = Array.from(filesList || []);
      if (files.length === 0) return;

      const next = [...(value || [])];
      const localErrors = [];

      for (const file of files) {
        if (next.length >= maxFiles) {
          localErrors.push(`Only ${maxFiles} files allowed.`);
          break;
        }
        const vErrors = validateFile(file, { accept, maxSizeBytes });
        if (vErrors.length) {
          const types = [];
          if (vErrors.includes('type')) types.push('type');
          if (vErrors.includes('size')) types.push(`size > ${formatBytes(maxSizeBytes)}`);
          localErrors.push(`${file.name || 'File'} rejected (${types.join(', ')})`);
          continue;
        }

        let finalFile = file;
        // compress only if it's an image
        if (compressImages && (file.type || '').startsWith('image/')) {
          try {
            finalFile = await compressImageBlob(file, compressOptions);
          } catch {
            // if compression fails, use original file
            finalFile = file;
          }
        }

        next.push(finalFile);
      }

      if (localErrors.length) setErrors(localErrors);
      else setErrors([]);

      notifyChange(next);
    },
    [value, accept, maxFiles, maxSizeBytes, compressImages, compressOptions, notifyChange]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const dt = e.dataTransfer;
      if (!dt) return;
      const files = dt.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (e) => {
      handleFiles(e.target.files);
      // reset input so same file selection can be picked again if needed
      e.target.value = '';
    },
    [handleFiles]
  );

  const onRemove = useCallback(
    (idx) => {
      const next = (value || []).filter((_, i) => i !== idx);
      notifyChange(next);
    },
    [value, notifyChange]
  );

  const onKeyDown = (e) => {
    // Basic keyboard support
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onBrowse();
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the dropzone element
    if (!dzRef.current?.contains(e.relatedTarget)) {
      setDragging(false);
    }
  };

  return (
    <div>
      <div
        ref={dzRef}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-describedby="file-dz-desc"
        className="file-dropzone"
        onClick={onBrowse}
        onKeyDown={onKeyDown}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        data-dragging={isDragging ? 'true' : 'false'}
      >
        <div className="file-dz-inner">
          <div className="file-dz-icon" aria-hidden="true">📎</div>
          <div>
            <div className="file-dz-label">{label}</div>
            <div id="file-dz-desc" className="file-dz-desc muted">
              {description} • Allowed: {accept?.join(', ') || 'any'} • Max size: {formatBytes(maxSizeBytes)}
            </div>
          </div>
          <button type="button" className="btn btn-sm" onClick={(e) => { e.stopPropagation(); onBrowse(); }} aria-label="Choose files">
            Choose files
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptAttr}
          onChange={onInputChange}
          aria-hidden="true"
          style={{ display: 'none' }}
        />
      </div>

      {errors.length > 0 && (
        <div role="alert" className="card" style={{ marginTop: 10, borderColor: 'var(--color-error)' }}>
          <strong style={{ color: 'var(--color-error)' }}>Some files were not added:</strong>
          <ul style={{ margin: '6px 0 0 18px' }}>
            {errors.map((e, i) => (<li key={i} className="muted">{e}</li>))}
          </ul>
        </div>
      )}

      {previews.length > 0 && (
        <ul className="file-grid" aria-label="Selected files">
          {previews.map((p, i) => (
            <li key={i} className="file-card">
              <div className="file-thumb" aria-hidden={!p.isImage}>
                {p.isImage ? (
                  <img src={p.url} alt={p.name || `Image ${i + 1}`} />
                ) : (
                  <div className="file-generic">📄</div>
                )}
              </div>
              <div className="file-meta">
                <div className="file-title" title={p.name}>{p.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{p.type || 'unknown'} · {formatBytes(p.size)}</div>
              </div>
              <button className="btn btn-sm" onClick={() => onRemove(i)} aria-label={`Remove ${p.name || 'file'}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Inline styles scoped by class names */}
      <style>{`
        .file-dropzone {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 12px;
          background: var(--surface);
          cursor: pointer;
          transition: border-color .2s ease, background .2s ease;
        }
        .file-dropzone[data-dragging="true"] {
          border-color: var(--color-primary);
          background: rgba(37,99,235,.05);
        }
        .file-dz-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: space-between;
        }
        .file-dz-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .file-dz-label {
          font-weight: 700;
        }
        .file-grid {
          list-style: none;
          padding: 0;
          margin: 12px 0 0;
          display: grid;
          gap: 10px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .file-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 920px) {
          .file-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .file-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 8px;
          background: var(--surface);
          display: grid;
          grid-template-columns: 64px 1fr auto;
          gap: 8px;
          align-items: center;
        }
        .file-thumb {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .file-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .file-generic { font-size: 28px; }
        .file-meta { min-width: 0; }
        .file-title {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}

export { compressImageBlob };
