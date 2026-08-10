import {
  LayoutDashboard, User, Briefcase, FileText, Calendar, Bell, Settings,
  Building2, Users, GraduationCap, ClipboardList, BarChart3, Shield,
  Target, Award, FolderOpen, Megaphone, ScrollText, Layers, UserCheck, UserX,
} from 'lucide-react';

export const studentNav = [
  { label: 'Overview', path: '/student', icon: LayoutDashboard },
  { label: 'Profile', path: '/student/profile', icon: User },
  { label: 'Eligible Jobs', path: '/student/jobs', icon: Target },
  { label: 'Applications', path: '/student/applications', icon: ClipboardList },
  { label: 'Interviews', path: '/student/interviews', icon: Calendar },
  { label: 'Assessments', path: '/student/assessments', icon: FileText },
  { label: 'Offers', path: '/student/offers', icon: Award },
  { label: 'Documents', path: '/student/documents', icon: FolderOpen },
  { label: 'Calendar', path: '/student/calendar', icon: Calendar },
  { label: 'Notifications', path: '/student/notifications', icon: Bell },
  { label: 'Settings', path: '/student/settings', icon: Settings },
];

export const recruiterNav = [
  { label: 'Overview', path: '/recruiter', icon: LayoutDashboard },
  { label: 'Company Profile', path: '/recruiter/company', icon: Building2 },
  { label: 'Job Drives', path: '/recruiter/drives', icon: Briefcase },
  { label: 'Applicants', path: '/recruiter/applicants', icon: Users },
  { label: 'Selection Rounds', path: '/recruiter/rounds', icon: Layers },
  { label: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
  { label: 'Assessments', path: '/recruiter/assessments', icon: FileText },
  { label: 'Selected', path: '/recruiter/selected', icon: UserCheck },
  { label: 'Rejected', path: '/recruiter/rejected', icon: UserX },
  { label: 'Calendar', path: '/recruiter/calendar', icon: Calendar },
  { label: 'Notifications', path: '/recruiter/notifications', icon: Bell },
  { label: 'Settings', path: '/recruiter/settings', icon: Settings },
];

export const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Shield },
  { label: 'Students', path: '/admin/students', icon: GraduationCap },
  { label: 'Recruiters', path: '/admin/recruiters', icon: Users },
  { label: 'Companies', path: '/admin/companies', icon: Building2 },
  { label: 'Departments', path: '/admin/departments', icon: Layers },
  { label: 'Drives', path: '/admin/drives', icon: Briefcase },
  { label: 'Applications', path: '/admin/applications', icon: ClipboardList },
  { label: 'Interviews', path: '/admin/interviews', icon: Calendar },
  { label: 'Assessments', path: '/admin/assessments', icon: FileText },
  { label: 'Offers', path: '/admin/offers', icon: Award },
  { label: 'Documents', path: '/admin/documents', icon: FolderOpen },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Calendar', path: '/admin/calendar', icon: Calendar },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export const getNavForRole = (role) => {
  if (role === 'student') return studentNav;
  if (role === 'recruiter') return recruiterNav;
  if (role === 'admin') return adminNav;
  return [];
};

export const getRoleDashboard = (role) => {
  if (role === 'student') return '/student';
  if (role === 'recruiter') return '/recruiter';
  if (role === 'admin') return '/admin';
  return '/';
};
