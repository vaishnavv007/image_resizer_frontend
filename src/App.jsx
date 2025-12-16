import { Link, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

export default function App() {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      <header className="header">
        <div className="headerInner">
          <Link className="brand" to="/">
            Image Processor
          </Link>
          {!isAuthenticated && (
            <nav className="row gap">
              <Link to="/about" className="muted small">
                About
              </Link>
            </nav>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
