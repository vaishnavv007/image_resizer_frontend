import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>Secure Image Processor</h1>
        <p className="muted">
          Upload images, resize using multiple units, convert formats, compress, crop, remove metadata, and
          download results as a ZIP.
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
