import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentApi } from '../../api/student';
import { offerApi, documentApi, notificationApi } from '../../api/common';
import { Card, Badge, Button } from '../../components/ui';
import { DataTable, Pagination } from '../../components/ui/Table';
import { PageLoader } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { ConfirmDialog } from '../../components/ui/Modal';
import { capitalize, formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';

export function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = (p = page) => {
    setLoading(true);
    studentApi.getApplications({ page: p, limit: 10, status: status || undefined })
      .then((r) => { setApps(r.data.data || []); setMeta(r.data.meta); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(page); }, [page, status]);

  const columns = [
    { key: 'drive', label: 'Drive', render: (r) => r.jobDrive?.title },
    { key: 'company', label: 'Company', render: (r) => r.jobDrive?.company?.name },
    { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
    { key: 'applied', label: 'Applied', render: (r) => formatDate(r.appliedAt) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Applications</h1>
      <Card>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="mb-4 rounded-lg border px-3 py-2 text-sm">
          <option value="">All Status</option>
          {['applied', 'shortlisted', 'rejected', 'interview_scheduled', 'selected', 'placed'].map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
        </select>
        {loading ? <PageLoader /> : apps.length ? <><DataTable columns={columns} data={apps} /><Pagination meta={meta} onPageChange={setPage} /></> : <EmptyState title="No applications" />}
      </Card>
    </div>
  );
}

export function StudentOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    offerApi.getMy().then((r) => setOffers(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const respond = async (id, status) => {
    try {
      await offerApi.respond(id, status);
      toast.success(`Offer ${status}`);
      const r = await offerApi.getMy();
      setOffers(r.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setConfirm(null);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Offers</h1>
      {!offers.length ? <Card><EmptyState title="No offers yet" /></Card> : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map((o) => (
            <Card key={o._id}>
              <div className="flex justify-between"><h3 className="font-semibold">{o.role}</h3><Badge className={getStatusColor(o.status)}>{capitalize(o.status)}</Badge></div>
              <p className="text-sm text-gray-500">{o.company?.name}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p>CTC: <strong>{formatCurrency(o.ctc)}</strong></p>
                <p>Joining: {formatDate(o.joiningDate)}</p>
              </div>
              {o.status === 'extended' && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => setConfirm({ id: o._id, status: 'accepted' })}>Accept</Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirm({ id: o._id, status: 'rejected' })}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => respond(confirm.id, confirm.status)} message={`Are you sure you want to ${confirm?.status} this offer?`} confirmLabel={capitalize(confirm?.status)} variant={confirm?.status === 'rejected' ? 'danger' : 'success'} />
    </div>
  );
}

export function StudentDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('resume');

  const load = () => documentApi.getAll().then((r) => setDocs(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    try {
      await documentApi.upload(fd);
      toast.success('Uploaded');
      load();
    } catch { toast.error('Upload failed'); }
  };

  const remove = async (id) => {
    await documentApi.delete(id);
    toast.success('Deleted');
    load();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>
      <Card title="Upload Document">
        <div className="flex flex-wrap gap-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            {['resume', 'marksheet', 'certificate', 'id_proof', 'other'].map((t) => <option key={t} value={t}>{capitalize(t)}</option>)}
          </select>
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={upload} className="text-sm" />
        </div>
      </Card>
      <Card title="My Documents">
        {!docs.length ? <EmptyState title="No documents" /> : (
          <div className="space-y-3">
            {docs.map((d) => (
              <div key={d._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{d.originalName || d.filename}</p>
                  <Badge className="bg-gray-100 text-gray-600">{capitalize(d.type)}</Badge>
                </div>
                <div className="flex gap-2">
                  <a href={d.url} target="_blank" rel="noreferrer"><Button size="sm" variant="secondary">View</Button></a>
                  <Button size="sm" variant="danger" onClick={() => remove(d._id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function StudentInterviews() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getApplications({ limit: 50 }).then((r) => {
      setApps((r.data.data || []).filter((a) => ['interview_scheduled', 'technical_interview', 'hr_interview', 'shortlisted'].includes(a.status)));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Interviews</h1>
      <Card>
        {!apps.length ? <EmptyState title="No upcoming interviews" description="Interviews will appear when scheduled" /> : (
          <DataTable columns={[
            { key: 'drive', label: 'Drive', render: (r) => r.jobDrive?.title },
            { key: 'company', label: 'Company', render: (r) => r.jobDrive?.company?.name },
            { key: 'round', label: 'Round', render: (r) => capitalize(r.currentRound) },
            { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
          ]} data={apps} />
        )}
      </Card>
    </div>
  );
}

export function StudentAssessments() {
  const [notifications, setNotifications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assessmentId, setAssessmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      notificationApi.getAll({ limit: 50 }),
      studentApi.getApplications({ limit: 50 }),
    ]).then(([n, a]) => {
      setNotifications((n.data.data || []).filter((x) => ['assessment', 'result'].includes(x.type)));
      setApplications((a.data.data || []).filter((x) => ['shortlisted', 'assessment_pending', 'assessment_completed'].includes(x.status)));
    }).finally(() => setLoading(false));
  }, []);

  const startById = () => {
    if (!assessmentId.trim()) return toast.error('Enter assessment ID');
    navigate(`/student/assessments/${assessmentId.trim()}/take`);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assessments</h1>

      <Card title="Start Assessment">
        <p className="mb-3 text-sm text-gray-500">Enter the assessment ID shared by your recruiter or from notifications.</p>
        <div className="flex gap-3">
          <input value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)} placeholder="Assessment ID" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
          <Button onClick={startById}>Start</Button>
        </div>
      </Card>

      {applications.length > 0 && (
        <Card title="Assessment-eligible Applications">
          {applications.map((app) => (
            <div key={app._id} className="flex items-center justify-between border-b py-3 last:border-0">
              <div>
                <p className="font-medium">{app.jobDrive?.title}</p>
                <p className="text-xs text-gray-500">Status: {capitalize(app.status)}</p>
              </div>
              <Badge className={getStatusColor(app.status)}>{capitalize(app.status)}</Badge>
            </div>
          ))}
        </Card>
      )}

      <Card title="Assessment Notifications">
        {!notifications.length ? <EmptyState title="No assessment notifications" description="Notifications will appear when assessments are assigned" /> : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n._id} className="rounded-lg border p-4">
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-gray-500">{n.message}</p>
                {n.relatedEntity?.entityType === 'Assessment' && n.relatedEntity?.entityId && (
                  <Link to={`/student/assessments/${n.relatedEntity.entityId}/take`} className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline">Take Assessment →</Link>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
