import { useEffect, useMemo } from 'react';

export default function BatchPreview({ items, zipBlob, onClear }) {
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
          <div key={it.name} className="previewItem">
            <img src={it.url} alt={it.name} />
            <div className="muted small">{it.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
