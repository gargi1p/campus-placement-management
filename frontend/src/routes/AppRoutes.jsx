import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout, GuestRoute } from '../components/layout/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage, { ResetPasswordPage, VerifyEmailPage, VerifyPendingPage } from '../pages/auth/AuthPages';
import NotFound from '../pages/NotFound';

import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import StudentJobs, { StudentJobDetail } from '../pages/student/StudentJobs';
import { StudentApplications, StudentOffers, StudentDocuments, StudentInterviews, StudentAssessments } from '../pages/student/StudentPages';
import AssessmentTakePage from '../pages/student/AssessmentTakePage';

import RecruiterDashboard from '../pages/recruiter/RecruiterDashboard';
import { RecruiterCompany, RecruiterDrives, RecruiterApplicants, RecruiterInterviews, RecruiterAssessments, RecruiterSelected, RecruiterRejected, RecruiterRounds } from '../pages/recruiter/RecruiterPages';

import AdminDashboard from '../pages/admin/AdminPages';
import { AdminAnalytics, AdminStudents, AdminRecruiters, AdminCompanies, AdminDepartments, AdminDrives, AdminApplications, AdminInterviews, AdminAssessments, AdminOffers, AdminDocuments, AdminAnnouncements, AdminAuditLogs, AdminUsers } from '../pages/admin/AdminPages';

import NotificationsPage from '../pages/shared/NotificationsPage';
import SettingsPage from '../pages/shared/SettingsPage';
import CalendarPage from '../pages/shared/CalendarPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      <Route path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/auth/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/auth/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path="/auth/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/auth/verify-pending" element={<VerifyPendingPage />} />

      <Route path="/student" element={<DashboardLayout role="student" />}>
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="jobs/:id" element={<StudentJobDetail />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="interviews" element={<StudentInterviews />} />
        <Route path="assessments" element={<StudentAssessments />} />
        <Route path="assessments/:id/take" element={<AssessmentTakePage />} />
        <Route path="offers" element={<StudentOffers />} />
        <Route path="documents" element={<StudentDocuments />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/recruiter" element={<DashboardLayout role="recruiter" />}>
        <Route index element={<RecruiterDashboard />} />
        <Route path="company" element={<RecruiterCompany />} />
        <Route path="drives" element={<RecruiterDrives />} />
        <Route path="applicants" element={<RecruiterApplicants />} />
        <Route path="rounds" element={<RecruiterRounds />} />
        <Route path="interviews" element={<RecruiterInterviews />} />
        <Route path="assessments" element={<RecruiterAssessments />} />
        <Route path="selected" element={<RecruiterSelected />} />
        <Route path="rejected" element={<RecruiterRejected />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/admin" element={<DashboardLayout role="admin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="recruiters" element={<AdminRecruiters />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="drives" element={<AdminDrives />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="interviews" element={<AdminInterviews />} />
        <Route path="assessments" element={<AdminAssessments />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
