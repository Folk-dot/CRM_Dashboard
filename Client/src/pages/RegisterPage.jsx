import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/index.js';
import { Alert } from '../components/ui/index.jsx';

const ROLES = ['receptionist', 'doctor', 'admin'];

export default function RegisterPage() {
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ first_name:'', last_name:'', email:'', password:'', role:'receptionist' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-400 mt-1">DentaCare CRM</p>
        </div>

        <div className="card p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <Alert type="error" message={error} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First name</label>
                <input name="first_name" required value={form.first_name} onChange={onChange} className="input" placeholder="Somchai" />
              </div>
              <div>
                <label className="label">Last name</label>
                <input name="last_name" required value={form.last_name} onChange={onChange} className="input" placeholder="W." />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required value={form.email} onChange={onChange} className="input" placeholder="you@dentacare.th" />
            </div>

            <div>
              <label className="label">Password</label>
              <input name="password" type="password" required value={form.password} onChange={onChange} className="input" placeholder="••••••••" />
            </div>

            <div>
              <label className="label">Role</label>
              <select name="role" value={form.role} onChange={onChange} className="input">
                {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
