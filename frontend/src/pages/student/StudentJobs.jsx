import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentApi } from '../../api/student';
import { Card, Badge, Button } from '../../components/ui';
import { SearchBar, Pagination } from '../../components/ui/Table';
import { PageLoader } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { formatDate, formatPackage, capitalize, getStatusColor } from '../../utils/helpers';

export default function StudentJobs() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = (p = page, s = search) => {
    setLoading(true);
    studentApi.getEligibleDrives().then((r) => {
      let data = r.data.data || [];
      if (s) data = data.filter(({ drive }) => drive.title?.toLowerCase().includes(s.toLowerCase()) || drive.company?.name?.toLowerCase().includes(s.toLowerCase()));
      setItems(data);
      setMeta(null);
    }).catch((err) => setError(err.response?.data?.message)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eligible Jobs</h1>
          <p className="text-sm text-gray-500">Browse drives you qualify for</p>
        </div>
        <SearchBar value={search} onChange={(v) => { setSearch(v); fetchData(1, v); }} className="sm:w-72" />
      </div>

      {!items.length ? <Card><EmptyState title="No eligible jobs" description="Complete your profile or check back later" /></Card> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(({ drive, eligibility }) => (
            <Card key={drive._id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{drive.title}</h3>
                  <p className="text-sm text-gray-500">{drive.company?.name}</p>
                </div>
                <Badge className={eligibility.isEligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
                </Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Role</span><span>{drive.role}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Package</span><span>{formatPackage(drive.package)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Deadline</span><span>{formatDate(drive.applicationDeadline)}</span></div>
                {drive.eligibilityCriteria?.requiredSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {drive.eligibilityCriteria.requiredSkills.map((s) => <Badge key={s} className="bg-gray-100 text-gray-600">{s}</Badge>)}
                  </div>
                )}
              </div>
              {!eligibility.isEligible && eligibility.missingRequirements?.length > 0 && (
                <ul className="mt-3 list-inside list-disc text-xs text-red-600">
                  {eligibility.missingRequirements.slice(0, 2).map((r) => <li key={r}>{r}</li>)}
                </ul>
              )}
              <Link to={`/student/jobs/${drive._id}`} className="mt-4 block">
                <Button className="w-full" variant={eligibility.isEligible ? 'primary' : 'secondary'} disabled={!eligibility.isEligible}>
                  {eligibility.isEligible ? 'View & Apply' : 'View Details'}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentJobDetail() {
  const { id: driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!driveId) return;
    Promise.all([
      studentApi.getEligibleDrives(),
      studentApi.checkEligibility(driveId),
    ]).then(([drives, elig]) => {
      const found = (drives.data.data || []).find(({ drive: dr }) => dr._id === driveId);
      setDrive(found?.drive);
      setEligibility(elig.data.data);
    }).finally(() => setLoading(false));
  }, [driveId]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await studentApi.applyToDrive(driveId);
      toast.success('Application submitted!');
      navigate('/student/applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!drive) return <ErrorState message="Drive not found" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card title={drive.title} subtitle={drive.company?.name}>
        <div className="space-y-4">
          <p className="text-gray-600">{drive.description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><span className="text-sm text-gray-500">Role</span><p className="font-medium">{drive.role}</p></div>
            <div><span className="text-sm text-gray-500">Package</span><p className="font-medium">{formatPackage(drive.package)}</p></div>
            <div><span className="text-sm text-gray-500">Location</span><p className="font-medium">{drive.location || '—'}</p></div>
            <div><span className="text-sm text-gray-500">Deadline</span><p className="font-medium">{formatDate(drive.applicationDeadline)}</p></div>
          </div>
          {eligibility && (
            <div className={`rounded-lg p-4 ${eligibility.isEligible ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-medium">{eligibility.isEligible ? 'You are eligible!' : 'Not eligible'}</p>
              <ul className="mt-2 text-sm">{eligibility.reasons?.map((r) => <li key={r}>• {r}</li>)}</ul>
            </div>
          )}
          {eligibility?.isEligible && (
            <Button loading={applying} onClick={handleApply} className="w-full">Apply Now</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
