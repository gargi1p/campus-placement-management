require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Recruiter = require('../models/Recruiter');
const Company = require('../models/Company');
const Department = require('../models/Department');
const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const SelectionRound = require('../models/SelectionRound');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const Announcement = require('../models/Announcement');
const { checkEligibility } = require('../services/eligibilityService');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    Recruiter.deleteMany({}),
    Company.deleteMany({}),
    Department.deleteMany({}),
    JobDrive.deleteMany({}),
    Application.deleteMany({}),
    SelectionRound.deleteMany({}),
    Assessment.deleteMany({}),
    Question.deleteMany({}),
    Announcement.deleteMany({}),
  ]);

  console.log('Creating departments...');
  const departments = await Department.insertMany([
    { name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Sharma' },
    { name: 'Information Technology', code: 'IT', hod: 'Dr. Patel' },
    { name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Kumar' },
    { name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. Singh' },
  ]);

  console.log('Creating admin...');
  const admin = await User.create({
    name: 'Placement Admin',
    email: 'admin@campus.edu',
    password: 'Admin@123',
    role: 'admin',
    isVerified: true,
  });

  console.log('Creating companies...');
  const companies = await Company.insertMany([
    { name: 'TechNova Solutions', description: 'Leading software company', website: 'https://technova.com', industry: 'IT', location: 'Bangalore', size: 'large', isVerified: true },
    { name: 'DataPulse Analytics', description: 'Data analytics firm', website: 'https://datapulse.com', industry: 'Analytics', location: 'Hyderabad', size: 'medium', isVerified: true },
    { name: 'CloudScale Systems', description: 'Cloud infrastructure provider', website: 'https://cloudscale.com', industry: 'Cloud', location: 'Pune', size: 'enterprise', isVerified: true },
  ]);

  console.log('Creating recruiter...');
  const recruiterUser = await User.create({
    name: 'Rajesh Mehta',
    email: 'recruiter@technova.com',
    password: 'Recruiter@123',
    role: 'recruiter',
    isVerified: true,
  });
  const recruiter = await Recruiter.create({
    user: recruiterUser._id,
    company: companies[0]._id,
    designation: 'Senior HR Manager',
    phone: '9876543210',
    isApproved: true,
  });

  console.log('Creating students...');
  const studentData = [
    { name: 'Ansh Singh', email: 'ansh@student.edu', rollNumber: 'CS2024001', branch: 'CSE', cgpa: 8.5, backlogs: 0 },
    { name: 'Priya Verma', email: 'priya@student.edu', rollNumber: 'CS2024002', branch: 'CSE', cgpa: 7.8, backlogs: 1 },
    { name: 'Rahul Gupta', email: 'rahul@student.edu', rollNumber: 'IT2024003', branch: 'IT', cgpa: 8.2, backlogs: 0 },
    { name: 'Sneha Reddy', email: 'sneha@student.edu', rollNumber: 'EC2024004', branch: 'ECE', cgpa: 9.1, backlogs: 0 },
    { name: 'Amit Joshi', email: 'amit@student.edu', rollNumber: 'CS2024005', branch: 'CSE', cgpa: 6.5, backlogs: 2 },
  ];

  const students = [];
  for (const s of studentData) {
    const user = await User.create({
      name: s.name,
      email: s.email,
      password: 'Student@123',
      role: 'student',
      isVerified: true,
    });
    const profile = await StudentProfile.create({
      user: user._id,
      rollNumber: s.rollNumber,
      department: departments.find((d) => d.code === s.branch)?._id || departments[0]._id,
      branch: s.branch,
      graduationYear: 2026,
      cgpa: s.cgpa,
      tenthPercentage: 85 + Math.random() * 10,
      twelfthPercentage: 80 + Math.random() * 15,
      backlogs: s.backlogs,
      skills: ['JavaScript', 'Node.js', 'MongoDB', 'React', 'Python'].slice(0, 3 + Math.floor(Math.random() * 2)),
      projects: [{ title: 'Placement Portal', description: 'Campus placement system', technologies: ['MERN'] }],
      socialLinks: { github: `https://github.com/${s.name.split(' ')[0].toLowerCase()}`, linkedin: 'https://linkedin.com/in/student' },
    });
    profile.calculateProfileCompletion();
    await profile.save();
    students.push({ user, profile });
  }

  console.log('Creating job drives...');
  const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const drives = await JobDrive.insertMany([
    {
      company: companies[0]._id,
      recruiter: recruiter._id,
      title: 'Software Engineer - Full Stack',
      description: 'Looking for talented full stack developers',
      role: 'Software Engineer',
      jobType: 'full-time',
      package: { minCtc: 800000, maxCtc: 1200000, currency: 'INR' },
      location: 'Bangalore',
      eligibilityCriteria: {
        minCgpa: 7.0,
        maxBacklogs: 0,
        minTenthPercentage: 60,
        minTwelfthPercentage: 60,
        allowedBranches: ['CSE', 'IT'],
        graduationYears: [2026],
        requiredSkills: ['JavaScript', 'Node.js'],
      },
      applicationDeadline: deadline,
      status: 'published',
      departments: [departments[0]._id, departments[1]._id],
    },
    {
      company: companies[1]._id,
      recruiter: recruiter._id,
      title: 'Data Analyst Intern',
      description: 'Summer internship for data enthusiasts',
      role: 'Data Analyst Intern',
      jobType: 'internship',
      package: { minCtc: 300000, maxCtc: 400000, currency: 'INR' },
      location: 'Hyderabad',
      eligibilityCriteria: {
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: ['CSE', 'IT', 'ECE'],
        graduationYears: [2026],
        requiredSkills: ['Python'],
      },
      applicationDeadline: deadline,
      status: 'published',
    },
    {
      company: companies[2]._id,
      recruiter: recruiter._id,
      title: 'Cloud Engineer',
      description: 'Cloud infrastructure and DevOps role',
      role: 'Cloud Engineer',
      package: { minCtc: 1000000, maxCtc: 1500000, currency: 'INR' },
      location: 'Pune',
      eligibilityCriteria: {
        minCgpa: 8.0,
        maxBacklogs: 0,
        allowedBranches: ['CSE', 'IT'],
        graduationYears: [2026],
      },
      applicationDeadline: deadline,
      status: 'published',
    },
  ]);

  console.log('Creating applications...');
  for (const { profile } of students.slice(0, 4)) {
    const drive = drives[0];
    const eligibility = checkEligibility(profile, drive.eligibilityCriteria);
    if (eligibility.isEligible) {
      await Application.create({
        student: profile._id,
        jobDrive: drive._id,
        eligibility,
        status: profile.cgpa >= 8 ? 'shortlisted' : 'applied',
      });
    }
  }

  console.log('Creating selection rounds...');
  await SelectionRound.insertMany([
    { jobDrive: drives[0]._id, name: 'Online Assessment', type: 'assessment', order: 1 },
    { jobDrive: drives[0]._id, name: 'Technical Interview', type: 'technical_interview', order: 2 },
    { jobDrive: drives[0]._id, name: 'HR Interview', type: 'hr_interview', order: 3 },
  ]);

  console.log('Creating assessment...');
  const assessment = await Assessment.create({
    jobDrive: drives[0]._id,
    title: 'Technical Aptitude Test',
    type: 'mixed',
    duration: 60,
    totalMarks: 10,
    passingMarks: 6,
    randomizeQuestions: true,
    questionCount: 5,
    status: 'published',
  });

  await Question.insertMany([
    { assessment: assessment._id, type: 'mcq', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 'O(log n)', marks: 2 },
    { assessment: assessment._id, type: 'mcq', question: 'Which HTTP method is idempotent?', options: ['POST', 'PUT', 'PATCH', 'CONNECT'], correctAnswer: 'PUT', marks: 2 },
    { assessment: assessment._id, type: 'aptitude', question: 'If 20% of a number is 40, what is the number?', options: ['100', '200', '400', '800'], correctAnswer: '200', marks: 2 },
    { assessment: assessment._id, type: 'mcq', question: 'MongoDB is a ___ database.', options: ['Relational', 'NoSQL', 'Graph', 'Time-series'], correctAnswer: 'NoSQL', marks: 2 },
    { assessment: assessment._id, type: 'mcq', question: 'JWT stands for?', options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Tool', 'Joint Web Transfer'], correctAnswer: 'JSON Web Token', marks: 2 },
  ]);

  console.log('Creating announcement...');
  await Announcement.create({
    title: 'Placement Season 2026 Begins!',
    content: 'All final year students are requested to complete their profiles and apply to eligible drives.',
    author: admin._id,
    targetRoles: ['student'],
    priority: 'high',
  });

  console.log('\n✅ Seed completed successfully!\n');
  console.log('Demo Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Admin:     admin@campus.edu / Admin@123');
  console.log('Recruiter: recruiter@technova.com / Recruiter@123');
  console.log('Students:  ansh@student.edu / Student@123');
  console.log('           priya@student.edu / Student@123');
  console.log('           (all students use Student@123)');
  console.log('─────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
