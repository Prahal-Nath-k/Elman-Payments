import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Payments } from './pages/Payments';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { PendingPayment } from './pages/PendingPayment';

// ─── Dev / payment flags ──────────────────────────────────────────────────────
// Set IS_DEV_BYPASS = true to skip payment wall for all users in this build.
// Otherwise, use the in-app "Developer Access Bypass" button to set a localStorage flag.
const IS_DEV_BYPASS = false;

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authSaved = localStorage.getItem('elman_auth') === 'true';

    // If IS_DEV_BYPASS is false, always scrub any stale dev flag from localStorage
    // so a previously-set bypass can never silently grant access.
    if (!IS_DEV_BYPASS) {
      localStorage.removeItem('elman_dev_bypass');
    }
    const devSaved = IS_DEV_BYPASS; // only trust the compile-time constant

    // isPaid flag: set to true once a real payment confirmation is received
    const paidSaved = localStorage.getItem('elman_paid') === 'true';

    setIsAuth(authSaved);
    setIsPaid(paidSaved);
    setIsDevMode(devSaved);
    setLoading(false);
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('elman_auth');
    localStorage.removeItem('elman_dev_bypass');
    localStorage.removeItem('elman_paid');
    setIsAuth(false);
    setIsPaid(false);
    setIsDevMode(false);
  };

  if (loading) return null;

  /** Determines what the authenticated user sees:
   *  - dev mode OR paid → full app
   *  - otherwise        → payment wall
   */
  const hasAccess = isDevMode || isPaid;

  return (
    <Router>
      <Routes>
        {/* Public: login */}
        <Route
          path="/login"
          element={!isAuth ? <Login onLogin={setIsAuth} /> : <Navigate to="/" replace />}
        />

        {/* Payment wall — shown to authenticated but unpaid, non-dev users */}
        <Route
          path="/pending-payment"
          element={
            !isAuth
              ? <Navigate to="/login" replace />
              : hasAccess
                ? <Navigate to="/" replace />
                : <PendingPayment />
          }
        />

        {/* Protected app shell */}
        <Route
          path="/"
          element={
            !isAuth
              ? <Navigate to="/login" replace />
              : !hasAccess
                ? <Navigate to="/pending-payment" replace />
                : <Layout onLogout={handleLogout} />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
