export default function ImageUploader({ files, setFiles }) {
  function onChange(e) {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  }

  return (
    <div className="card">
      <h3>Upload Images</h3>
      <input type="file" multiple accept="image/*" onChange={onChange} />
      <div className="muted">Selected: {files.length} file(s)</div>
    </div>
  );
}
