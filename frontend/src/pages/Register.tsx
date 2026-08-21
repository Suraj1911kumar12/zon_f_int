import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await register(name, email, password);
      toast.success('Account created successfully');
      navigate('/');
    } catch (err: any) {
      const errMsg = err.response?.data?.msg || 'Failed to register';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-30 -ml-20 -mb-20"></div>

      <div className="bg-white p-8 md:p-10 rounded-2xl w-full max-w-md shadow-xl border border-slate-100 z-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 text-center mb-2">Get Started</h2>
        <p className="text-sm text-slate-500 text-center mb-8">Create an account to manage your tasks</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition duration-200 text-slate-800"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition duration-200 text-slate-800"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition duration-200 text-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition duration-200 text-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
