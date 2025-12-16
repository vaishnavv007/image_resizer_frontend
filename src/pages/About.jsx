import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container">
      <div className="card">
        <h1>About Image Processor</h1>
        <p className="muted">
          This web app helps you quickly resize, convert, and clean up your images directly in the browser.
          Nothing to install and no design skills required.
        </p>

        <h2>What you can do</h2>
        <ul>
          <li>Upload single images or batches of images</li>
          <li>Resize by width and height in pixels or by percentage</li>
          <li>Convert between popular formats like JPEG, PNG, and WebP</li>
          <li>Adjust quality and DPI to control file size</li>
          <li>Optionally crop and change background color</li>
          <li>Remove metadata for extra privacy</li>
          <li>Download all processed files at once as a ZIP</li>
        </ul>

        <h2>How it works</h2>
        <p className="muted">
          Sign up or log in, go to the dashboard, choose your images, configure your resize and conversion
          options, then process and download. Your settings are applied to every selected image so you can
          handle entire batches in one step.
        </p>

        <p className="muted">
          You can also convert processed images to and from Base64 strings, which is useful for embedding
          images in code, HTML, or JSON.
        </p>

        <div className="row gap" style={{ marginTop: 16 }}>
          <Link className="btn" to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
