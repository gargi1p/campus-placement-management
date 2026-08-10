import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../api/student';
import { analyticsApi } from '../../api/common';
import { adminApi } from '../../api/admin';
import { recruiterApi } from '../../api/recruiter';
import { Card, Badge } from '../../components/ui';
import { PageLoader } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';
import { formatDate, formatDateTime, capitalize } from '../../utils/helpers';

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const evts = [];
      try {
        const [annRes] = await Promise.all([analyticsApi.getAnnouncements()]);
        (annRes.data.data || []).forEach((a) => evts.push({ date: a.createdAt, title: a.title, type: 'announcement', color: 'bg-purple-100 text-purple-700' }));

        if (user.role === 'student') {
          const [drives, apps] = await Promise.all([
            studentApi.getEligibleDrives(),
            studentApi.getApplications({ limit: 50 }),
          ]);
          (drives.data.data || []).forEach(({ drive }) => evts.push({ date: drive.applicationDeadline, title: `${drive.title} Deadline`, type: 'deadline', color: 'bg-red-100 text-red-700' }));
          (apps.data.data || []).filter((a) => a.status === 'interview_scheduled').forEach((a) => evts.push({ date: a.updatedAt, title: `Interview: ${a.jobDrive?.title}`, type: 'interview', color: 'bg-amber-100 text-amber-700' }));
        }

        if (user.role === 'admin') {
          const [drives, interviews] = await Promise.all([adminApi.getDrives({ limit: 50 }), adminApi.getInterviews()]);
          (drives.data.data || []).forEach((d) => evts.push({ date: d.applicationDeadline, title: `${d.title} Deadline`, type: 'deadline', color: 'bg-red-100 text-red-700' }));
          (interviews.data.data || []).forEach((i) => evts.push({ date: i.scheduledAt, title: `${capitalize(i.type)} Interview`, type: 'interview', color: 'bg-amber-100 text-amber-700' }));
        }

        if (user.role === 'recruiter') {
          const drives = await recruiterApi.getDrives({ limit: 50 });
          (drives.data.data || []).forEach((d) => evts.push({ date: d.applicationDeadline, title: `${d.title} Deadline`, type: 'deadline', color: 'bg-red-100 text-red-700' }));
        }

        evts.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(evts);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.role]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Placement Calendar</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Upcoming Events" className="lg:col-span-2">
          {!events.length ? <EmptyState title="No events" /> : (
            <div className="space-y-3">
              {events.map((e, i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="min-w-[80px] text-center">
                    <p className="text-lg font-bold text-primary-600">{formatDate(e.date, 'dd')}</p>
                    <p className="text-xs text-gray-500">{formatDate(e.date, 'MMM yyyy')}</p>
                  </div>
                  <div>
                    <Badge className={e.color}>{capitalize(e.type)}</Badge>
                    <p className="mt-1 font-medium">{e.title}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(e.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Legend">
          <div className="space-y-2">
            {[['deadline', 'Deadlines'], ['interview', 'Interviews'], ['announcement', 'Announcements'], ['assessment', 'Assessments']].map(([t, l]) => (
              <div key={t} className="flex items-center gap-2 text-sm"><Badge className={`bg-${t === 'deadline' ? 'red' : t === 'interview' ? 'amber' : 'purple'}-100`}>{l}</Badge></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
