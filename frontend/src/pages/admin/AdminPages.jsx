import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { adminApi } from '../../api/admin';
import { analyticsApi, offerApi } from '../../api/common';
import { StatCard, Card, Badge, Button, Input, Textarea, Select } from '../../components/ui';
import { DataTable, Pagination } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { capitalize, formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import { GraduationCap, Building2, Briefcase, Users } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getDashboard(),
      analyticsApi.getAnnouncements(),
    ]).then(([dash, ann]) => {
      setStats(dash.data.data);
      setAnnouncements((ann.data.data || []).slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Students" value={stats?.students} icon={GraduationCap} />
        <StatCard title="Companies" value={stats?.companies} icon={Building2} color="green" />
        <StatCard title="Applications" value={stats?.applications} icon={Briefcase} color="amber" />
        <StatCard title="Placement Rate" value={`${stats?.placementRate}%`} icon={Users} color="purple" subtitle={`${stats?.placedStudents} placed`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Quick Stats">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">Active Drives</p><p className="text-xl font-bold">{stats?.activeDrives}</p></div>
            <div><p className="text-gray-500">Offers</p><p className="text-xl font-bold">{stats?.offers}</p></div>
            <div><p className="text-gray-500">Departments</p><p className="text-xl font-bold">{stats?.departments}</p></div>
            <div><p className="text-gray-500">Placed</p><p className="text-xl font-bold">{stats?.placedStudents}</p></div>
          </div>
        </Card>
        <Card title="Recent Announcements">
          {announcements.length ? announcements.map((a) => (
            <div key={a._id} className="border-b py-3 last:border-0">
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{a.content}</p>
            </div>
          )) : <p className="text-sm text-gray-500">No announcements</p>}
        </Card>
      </div>
    </div>
  );
}

export function AdminAnalytics() {
  const [placement, setPlacement] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [dept, setDept] = useState([]);
  const [year, setYear] = useState([]);
  const [company, setCompany] = useState([]);
  const [packages, setPackages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getPlacementRate(),
      analyticsApi.getDashboard(),
      analyticsApi.getDepartmentStats(),
      analyticsApi.getYearWise(),
      analyticsApi.getCompanySelections(),
      analyticsApi.getPackageStats(),
    ]).then(([p, dash, d, y, c, pkg]) => {
      setPlacement(p.data.data);
      setDashboard(dash.data.data);
      setDept(d.data.data || []);
      setYear(y.data.data || []);
      setCompany(c.data.data || []);
      setPackages(pkg.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const conversionRate = dashboard?.applications
    ? ((dashboard.offers / dashboard.applications) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Placement Rate" value={`${placement?.placementRate}%`} subtitle={`${placement?.placedStudents}/${placement?.totalStudents} placed`} />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} subtitle="Applications → Offers" color="green" />
        <StatCard title="Avg Package" value={formatCurrency(packages?.average)} color="green" />
        <StatCard title="Median Package" value={formatCurrency(packages?.median)} color="amber" />
        <StatCard title="Highest Package" value={formatCurrency(packages?.highest)} color="purple" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Department-wise Placements">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dept}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="placed" fill="#6366f1" name="Placed" />
              <Bar dataKey="total" fill="#c7d2fe" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Package Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={packages?.distribution || []} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={100} label>
                {(packages?.distribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Year-wise Placements">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={year}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="placed" stroke="#6366f1" name="Placed" />
              <Line type="monotone" dataKey="total" stroke="#10b981" name="Total" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Company-wise Selections">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={company} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="companyName" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="selections" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function AdminListPage({ title, fetchFn, columns, filters }) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFn({ page, ...filter }).then((r) => { setData(r.data.data || []); setMeta(r.data.meta); }).finally(() => setLoading(false));
  }, [page, filter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card>
        {filters && <div className="mb-4 flex flex-wrap gap-4">{filters(filter, setFilter)}</div>}
        {loading ? <PageLoader /> : <><DataTable columns={columns} data={data} /><Pagination meta={meta} onPageChange={setPage} /></>}
      </Card>
    </div>
  );
}

export const AdminStudents = () => (
  <AdminListPage
    title="Students"
    fetchFn={adminApi.getStudents}
    filters={(f, setF) => (
      <>
        <Input placeholder="Branch" value={f.branch || ''} onChange={(e) => setF({ ...f, branch: e.target.value })} className="w-32" />
        <Select value={f.placementStatus || ''} onChange={(e) => setF({ ...f, placementStatus: e.target.value })} options={[{ value: '', label: 'All Status' }, { value: 'placed', label: 'Placed' }, { value: 'not_placed', label: 'Not Placed' }]} />
      </>
    )}
    columns={[
      { key: 'name', label: 'Name', render: (r) => r.user?.name },
      { key: 'email', label: 'Email', render: (r) => r.user?.email },
      { key: 'branch', label: 'Branch' },
      { key: 'cgpa', label: 'CGPA' },
      { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.placementStatus)}>{capitalize(r.placementStatus)}</Badge> },
    ]}
  />
);

export const AdminRecruiters = () => {
  const [data, setData] = useState([]);
  useEffect(() => { adminApi.getRecruiters().then((r) => setData(r.data.data || [])); }, []);
  const approve = async (id) => { await adminApi.approveRecruiter(id); toast.success('Approved'); adminApi.getRecruiters().then((r) => setData(r.data.data || [])); };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recruiters</h1>
      <Card><DataTable columns={[
        { key: 'name', label: 'Name', render: (r) => r.user?.name },
        { key: 'company', label: 'Company', render: (r) => r.company?.name },
        { key: 'approved', label: 'Approved', render: (r) => <Badge className={r.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>{r.isApproved ? 'Yes' : 'Pending'}</Badge> },
        { key: 'actions', label: 'Actions', render: (r) => !r.isApproved && <Button size="sm" onClick={() => approve(r._id)}>Approve</Button> },
      ]} data={data} /></Card>
    </div>
  );
};

export const AdminCompanies = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', location: '' });
  const load = () => adminApi.getCompanies().then((r) => setData(r.data.data || []));
  useEffect(() => { load(); }, []);
  const create = async () => { await adminApi.createCompany(form); toast.success('Created'); setShow(false); load(); };
  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h1 className="text-2xl font-bold">Companies</h1><Button onClick={() => setShow(true)}>Add Company</Button></div>
      <Card><DataTable columns={[{ key: 'name', label: 'Name' }, { key: 'industry', label: 'Industry' }, { key: 'location', label: 'Location' }, { key: 'id', label: 'ID', render: (r) => <code className="text-xs">{r._id}</code> }]} data={data} /></Card>
      <Modal open={show} onClose={() => setShow(false)} title="Add Company" footer={<Button onClick={create}>Create</Button>}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
};

export const AdminDepartments = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ name: '', code: '' });
  useEffect(() => { adminApi.getDepartments().then((r) => setData(r.data.data || [])); }, []);
  const create = async () => { await adminApi.createDepartment(form); toast.success('Created'); adminApi.getDepartments().then((r) => setData(r.data.data || [])); };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Departments</h1>
      <Card title="Add Department">
        <div className="flex gap-4"><Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /><Button className="self-end" onClick={create}>Add</Button></div>
      </Card>
      <Card><DataTable columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'hod', label: 'HOD' }]} data={data} /></Card>
    </div>
  );
};

