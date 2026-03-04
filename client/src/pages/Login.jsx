import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_PATHS = {
  admin: '/admin/dashboard',
  receptionist: '/reception/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/home',
};

function normalizePhone(value) {
  return (value || '').replace(/\D/g, '');
}

function isValidPhone(phone) {
  const digits = normalizePhone(phone);
  return digits.length >= 9 && digits.length <= 15;
}

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, loading, error } = useAuth();
  const displayError = validationError || error;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setValidationError('');
    const trimmedPhone = (phone || '').trim();
    const trimmedPassword = (password || '').trim();
    if (!trimmedPhone || !trimmedPassword) {
      setValidationError('Telefon raqam va parol majburiy');
      return;
    }
    if (!isValidPhone(trimmedPhone)) {
      setPhoneError('Telefon raqam kamida 9 ta raqamdan iborat bo\'lishi kerak');
      return;
    }
    const normalized = normalizePhone(trimmedPhone);
    try {
      const { user } = await login(normalized, trimmedPassword);
      const role = user?.role || 'patient';
      const path = ROLE_PATHS[role] || ROLE_PATHS.patient;
      navigate(path, { replace: true });
    } catch (err) {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/30" />
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-clinical-lg border border-slate-100 p-8 md:p-10">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-200">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Hospital Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                {displayError}
              </div>
            )}

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d+\s]/g, '');
                  setPhone(v);
                  setPhoneError('');
                  setValidationError('');
                }}
                required
                autoComplete="tel"
                placeholder="Enter phone number"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-600">{phoneError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationError('');
                }}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Sign in with phone number and password
          </p>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          © 2026 Hospital Management System
        </p>
      </div>
    </div>
  );
}

export default Login;
