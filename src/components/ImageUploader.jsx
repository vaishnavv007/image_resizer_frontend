import { useState } from 'react';

export default function ImageUploader({ 
  files, 
  setFiles, 
  onConvertToBase64, 
  onPasteBase64,
  hasProcessedImage,
  outputFormat = 'PNG' 
}) {
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  
  function onChange(e) {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  }

  return (
    <div className="card">
      <h3>Upload Images</h3>
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={onChange} 
        style={{ marginBottom: '1rem' }}
      />
      <div className="muted" style={{ marginBottom: '1rem' }}>
        Selected: {files.length} file(s)
      </div>
      
      <div className="section" style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
        <h4>Base64 Tools</h4>
        <div className="grid2" style={{ gap: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <button 
              className="btn secondary" 
              type="button" 
              onClick={() => hasProcessedImage && setShowFormatOptions(!showFormatOptions)}
              disabled={!hasProcessedImage}
              title={!hasProcessedImage ? "Process an image first" : "Convert to Base64"}
            >
              To Base64
            </button>
            {showFormatOptions && (
              <div className="format-options" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#2d3748',
                borderRadius: '0 0 4px 4px',
                padding: '0.5rem',
                zIndex: 10,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <div style={{ color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', textAlign: 'center' }}>Select Format</div>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  <button 
                    className="btn" 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onConvertToBase64('png');
                      setShowFormatOptions(false);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.875rem',
                      width: '100%',
                      textAlign: 'left',
                      backgroundColor: outputFormat === 'PNG' ? '#4a5568' : 'transparent'
                    }}
                  >
                    PNG - Lossless with transparency
                  </button>
                  <button 
                    className="btn" 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onConvertToBase64('jpeg', 0.9);
                      setShowFormatOptions(false);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.875rem',
                      width: '100%',
                      textAlign: 'left',
                      backgroundColor: outputFormat === 'JPEG' ? '#4a5568' : 'transparent'
                    }}
                  >
                    JPEG - Best for photos
                  </button>
                  <button 
                    className="btn" 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onConvertToBase64('webp', 0.8);
                      setShowFormatOptions(false);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.875rem',
                      width: '100%',
                      textAlign: 'left',
                      backgroundColor: outputFormat === 'WEBP' ? '#4a5568' : 'transparent'
                    }}
                  >
                    WebP - Modern format
                  </button>
                </div>
              </div>
            )}
          </div>
          <button 
            className="btn secondary" 
            type="button" 
            onClick={onPasteBase64}
            title="Paste Base64 and convert to image"
          >
            From Base64
          </button>
        </div>
        <div className="base64-output-format" style={{ marginTop: '0.5rem' }}>
          <span>Current format: <strong>{outputFormat}</strong></span>
        </div>
        <p className="base64-helper">
          {hasProcessedImage 
            ? 'Click "To Base64" to convert the processed image to Base64'
            : 'Process an image first to enable Base64 conversion'}
        </p>
        <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.85em' }}>
          Convert between images and Base64 strings. Click "To Base64" to select output format.
        </p>
      </div>
    </div>
  );
}
