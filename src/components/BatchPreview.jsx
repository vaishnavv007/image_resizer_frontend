import { useEffect, useMemo, useState } from 'react';

function ImageModal({ src, alt, onClose }) {
  if (!src) return null;

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'downloaded-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          position: 'relative',
          maxWidth: '90%', 
          maxHeight: '90%',
          cursor: 'default',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          gap: '10px',
          zIndex: 1001
        }}>
          <button 
            onClick={handleDownload}
            style={{
              padding: '8px 16px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Download
          </button>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Close
          </button>
        </div>

        <img 
          src={src} 
          alt={alt} 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '80vh',
            border: '2px solid white',
            borderRadius: '4px',
          }} 
        />
        <div style={{ 
          marginTop: '10px', 
          color: 'white', 
          textAlign: 'center',
          wordBreak: 'break-all',
        }}>
          {alt}
        </div>
      </div>
    </div>
  );
}

export default function BatchPreview({ items, zipBlob, onClear }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const count = items.length;

  const url = useMemo(() => {
    if (!zipBlob) return null;
    return URL.createObjectURL(zipBlob);
  }, [zipBlob]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const handleImageClick = (item) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="card">
      <div className="row space">
        <h3>Results ({count})</h3>
        <div className="row gap">
          {url ? (
            <a className="btn" href={url} download="processed_images.zip">
              Download ZIP
            </a>
          ) : null}
          <button className="btn secondary" type="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      {count === 0 ? <div className="muted">No results yet.</div> : null}

      <div className="gridPreview">
        {items.map((it) => (
          <div key={it.name} className="previewItem" onClick={() => handleImageClick(it)} style={{ cursor: 'pointer' }}>
            <img src={it.url} alt={it.name} style={{ maxWidth: '100%', height: 'auto' }} />
            <div className="muted small" style={{ marginTop: '8px', textAlign: 'center' }}>
              <div style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '150px',
                margin: '0 auto'
              }}>
                {it.name}
              </div>
              <div className="muted" style={{ fontSize: '0.8em' }}>Click to preview</div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageModal 
          src={selectedImage.url} 
          alt={selectedImage.name} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
}
