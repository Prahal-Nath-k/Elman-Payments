import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Payments } from './pages/Payments';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authSaved = localStorage.getItem('elman_auth');
    if (authSaved === 'true') {
      setIsAuth(true);
    }
    setLoading(false);
  }, []);

  if (loading) return null; // Or a subtle spinner

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuth ? <Login onLogin={setIsAuth} /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/" 
          element={isAuth ? <Layout onLogout={() => setIsAuth(false)} /> : <Navigate to="/login" replace />}
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
