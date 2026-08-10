import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { recruiterApi } from '../../api/recruiter';
import { offerApi } from '../../api/common';
import { Card, Button, Input, Textarea, Badge, Select } from '../../components/ui';
import { DataTable, SearchBar, Pagination } from '../../components/ui/Table';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';
import { capitalize, formatDate, formatPackage, getStatusColor } from '../../utils/helpers';

export function RecruiterCompany() {
  const [company, setCompany] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    recruiterApi.getProfile().then((r) => { setCompany(r.data.data.company); setForm(r.data.data.company || {}); }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await recruiterApi.updateCompany(form);
      setCompany(res.data.data);
      toast.success('Company updated');
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Company Profile</h1>
      <Card>
        <div className="space-y-4">
          <Input label="Company Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Website" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input label="Industry" value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <Input label="Location" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Button loading={saving} onClick={save}>Save</Button>
        </div>
      </Card>
    </div>
  );
}

export function RecruiterDrives() {
  const [drives, setDrives] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', role: '', applicationDeadline: '', description: '', location: '', minCtc: '', maxCtc: '', minCgpa: 7, maxBacklogs: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = (p = page) => {
    setLoading(true);
    recruiterApi.getDrives({ page: p }).then((r) => { setDrives(r.data.data || []); setMeta(r.data.meta); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page]);

  const create = async () => {
    setSaving(true);
    try {
      await recruiterApi.createDrive({
        title: form.title, role: form.role, description: form.description, location: form.location,
        applicationDeadline: new Date(form.applicationDeadline).toISOString(),
        package: { minCtc: +form.minCtc, maxCtc: +form.maxCtc },
        eligibilityCriteria: { minCgpa: +form.minCgpa, maxBacklogs: +form.maxBacklogs, allowedBranches: ['CSE', 'IT'], graduationYears: [2026] },
      });
      toast.success('Drive created');
      setShowCreate(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const publish = async (id) => {
    await recruiterApi.publishDrive(id);
    toast.success('Published');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h1 className="text-2xl font-bold">Job Drives</h1><Button onClick={() => setShowCreate(true)}>Create Drive</Button></div>
      <Card>
        {loading ? <PageLoader /> : drives.length ? (
          <>
            <DataTable columns={[
              { key: 'title', label: 'Title' },
              { key: 'role', label: 'Role' },
              { key: 'package', label: 'Package', render: (r) => formatPackage(r.package) },
              { key: 'deadline', label: 'Deadline', render: (r) => formatDate(r.applicationDeadline) },
              { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
              { key: 'actions', label: 'Actions', render: (r) => (
                <div className="flex gap-2">
                  {r.status === 'draft' && <Button size="sm" onClick={() => publish(r._id)}>Publish</Button>}
                  <Link to={`/recruiter/applicants?drive=${r._id}`}><Button size="sm" variant="secondary">Applicants</Button></Link>
                </div>
              )},
            ]} data={drives} />
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        ) : <EmptyState title="No drives" />}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Job Drive" footer={<><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button loading={saving} onClick={create}>Create</Button></>}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input label="Deadline" type="datetime-local" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min CTC" type="number" value={form.minCtc} onChange={(e) => setForm({ ...form, minCtc: e.target.value })} />
            <Input label="Max CTC" type="number" value={form.maxCtc} onChange={(e) => setForm({ ...form, maxCtc: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min CGPA" type="number" step="0.1" value={form.minCgpa} onChange={(e) => setForm({ ...form, minCgpa: e.target.value })} />
            <Input label="Max Backlogs" type="number" value={form.maxBacklogs} onChange={(e) => setForm({ ...form, maxBacklogs: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function RecruiterApplicants() {
  const [drives, setDrives] = useState([]);
  const [driveId, setDriveId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', minCgpa: '', branch: '' });
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [offerApp, setOfferApp] = useState(null);
  const [offerForm, setOfferForm] = useState({ role: '', ctc: '', joiningDate: '' });
  const [profile, setProfile] = useState(null);

  const fetchApplicants = () => {
    if (!driveId) return;
    setLoading(true);
    recruiterApi.getApplicants(driveId, { page, ...filters, minCgpa: filters.minCgpa || undefined, branch: filters.branch || undefined, status: filters.status || undefined })
      .then((r) => { setApplicants(r.data.data || []); setMeta(r.data.meta); }).finally(() => setLoading(false));
  };

  useEffect(() => {
    recruiterApi.getProfile().then((r) => setProfile(r.data.data));
    recruiterApi.getDrives({ limit: 50 }).then((r) => {
      const d = r.data.data || [];
      setDrives(d);
      const params = new URLSearchParams(window.location.search);
      const pre = params.get('drive') || d[0]?._id;
      if (pre) setDriveId(pre);
    });
  }, []);

  useEffect(() => { fetchApplicants(); }, [driveId, page, filters]);

  const shortlist = async (id) => {
    await recruiterApi.shortlistApplicant(id);
    toast.success('Shortlisted');
    fetchApplicants();
  };

  const reject = async (id) => {
    await recruiterApi.rejectApplicant(id, 'Not selected');
    toast.success('Rejected');
    setRejectId(null);
    fetchApplicants();
  };

  const createOffer = async () => {
    const drive = drives.find((d) => d._id === driveId);
    try {
      await offerApi.create({
        applicationId: offerApp._id,
        company: profile?.company?._id || drive?.company,
        jobDrive: driveId,
        role: offerForm.role || drive?.role,
        ctc: +offerForm.ctc,
        joiningDate: offerForm.joiningDate ? new Date(offerForm.joiningDate).toISOString() : undefined,
      });
      toast.success('Offer extended');
      setOfferApp(null);
      fetchApplicants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create offer');
    }
  };

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success('Application ID copied');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Applicants</h1>
      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <Select label="" value={driveId} onChange={(e) => { setDriveId(e.target.value); setPage(1); }} options={[{ value: '', label: 'Select Drive' }, ...drives.map((d) => ({ value: d._id, label: d.title }))]} className="min-w-[200px]" />
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} options={[{ value: '', label: 'All Status' }, ...['applied', 'shortlisted', 'rejected', 'selected'].map((s) => ({ value: s, label: capitalize(s) }))]} />
          <Input placeholder="Min CGPA" type="number" value={filters.minCgpa} onChange={(e) => setFilters({ ...filters, minCgpa: e.target.value })} className="w-32" />
          <Input placeholder="Branch" value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })} className="w-32" />
        </div>
        {loading ? <PageLoader /> : (
          <DataTable columns={[
            { key: 'name', label: 'Name', render: (r) => r.student?.user?.name },
            { key: 'email', label: 'Email', render: (r) => r.student?.user?.email },
            { key: 'cgpa', label: 'CGPA', render: (r) => r.student?.cgpa },
            { key: 'branch', label: 'Branch', render: (r) => r.student?.branch },
            { key: 'skills', label: 'Skills', render: (r) => (r.student?.skills || []).slice(0, 2).join(', ') },
            { key: 'status', label: 'Status', render: (r) => <Badge className={getStatusColor(r.status)}>{capitalize(r.status)}</Badge> },
            { key: 'actions', label: 'Actions', render: (r) => (
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => copyId(r._id)} title={r._id}>ID</Button>
                {r.student?.resume?.url && <a href={r.student.resume.url} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost">Resume</Button></a>}
                {r.status === 'applied' && <Button size="sm" onClick={() => shortlist(r._id)}>Shortlist</Button>}
                {['shortlisted', 'selected', 'assessment_completed'].includes(r.status) && <Button size="sm" variant="success" onClick={() => { setOfferApp(r); setOfferForm({ role: drives.find((d) => d._id === driveId)?.role || '', ctc: '', joiningDate: '' }); }}>Offer</Button>}
                {!['rejected', 'placed'].includes(r.status) && <Button size="sm" variant="danger" onClick={() => setRejectId(r._id)}>Reject</Button>}
              </div>
            )},
          ]} data={applicants} emptyMessage="No applicants" />
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>
      <ConfirmDialog open={!!rejectId} onClose={() => setRejectId(null)} onConfirm={() => reject(rejectId)} message="Reject this applicant?" confirmLabel="Reject" />
      <Modal open={!!offerApp} onClose={() => setOfferApp(null)} title={`Extend Offer — ${offerApp?.student?.user?.name}`} footer={<><Button variant="secondary" onClick={() => setOfferApp(null)}>Cancel</Button><Button onClick={createOffer}>Send Offer</Button></>}>
        <div className="space-y-4">
          <Input label="Role" value={offerForm.role} onChange={(e) => setOfferForm({ ...offerForm, role: e.target.value })} />
          <Input label="CTC (annual)" type="number" value={offerForm.ctc} onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })} placeholder="e.g. 800000" />
          <Input label="Joining Date" type="date" value={offerForm.joiningDate} onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

export function RecruiterInterviews() {
  const [drives, setDrives] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ jobDrive: '', type: 'technical', scheduledAt: '', interviewer: '', venue: '', meetingLink: '', applicationId: '' });

  useEffect(() => {
    recruiterApi.getDrives({ limit: 50 }).then((r) => setDrives(r.data.data || []));
    const saved = localStorage.getItem('recruiter_interviews');
    if (saved) setScheduled(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!form.jobDrive) return;
    recruiterApi.getApplicants(form.jobDrive, { status: 'shortlisted', limit: 50 })
      .then((r) => setApplicants(r.data.data || []));
  }, [form.jobDrive]);

  const schedule = async () => {
    try {
      const res = await recruiterApi.scheduleInterview({
        jobDrive: form.jobDrive, type: form.type, scheduledAt: new Date(form.scheduledAt).toISOString(),
        interviewer: form.interviewer, venue: form.venue, meetingLink: form.meetingLink,
        candidates: [{ application: form.applicationId }],
      });
      const entry = { ...form, id: res.data.data?._id, candidate: applicants.find((a) => a._id === form.applicationId)?.student?.user?.name };
      const updated = [entry, ...scheduled];
      setScheduled(updated);
      localStorage.setItem('recruiter_interviews', JSON.stringify(updated));
      toast.success('Interview scheduled');
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h1 className="text-2xl font-bold">Interviews</h1><Button onClick={() => setShowModal(true)}>Schedule Interview</Button></div>
      <Card title="Scheduled Interviews">
        {scheduled.length ? (
          <DataTable columns={[
            { key: 'candidate', label: 'Candidate', render: (r) => r.candidate || '—' },
            { key: 'type', label: 'Round', render: (r) => capitalize(r.type) },
            { key: 'date', label: 'Date/Time', render: (r) => formatDate(r.scheduledAt, 'MMM dd, yyyy hh:mm a') },
            { key: 'interviewer', label: 'Interviewer' },
            { key: 'venue', label: 'Venue/Link', render: (r) => r.venue || r.meetingLink || '—' },
          ]} data={scheduled} />
        ) : <EmptyState title="No interviews scheduled" description="Schedule interviews for shortlisted candidates" actionLabel="Schedule" onAction={() => setShowModal(true)} />}
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Schedule Interview" size="lg" footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={schedule}>Schedule</Button></>}>
        <div className="space-y-4">
          <Select label="Job Drive" value={form.jobDrive} onChange={(e) => setForm({ ...form, jobDrive: e.target.value, applicationId: '' })} options={[{ value: '', label: 'Select' }, ...drives.map((d) => ({ value: d._id, label: d.title }))]} />
          <Select label="Candidate" value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })} options={[{ value: '', label: 'Select shortlisted candidate' }, ...applicants.map((a) => ({ value: a._id, label: `${a.student?.user?.name} (CGPA ${a.student?.cgpa})` }))]} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'technical', label: 'Technical' }, { value: 'hr', label: 'HR' }]} />
          <Input label="Date & Time" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          <Input label="Interviewer" value={form.interviewer} onChange={(e) => setForm({ ...form, interviewer: e.target.value })} />
          <Input label="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          <Input label="Meeting Link" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

export function RecruiterAssessments() {
  const [drives, setDrives] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showQuestion, setShowQuestion] = useState(null);
  const [form, setForm] = useState({ jobDrive: '', title: '', type: 'mcq', duration: 60, totalMarks: 10, passingMarks: 6, questionCount: 5 });
  const [questionForm, setQuestionForm] = useState({ type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 });

  useEffect(() => {
    recruiterApi.getDrives({ limit: 50 }).then((r) => setDrives(r.data.data || []));
    const saved = localStorage.getItem('recruiter_assessments');
    if (saved) setAssessments(JSON.parse(saved));
  }, []);

  const create = async () => {
    try {
      const res = await recruiterApi.createAssessment({ ...form, jobDrive: form.jobDrive, duration: +form.duration, totalMarks: +form.totalMarks, passingMarks: +form.passingMarks, questionCount: +form.questionCount, status: 'published' });
      const item = { ...res.data.data, driveTitle: drives.find((d) => d._id === form.jobDrive)?.title };
      const updated = [item, ...assessments];
      setAssessments(updated);
      localStorage.setItem('recruiter_assessments', JSON.stringify(updated));
      toast.success(`Assessment created! ID: ${item._id}`);
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const addQuestion = async () => {
    try {
      await recruiterApi.addQuestion(showQuestion, {
        ...questionForm,
        options: questionForm.options.filter(Boolean),
        marks: +questionForm.marks,
      });
      toast.success('Question added');
      setShowQuestion(null);
      setQuestionForm({ type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const copyId = (id) => { navigator.clipboard.writeText(id); toast.success('Assessment ID copied — share with students'); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h1 className="text-2xl font-bold">Assessments</h1><Button onClick={() => setShowModal(true)}>Create Assessment</Button></div>
      <Card title="Your Assessments">
        {assessments.length ? (
          <DataTable columns={[
            { key: 'title', label: 'Title' },
            { key: 'drive', label: 'Drive', render: (r) => r.driveTitle },
            { key: 'type', label: 'Type', render: (r) => capitalize(r.type) },
            { key: 'duration', label: 'Duration', render: (r) => `${r.duration} mins` },
            { key: 'id', label: 'ID', render: (r) => <Button size="sm" variant="ghost" onClick={() => copyId(r._id)}>Copy ID</Button> },
            { key: 'actions', label: 'Actions', render: (r) => <Button size="sm" variant="secondary" onClick={() => setShowQuestion(r._id)}>Add Question</Button> },
          ]} data={assessments} />
        ) : <EmptyState title="No assessments yet" description="Create an assessment for your job drives" actionLabel="Create" onAction={() => setShowModal(true)} />}
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Assessment" footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={create}>Create & Publish</Button></>}>
        <div className="space-y-4">
          <Select label="Job Drive" value={form.jobDrive} onChange={(e) => setForm({ ...form, jobDrive: e.target.value })} options={[{ value: '', label: 'Select' }, ...drives.map((d) => ({ value: d._id, label: d.title }))]} />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'mcq', label: 'MCQ' }, { value: 'aptitude', label: 'Aptitude' }, { value: 'mixed', label: 'Mixed' }]} />
          <Input label="Duration (mins)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          <Input label="Passing Marks" type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} />
        </div>
      </Modal>
      <Modal open={!!showQuestion} onClose={() => setShowQuestion(null)} title="Add Question" footer={<><Button variant="secondary" onClick={() => setShowQuestion(null)}>Cancel</Button><Button onClick={addQuestion}>Add</Button></>}>
        <div className="space-y-4">
          <Textarea label="Question" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} />
          {questionForm.options.map((opt, i) => (
            <Input key={i} label={`Option ${i + 1}`} value={opt} onChange={(e) => { const opts = [...questionForm.options]; opts[i] = e.target.value; setQuestionForm({ ...questionForm, options: opts }); }} />
          ))}
          <Input label="Correct Answer" value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} />
          <Input label="Marks" type="number" value={questionForm.marks} onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

export function RecruiterSelected() {
  return <RecruiterFilteredApps title="Selected Candidates" status="selected" />;
}

export function RecruiterRejected() {
  return <RecruiterFilteredApps title="Rejected Candidates" status="rejected" />;
}

function RecruiterFilteredApps({ title, status }) {
  const [drives, setDrives] = useState([]);
  const [driveId, setDriveId] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { recruiterApi.getDrives({ limit: 50 }).then((r) => { setDrives(r.data.data || []); setDriveId(r.data.data?.[0]?._id); }); }, []);
  useEffect(() => {
    if (!driveId) return;
    setLoading(true);
    recruiterApi.getApplicants(driveId, { status, limit: 50 }).then((r) => setApps(r.data.data || [])).finally(() => setLoading(false));
  }, [driveId, status]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card>
        <Select value={driveId} onChange={(e) => setDriveId(e.target.value)} options={drives.map((d) => ({ value: d._id, label: d.title }))} className="mb-4 max-w-xs" />
        {loading ? <PageLoader /> : <DataTable columns={[
          { key: 'name', label: 'Name', render: (r) => r.student?.user?.name },
          { key: 'cgpa', label: 'CGPA', render: (r) => r.student?.cgpa },
          { key: 'branch', label: 'Branch', render: (r) => r.student?.branch },
        ]} data={apps} emptyMessage={`No ${status} candidates`} />}
      </Card>
    </div>
  );
}

export function RecruiterRounds() {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({ jobDrive: '', name: '', type: 'assessment', order: 1 });
  useEffect(() => { recruiterApi.getDrives({ limit: 50 }).then((r) => setDrives(r.data.data || [])); }, []);
  const create = async () => {
    await recruiterApi.createRound(form);
    toast.success('Round created');
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Selection Rounds</h1>
      <Card title="Create Round">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Drive" value={form.jobDrive} onChange={(e) => setForm({ ...form, jobDrive: e.target.value })} options={[{ value: '', label: 'Select' }, ...drives.map((d) => ({ value: d._id, label: d.title }))]} />
          <Input label="Round Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={['assessment', 'technical_interview', 'hr_interview', 'shortlisting'].map((t) => ({ value: t, label: capitalize(t) }))} />
          <Input label="Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: +e.target.value })} />
        </div>
        <Button className="mt-4" onClick={create}>Create Round</Button>
      </Card>
    </div>
  );
}
