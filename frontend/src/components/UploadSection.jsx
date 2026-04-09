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
  recentSearches,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);
  
  // Extra fields
  const [personInfo, setPersonInfo] = useState({
    name: '', age: '', gender: '', lastSeenLocation: '', missingDate: '', contactInfo: ''
  });
  const [touched, setTouched] = useState({});

  const handleInfoChange = (e) => {
    setPersonInfo({ ...personInfo, [e.target.name]: e.target.value });
    setTouched({ ...touched, [e.target.name]: true });
  };

  const getErrors = () => {
    const errors = {};
    if (!personInfo.name.trim()) errors.name = 'Name is required';
    if (!personInfo.age || isNaN(personInfo.age)) errors.age = 'Please enter valid age';
    if (!personInfo.lastSeenLocation.trim()) errors.lastSeenLocation = 'Last seen location is required';
    if (!personInfo.missingDate.trim()) errors.missingDate = 'Missing date/time is required';
    if (!selectedFile) errors.file = 'Image is required';
    return errors;
  };
  
  const errors = getErrors();
  const isFormValid = Object.keys(errors).length === 0;

  const submitSearch = () => {
    if (!isFormValid) {
      // Mark all as touched just in case
      setTouched({ name: true, age: true, gender: true, lastSeenLocation: true, missingDate: true, contactInfo: true });
      return;
    }
    const formData = new FormData();
    Object.keys(personInfo).forEach(key => formData.append(key, personInfo[key]));
    onSearch(formData);
  };

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
          🔍 Report & Search Missing Person
        </h2>
        
        {/* Guidelines */}
        <div className="guidelines-banner" style={{ background: 'var(--bg-2)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px', textTransform: 'uppercase' }}>📸 Image Upload Guidelines</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', fontSize: '12px', color: 'var(--text-dim)' }}>
            <div>
              <div style={{ color: 'var(--success)', fontWeight: 'bold', marginBottom: '4px' }}>✅ Good Images</div>
              <ul style={{ paddingLeft: '16px' }}>
                <li>Face clearly visible</li>
                <li>Front view</li>
                <li>Good lighting</li>
              </ul>
            </div>
            <div>
              <div style={{ color: 'var(--danger)', fontWeight: 'bold', marginBottom: '4px' }}>❌ Bad Images</div>
              <ul style={{ paddingLeft: '16px' }}>
                <li>Blurred or low-light</li>
                <li>Group photos (multiple faces)</li>
                <li>Wearing sunglasses/masks</li>
              </ul>
            </div>
          </div>
        </div>

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
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-dim)' }}>
            Helper: Upload clear front-facing image
          </div>
          {touched.file && !selectedFile && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px' }}>
              Image is required
            </div>
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



        {/* Input Form Box */}
        {selectedFile && previewUrl && (
          <div className="upload-form" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Missing Person Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>Full Name *</label>
                <input required type="text" name="name" value={personInfo.name} onBlur={(e) => setTouched({ ...touched, [e.target.name]: true })} onChange={handleInfoChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="E.g. John Doe" />
                {touched.name && errors.name && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>Age *</label>
                <input required type="number" name="age" value={personInfo.age} onBlur={(e) => setTouched({ ...touched, [e.target.name]: true })} onChange={handleInfoChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="E.g. 34" />
                {touched.age && errors.age && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.age}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>Gender</label>
                <select name="gender" value={personInfo.gender} onChange={handleInfoChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>Missing Date / Time *</label>
                <input required type="text" name="missingDate" value={personInfo.missingDate} onBlur={(e) => setTouched({ ...touched, [e.target.name]: true })} onChange={handleInfoChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="E.g. 10th Oct, 2 PM" />
                {touched.missingDate && errors.missingDate && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.missingDate}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>Last Seen Location *</label>
              <input required type="text" name="lastSeenLocation" value={personInfo.lastSeenLocation} onBlur={(e) => setTouched({ ...touched, [e.target.name]: true })} onChange={handleInfoChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="E.g. Market Area" />
              {touched.lastSeenLocation && errors.lastSeenLocation && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.lastSeenLocation}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>Contact Information</label>
              <input type="text" name="contactInfo" value={personInfo.contactInfo} onChange={handleInfoChange} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="E.g. Call 911 or 555-0192" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="upload-actions">
          <button
            id="search-btn"
            className="btn btn-primary"
            onClick={submitSearch}
            disabled={!isFormValid || isLoading}
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
            <strong>Prototype:</strong> Connected to real-time memory cases processing.
          </span>
        </div>

        {/* Recent Searches */}
        {recentSearches && recentSearches.length > 0 && !selectedFile && !isLoading && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Recent Searches</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentSearches.map(search => (
                <li key={search.id} style={{ background: 'var(--bg-2)', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '4px' }}>{search.name}</div>
                    <div style={{ color: 'var(--text-dim)' }}>Last seen: {search.lastSeenLocation}</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>{search.date} {search.time}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
