import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, CheckCircle } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Button, Input, Card } from '../../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card title="Forgot Password">
          {sent ? (
            <div className="text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-primary-500" />
              <p className="text-sm text-gray-600">If an account exists for {email}, a reset link has been sent.</p>
              <Link to="/auth/login" className="mt-4 inline-block text-sm text-primary-600 hover:underline">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">Enter your email and we'll send a reset link.</p>
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
              <Link to="/auth/login" className="block text-center text-sm text-primary-600 hover:underline">Back to login</Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const { token: paramToken } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(paramToken || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset successful!');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card title="Reset Password">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!paramToken && <Input label="Reset Token" value={token} onChange={(e) => setToken(e.target.value)} required />}
            <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authApi.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card>
        {status === 'loading' && <p className="text-center text-gray-500">Verifying email...</p>}
        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="text-lg font-semibold">Email Verified!</h2>
            <Link to="/auth/login" className="mt-4 inline-block text-primary-600 hover:underline">Sign in now</Link>
          </div>
        )}
        {status === 'error' && (
          <div className="text-center">
            <p className="text-red-500">Verification failed or link expired.</p>
            <Link to="/auth/login" className="mt-4 inline-block text-primary-600 hover:underline">Back to login</Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export function VerifyPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card>
        <div className="text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-500">We've sent a verification link to your email. Please verify before accessing the dashboard.</p>
          <Link to="/auth/login" className="mt-4 inline-block text-sm text-primary-600 hover:underline">Back to login</Link>
        </div>
      </Card>
    </div>
  );
}
