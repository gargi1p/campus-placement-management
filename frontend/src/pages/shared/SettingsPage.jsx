import { useAuth } from '../../context/AuthContext';
import { Card, Badge } from '../../components/ui';
import { capitalize } from '../../utils/helpers';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <Card title="Account Information">
        <dl className="space-y-4">
          <div><dt className="text-sm text-gray-500">Name</dt><dd className="font-medium">{user?.name}</dd></div>
          <div><dt className="text-sm text-gray-500">Email</dt><dd className="font-medium">{user?.email}</dd></div>
          <div><dt className="text-sm text-gray-500">Role</dt><dd><Badge className="bg-primary-100 text-primary-700 capitalize">{user?.role}</Badge></dd></div>
          <div><dt className="text-sm text-gray-500">Email Verified</dt><dd><Badge className={user?.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>{user?.isVerified ? 'Verified' : 'Pending'}</Badge></dd></div>
          <div><dt className="text-sm text-gray-500">Status</dt><dd><Badge className="bg-green-100 text-green-700">{capitalize(user?.isActive !== false ? 'active' : 'inactive')}</Badge></dd></div>
        </dl>
      </Card>
    </div>
  );
}
