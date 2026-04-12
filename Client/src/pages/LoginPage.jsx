import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert } from '../components/ui/index.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">DentaCare CRM</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <Alert type="error" message={error} />

            <div>
              <label className="label">Email</label>
              <input
                name="email" type="email" required
                value={form.email} onChange={onChange}
                className="input" placeholder="you@dentacare.th"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                name="password" type="password" required
                value={form.password} onChange={onChange}
                className="input" placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            No account?{' '}
            <Link to="/register" className="text-brand-500 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
