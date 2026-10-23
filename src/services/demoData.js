export const demoProfile = {
  id: 'sagar-kumar',
  name: 'Sagar Kumar',
  username: 'sagarkumar',
  headline: 'Full Stack Developer · React & Node.js',
  location: 'Bengaluru, India',
  website: 'https://sagarkumar.dev',
  bio: 'Full stack developer focused on thoughtful, high-performance products. I enjoy turning complex ideas into clear interfaces and scalable APIs.',
  skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Docker'],
  experience: [
    { id: 'exp-1', title: 'Software Engineer', company: 'Nexora Labs', startDate: 'Jan 2024', endDate: null },
    { id: 'exp-2', title: 'Frontend Developer', company: 'BrightStack', startDate: 'Jul 2021', endDate: 'Dec 2023' },
  ],
  education: [{ id: 'edu-1', degree: 'B.Tech in Computer Science', school: 'Visvesvaraya Technological University', year: '2021' }],
  githubUsername: 'sagarkumar',
  connections: 248,
  isVerified: true,
  completionPercentage: 92,
  jobType: 'Full-time · Senior Frontend / Full Stack',
  locationPreference: 'Remote or Bengaluru',
  interests: ['Developer tools', 'SaaS', 'AI products'],
};

export const demoDevelopers = [
  { id: 'ananya-sharma', name: 'Ananya Sharma', headline: 'Product Engineer at Figma', location: 'Bengaluru, India', skills: ['React', 'TypeScript', 'Design Systems'], projectsCount: 14, connections: 612, isVerified: true },
  { id: 'arjun-mehta', name: 'Arjun Mehta', headline: 'Backend Engineer · Go & Kubernetes', location: 'Remote', skills: ['Go', 'PostgreSQL', 'Kubernetes'], projectsCount: 9, connections: 398, isVerified: true },
  { id: 'priya-nair', name: 'Priya Nair', headline: 'AI Engineer at Orbit', location: 'Hyderabad, India', skills: ['Python', 'ML', 'FastAPI'], projectsCount: 11, connections: 456, isVerified: true },
  { id: 'rahul-verma', name: 'Rahul Verma', headline: 'Mobile Developer · React Native', location: 'Pune, India', skills: ['React Native', 'TypeScript', 'Firebase'], projectsCount: 7, connections: 201, isVerified: false },
  { id: 'meera-iyer', name: 'Meera Iyer', headline: 'DevOps Engineer', location: 'Chennai, India', skills: ['AWS', 'Docker', 'Terraform'], projectsCount: 12, connections: 341, isVerified: true },
  { id: 'kabir-khan', name: 'Kabir Khan', headline: 'Frontend Engineer at Nova', location: 'Remote', skills: ['Vue.js', 'Nuxt', 'JavaScript'], projectsCount: 8, connections: 287, isVerified: true },
];

export const demoProjects = [
  { id: 'devflow', title: 'DevFlow', description: 'A collaborative developer workspace for planning, reviewing, and shipping projects.', tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], language: 'TypeScript', category: 'frontend', stars: 428, forks: 74, featured: true, author: { id: 'sagar-kumar', name: 'Sagar Kumar', avatar: 'SK' }, repositoryUrl: 'https://github.com/sagarkumar/devflow', demoUrl: 'https://devflow.example.com', createdAt: '2026-09-18T09:00:00.000Z' },
  { id: 'pulseboard', title: 'PulseBoard', description: 'A real-time analytics dashboard with configurable metrics and clean data visualizations.', tags: ['Next.js', 'Tailwind CSS', 'Supabase'], language: 'TypeScript', category: 'frontend', stars: 265, forks: 38, featured: true, author: { id: 'sagar-kumar', name: 'Sagar Kumar', avatar: 'SK' }, repositoryUrl: 'https://github.com/sagarkumar/pulseboard', demoUrl: 'https://pulseboard.example.com', createdAt: '2026-08-03T09:00:00.000Z' },
  { id: 'shipmate', title: 'Shipmate API', description: 'A production-ready API starter with authentication, observability, and automated deployments.', tags: ['Node.js', 'Docker', 'PostgreSQL'], language: 'JavaScript', category: 'backend', stars: 189, forks: 26, featured: true, author: { id: 'sagar-kumar', name: 'Sagar Kumar', avatar: 'SK' }, repositoryUrl: 'https://github.com/sagarkumar/shipmate', demoUrl: '', createdAt: '2026-07-11T09:00:00.000Z' },
  { id: 'focusbase', title: 'FocusBase', description: 'A minimalist productivity app for building deep-work habits.', tags: ['React', 'Firebase', 'PWA'], language: 'JavaScript', category: 'frontend', stars: 96, forks: 14, featured: false, author: { id: 'ananya-sharma', name: 'Ananya Sharma', avatar: 'AS' }, repositoryUrl: '', demoUrl: '', createdAt: '2026-06-16T09:00:00.000Z' },
];

