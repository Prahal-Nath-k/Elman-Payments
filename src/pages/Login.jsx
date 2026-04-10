import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CreditCard, Loader2, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username.trim())
        .eq('password_hash', password) // Simple exact match based on your custom requirements
        .single();

      if (dbError || !data) {
        throw new Error("Invalid username or password.");
      }

      // Success
      localStorage.setItem('elman_auth', 'true');
      onLogin(true);

    } catch (err) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border shadow-xl rounded-3xl p-8 z-10 relative overflow-hidden">
        
        {/* Subtle background shape inside card */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign In to ElmanPay</h1>
            <p className="text-muted-foreground mt-2 text-sm">Enter your credentials to access the payment tracking system.</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-center justify-center text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">Username</label>
                <div className="relative">
                    <User className="absolute left-3.5 top-3 w-5 h-5 text-muted-foreground" />
                    <input 
                        type="text" 
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                        placeholder="Enter your username"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-5 h-5 text-muted-foreground" />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                        placeholder="Enter your password"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-70"
            >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Authenticate'}
            </button>
        </form>
      </div>
    </div>
  );
}
