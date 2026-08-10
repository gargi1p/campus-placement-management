import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Calendar, FileText } from 'lucide-react';
import { recruiterApi } from '../../api/recruiter';
import { StatCard, Card, Badge, Button } from '../../components/ui';
import { PageLoader } from '../../components/ui/Skeleton';
import { capitalize, getStatusColor } from '../../utils/helpers';

export default function RecruiterDashboard() {
  const [profile, setProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([recruiterApi.getProfile(), recruiterApi.getDrives({ limit: 5 })])
      .then(([p, d]) => { setProfile(p.data.data); setDrives(d.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const published = drives.filter((d) => d.status === 'published').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <p className="text-sm text-gray-500">{profile?.company?.name}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Job Drives" value={drives.length} icon={Briefcase} />
        <StatCard title="Published" value={published} icon={FileText} color="green" />
        <StatCard title="Company" value={profile?.company?.name?.slice(0, 12)} icon={Users} color="purple" />
        <StatCard title="Status" value={profile?.isApproved ? 'Approved' : 'Pending'} icon={Calendar} color={profile?.isApproved ? 'green' : 'amber'} />
      </div>
      <Card title="Recent Drives" action={<Link to="/recruiter/drives"><Button size="sm">Manage</Button></Link>}>
        {drives.map((d) => (
          <div key={d._id} className="flex items-center justify-between border-b py-3 last:border-0">
            <div><p className="font-medium">{d.title}</p><p className="text-xs text-gray-500">{d.role}</p></div>
            <Badge className={getStatusColor(d.status)}>{capitalize(d.status)}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
