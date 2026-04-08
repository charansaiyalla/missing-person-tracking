import { useRef, useState } from 'react';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadSection({
  selectedFile,
  previewUrl,
  isLoading,
  onFileSelect,
  onClear,
  onSearch,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const validate = (file) => {
    if (!file) return 'No file selected';
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPG, PNG, or WebP images are supported';
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB}MB`;
    return null;
  };

  const handleFile = (file) => {
    const err = validate(file);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    onFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const dropzoneClass = [
    'upload-dropzone',
    dragging ? 'dragging' : '',
    selectedFile ? 'has-file' : '',
  ].filter(Boolean).join(' ');

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <div className="upload-card">
        <h2 id="upload-title" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' }}>
          🔍 Search Missing Person
        </h2>

        {/* Dropzone */}
        <div
          className={dropzoneClass}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !selectedFile && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload image of missing person"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <span className="upload-icon" aria-hidden="true">
            {selectedFile ? '✅' : '📤'}
          </span>
          {selectedFile ? (
            <>
              <div className="upload-dropzone-title">Image selected</div>
              <div className="upload-dropzone-sub">Ready to scan against CCTV dataset</div>
            </>
          ) : (
            <>
              <div className="upload-dropzone-title">Drop the person's photo here</div>
              <div className="upload-dropzone-sub">
                or{' '}
                <span
                  className="upload-browse"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  role="button"
                  tabIndex={0}
                >
                  browse files
                </span>
                {' '}(JPG, PNG, WebP — max 10 MB)
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            id="file-input"
            className="upload-input"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleInputChange}
            aria-hidden="true"
          />
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="info-banner" style={{ background: 'var(--danger-dim)', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--danger)' }} role="alert">
            <span className="info-banner-icon">⚠️</span>
            {validationError}
          </div>
        )}

        {/* Preview */}
        {selectedFile && previewUrl && (
          <div className="upload-preview">
            <img
              src={previewUrl}
              alt="Preview of uploaded missing person photo"
              className="upload-preview-thumb"
            />
            <div className="upload-preview-info">
              <div className="upload-preview-name">{selectedFile.name}</div>
              <div className="upload-preview-size">{formatBytes(selectedFile.size)}</div>
            </div>
            <button
              className="upload-preview-remove"
              onClick={onClear}
              aria-label="Remove selected image"
              title="Remove image"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="upload-actions">
          <button
            id="search-btn"
            className="btn btn-primary"
            onClick={onSearch}
            disabled={!selectedFile || isLoading}
            aria-label="Start face recognition search"
          >
            {isLoading ? (
              <>
                <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} aria-hidden="true" />
                Analyzing...
              </>
            ) : (
              <>🔍 Search CCTV Footage</>
            )}
          </button>
          {selectedFile && !isLoading && (
            <button
              id="clear-btn"
              className="btn btn-ghost"
              onClick={onClear}
              aria-label="Clear and start over"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mock Mode Info */}
        <div className="info-banner" role="note">
          <span className="info-banner-icon">ℹ️</span>
          <span>
            <strong>Prototype 1:</strong> Not Finalised yet.
          </span>
        </div>
      </div>
    </section>
  );
}
