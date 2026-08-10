import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { studentApi } from '../../api/student';
import { documentApi } from '../../api/common';
import { Card, Button, Input, Textarea, Badge } from '../../components/ui';
import { Tabs } from '../../components/ui/Table';
import { PageLoader } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/States';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState({});
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    studentApi.getProfile().then((r) => {
      const p = r.data.data;
      setProfile(p);
      setForm(p);
      setSkillsInput((p.skills || []).join(', '));
    }).catch((err) => setError(err.response?.data?.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean) };
      const res = await studentApi.updateProfile(payload);
      setProfile(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'resume');
    try {
      await documentApi.upload(fd);
      toast.success('Resume uploaded');
      load();
    } catch {
      toast.error('Upload failed');
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills & Projects' },
    { id: 'social', label: 'Social & Resume' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <Badge className="mt-2 bg-primary-100 text-primary-700">{profile.profileCompletion}% Complete</Badge>
        </div>
        <Button loading={saving} onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${profile.profileCompletion}%` }} />
      </div>

      <Card>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="mt-6 space-y-4">
          {tab === 'personal' && (
            <>
              <Input label="Roll Number" value={form.rollNumber || ''} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
              <Input label="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="Branch" value={form.branch || ''} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
              <Input label="Graduation Year" type="number" value={form.graduationYear || ''} onChange={(e) => setForm({ ...form, graduationYear: +e.target.value })} />
            </>
          )}
          {tab === 'education' && (
            <>
              <Input label="CGPA" type="number" step="0.01" value={form.cgpa || ''} onChange={(e) => setForm({ ...form, cgpa: +e.target.value })} />
              <Input label="10th Percentage" type="number" value={form.tenthPercentage || ''} onChange={(e) => setForm({ ...form, tenthPercentage: +e.target.value })} />
              <Input label="12th Percentage" type="number" value={form.twelfthPercentage || ''} onChange={(e) => setForm({ ...form, twelfthPercentage: +e.target.value })} />
              <Input label="Backlogs" type="number" value={form.backlogs ?? 0} onChange={(e) => setForm({ ...form, backlogs: +e.target.value })} />
            </>
          )}
          {tab === 'skills' && (
            <>
              <Input label="Skills (comma separated)" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
              <Textarea label="Project Title" value={form.projects?.[0]?.title || ''} onChange={(e) => setForm({ ...form, projects: [{ ...form.projects?.[0], title: e.target.value, description: form.projects?.[0]?.description || '', technologies: form.projects?.[0]?.technologies || [] }] })} />
              <Textarea label="Project Description" value={form.projects?.[0]?.description || ''} onChange={(e) => setForm({ ...form, projects: [{ ...form.projects?.[0], title: form.projects?.[0]?.title || '', description: e.target.value, technologies: form.projects?.[0]?.technologies || [] }] })} />
              <Input label="Certification Name" value={form.certifications?.[0]?.name || ''} onChange={(e) => setForm({ ...form, certifications: [{ ...form.certifications?.[0], name: e.target.value }] })} />
            </>
          )}
          {tab === 'social' && (
            <>
              <Input label="GitHub" value={form.socialLinks?.github || ''} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, github: e.target.value } })} />
              <Input label="LinkedIn" value={form.socialLinks?.linkedin || ''} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })} />
              <Input label="Portfolio" value={form.socialLinks?.portfolio || ''} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, portfolio: e.target.value } })} />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Resume</label>
                {profile.resume?.url ? (
                  <a href={profile.resume.url} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">View current resume</a>
                ) : <p className="text-sm text-gray-500">No resume uploaded</p>}
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="mt-2 block w-full text-sm" />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
