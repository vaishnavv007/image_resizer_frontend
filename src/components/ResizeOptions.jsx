const PRESETS = [
  { value: '', label: 'Custom' },
  { value: 'instagram_square', label: 'Instagram Square (1080x1080)' },
  { value: 'instagram_story', label: 'Instagram Story (1080x1920)' },
  { value: 'instagram_portrait', label: 'Instagram Portrait (1080x1350)' },
  { value: 'whatsapp_status', label: 'WhatsApp Status (1080x1920)' },
  { value: 'whatsapp_dp', label: 'WhatsApp Display Pic (640x640)' },
  { value: 'print_a4', label: 'Print A4 @300DPI (2480x3508)' },
  { value: 'print_letter', label: 'Print Letter @300DPI (2550x3300)' },
];

export default function ResizeOptions({ options, setOptions }) {
  const resize = options.resize;

  const unit = String(resize.unit || 'px');
  const showDpi = unit !== 'px' && unit !== '%';
  const presetValue = String(options.preset || '').toLowerCase();
  const isPrintPreset = presetValue.startsWith('print_') || presetValue.includes('a4') || presetValue.includes('letter');
  const effectiveDpi =
    Number(options.dpi) ||
    (presetValue && !isPrintPreset ? 72 : isPrintPreset ? 300 : showDpi ? 300 : 72);
  const isJpeg = String(options.format || 'jpeg').toLowerCase() === 'jpeg';
  const canEditDpi = showDpi;

  function setResize(patch) {
    setOptions((prev) => ({
      ...prev,
      resize: { ...prev.resize, ...patch },
    }));
  }

  function setDpi(value) {
    setOptions((prev) => ({
      ...prev,
      dpi: value,
    }));
  }

  return (
    <div className="card">
      <h3>Processing Options</h3>

      <div className="grid2">
        <label>
          Preset
          <select
            value={options.preset}
            onChange={(e) => setOptions((p) => ({ ...p, preset: e.target.value }))}
          >
            {PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Output Format
          <select
            value={options.format}
            onChange={(e) => {
              const nextFormat = e.target.value;
              setOptions((p) => ({
                ...p,
                format: nextFormat,
                background: String(nextFormat).toLowerCase() === 'jpeg' ? 'white' : p.background,
              }));
            }}
          >
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
          </select>
        </label>
      </div>

      <div className="grid2">
        <label>
          Quality: {options.quality}
          <input
            type="range"
            min={1}
            max={100}
            value={options.quality}
            onChange={(e) => setOptions((p) => ({ ...p, quality: Number(e.target.value) }))}
          />
        </label>

        <label>
          Background
          <select
            value={options.background}
            onChange={(e) => setOptions((p) => ({ ...p, background: e.target.value }))}
            disabled={isJpeg}
          >
            <option value="white">White</option>
            <option value="transparent">Transparent</option>
          </select>
        </label>
      </div>

      {isJpeg ? <div className="muted">JPEG does not support transparency; background will be white.</div> : null}
      {options.removeMetadata ? <div className="muted">Metadata will be removed from output images.</div> : null}
      {options.removeMetadata ? <div className="muted">Note: DPI is stored in image metadata. When metadata is removed, DPI may not be embedded in the output file.</div> : null}

      {canEditDpi ? (
        <div className="grid2">
          <label>
            DPI
            <input
              type="number"
              min={1}
              value={options.dpi}
              onChange={(e) => setDpi(e.target.value)}
              placeholder="e.g. 300"
            />
          </label>
          <div className="muted" style={{ alignSelf: 'end' }}>
            Effective DPI: {effectiveDpi}
          </div>
        </div>
      ) : (
        <div className="muted">Effective DPI: {effectiveDpi}</div>
      )}

      <div className="grid2">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={options.crop}
            onChange={(e) => setOptions((p) => ({ ...p, crop: e.target.checked }))}
          />
          Crop (cover)
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={options.removeMetadata}
            onChange={(e) => setOptions((p) => ({ ...p, removeMetadata: e.target.checked }))}
          />
          Remove metadata
        </label>
      </div>

      {options.preset ? null : (
        <>
          <div className="grid3">
            <label>
              Width
              <input
                type="number"
                min={1}
                value={resize.width}
                onChange={(e) => setResize({ width: e.target.value })}
                placeholder="e.g. 800"
              />
            </label>

            <label>
              Height
              <input
                type="number"
                min={1}
                value={resize.height}
                onChange={(e) => setResize({ height: e.target.value })}
                placeholder="e.g. 600"
              />
            </label>

            <label>
              Unit
              <select value={resize.unit} onChange={(e) => setResize({ unit: e.target.value })}>
                <option value="px">px</option>
                <option value="%">%</option>
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="inch">inch</option>
              </select>
            </label>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={resize.lockAspect}
              onChange={(e) => setResize({ lockAspect: e.target.checked })}
            />
            Lock aspect ratio
          </label>

          <div className="muted">
            For mm/cm/inch conversion, DPI can be set above.
          </div>
        </>
      )}
    </div>
  );
}
