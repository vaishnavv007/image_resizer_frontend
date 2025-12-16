import { useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BatchPreview from '../components/BatchPreview';
import ImageUploader from '../components/ImageUploader';
import ResizeOptions from '../components/ResizeOptions';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [zipBlob, setZipBlob] = useState(null);
  const [results, setResults] = useState([]);
  const [singleBlob, setSingleBlob] = useState(null);
  const [singleName, setSingleName] = useState('');
  const [base64String, setBase64String] = useState('');
  const [notification, setNotification] = useState(null);
  const [outputFormat, setOutputFormat] = useState('PNG');
  
  // Show notification and auto-hide after delay
  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Close notification
  const closeNotification = () => {
    setNotification(null);
  };

  const [options, setOptions] = useState({
    preset: '',
    format: 'jpeg',
    quality: 80,
    dpi: '',
    crop: false,
    removeMetadata: true,
    background: 'white',
    resize: {
      width: '',
      height: '',
      unit: 'px',
      lockAspect: true,
    },
  });

  const canProcess = useMemo(() => files.length > 0 && !busy, [files.length, busy]);

  useEffect(() => {
    return () => {
      for (const it of results) {
        if (it.url) URL.revokeObjectURL(it.url);
      }
    };
  }, [results]);

  function clearResults() {
    for (const it of results) {
      if (it.url) URL.revokeObjectURL(it.url);
    }
    setResults([]);
    setZipBlob(null);
    setSingleBlob(null);
    setSingleName('');
  }

  function parseFilenameFromContentDisposition(headerValue) {
    const raw = String(headerValue || '');
    if (!raw) return '';
    const m = raw.match(/filename\s*=\s*"?([^";]+)"?/i);
    return m?.[1] ? String(m[1]).trim() : '';
  }

  function downloadBlob({ blob, filename }) {
    // Programmatic download (works for API responses that don't navigate the browser).
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'processed-image';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function onProcess() {
    setError('');
    clearResults();

    try {
      setBusy(true);

      const fd = new FormData();
      for (const f of files) fd.append('images', f);
      fd.append('options', JSON.stringify(options));

      const res = await api.post('/images/process', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      const blob = res.data;

      // Single file returns the processed image directly (not a ZIP).
      if (files.length === 1) {
        const cd = res.headers?.['content-disposition'] || res.headers?.get?.('content-disposition');
        const inferred = parseFilenameFromContentDisposition(cd);
        const format = String(options.format || 'jpeg').toLowerCase();
        const ext = format === 'jpeg' ? 'jpg' : format;
        const fallbackName = `processed-image.${ext}`;
        const name = inferred || fallbackName;
        const url = URL.createObjectURL(blob);
        
        setSingleBlob(blob);
        setSingleName(name);
        setResults([{ name, url }]);
        return;
      }

      setZipBlob(blob);
      const zip = await JSZip.loadAsync(blob);
      const entries = Object.values(zip.files).filter((f) => !f.dir);

      const next = [];
      for (const entry of entries) {
        const b = await entry.async('blob');
        const url = URL.createObjectURL(b);
        next.push({ name: entry.name, url });
      }

      setResults(next);
    } catch (err) {
      let msg = 'Processing failed';
      const data = err?.response?.data;

      // Axios uses Blob for error payloads too when responseType='blob'.
      if (data && typeof Blob !== 'undefined' && data instanceof Blob) {
        try {
          const text = await data.text();
          try {
            const parsed = JSON.parse(text);
            msg = parsed?.message || msg;
          } catch {
            msg = text || msg;
          }
        } catch {
          msg = msg;
        }
      } else {
        msg = err?.response?.data?.message || err?.message || msg;
      }

      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await logout();
  }

  const handleConvertToBase64 = async (format = 'png', quality = 0.92) => {
    setOutputFormat(format.toUpperCase());
    if (!singleBlob && results.length === 0) {
      setError('No processed image available to convert to Base64');
      return;
    }

    try {
      const blob = singleBlob || (results[0]?.url ? await fetch(results[0].url).then(r => r.blob()) : null);
      if (!blob) {
        setError('No image data available');
        return;
      }
      
      // Convert to the selected format if different from original
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Convert to data URL with specified format
      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType, quality);
      
      // Convert data URL back to blob
      const res = await fetch(dataUrl);
      const processedBlob = await res.blob();
      
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64 = reader.result;
        setBase64String(base64);
        try {
          await navigator.clipboard.writeText(base64);
          showNotification(`Base64 (${format.toUpperCase()}) copied to clipboard!`);
        } catch (err) {
          // If clipboard write fails, show the base64 in a notification
          showNotification(`Copied to clipboard but could not access it. The image is in ${format.toUpperCase()} format.`);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read the image file');
      };
      
      reader.readAsDataURL(processedBlob);
    } catch (err) {
      setError('Error converting image to Base64: ' + (err.message || 'Unknown error'));
    }
  };

  const handlePasteBase64 = () => {
    const paste = prompt('Paste your Base64 string or data URL here:');
    if (!paste) return;

    try {
      // Handle data URL format (e.g., "data:image/png;base64,...")
      let base64Data = paste;
      const dataUrlMatch = paste.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      
      if (dataUrlMatch) {
        base64Data = dataUrlMatch[2];
      }

      // Convert Base64 to Blob
      const byteString = atob(base64Data);
      const mimeType = dataUrlMatch ? dataUrlMatch[1] : 'image/png';
      
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Determine file extension from MIME type or default to png
      const ext = mimeType ? mimeType.split('/')[1] || 'png' : 'png';
      const fileName = `converted-from-base64.${ext}`;
      
      // Update state with the new image
      setSingleBlob(blob);
      setSingleName(fileName);
      setResults([{ name: fileName, url }]);
      setError('');
      
    } catch (err) {
      setError('Invalid Base64 string. Please check your input and try again.');
    }
  };

  return (
    <div className="container">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.isError ? 'error' : ''}`}>
          {notification.message}
          <button className="close-btn" onClick={closeNotification}>&times;</button>
        </div>
      )}
      
      <div className="row space">
        <div>
          <h1>Dashboard</h1>
          <div className="muted">Logged in as {user?.email}</div>
        </div>
        <button className="btn secondary" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="grid">
        <ImageUploader 
          files={files} 
          setFiles={setFiles} 
          onConvertToBase64={handleConvertToBase64}
          onPasteBase64={handlePasteBase64}
          hasProcessedImage={!!(singleBlob || results.length > 0)}
          outputFormat={outputFormat}
        />
        <ResizeOptions 
          options={options} 
          setOptions={setOptions}
        />
      </div>


      <div className="card">
        <div className="row gap">
          <button className="btn" type="button" onClick={onProcess} disabled={!canProcess}>
            {busy ? 'Processing...' : 'Process Images'}
          </button>
          {singleBlob ? (
            <button
              className="btn secondary"
              type="button"
              onClick={() => downloadBlob({ blob: singleBlob, filename: singleName })}
              disabled={busy}
            >
              Download
            </button>
          ) : null}
          <button className="btn secondary" type="button" onClick={clearResults} disabled={busy}>
            Reset Results
          </button>
        </div>
        {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}
      </div>

      {(results.length > 0 || singleBlob) && (
        <BatchPreview items={results} zipBlob={zipBlob} onClear={clearResults} />
      )}
    </div>
  );
}
