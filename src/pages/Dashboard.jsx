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

        setSingleBlob(blob);
        setSingleName(name);
        downloadBlob({ blob, filename: name });
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

  return (
    <div className="container">
      <div className="row space">
        <div>
          <h2>Dashboard</h2>
          <div className="muted">Logged in as {user?.email}</div>
        </div>
        <button className="btn secondary" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="grid">
        <ImageUploader files={files} setFiles={setFiles} />
        <ResizeOptions options={options} setOptions={setOptions} />
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

      <BatchPreview items={results} zipBlob={zipBlob} onClear={clearResults} />
    </div>
  );
}
