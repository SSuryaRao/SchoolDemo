import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { demoCredentials } from '../../data/users';
import toast from 'react-hot-toast';

const roleHomeMap = {
  admin: '/admin/dashboard',
  student: '/student/portal',
  parent: '/parent/portal',
};

const roleColors = {
  admin: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
  student: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
  parent: 'border-green-200 bg-green-50 hover:bg-green-100',
};

const roleBadge = {
  admin: 'badge-blue',
  student: 'badge-purple',
  parent: 'badge-green',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function autoFill(cred) {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600)); // Simulate network
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
      navigate(roleHomeMap[result.user.role]);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white text-xl font-bold">SA</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">Springfield<br />Academy</h1>
          <p className="text-primary-200 mt-3 text-lg">Empowering Education Through Technology</p>
        </div>
        <div className="relative space-y-4">
          {[
            { icon: '📊', text: 'Real-time attendance & grade tracking' },
            { icon: '💬', text: 'Seamless parent-teacher communication' },
            { icon: '💳', text: 'Automated fee management & receipts' },
            { icon: '📅', text: 'Smart scheduling & event calendar' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/90">
              <span className="text-xl">{icon}</span>
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
        <p className="text-primary-300 text-xs relative">© 2026 EduManage Pro — Demo Version</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <span className="font-bold text-gray-900">Springfield Academy</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
          <p className="text-gray-500 mt-1 text-sm">Access your school management portal</p>

          {/* Demo credential cards */}
          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Click to use demo credentials</p>
            {demoCredentials.map((cred) => (
              <button
                key={cred.role}
                onClick={() => autoFill(cred)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${roleColors[cred.role]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`badge ${roleBadge[cred.role]} mb-1`}>{cred.label}</span>
                    <p className="text-xs text-gray-600 mt-1">{cred.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">click to fill →</span>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.edu"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
