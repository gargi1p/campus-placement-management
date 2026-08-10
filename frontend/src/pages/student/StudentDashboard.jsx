import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ClipboardList, Calendar, Award, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../api/student';
import { offerApi, notificationApi } from '../../api/common';
import { StatCard, Card, Badge, Button } from '../../components/ui';
import { PageLoader } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/States';
import { capitalize, formatDate, getStatusColor } from '../../utils/helpers';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appTotal, setAppTotal] = useState(0);
  const [offers, setOffers] = useState([]);
  const [pendingAssessments, setPendingAssessments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      studentApi.getProfile(),
      studentApi.getEligibleDrives(),
      studentApi.getApplications({ limit: 10 }),
      offerApi.getMy(),
      notificationApi.getAll({ limit: 50 }),
    ]).then(([p, e, a, o, n]) => {
      setProfile(p.data.data);
      setEligible(e.data.data || []);
      setApplications(a.data.data || []);
      setAppTotal(a.data.meta?.total || a.data.data?.length || 0);
      setOffers(o.data.data || []);
      setPendingAssessments((n.data.data || []).filter((x) => x.type === 'assessment' && !x.isRead).length);
    }).catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} />;

  const eligibleCount = eligible.filter((x) => x.eligibility?.isEligible).length;
  const upcomingInterviews = applications.filter((a) => ['interview_scheduled', 'technical_interview', 'hr_interview'].includes(a.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
        <p className="text-sm text-gray-500">Track your placement journey</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Profile Completion" value={`${profile?.profileCompletion || 0}%`} icon={TrendingUp} color="primary" />
        <StatCard title="Eligible Jobs" value={eligibleCount} icon={Target} color="green" />
        <StatCard title="Applications" value={appTotal} icon={ClipboardList} color="amber" />
        <StatCard title="Upcoming Interviews" value={upcomingInterviews} icon={Calendar} color="amber" />
        <StatCard title="Pending Assessments" value={pendingAssessments} icon={FileText} color="red" />
        <StatCard title="Offers" value={offers.length} icon={Award} color="purple" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Placement Status" action={<Badge className={getStatusColor(profile?.placementStatus)}>{capitalize(profile?.placementStatus)}</Badge>}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Branch</span><span className="font-medium">{profile?.branch || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">CGPA</span><span className="font-medium">{profile?.cgpa ?? '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Graduation</span><span className="font-medium">{profile?.graduationYear || '—'}</span></div>
            <Link to="/student/profile"><Button variant="secondary" size="sm" className="mt-2 w-full">Complete Profile</Button></Link>
          </div>
        </Card>

        <Card title="Recent Applications">
          {applications.length ? applications.slice(0, 4).map((app) => (
            <div key={app._id} className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{app.jobDrive?.title}</p>
                <p className="text-xs text-gray-500">{app.jobDrive?.company?.name}</p>
              </div>
              <Badge className={getStatusColor(app.status)}>{capitalize(app.status)}</Badge>
            </div>
          )) : <p className="text-sm text-gray-500">No applications yet</p>}
          <Link to="/student/applications" className="mt-3 block text-sm text-primary-600 hover:underline">View all →</Link>
        </Card>
      </div>

      <Card title="Eligible Job Drives" action={<Link to="/student/jobs"><Button size="sm">Browse Jobs</Button></Link>}>
        {eligible.filter((x) => x.eligibility?.isEligible).length ? eligible.filter((x) => x.eligibility?.isEligible).slice(0, 3).map(({ drive }) => (
          <div key={drive._id} className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
            <div>
              <p className="font-medium">{drive.title}</p>
              <p className="text-xs text-gray-500">{drive.company?.name} · Deadline: {formatDate(drive.applicationDeadline)}</p>
            </div>
            <Link to={`/student/jobs/${drive._id}`}><Button size="sm" variant="secondary">View</Button></Link>
          </div>
        )) : <p className="text-sm text-gray-500">No eligible drives</p>}
      </Card>
    </div>
  );
}