export const AdminDrives = () => (
  <AdminListPage title="Job Drives" fetchFn={adminApi.getDrives} columns={[
    { key: 'title', label: 'Title' }, { key: 'role', label: 'Role' },
    { key: 'company', label: 'Company', render: (r) => r.company?.name },
    { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
  ]} />
);

export const AdminApplications = () => (
  <AdminListPage title="Applications" fetchFn={adminApi.getApplications} columns={[
    { key: 'student', label: 'Student', render: (r) => r.student?.user?.name },
    { key: 'drive', label: 'Drive', render: (r) => r.jobDrive?.title },
    { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
  ]} />
);

export const AdminInterviews = () => {
  const [data, setData] = useState([]);
  useEffect(() => { adminApi.getInterviews().then((r) => setData(r.data.data || [])); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Interviews</h1>
      <Card><DataTable columns={[
        { key: 'type', label: 'Type', render: (r) => capitalize(r.type) },
        { key: 'date', label: 'Date', render: (r) => formatDate(r.scheduledAt) },
        { key: 'interviewer', label: 'Interviewer' },
        { key: 'venue', label: 'Venue/Link', render: (r) => r.venue || r.meetingLink || '—' },
        { key: 'candidates', label: 'Candidates', render: (r) => r.candidates?.length || 0 },
        { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
      ]} data={data} /></Card>
    </div>
  );
};

export const AdminAssessments = () => {
  const [data, setData] = useState([]);
  useEffect(() => { adminApi.getAssessments().then((r) => setData(r.data.data || [])); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assessments</h1>
      <Card><DataTable columns={[
        { key: 'title', label: 'Title' }, { key: 'type', label: 'Type', render: (r) => capitalize(r.type) },
        { key: 'duration', label: 'Duration', render: (r) => `${r.duration} mins` },
        { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
        { key: 'id', label: 'Assessment ID', render: (r) => <code className="text-xs">{r._id}</code> },
      ]} data={data} /></Card>
    </div>
  );
};

export const AdminOffers = () => {
  const [data, setData] = useState([]);
  useEffect(() => { adminApi.getOffers().then((r) => setData(r.data.data || [])); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Offers</h1>
      <Card><DataTable columns={[
        { key: 'role', label: 'Role' }, { key: 'ctc', label: 'CTC', render: (r) => formatCurrency(r.ctc) },
        { key: 'company', label: 'Company', render: (r) => r.company?.name },
        { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
      ]} data={data} /></Card>
    </div>
  );
};

export const AdminDocuments = () => {
  const [data, setData] = useState([]);
  useEffect(() => { adminApi.getDocuments().then((r) => setData(r.data.data || [])); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>
      <Card><DataTable columns={[
        { key: 'user', label: 'User', render: (r) => r.user?.name },
        { key: 'type', label: 'Type', render: (r) => capitalize(r.type) },
        { key: 'file', label: 'File', render: (r) => <a href={r.url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{r.originalName || 'View'}</a> },
      ]} data={data} /></Card>
    </div>
  );
};

export const AdminAnnouncements = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium' });
  const load = () => adminApi.getAnnouncements().then((r) => setData(r.data.data || []));
  useEffect(() => { load(); }, []);
  const create = async () => { await adminApi.createAnnouncement({ ...form, targetRoles: ['student', 'recruiter'] }); toast.success('Created'); load(); setForm({ title: '', content: '', priority: 'medium' }); };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Announcements</h1>
      <Card title="Create Announcement">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <Button onClick={create}>Publish</Button>
        </div>
      </Card>
      <Card title="All Announcements">
        {data.map((a) => (
          <div key={a._id} className="border-b py-4 last:border-0">
            <div className="flex items-center gap-2"><h3 className="font-medium">{a.title}</h3><Badge className="bg-gray-100">{a.priority}</Badge></div>
            <p className="mt-1 text-sm text-gray-600">{a.content}</p>
            <p className="mt-1 text-xs text-gray-400">{formatDate(a.createdAt)}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};

export const AdminAuditLogs = () => (
  <AdminListPage title="Audit Logs" fetchFn={adminApi.getAuditLogs} columns={[
    { key: 'user', label: 'User', render: (r) => r.user?.name || 'System' },
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ]} />
);

export const AdminUsers = () => (
  <AdminListPage
    title="Users"
    fetchFn={adminApi.getUsers}
    filters={(f, setF) => (
      <Select value={f.role || ''} onChange={(e) => setF({ ...f, role: e.target.value })} options={[{ value: '', label: 'All Roles' }, { value: 'student', label: 'Student' }, { value: 'recruiter', label: 'Recruiter' }, { value: 'admin', label: 'Admin' }]} />
    )}
    columns={[
      { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (r) => <Badge className="bg-primary-100 text-primary-700 capitalize">{r.role}</Badge> },
      { key: 'active', label: 'Active', render: (r) => <Badge className={r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{r.isActive ? 'Yes' : 'No'}</Badge> },
      { key: 'actions', label: 'Actions', render: (r) => <Button size="sm" variant="secondary" onClick={() => adminApi.toggleUserStatus(r._id).then(() => toast.success('Updated'))}>Toggle</Button> },
    ]}
  />
);