export const demoJobs = [
  { id: 'job-1', title: 'Senior Frontend Engineer', company: { id: 'orbit', name: 'Orbit Labs' }, location: 'Remote · India', type: 'full-time', experience: 'senior', remote: true, hybrid: false, description: 'Build polished workflows used by thousands of product teams.', requirements: ['4+ years with React and TypeScript', 'Strong product and UI instincts', 'Experience with testing and performance'], responsibilities: ['Own frontend architecture', 'Collaborate with design and product', 'Mentor engineers'], skills: ['React', 'TypeScript', 'Next.js', 'Testing'], salary: '₹28L – ₹40L', postedAt: '2026-10-12T09:00:00.000Z', deadline: '2026-11-10T09:00:00.000Z', applicants: 42, status: 'open', matchScore: 96 },
  { id: 'job-2', title: 'Full Stack Developer', company: { id: 'atlas', name: 'Atlas Commerce' }, location: 'Bengaluru, India', type: 'full-time', experience: 'mid-level', remote: false, hybrid: true, description: 'Help build reliable commerce infrastructure for growing brands.', requirements: ['React and Node.js experience', 'SQL fluency', 'Comfort working across the stack'], responsibilities: ['Ship customer-facing features', 'Improve API performance'], skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'], salary: '₹20L – ₹30L', postedAt: '2026-10-10T09:00:00.000Z', deadline: '2026-11-05T09:00:00.000Z', applicants: 31, status: 'open', matchScore: 91 },
  { id: 'job-3', title: 'Frontend Platform Engineer', company: { id: 'mint', name: 'Mintly' }, location: 'Remote', type: 'full-time', experience: 'senior', remote: true, hybrid: false, description: 'Create the platform and design system powering a fast-growing fintech product.', requirements: ['Design systems experience', 'Advanced TypeScript'], responsibilities: ['Build shared UI foundations', 'Improve developer experience'], skills: ['TypeScript', 'React', 'Storybook', 'GraphQL'], salary: '₹32L – ₹45L', postedAt: '2026-10-08T09:00:00.000Z', deadline: null, applicants: 18, status: 'open', matchScore: 89 },
];

export const demoConnections = demoDevelopers.slice(0, 4).map((developer, index) => ({ ...developer, connectedAt: `${index + 1} week${index ? 's' : ''} ago` }));
export const demoPendingRequests = [{ id: 'request-1', from: demoDevelopers[4], sentAt: '2 hours ago' }, { id: 'request-2', from: demoDevelopers[5], sentAt: 'Yesterday' }];
export const demoSentRequests = [{ id: 'request-3', to: demoDevelopers[3], sentAt: '3 days ago' }];

export const demoNotifications = [
  { id: 'notification-1', message: 'Ananya Sharma accepted your connection request.', createdAt: '2026-10-14T08:30:00.000Z', read: false, link: '/connections' },
  { id: 'notification-2', message: 'Your project “DevFlow” was featured in the community showcase.', createdAt: '2026-10-13T12:00:00.000Z', read: false, link: '/projects/devflow' },
  { id: 'notification-3', message: 'You have a new 96% match for Senior Frontend Engineer at Orbit Labs.', createdAt: '2026-10-12T10:00:00.000Z', read: true, link: '/jobs/job-1' },
  { id: 'notification-4', message: 'Priya Nair viewed your profile.', createdAt: '2026-10-11T15:45:00.000Z', read: true, link: '/developers/priya-nair' },
];

export const demoApplications = [
  { id: 'application-1', jobId: 'job-1', jobTitle: 'Senior Frontend Engineer', companyName: 'Orbit Labs', status: 'shortlisted', submittedAt: '2026-10-02T09:00:00.000Z', updatedAt: '2026-10-13T09:00:00.000Z' },
  { id: 'application-2', jobId: 'job-2', jobTitle: 'Full Stack Developer', companyName: 'Atlas Commerce', status: 'under_review', submittedAt: '2026-10-06T09:00:00.000Z', updatedAt: '2026-10-10T09:00:00.000Z' },
  { id: 'application-3', jobId: 'job-3', jobTitle: 'Frontend Platform Engineer', companyName: 'Mintly', status: 'submitted', submittedAt: '2026-10-11T09:00:00.000Z', updatedAt: '2026-10-11T09:00:00.000Z' },
];
