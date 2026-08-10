import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Select, Card } from '../../components/ui';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', rollNumber: '', companyId: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.role === 'recruiter' && !form.companyId) return toast.error('Company ID is required. Contact admin to register your company first.');
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (form.role === 'student') payload.rollNumber = form.rollNumber;
      if (form.role === 'recruiter') payload.companyId = form.companyId;
      await signup(payload);
      toast.success('Account created! Please verify your email.');
      navigate('/auth/verify-pending');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600"><GraduationCap className="h-7 w-7 text-white" /></div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[{ value: 'student', label: 'Student' }, { value: 'recruiter', label: 'Recruiter' }]} />
            {form.role === 'student' && <Input label="Roll Number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />}
            {form.role === 'recruiter' && (
              <div>
                <Input label="Company ID" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} placeholder="Ask admin for your company ID" />
                <p className="mt-1 text-xs text-gray-400">Admin must create the company first and share the ID with you.</p>
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Already have an account? <Link to="/auth/login" className="text-primary-600 hover:underline">Sign in</Link></p>
        </Card>
      </div>
    </div>
  );
}
