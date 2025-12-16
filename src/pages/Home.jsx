import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>Online Image Resizer & Converter</h1>
        <p className="muted">
          Upload one or more images, resize them in pixels or percentages, change the format, adjust quality,
          remove metadata, and download everything in a single ZIP – all from your browser.
        </p>

        <div className="row gap">
          {isAuthenticated ? (
            <Link className="btn" to="/dashboard">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link className="btn" to="/login">
                Login
              </Link>
              <Link className="btn secondary" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
