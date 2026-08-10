import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assessmentApi } from '../../api/common';
import { Card, Button, Badge } from '../../components/ui';
import { ConfirmDialog } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Skeleton';

export default function AssessmentTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [review, setReview] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    assessmentApi.start(id).then((r) => {
      const d = r.data.data;
      setQuestions(d.questions || []);
      setTimeLeft((d.duration || 60) * 60);
    }).catch((err) => toast.error(err.response?.data?.message || 'Cannot start assessment'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    try {
      const answerArr = Object.entries(answersRef.current).map(([question, answer]) => ({ question, answer }));
      const res = await assessmentApi.submit(id, { answers: answerArr, autoSubmit });
      setResult(res.data.data);
      toast.success(autoSubmit ? 'Time up — assessment auto-submitted' : 'Assessment submitted!');
    } catch (err) {
      setSubmitted(false);
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
      setConfirmSubmit(false);
    }
  }, [id, submitted]);

  useEffect(() => {
    if (!timeLeft || result || loading) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, result, loading, handleSubmit]);

  if (loading) return <PageLoader />;

  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <Card title="Assessment Result">
          <div className="space-y-4 text-center">
            <p className="text-4xl font-bold text-primary-600">{result.score}</p>
            <Badge className={result.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{result.result?.toUpperCase()}</Badge>
            <p className="text-sm text-gray-500">Passing marks: {result.passingMarks}</p>
            <Button onClick={() => navigate('/student/assessments')}>Back to Assessments</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <Card title="Assessment Unavailable">
        <p className="text-sm text-gray-500">No questions available or assessment not published.</p>
        <Button className="mt-4" onClick={() => navigate('/student/assessments')}>Go Back</Button>
      </Card>
    );
  }

  const q = questions[current];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
        <h1 className="font-semibold">Assessment in Progress</h1>
        <div className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <Button onClick={() => setConfirmSubmit(true)}>Submit</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-1">
          <p className="mb-3 text-sm font-medium text-gray-500">Navigation</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((ques, i) => (
              <button key={ques._id} type="button" onClick={() => setCurrent(i)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${current === i ? 'bg-primary-600 text-white' : answers[ques._id] ? 'bg-green-100 text-green-700' : review[ques._id] ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</button>
            ))}
          </div>
          <div className="mt-4 space-y-1 text-xs text-gray-500">
            <p><span className="inline-block h-2 w-2 rounded-full bg-green-400" /> Answered</p>
            <p><span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Marked for review</p>
          </div>
        </div>

        <Card className="lg:col-span-3" title={`Question ${current + 1} of ${questions.length}`}>
          <Badge className="mb-4 bg-gray-100 text-gray-600 capitalize">{q.type}</Badge>
          <p className="mb-6 text-gray-900">{q.question}</p>
          {q.type !== 'coding' ? (
            <div className="space-y-2">
              {(q.options || []).map((opt) => (
                <label key={opt} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${answers[q._id] === opt ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name={q._id} checked={answers[q._id] === opt} onChange={() => setAnswers((prev) => ({ ...prev, [q._id]: opt }))} />
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <textarea className="w-full rounded-lg border p-3 font-mono text-sm" rows={8} value={answers[q._id] || ''} onChange={(e) => setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }))} placeholder="Write your code here..." />
          )}
          <div className="mt-6 flex flex-wrap justify-between gap-2">
            <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Previous</Button>
            <Button variant="ghost" onClick={() => setReview((prev) => ({ ...prev, [q._id]: !prev[q._id] }))}>{review[q._id] ? 'Unmark Review' : 'Mark for Review'}</Button>
            <Button disabled={current === questions.length - 1} onClick={() => setCurrent(current + 1)}>Next</Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)} onConfirm={() => handleSubmit(false)} loading={submitting} title="Submit Assessment" message="Are you sure you want to submit? You cannot change answers after submission." confirmLabel="Submit" variant="primary" />
    </div>
  );
}
