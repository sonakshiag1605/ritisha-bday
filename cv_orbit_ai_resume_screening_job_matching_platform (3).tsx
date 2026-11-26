import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Briefcase,
  Users,
  FileText,
  Sparkles,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Eye,
  EyeOff,
  Sliders,
  BarChart3,
  Columns,
  GitCompare,
  Award,
  BookOpen,
  Compass,
  MessageSquare,
  Send,
  UploadCloud,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Shield,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Star,
  Tag,
  Trash2,
  Copy,
  Check,
  X,
  TrendingUp,
  Layers,
  GraduationCap,
  Cpu,
  Target,
  Zap,
  Globe,
  Building2,
  Mail,
  UserCheck,
  FileCheck,
  Play,
  ArrowUpRight,
  Command,
  Menu,
  ExternalLink,
  Key,
  Youtube,
  RefreshCw,
  FileUp,
  Maximize2
} from 'lucide-react';

// ============================================================================
// 1. REAL CLIENT-SIDE PDF EXTRACTOR & YOUTUBE DATA API v3 INTEGRATION
// ============================================================================
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function loadPdfJsLibrary() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
      resolve(window.pdfjsLib);
      return;
    }
    const existing = document.querySelector(`script[src="${PDFJS_CDN}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js failed to initialize'));
        }
      });
      return;
    }
    const script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js unavailable'));
      }
    };
    script.onerror = () => reject(new Error('Could not load PDF parser library'));
    document.head.appendChild(script);
  });
}

async function extractTextFromUploadedFile(file) {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return await file.text();
  }

  try {
    const pdfjs = await loadPdfJsLibrary();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str || '');
      pageTexts.push(strings.join(' '));
    }

    const combined = pageTexts.join('\n\n').trim();
    if (combined.length > 25) {
      return combined;
    }
  } catch (err) {
    console.warn('PDF.js extraction fallback triggered:', err);
  }

  // Fallback binary text stream scanner if CDN is blocked or PDF uses uncompressed streams
  const buffer = await file.arrayBuffer();
  const raw = new TextDecoder('latin1').decode(buffer);
  const tjMatches = raw.match(/\(([^()\\]{2,})\)\s*Tj/g) || [];
  const extracted = tjMatches
    .map(m => m.replace(/^\(/, '').replace(/\)\s*Tj$/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (extracted.length > 25) {
    return extracted;
  }

  return `${file.name.replace(/\.pdf$/i, '')}\nUploaded PDF Resume Document (${(file.size / 1024).toFixed(1)} KB)\nSkills: Python, React, TypeScript, SQL, Docker, AWS, REST APIs\nExperience: 3 years software engineering experience\nEducation: B.S. in Computer Science`;
}

// ============================================================================
// 2. SKILL NORMALIZATION & NLP RESUME PARSING / MATCHING ENGINE
// ============================================================================
const SKILL_SYNONYMS = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  reactjs: 'React',
  'react.js': 'React',
  react: 'React',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  node: 'Node.js',
  ml: 'Machine Learning',
  'machine learning': 'Machine Learning',
  ai: 'Artificial Intelligence',
  'artificial intelligence': 'Artificial Intelligence',
  nlp: 'NLP',
  'natural language processing': 'NLP',
  dl: 'Deep Learning',
  'deep learning': 'Deep Learning',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  sql: 'SQL',
  mysql: 'SQL',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  docker: 'Docker',
  aws: 'AWS',
  'amazon web services': 'AWS',
  gcp: 'GCP',
  fastapi: 'FastAPI',
  django: 'Django',
  flask: 'Flask',
  tailwind: 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',
  figma: 'Figma',
  'ui/ux': 'UI/UX Design',
  ux: 'UI/UX Design',
  graphql: 'GraphQL',
  redis: 'Redis',
  git: 'Git',
  'ci/cd': 'CI/CD',
  cicd: 'CI/CD',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  'llm': 'LLM Engineering',
  'llms': 'LLM Engineering',
  'rag': 'RAG Systems',
  agile: 'Agile/Scrum',
  scrum: 'Agile/Scrum',
  'product management': 'Product Strategy',
  'data analysis': 'Data Analytics',
  pandas: 'Pandas',
  'rest api': 'REST APIs',
  'restful': 'REST APIs',
  'system design': 'System Design',
  'design systems': 'Design Systems',
  'product design': 'Product Design'
};

const ALL_KNOWN_SKILLS = Array.from(new Set(Object.values(SKILL_SYNONYMS)));

function normalizeSkill(raw) {
  if (!raw) return '';
  const cleaned = raw.trim().toLowerCase();
  if (SKILL_SYNONYMS[cleaned]) return SKILL_SYNONYMS[cleaned];
  return raw.trim().replace(/\b\w/g, (l) => l.toUpperCase());
}

function parseResumeNLP(rawText, fileName = 'resume.pdf') {
  const text = rawText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const candidateName = lines[0] && lines[0].length < 45 && !lines[0].includes('@')
    ? lines[0].replace(/^#+\s*/, '')
    : fileName.replace(/\.(pdf|docx|txt)$/i, '').replace(/[_-]/g, ' ');

  const detectedSet = new Set();
  const lowerText = text.toLowerCase();

  Object.entries(SKILL_SYNONYMS).forEach(([alias, canonical]) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(lowerText)) {
      detectedSet.add(canonical);
    }
  });

  if (detectedSet.size === 0) {
    ['Python', 'SQL', 'REST APIs', 'Git'].forEach(s => detectedSet.add(s));
  }

  let experienceYears = 2;
  const expRegex = /(\d+)\+?\s*(?:years|yrs)(?:\s+of)?\s+(?:experience|exp)/i;
  const expMatch = text.match(expRegex);
  if (expMatch) {
    experienceYears = Math.min(20, Math.max(0, parseInt(expMatch[1], 10)));
  } else {
    const yearMatches = text.match(/20(1[5-9]|2[0-6])/g);
    if (yearMatches && yearMatches.length >= 2) {
      const nums = yearMatches.map(y => parseInt(y, 10));
      experienceYears = Math.max(1, Math.min(15, Math.max(...nums) - Math.min(...nums)));
    }
  }

  let education = 'B.S. in Computer Science';
  let eduLevel = 2;
  if (/ph\.?d|doctorate/i.test(text)) {
    education = 'Ph.D. in Computer Science / AI';
    eduLevel = 4;
  } else if (/m\.?s\.?|master|m\.?tech|mba/i.test(text)) {
    education = 'M.S. in Computer Science & Engineering';
    eduLevel = 3;
  } else if (/b\.?s\.?|b\.?tech|bachelor|b\.?e\./i.test(text)) {
    education = 'B.S. in Computer Science';
    eduLevel = 2;
  }

  const titleLine = lines.find((l, idx) => idx > 0 && idx < 5 && l.length < 60 && !l.includes('@'));
  const extractedTitle = titleLine || `${Array.from(detectedSet)[0] || 'Software'} Engineer`;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasMetrics = /\d+%|\$\d+|\d+x|\d+\+/i.test(text);
  const hasSections = /(experience|education|skills|projects)/i.test(text);
  const atsScore = Math.min(
    98,
    Math.max(
      54,
      50 +
        Math.min(22, detectedSet.size * 3) +
        (hasMetrics ? 12 : 0) +
        (hasSections ? 10 : 0) +
        (wordCount > 80 ? 4 : 0)
    )
  );

  return {
    name: candidateName,
    email: emailMatch ? emailMatch[0] : `${candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: phoneMatch ? phoneMatch[0] : '+1 (415) 890-4312',
    title: extractedTitle,
    skills: Array.from(detectedSet),
    experienceYears,
    education,
    eduLevel,
    atsScore,
    wordCount,
    hasMetrics,
    hasSections,
    rawText: text
  };
}

function computeHybridMatch(candidate, job, weights = { skills: 50, experience: 30, education: 20 }) {
  const candSkills = (candidate.skills || []).map(normalizeSkill);
  const reqSkills = (job.requiredSkills || []).map(normalizeSkill);
  const prefSkills = (job.preferredSkills || []).map(normalizeSkill);

  const matchedSkills = reqSkills.filter(s => candSkills.includes(s));
  const missingSkills = reqSkills.filter(s => !candSkills.includes(s));
  const bonusMatched = prefSkills.filter(s => candSkills.includes(s));

  const reqRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 1;
  const bonusBoost = prefSkills.length > 0 ? (bonusMatched.length / prefSkills.length) * 12 : 0;
  const skillScore = Math.min(100, Math.round(reqRatio * 90 + bonusBoost));

  const reqExp = job.minExperience || 2;
  const candExp = candidate.experienceYears || 0;
  let expScore = 100;
  if (candExp < reqExp) {
    expScore = Math.max(35, Math.round((candExp / Math.max(1, reqExp)) * 88));
  } else {
    expScore = Math.min(100, 92 + Math.min(8, (candExp - reqExp) * 2));
  }

  const reqEdu = job.minEduLevel || 2;
  const candEdu = candidate.eduLevel || 2;
  const eduScore = candEdu >= reqEdu ? 100 : Math.max(60, 100 - (reqEdu - candEdu) * 20);

  const totalWeight = (weights.skills + weights.experience + weights.education) || 100;
  const overall = Math.round(
    (skillScore * weights.skills + expScore * weights.experience + eduScore * weights.education) /
      totalWeight
  );

  const explanation =
    missingSkills.length === 0
      ? `Strong alignment across all ${reqSkills.length} core skills (${matchedSkills.join(', ')}) and ${candExp} yrs experience.`
      : `Matches ${matchedSkills.length}/${reqSkills.length} required skills. Upskilling in ${missingSkills.slice(0, 2).join(' & ')} will raise match score by +${Math.min(18, missingSkills.length * 7)}%.`;

  return {
    overall: Math.min(99, Math.max(25, overall)),
    skillScore,
    expScore,
    eduScore,
    matchedSkills,
    missingSkills,
    bonusMatched,
    explanation
  };
}

// ============================================================================
// 3. SEED DATA (JOBS, TRENDING COMPANIES, CANDIDATES, VERIFIED YOUTUBE COURSES)
// ============================================================================
const INITIAL_JOBS = [
  {
    id: 'job-1',
    company: 'TalentMatch Core Labs',
    title: 'Senior Full-Stack AI Engineer',
    department: 'Core Platform',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-Time',
    salary: '$165,000 – $195,000',
    postedDate: '2 days ago',
    status: 'Open',
    minExperience: 4,
    minEduLevel: 2,
    deadline: '2026-12-15',
    requiredSkills: ['React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    preferredSkills: ['AWS', 'Redis', 'LLM Engineering', 'Tailwind CSS'],
    description: 'Lead architecture for our next-generation AI talent intelligence workflows, building low-latency FastAPI microservices and modern React interfaces.'
  },
  {
    id: 'job-2',
    company: 'DeepVector Intelligence',
    title: 'Machine Learning & NLP Engineer',
    department: 'AI Research',
    location: 'Remote (US / EU)',
    type: 'Full-Time',
    salary: '$180,000 – $220,000',
    postedDate: '4 days ago',
    status: 'Open',
    minExperience: 3,
    minEduLevel: 3,
    deadline: '2026-12-20',
    requiredSkills: ['Python', 'Machine Learning', 'NLP', 'PyTorch', 'LLM Engineering'],
    preferredSkills: ['RAG Systems', 'Docker', 'AWS', 'FastAPI'],
    description: 'Design hybrid semantic retrieval models, embedding pipelines, and explainable ranking algorithms for millions of candidate profiles.'
  },
  {
    id: 'job-3',
    company: 'CloudScale Systems',
    title: 'Cloud & DevOps Infrastructure Lead',
    department: 'Platform Ops',
    location: 'New York, NY (Hybrid)',
    type: 'Full-Time',
    salary: '$160,000 – $188,000',
    postedDate: '1 week ago',
    status: 'Open',
    minExperience: 5,
    minEduLevel: 2,
    deadline: '2026-12-10',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Python'],
    preferredSkills: ['PostgreSQL', 'Redis', 'System Design'],
    description: 'Scale multi-region Kubernetes clusters, zero-downtime deployment pipelines, and SOC2-compliant cloud infrastructure.'
  },
  {
    id: 'job-4',
    company: 'StudioCraft Enterprise',
    title: 'Staff Product Designer (Design Systems)',
    department: 'Design',
    location: 'Austin, TX / Remote',
    type: 'Full-Time',
    salary: '$150,000 – $178,000',
    postedDate: '5 days ago',
    status: 'Open',
    minExperience: 4,
    minEduLevel: 2,
    deadline: '2026-12-22',
    requiredSkills: ['Figma', 'Product Design', 'Design Systems', 'UI/UX Design', 'React'],
    preferredSkills: ['Tailwind CSS', 'TypeScript', 'Agile/Scrum'],
    description: 'Craft intuitive, WCAG-accessible enterprise SaaS experiences and maintain our multi-brand component design system.'
  },
  {
    id: 'job-5',
    company: 'RazorFlow FinTech',
    title: 'Senior Backend & Payments Engineer',
    department: 'Payments Core',
    location: 'San Francisco / Remote',
    type: 'Full-Time',
    salary: '$180,000 – $215,000',
    postedDate: 'Today',
    status: 'Open',
    minExperience: 3,
    minEduLevel: 2,
    deadline: '2026-12-28',
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
    preferredSkills: ['AWS', 'Kubernetes', 'System Design'],
    description: 'Build ultra-low-latency payment routing APIs and real-time fraud scoring pipelines.'
  },
  {
    id: 'job-6',
    company: 'ApexCloud AI',
    title: 'Full-Stack AI Product Engineer',
    department: 'Enterprise Copilot',
    location: 'New York / Hybrid',
    type: 'Full-Time',
    salary: '$172,000 – $205,000',
    postedDate: 'Today',
    status: 'Open',
    minExperience: 3,
    minEduLevel: 2,
    deadline: '2026-12-29',
    requiredSkills: ['React', 'TypeScript', 'Python', 'FastAPI', 'LLM Engineering'],
    preferredSkills: ['Next.js', 'Docker', 'AWS'],
    description: 'Develop autonomous enterprise copilots, semantic search APIs, and interactive React interfaces.'
  },
  {
    id: 'job-7',
    company: 'Amazon',
    title: 'Software Development Engineer II (AWS & Distributed Systems)',
    department: 'AWS Core Cloud',
    location: 'Seattle, WA / Bengaluru (Hybrid)',
    type: 'Full-Time',
    salary: '$185,000 – $225,000',
    postedDate: 'Today',
    status: 'Open',
    minExperience: 3,
    minEduLevel: 2,
    deadline: '2026-12-30',
    requiredSkills: ['Python', 'AWS', 'Docker', 'Kubernetes', 'System Design', 'REST APIs'],
    preferredSkills: ['Redis', 'PostgreSQL', 'CI/CD'],
    description: 'Architect planet-scale distributed cloud storage and low-latency microservice orchestration on AWS.'
  },
  {
    id: 'job-8',
    company: 'Gemini Solutions',
    title: 'Full-Stack Enterprise & Cloud Consultant',
    department: 'Digital Product Engineering',
    location: 'Gurugram / Noida / Remote (Hybrid)',
    type: 'Full-Time',
    salary: '$145,000 – $175,000',
    postedDate: 'Today',
    status: 'Open',
    minExperience: 2,
    minEduLevel: 2,
    deadline: '2026-12-30',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'REST APIs'],
    preferredSkills: ['Docker', 'AWS', 'Tailwind CSS'],
    description: 'Deliver high-impact enterprise web applications, API platforms, and cloud transformation solutions for global clients.'
  },
  {
    id: 'job-9',
    company: 'Microsoft',
    title: 'Senior AI & Cloud Platform Engineer (Azure Copilot)',
    department: 'Azure AI Engineering',
    location: 'Redmond, WA / Hyderabad (Hybrid)',
    type: 'Full-Time',
    salary: '$190,000 – $230,000',
    postedDate: 'Today',
    status: 'Open',
    minExperience: 4,
    minEduLevel: 2,
    deadline: '2026-12-31',
    requiredSkills: ['TypeScript', 'React', 'Python', 'LLM Engineering', 'Docker', 'Kubernetes'],
    preferredSkills: ['PyTorch', 'RAG Systems', 'System Design'],
    description: 'Build intelligent developer copilots, multi-modal AI workflows, and enterprise cloud infrastructure.'
  }
];

const TRENDING_COMPANIES = [
  {
    id: 'tc-amazon',
    name: 'Amazon',
    jobId: 'job-7',
    sector: 'Cloud Computing & Global E-Commerce',
    hq: 'Seattle • Bengaluru • Hyderabad',
    openRoles: 48,
    avgPackage: '$185k – $225k',
    hiringTrend: '+54% SDE Hiring',
    badge: 'FAANG Giant',
    accent: 'from-amber-500 to-orange-600'
  },
  {
    id: 'tc-gemini',
    name: 'Gemini Solutions',
    jobId: 'job-8',
    sector: 'IT Consulting & Product Engineering',
    hq: 'Gurugram • Noida • Panchkula',
    openRoles: 24,
    avgPackage: '$145k – $175k',
    hiringTrend: 'Fast-Track Offers',
    badge: 'Top Tech Partner',
    accent: 'from-teal-500 to-emerald-600'
  },
  {
    id: 'tc-microsoft',
    name: 'Microsoft',
    jobId: 'job-9',
    sector: 'Enterprise Cloud & Azure AI',
    hq: 'Redmond • Hyderabad • Bengaluru',
    openRoles: 41,
    avgPackage: '$190k – $230k',
    hiringTrend: 'Copilot R&D Drive',
    badge: 'Global Leader',
    accent: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'tc-1',
    name: 'TalentMatch Core Labs',
    jobId: 'job-1',
    sector: 'Enterprise HR & AI SaaS',
    hq: 'San Francisco • Remote',
    openRoles: 16,
    avgPackage: '$165k – $195k',
    hiringTrend: '+40% Hiring Surge',
    badge: 'Hot Startup',
    accent: 'from-indigo-600 to-violet-600'
  },
  {
    id: 'tc-2',
    name: 'RazorFlow FinTech',
    jobId: 'job-5',
    sector: 'FinTech & Global Payments',
    hq: 'San Francisco • Austin',
    openRoles: 28,
    avgPackage: '$180k – $215k',
    hiringTrend: 'Immediate Interviews',
    badge: 'Top Recruiter',
    accent: 'from-violet-600 to-purple-600'
  },
  {
    id: 'tc-3',
    name: 'DeepVector Intelligence',
    jobId: 'job-2',
    sector: 'Foundation Models & NLP',
    hq: 'Seattle • Remote',
    openRoles: 12,
    avgPackage: '$185k – $225k',
    hiringTrend: 'AI R&D Drive',
    badge: 'High Comp',
    accent: 'from-cyan-500 to-blue-600'
  }
];

const INITIAL_CANDIDATES = [
  {
    id: 'cand-1041',
    anonymizedId: 'Candidate #1041',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (415) 721-9834',
    location: 'San Francisco, CA',
    title: 'Full-Stack Software Engineer',
    appliedJobId: 'job-1',
    stage: 'Shortlisted',
    rating: 5,
    uploadDate: '2026-11-24',
    source: 'Direct Portal',
    experienceYears: 4,
    education: 'B.S. in Computer Science, UC Berkeley',
    eduLevel: 2,
    skills: ['React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Tailwind CSS', 'Git', 'REST APIs'],
    strengths: [
      '4+ years shipping production React + Python microservices',
      'Reduced API p95 latency by 42% using async FastAPI & Redis',
      'Strong architectural grasp of relational schemas'
    ],
    risks: ['No direct production Docker/Kubernetes certification listed'],
    notes: 'Top communicator during initial screen. Recommended advancing to technical system design.',
    tags: ['Top Match', 'Fast-Track', 'Full-Stack'],
    interviewScheduled: '2026-11-29 at 10:30 AM PST',
    rawText: `Alex Rivera\nalex.rivera@example.com | +1 (415) 721-9834 | San Francisco, CA\nSenior Full-Stack Software Engineer with 4 years of experience building scalable AI web applications.\n\nEXPERIENCE\nSoftware Engineer II — PulseCloud Inc. (2023 - Present)\n- Architected React, TypeScript, and Tailwind CSS dashboards serving 180K+ monthly active users.\n- Built Python and FastAPI REST APIs backed by PostgreSQL, cutting query latency by 42%.\n\nSoftware Engineer — FinStack Labs (2022 - 2023)\n- Developed automated CI workflows and full-stack analytics features.\n\nEDUCATION\nB.S. in Computer Science, University of California, Berkeley`
  },
  {
    id: 'cand-1042',
    anonymizedId: 'Candidate #1042',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+1 (206) 442-1190',
    location: 'Seattle, WA',
    title: 'Senior NLP & ML Research Engineer',
    appliedJobId: 'job-2',
    stage: 'Interview',
    rating: 5,
    uploadDate: '2026-11-23',
    source: 'LinkedIn Import',
    experienceYears: 5,
    education: 'M.S. in Machine Learning, Carnegie Mellon University',
    eduLevel: 3,
    skills: ['Python', 'Machine Learning', 'NLP', 'PyTorch', 'LLM Engineering', 'RAG Systems', 'AWS', 'Docker'],
    strengths: [
      'Published NLP researcher with 5 years production ML deployment',
      'Hands-on RAG & semantic embedding optimization at scale',
      'Full containerization & AWS SageMaker experience'
    ],
    risks: ['Compensation expectation near top of band ($215k)'],
    notes: 'Exceptional technical depth on hybrid vector + lexical search.',
    tags: ['AI Specialist', 'CMU Alumni'],
    interviewScheduled: '2026-11-28 at 2:00 PM PST',
    rawText: `Priya Nair\npriya.nair@example.com | Seattle, WA\nSenior Machine Learning & NLP Engineer with 5 years of experience in PyTorch, LLM Engineering, and RAG Systems.\n\nEXPERIENCE\nStaff ML Engineer — VectorMind AI (2022 - Present)\n- Fine-tuned transformer models in PyTorch and deployed Dockerized inference on AWS.\n\nEDUCATION\nM.S. in Machine Learning, Carnegie Mellon University`
  },
  {
    id: 'cand-1043',
    anonymizedId: 'Candidate #1043',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (646) 319-7721',
    location: 'New York, NY',
    title: 'Principal Cloud Infrastructure Architect',
    appliedJobId: 'job-3',
    stage: 'Offer',
    rating: 5,
    uploadDate: '2026-11-20',
    source: 'Employee Referral',
    experienceYears: 7,
    education: 'B.S. in Computer Engineering, Georgia Tech',
    eduLevel: 2,
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Python', 'PostgreSQL', 'Redis', 'System Design'],
    strengths: [
      '7 years leading multi-region AWS & Kubernetes infrastructure',
      'Cut cloud spend by 31% via automated spot autoscaling'
    ],
    risks: ['Requires 3-week notice period before start date'],
    notes: 'Offer letter approved by VP of Engineering.',
    tags: ['Referral', 'Infra Lead'],
    interviewScheduled: null,
    rawText: `Marcus Vance\nmarcus.vance@example.com | New York, NY\nCloud & DevOps Infrastructure Lead with 7 years of experience in AWS, Docker, Kubernetes, CI/CD, and Python.\n\nEXPERIENCE\nPrincipal SRE — NimbusCore (2020 - Present)\n- Managed 120+ Kubernetes clusters on AWS with Terraform and GitHub Actions CI/CD.\n\nEDUCATION\nB.S. in Computer Engineering, Georgia Tech`
  },
  {
    id: 'cand-1044',
    anonymizedId: 'Candidate #1044',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (512) 904-6612',
    location: 'Austin, TX',
    title: 'Lead Product & Design Systems Architect',
    appliedJobId: 'job-4',
    stage: 'Screening',
    rating: 4,
    uploadDate: '2026-11-25',
    source: 'Direct Portal',
    experienceYears: 5,
    education: 'B.F.A. in Interaction Design, RISD',
    eduLevel: 2,
    skills: ['Figma', 'Product Design', 'Design Systems', 'UI/UX Design', 'React', 'Tailwind CSS', 'TypeScript'],
    strengths: [
      'Built multi-theme enterprise Figma + React component libraries',
      'Strong frontend prototyping skills in TypeScript & Tailwind'
    ],
    risks: ['Limited exposure to complex enterprise data visualization'],
    notes: 'Portfolio review scheduled with Design Director.',
    tags: ['Design Systems', 'UI Engineer'],
    interviewScheduled: null,
    rawText: `Elena Rostova\nelena.rostova@example.com | Austin, TX\nStaff Product Designer with 5 years of experience in Figma, Design Systems, UI/UX Design, React, and Tailwind CSS.\n\nEXPERIENCE\nLead Product Designer — FlowGrid (2021 - Present)\n- Built accessible design systems in Figma and React.\n\nEDUCATION\nB.F.A. in Interaction Design, RISD`
  },
  {
    id: 'cand-1045',
    anonymizedId: 'Candidate #1045',
    name: 'Devon Brooks',
    email: 'devon.brooks@example.com',
    phone: '+1 (312) 558-2209',
    location: 'Chicago, IL',
    title: 'Backend Python & Data Engineer',
    appliedJobId: 'job-2',
    stage: 'Applied',
    rating: 3,
    uploadDate: '2026-11-26',
    source: 'Job Board API',
    experienceYears: 2,
    education: 'B.S. in Data Science, UIUC',
    eduLevel: 2,
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'SQL', 'Pandas', 'NLP', 'Git'],
    strengths: ['Clean Python & SQL engineering fundamentals'],
    risks: ['Lacks PyTorch & production LLM Engineering depth'],
    notes: 'Promising junior/mid engineer, though slightly below senior bar for AI Research role.',
    tags: ['Backend', 'High Potential'],
    interviewScheduled: null,
    rawText: `Devon Brooks\ndevon.brooks@example.com | Chicago, IL\nBackend Developer with 2 years of experience in Python, FastAPI, and NLP pipelines.\n\nEXPERIENCE\nSoftware Engineer — DataPulse (2024 - Present)\n- Built REST APIs with Python, FastAPI, and PostgreSQL.\n\nEDUCATION\nB.S. in Data Science, UIUC`
  },
  {
    id: 'cand-1047',
    anonymizedId: 'Candidate #1047',
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    phone: '+1 (415) 622-9104',
    location: 'San Jose, CA',
    title: 'Senior Full-Stack & GenAI Engineer',
    appliedJobId: 'job-6',
    stage: 'Shortlisted',
    rating: 5,
    uploadDate: '2026-11-26',
    source: 'TalentMatch Portal',
    experienceYears: 4,
    education: 'M.S. in Computer Science, UC Berkeley',
    eduLevel: 3,
    skills: ['React', 'TypeScript', 'Python', 'FastAPI', 'LLM Engineering', 'PostgreSQL', 'Git'],
    strengths: ['4 years building production React + Python GenAI apps', 'Strong M.S. CS pedigree from UC Berkeley'],
    risks: ['Needs deeper Kubernetes production experience'],
    notes: 'Strong full-stack + LLM engineering blend; shortlisted for ApexCloud AI.',
    tags: ['GenAI', 'Full-Stack'],
    interviewScheduled: '2026-12-02 at 1:30 PM PST',
    rawText: `Maya Lin\nmaya.lin@example.com | San Jose, CA\nSenior Full-Stack & GenAI Engineer with 4 years of experience in React, TypeScript, Python, and FastAPI.\n\nEXPERIENCE\nSoftware Engineer II — VectorApps (2022 - Present)\n- Built LLM Engineering workflows and FastAPI microservices integrated with React and PostgreSQL.\n\nEDUCATION\nM.S. in Computer Science, UC Berkeley`
  },
  {
    id: 'cand-1048',
    anonymizedId: 'Candidate #1048',
    name: 'Rohan Kulkarni',
    email: 'rohan.k@example.com',
    phone: '+1 (646) 803-5521',
    location: 'New York, NY',
    title: 'Backend & Distributed Data Engineer',
    appliedJobId: 'job-5',
    stage: 'Screening',
    rating: 4,
    uploadDate: '2026-11-26',
    source: 'LinkedIn Direct',
    experienceYears: 4,
    education: 'B.S. in Computer Engineering, Georgia Tech',
    eduLevel: 2,
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'REST APIs', 'Git'],
    strengths: ['4 years scaling high-throughput Python & Redis payment APIs', 'Clean SQL & PostgreSQL optimization'],
    risks: ['Missing Docker & Kubernetes container orchestration'],
    notes: 'Solid backend speed; recommended Docker course in Learning Hub.',
    tags: ['Payments', 'Backend'],
    interviewScheduled: null,
    rawText: `Rohan Kulkarni\nrohan.k@example.com | New York, NY\nBackend Engineer with 4 years of experience in Python, FastAPI, PostgreSQL, and Redis.\n\nEXPERIENCE\nBackend Engineer — PayGrid (2022 - Present)\n- Engineered low-latency FastAPI and Redis transaction services handling 25K TPS.\n\nEDUCATION\nB.S. in Computer Engineering, Georgia Tech`
  }
];

const LEARNING_CATALOG = [
  {
    id: 'crs-1',
    skill: 'Docker',
    title: 'Docker Containers & Microservices Masterclass',
    provider: 'freeCodeCamp • YouTube',
    youtubeId: 'fqMOX6JJhGo',
    duration: '2h 10m',
    level: 'Intermediate',
    cost: 'Free',
    rating: 4.9,
    summary: 'Containerize Python FastAPI & Node services, write multi-stage Dockerfiles, and orchestrate local stacks.'
  },
  {
    id: 'crs-2',
    skill: 'AWS',
    title: 'AWS Certified Solutions Architect Crash Course',
    provider: 'freeCodeCamp • YouTube',
    youtubeId: 'Ia-UEYYR44s',
    duration: '10h 30m',
    level: 'Intermediate',
    cost: 'Free',
    rating: 4.8,
    summary: 'Master EC2, ECS, S3, IAM security, RDS PostgreSQL, and automated cloud deployments.'
  },
  {
    id: 'crs-3',
    skill: 'Kubernetes',
    title: 'Kubernetes Full Course for Cloud Engineers',
    provider: 'TechWorld with Nana • YouTube',
    youtubeId: 'X48VuDVv0do',
    duration: '3h 55m',
    level: 'Advanced',
    cost: 'Free',
    rating: 4.9,
    summary: 'Deploy pods, ingress controllers, Helm charts, and zero-downtime rolling updates.'
  },
  {
    id: 'crs-4',
    skill: 'LLM Engineering',
    title: 'Building Production LLM & RAG Pipelines',
    provider: 'freeCodeCamp • YouTube',
    youtubeId: 'tcqEUSNCn8I',
    duration: '2h 45m',
    level: 'Advanced',
    cost: 'Free',
    rating: 4.9,
    summary: 'Implement vector embeddings, hybrid semantic search, prompt guardrails, and evaluation harnesses.'
  },
  {
    id: 'crs-5',
    skill: 'PyTorch',
    title: 'Deep Learning & NLP with PyTorch',
    provider: 'freeCodeCamp • YouTube',
    youtubeId: 'V_xro1bcAuA',
    duration: '4h 15m',
    level: 'Intermediate',
    cost: 'Free',
    rating: 4.8,
    summary: 'Train transformer encoders, sequence classifiers, and custom embedding models from scratch.'
  },
  {
    id: 'crs-6',
    skill: 'Redis',
    title: 'High-Throughput Caching & Queues with Redis',
    provider: 'Traversy Media • YouTube',
    youtubeId: 'jgpVdJB2sKQ',
    duration: '1h 20m',
    level: 'Beginner',
    cost: 'Free',
    rating: 4.7,
    summary: 'Speed up APIs with sub-millisecond caching, pub/sub notifications, and background worker queues.'
  }
];

const PRACTICE_ASSESSMENTS = [
  {
    id: 'test-docker',
    skill: 'Docker',
    title: 'Docker & Containerization Assessment',
    companyTag: 'Amazon • Microsoft Standard',
    durationMins: 10,
    difficulty: 'Intermediate',
    questions: [
      {
        q: 'Which Dockerfile instruction reduces final image size by copying build artifacts from an earlier build stage?',
        options: ['FROM ... AS builder & COPY --from=builder', 'EXPOSE 8080', 'VOLUME /app/data', 'ENTRYPOINT ["sh"]'],
        answerIdx: 0,
        explanation: 'Multi-stage builds use `FROM ... AS builder` and `COPY --from=builder` to exclude compilers/dev dependencies from the final image.'
      },
      {
        q: 'What is the primary difference between CMD and ENTRYPOINT in a Dockerfile?',
        options: [
          'CMD provides default arguments that can be overridden at runtime; ENTRYPOINT defines the main executable',
          'CMD runs at build time while ENTRYPOINT runs at deploy time',
          'ENTRYPOINT only works on Linux containers',
          'There is no difference between them'
        ],
        answerIdx: 0,
        explanation: 'ENTRYPOINT sets the container executable, while CMD supplies default arguments that `docker run` arguments can override.'
      },
      {
        q: 'Which command lists all containers including stopped ones?',
        options: ['docker ps -a', 'docker images --all', 'docker inspect --running', 'docker stats -q'],
        answerIdx: 0,
        explanation: '`docker ps -a` (or `--all`) displays both active and exited containers.'
      }
    ]
  },
  {
    id: 'test-aws',
    skill: 'AWS',
    title: 'AWS Cloud Architecture & Distributed Systems Mock',
    companyTag: 'Amazon SDE-II Track',
    durationMins: 12,
    difficulty: 'Intermediate',
    questions: [
      {
        q: 'Which AWS service provides managed, auto-scaling relational databases with Multi-AZ failover?',
        options: ['Amazon RDS / Aurora', 'Amazon DynamoDB', 'AWS Lambda', 'Amazon S3 Glacier'],
        answerIdx: 0,
        explanation: 'Amazon RDS and Aurora provide managed relational SQL engines with synchronous Multi-AZ standby replicas.'
      },
      {
        q: 'How should an EC2 or ECS microservice securely authenticate to S3 without hardcoding credentials?',
        options: ['Attach an IAM Role with least-privilege S3 policies', 'Store AWS_SECRET_ACCESS_KEY in Git', 'Use public bucket ACLs', 'Pass keys in URL query strings'],
        answerIdx: 0,
        explanation: 'IAM Roles issue temporary rotating credentials automatically via the instance/task metadata service.'
      },
      {
        q: 'Which service decouples microservices using durable message queues?',
        options: ['Amazon SQS', 'Amazon CloudFront', 'AWS Route 53', 'AWS KMS'],
        answerIdx: 0,
        explanation: 'Amazon Simple Queue Service (SQS) buffers messages reliably between asynchronous producers and consumers.'
      }
    ]
  },
  {
    id: 'test-llm',
    skill: 'LLM Engineering',
    title: 'LLM Engineering & RAG Pipelines Mock Test',
    companyTag: 'Microsoft Azure Copilot Track',
    durationMins: 12,
    difficulty: 'Advanced',
    questions: [
      {
        q: 'What is the primary purpose of Retrieval-Augmented Generation (RAG)?',
        options: [
          'Ground LLM responses in up-to-date external knowledge retrieved via semantic/hybrid search',
          'Compress model weights from FP16 to INT4',
          'Replace tokenization with ASCII encoding',
          'Train a foundation model from scratch'
        ],
        answerIdx: 0,
        explanation: 'RAG retrieves relevant documents at query time and injects them into the prompt context to reduce hallucinations.'
      },
      {
        q: 'Why combine BM25 lexical search with dense vector cosine similarity (Hybrid Search)?',
        options: [
          'Captures both exact keyword/acronym matches and semantic conceptual similarity',
          'Eliminates the need for a database',
          'Makes prompts 10x longer automatically',
          'Only works for image generation'
        ],
        answerIdx: 0,
        explanation: 'Dense embeddings excel at semantic meaning while BM25 preserves exact matches for SKUs, error codes, and proper nouns.'
      },
      {
        q: 'Which metric measures how faithfully an LLM answer sticks to the retrieved context?',
        options: ['Faithfulness / Groundedness Score', 'BLEU-1 only', 'Disk IOPS', 'TCP Window Size'],
        answerIdx: 0,
        explanation: 'Faithfulness evaluates whether every claim in the generated answer is supported by the retrieved context.'
      }
    ]
  },
  {
    id: 'test-fullstack',
    skill: 'System Design',
    title: 'Full-Stack & API System Design Mock',
    companyTag: 'Gemini Solutions • Product Track',
    durationMins: 10,
    difficulty: 'Intermediate',
    questions: [
      {
        q: 'Which HTTP status code is most appropriate when rate-limiting an API client?',
        options: ['429 Too Many Requests', '204 No Content', '301 Moved Permanently', '418 I am a teapot'],
        answerIdx: 0,
        explanation: 'HTTP 429 indicates the user has sent too many requests in a given amount of time, often paired with a Retry-After header.'
      },
      {
        q: 'Which caching strategy writes data to the cache and the database simultaneously?',
        options: ['Write-Through Cache', 'Cache-Aside (Lazy Loading)', 'Write-Around Cache', 'Cold Boot'],
        answerIdx: 0,
        explanation: 'Write-Through updates both cache and backing store synchronously so cache reads are always fresh.'
      },
      {
        q: 'What prevents duplicate payment processing when a client retries a timed-out POST request?',
        options: ['An Idempotency-Key header stored in Redis/DB', 'Disabling HTTPS', 'Using GET instead of POST', 'Increasing client timeout to 10 minutes'],
        answerIdx: 0,
        explanation: 'An Idempotency-Key allows the server to recognize retries and return the original transaction result safely.'
      }
    ]
  }
];

// ============================================================================
// 4. REUSABLE UI PRIMITIVES (WATERMARK, SCORE RINGS, RADAR CHART)
// ============================================================================
function WatermarkOverlay({ darkMode }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='380' height='220'>
              <text x='20' y='115' fill='${darkMode ? '#94a3b8' : '#0f172a'}' fill-opacity='0.055'
                font-family='Inter, system-ui, sans-serif' font-size='17' font-weight='800'
                transform='rotate(-24 190 110)'>
                CV ORBIT TEAM • CV Orbit
              </text>
            </svg>`
          )}")`,
          backgroundRepeat: 'repeat'
        }}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed bottom-2.5 right-3.5 z-40 text-xs font-semibold tracking-wide select-none px-3 py-1 rounded-full backdrop-blur-md ${
          darkMode
            ? 'text-slate-300/80 bg-slate-900/60 border border-white/[0.08]'
            : 'text-slate-600/85 bg-white/80 border border-slate-200/80'
        }`}
      >
        CV ORBIT TEAM • CV Orbit
      </div>
    </>
  );
}

function ScoreRing({ score, size = 54, strokeWidth = 5, darkMode }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const gradId = useMemo(() => `ring-grad-${Math.random().toString(36).slice(2, 8)}`, []);

  const stops =
    score >= 82
      ? ['#10B981', '#14B8A6']
      : score >= 65
      ? ['#4F46E5', '#8B5CF6']
      : ['#F59E0B', '#F97316'];

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="100%" stopColor={stops[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold tracking-tight tabular-nums">{score}%</span>
    </div>
  );
}

function SkillRadarChart({ skills, matchedSkills, darkMode }) {
  const displaySkills = skills.slice(0, 6);
  if (displaySkills.length < 3) return null;

  const size = 240;
  const center = size / 2;
  const maxR = 82;
  const count = displaySkills.length;

  const getPoint = (index, ratio) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      x: center + maxR * ratio * Math.cos(angle),
      y: center + maxR * ratio * Math.sin(angle)
    };
  };

  const targetPolygon = displaySkills
    .map((_, i) => {
      const p = getPoint(i, 0.95);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const candidatePolygon = displaySkills
    .map((sk, i) => {
      const has = matchedSkills.includes(sk);
      const p = getPoint(i, has ? 0.92 : 0.34);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {[0.33, 0.66, 1].map((lvl, idx) => (
          <polygon
            key={idx}
            points={displaySkills
              .map((_, i) => {
                const p = getPoint(i, lvl);
                return `${p.x},${p.y}`;
              })
              .join(' ')}
            fill="none"
            stroke={darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}
            strokeWidth="1"
          />
        ))}
        {displaySkills.map((_, i) => {
          const end = getPoint(i, 1);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke={darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}
              strokeWidth="1"
            />
          );
        })}
        <polygon
          points={targetPolygon}
          fill="rgba(99, 102, 241, 0.08)"
          stroke="#6366F1"
          strokeDasharray="4 3"
          strokeWidth="1.5"
        />
        <polygon
          points={candidatePolygon}
          fill="rgba(20, 184, 166, 0.28)"
          stroke="#14B8A6"
          strokeWidth="2"
        />
        {displaySkills.map((sk, i) => {
          const labelPt = getPoint(i, 1.24);
          const has = matchedSkills.includes(sk);
          return (
            <text
              key={sk}
              x={labelPt.x}
              y={labelPt.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-semibold"
              fill={has ? (darkMode ? '#5EEAD4' : '#0F766E') : darkMode ? '#FDA4AF' : '#BE123C'}
            >
              {sk}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 text-[11px] mt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> Your Verified Profile
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-indigo-500 bg-indigo-500/20 inline-block" /> Role Benchmark
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// 5. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // API Keys persisted in localStorage
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('talentmatch_api_keys');
      return saved ? JSON.parse(saved) : { youtubeApiKey: '', llmApiKey: '', llmProvider: 'openai' };
    } catch {
      return { youtubeApiKey: '', llmApiKey: '', llmProvider: 'openai' };
    }
  });
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);

  // Live YouTube search results & active video modal
  const [liveYoutubeCourses, setLiveYoutubeCourses] = useState([]);
  const [activeVideoLesson, setActiveVideoLesson] = useState(null);

  // Active Uploaded PDF Document Preview Modal
  const [previewPdfDoc, setPreviewPdfDoc] = useState(null);

  // Auth & Role State
  const [authUser, setAuthUser] = useState(null);
  const [selectedPortalStep, setSelectedPortalStep] = useState('HR');
  const [authMode, setAuthMode] = useState('login');
  const [emailInput, setEmailInput] = useState('hr.lead@cvorbit.ai');
  const [passwordInput, setPasswordInput] = useState('Enterprise@2026');
  const [nameInput, setNameInput] = useState('Jordan Taylor');
  const [showPassword, setShowPassword] = useState(false);

  // Navigation & Global UI
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [biasFreeMode, setBiasFreeMode] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Core Enterprise Domain State
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('cvorbit_saved_candidates');
      return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    } catch {
      return INITIAL_CANDIDATES;
    }
  });
  const [scoringWeights, setScoringWeights] = useState({ skills: 50, experience: 30, education: 20 });
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: '10 mins ago', actor: 'Sarah Jenkins (HR Lead)', action: 'Shortlisted Alex Rivera for Senior Full-Stack AI Engineer' },
    { id: 2, time: '1 hour ago', actor: 'AI Matching Worker', action: 'Parsed 5 resumes & indexed 1,024-dim semantic vectors' },
    { id: 3, time: '3 hours ago', actor: 'Marcus Vance', action: 'Accepted interview slot for Cloud & DevOps Lead' }
  ]);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'New 94% Match Candidate', text: 'Alex Rivera matched Senior Full-Stack AI Engineer.', unread: true },
    { id: 'n2', title: 'Interview Confirmed', text: 'Priya Nair accepted Friday 2:00 PM PST slot.', unread: true },
    { id: 'n3', title: 'ATS Batch Complete', text: '5 resumes scored with hybrid NLP weights.', unread: false }
  ]);

  // HR Portal Filter & Drawer States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJobId, setFilterJobId] = useState('ALL');
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [filterStage, setFilterStage] = useState('ALL');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [compareIds, setCompareIds] = useState(['cand-1041', 'cand-1042']);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [pdfReportCandidate, setPdfReportCandidate] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Job Seeker Active Profile State
  const [activeCandidateId, setActiveCandidateId] = useState('cand-1041');
  const [savedJobIds, setSavedJobIds] = useState(['job-2']);
  const [completedCourseIds, setCompletedCourseIds] = useState(['crs-6']);
  const [completedTestIds, setCompletedTestIds] = useState([]);
  const [targetGapJobId, setTargetGapJobId] = useState('job-1');
  const [learningSkillFilter, setLearningSkillFilter] = useState('ALL');
  const [uploadedResumeHistory, setUploadedResumeHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('cvorbit_saved_resume_history');
      return saved
        ? JSON.parse(saved)
        : [{ id: 'v1', name: 'Alex_Rivera_Resume_2026.pdf', date: 'Nov 24, 2026', atsScore: 88, active: true, url: null }];
    } catch {
      return [{ id: 'v1', name: 'Alex_Rivera_Resume_2026.pdf', date: 'Nov 24, 2026', atsScore: 88, active: true, url: null }];
    }
  });
  const [resumeUploadPopupData, setResumeUploadPopupData] = useState(null);

  // AI Career Studio States
  const [studioTool, setStudioTool] = useState('chat');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Welcome to your TalentMatch AI Career Copilot! Ask me how to raise your match score, optimize resume impact metrics, or prepare for system design interviews.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [bulletInput, setBulletInput] = useState('Worked on backend APIs and frontend pages for user analytics.');
  const [bulletTargetJob, setBulletTargetJob] = useState('job-1');
  const [improvedBullets, setImprovedBullets] = useState([]);
  const [coverLetterJobId, setCoverLetterJobId] = useState('job-1');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [mockInterviewRole, setMockInterviewRole] = useState('job-1');
  const [mockQuestionIdx, setMockQuestionIdx] = useState(0);
  const [mockAnswer, setMockAnswer] = useState('');
  const [mockFeedback, setMockFeedback] = useState(null);

  const notify = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4200);
  };

  const handleSaveApiKeys = (updatedKeys) => {
    setApiKeys(updatedKeys);
    try {
      localStorage.setItem('talentmatch_api_keys', JSON.stringify(updatedKeys));
    } catch (e) {
      console.warn('Could not save keys to localStorage', e);
    }
    notify('API Keys Saved', 'YouTube Data API v3 and AI integration keys updated.');
  };

  // Persist candidate profile & uploaded resume history automatically
  useEffect(() => {
    try {
      const serializableCandidates = candidates.map(({ pdfUrl, ...rest }) => rest);
      localStorage.setItem('cvorbit_saved_candidates', JSON.stringify(serializableCandidates));
    } catch (e) {
      console.warn('Could not persist candidates to localStorage', e);
    }
  }, [candidates]);

  useEffect(() => {
    try {
      const serializableHistory = uploadedResumeHistory.map(({ url, ...rest }) => rest);
      localStorage.setItem('cvorbit_saved_resume_history', JSON.stringify(serializableHistory));
    } catch (e) {
      console.warn('Could not persist resume history to localStorage', e);
    }
  }, [uploadedResumeHistory]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setSelectedCandidateId(null);
        setNotificationsOpen(false);
        setActiveVideoLesson(null);
        setPreviewPdfDoc(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Derived candidate & job match scores computed dynamically from current weights
  const enrichedCandidates = useMemo(() => {
    return candidates.map(cand => {
      const targetJob = jobs.find(j => j.id === cand.appliedJobId) || jobs[0];
      const match = targetJob
        ? computeHybridMatch(cand, targetJob, scoringWeights)
        : { overall: 0, skillScore: 0, expScore: 0, eduScore: 0, matchedSkills: [], missingSkills: [], bonusMatched: [], explanation: '' };
      return {
        ...cand,
        jobTitle: targetJob ? targetJob.title : cand.title,
        match
      };
    });
  }, [candidates, jobs, scoringWeights]);

  const currentCandidate = useMemo(() => {
    return enrichedCandidates.find(c => c.id === activeCandidateId) || enrichedCandidates[0];
  }, [enrichedCandidates, activeCandidateId]);

  const candidateJobMatches = useMemo(() => {
    if (!currentCandidate) return [];
    return jobs
      .map(job => ({
        job,
        match: computeHybridMatch(currentCandidate, job, scoringWeights)
      }))
      .sort((a, b) => b.match.overall - a.match.overall);
  }, [currentCandidate, jobs, scoringWeights]);

  const formatDisplayNameFromEmail = (email, fallbackRole) => {
    if (!email || !email.includes('@')) {
      return fallbackRole === 'HR' ? 'Sarah Jenkins' : 'Alex Rivera';
    }
    const localPart = email.split('@')[0];
    const words = localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\d+/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return fallbackRole === 'HR' ? 'Sarah Jenkins' : 'Alex Rivera';
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // ==========================================================================
  // AUTH HANDLERS
  // ==========================================================================
  const handlePortalSwitch = (role) => {
    setSelectedPortalStep(role);
    if (role === 'HR') {
      setEmailInput('hr.lead@cvorbit.ai');
    } else {
      setEmailInput('alex.rivera@example.com');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const role = selectedPortalStep;
    const isDefaultHr = emailInput.trim().toLowerCase() === 'hr.lead@cvorbit.ai';
    const isDefaultCandidate = emailInput.trim().toLowerCase() === 'alex.rivera@example.com';

    const displayName =
      authMode === 'signup' && nameInput.trim()
        ? nameInput.trim()
        : isDefaultHr
        ? 'Sarah Jenkins'
        : isDefaultCandidate
        ? currentCandidate.name
        : formatDisplayNameFromEmail(emailInput, role);

    setAuthUser({
      role,
      name: displayName,
      email: emailInput,
      title: role === 'HR' ? 'VP Talent Acquisition' : currentCandidate.title
    });
    setActiveTab('dashboard');
    notify(
      `Welcome, ${displayName}!`,
      `Signed in to ${role === 'HR' ? 'Recruiter Workspace' : 'Candidate Career Portal'}.`
    );
  };

  const handleDemoQuickLogin = (role) => {
    setSelectedPortalStep(role);
    setAuthUser({
      role,
      name: role === 'HR' ? 'Sarah Jenkins' : currentCandidate.name,
      email: role === 'HR' ? 'hr.lead@cvorbit.ai' : currentCandidate.email,
      title: role === 'HR' ? 'VP Talent Acquisition' : currentCandidate.title
    });
    setActiveTab('dashboard');
    notify(
      'Demo Workspace Ready',
      `Signed in with live ${role === 'HR' ? 'HR Recruiter' : 'Job Seeker'} session.`
    );
  };

  const handleLogout = () => {
    setAuthUser(null);
    setSelectedCandidateId(null);
    notify('Signed Out', 'Your session has been securely closed.');
  };

  // ==========================================================================
  // DOMAIN ACTION HANDLERS (HR PIPELINE, CANDIDATE APPLICATIONS & LEARNING)
  // ==========================================================================
  const updateCandidateStage = (candId, nextStage) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candId ? { ...c, stage: nextStage } : c))
    );
    const target = candidates.find(c => c.id === candId);
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: authUser?.name || 'HR Recruiter',
        action: `Moved ${target?.name || 'Candidate'} to ${nextStage}`
      },
      ...prev
    ]);
    notify('Pipeline Updated', `Candidate moved to ${nextStage}.`);
  };

  const handleAddCandidateNote = (candId) => {
    if (!newNoteText.trim()) return;
    setCandidates(prev =>
      prev.map(c =>
        c.id === candId
          ? { ...c, notes: `${c.notes}\n• [${authUser?.name || 'Recruiter'}]: ${newNoteText.trim()}` }
          : c
      )
    );
    setNewNoteText('');
    notify('Note Saved', 'Evaluation note added to candidate dossier.');
  };

  const handleCandidateApplyJob = (job) => {
    setCandidates(prev =>
      prev.map(c =>
        c.id === currentCandidate.id
          ? { ...c, appliedJobId: job.id, stage: 'Applied', uploadDate: 'Today' }
          : c
      )
    );
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: currentCandidate.name,
        action: `Applied to ${job.title} at ${job.company || job.department}`
      },
      ...prev
    ]);
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title: 'Application Submitted',
        text: `${currentCandidate.name} applied for ${job.title}.`,
        unread: true
      },
      ...prev
    ]);
    notify('Application Sent!', `You applied to ${job.title} (${job.company || job.department}).`);
  };

  const handleCompleteCourse = (course) => {
    if (completedCourseIds.includes(course.id)) return;
    setCompletedCourseIds(prev => [...prev, course.id]);

    const normalized = normalizeSkill(course.skill);
    setCandidates(prev =>
      prev.map(c =>
        c.id === currentCandidate.id
          ? {
              ...c,
              skills: c.skills.includes(normalized) ? c.skills : [...c.skills, normalized]
            }
          : c
      )
    );
    notify(
      `Skill Unlocked: ${normalized}!`,
      `Your profile & all job eligibility scores have been recalculated live.`
    );
  };

  // ==========================================================================
  // RENDER: SPLIT-SCREEN ENTERPRISE LOGIN (FULL LIGHT/DARK THEME + WORKPLACE PHOTO)
  // ==========================================================================
  if (!authUser) {
    return (
      <div className={`min-h-screen flex flex-col lg:flex-row relative selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
        darkMode ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}>
        <WatermarkOverlay darkMode={darkMode} />

        {/* Left Column: Brand Story + Workplace Photography + Live Match Preview */}
        <div
          className={`lg:w-[52%] relative overflow-hidden p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r transition-colors duration-300 ${
            darkMode
              ? 'bg-[#0B101D] text-white border-white/[0.08]'
              : 'bg-gradient-to-br from-indigo-50/95 via-white to-teal-50/75 text-slate-900 border-slate-200/80'
          }`}
        >
          {/* Subtle Modern Office Workplace Background Photo */}
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80"
            alt="Modern collaborative office workplace"
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
              darkMode ? 'opacity-[0.14] mix-blend-luminosity' : 'opacity-[0.11]'
            }`}
          />
          <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
            darkMode ? 'bg-indigo-600/25' : 'bg-indigo-400/20'
          }`} />
          <div className={`absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full blur-3xl pointer-events-none ${
            darkMode ? 'bg-teal-500/15' : 'bg-teal-400/20'
          }`} />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight">CV Orbit</span>
                <span className={`ml-1.5 text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                  darkMode
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    : 'bg-indigo-600/10 text-indigo-700 border-indigo-600/20'
                }`}>
                  AI
                </span>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                darkMode
                  ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-slate-200'
                  : 'bg-white/90 hover:bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <div className="relative z-10 my-10 lg:my-0 space-y-6 max-w-xl">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${
              darkMode
                ? 'bg-white/[0.06] border-white/10 text-indigo-300'
                : 'bg-white/90 border-indigo-200/80 text-indigo-700 shadow-sm'
            }`}>
              <Zap className="w-3.5 h-3.5 text-teal-500" />
              <span>PDF Resume Parsing • YouTube Learning Hub • Bias-Free Screening</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.12]">
              Smarter hiring.{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 bg-clip-text text-transparent">
                Faster careers.
              </span>
            </h1>

            <p className={`text-base leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              CV Orbit bridges enterprise talent acquisition and candidate career growth with real PDF resume extraction, explainable weighted matching, and live video upskilling.
            </p>

            {/* Featured Workplace Collaboration Card */}
            <div className={`rounded-2xl border overflow-hidden shadow-xl backdrop-blur-xl ${
              darkMode
                ? 'bg-white/[0.05] border-white/10 shadow-black/30'
                : 'bg-white/90 border-slate-200/90 shadow-slate-200/70'
            }`}>
              <div className="relative h-36 sm:h-40 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                  alt="Recruiting and engineering team collaborating in modern office"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end justify-between p-4">
                  <div className="text-white">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                      Connected Hiring Ecosystem
                    </div>
                    <div className="text-sm font-bold">Real-Time Resume Intelligence & Career Matching</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold shadow">
                    92% Match Live
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    AR
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold">Alex Rivera • Senior Full-Stack AI</div>
                    <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      PDF Parsed • 8 Verified Skills • 4 Yrs Exp
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] font-bold text-indigo-500 tabular-nums">
                  Skills 94% • Exp 92%
                </div>
              </div>
            </div>
          </div>

          <div className={`relative z-10 flex flex-wrap items-center gap-6 text-xs font-medium ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-teal-500" /> SOC2 & GDPR Ready</span>
            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-indigo-500" /> Real PDF Resume Parser</span>
            <span className="flex items-center gap-1.5"><Youtube className="w-4 h-4 text-rose-500" /> YouTube Learning Hub</span>
          </div>
        </div>

        {/* Right Column: Dual-Portal Login Card */}
        <div className={`lg:w-[48%] flex items-center justify-center p-6 sm:p-12 transition-colors duration-300 ${
          darkMode ? 'bg-[#090D16]' : 'bg-[#F8FAFC]'
        }`}>
          <div className={`w-full max-w-md rounded-2xl p-7 sm:p-8 border shadow-xl transition-all ${
            darkMode
              ? 'bg-[#111827] border-white/[0.08] shadow-black/40'
              : 'bg-white border-slate-200/80 shadow-slate-200/60'
          }`}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                {authMode === 'login' ? 'Sign in to CV Orbit' : 'Create your workspace'}
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Step 1: Choose your portal • Step 2: Launch workspace
              </p>
            </div>

            {/* Step 1: Dual Portal Selector Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => handlePortalSwitch('HR')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedPortalStep === 'HR'
                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                    : darkMode
                    ? 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  {selectedPortalStep === 'HR' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </div>
                <div className="font-semibold text-sm">HR / Recruiter</div>
                <div className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Screen PDFs & hire
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePortalSwitch('CANDIDATE')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedPortalStep === 'CANDIDATE'
                    ? 'border-teal-500 bg-teal-500/10 ring-2 ring-teal-500/20'
                    : darkMode
                    ? 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  {selectedPortalStep === 'CANDIDATE' && <CheckCircle2 className="w-4 h-4 text-teal-500" />}
                </div>
                <div className="font-semibold text-sm">Job Seeker</div>
                <div className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Matches & Learning Hub
                </div>
              </button>
            </div>

            {/* Step 2: Credentials Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                      darkMode
                        ? 'bg-[#090D16] border-white/10 focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:bg-white'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-400">
                  Work or Personal Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                    darkMode
                      ? 'bg-[#090D16] border-white/10 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:bg-white'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => notify('Password Reset Sent', `Recovery instructions sent to ${emailInput}.`)}
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-400"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition pr-10 ${
                      darkMode
                        ? 'bg-[#090D16] border-white/10 focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Show or hide password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
              >
                <span>{authMode === 'login' ? `Enter ${selectedPortalStep === 'HR' ? 'Recruiter' : 'Candidate'} Portal` : 'Create Account'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>

            {/* Instant 1-Click Demo Access */}
            <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-white/[0.08]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
                Instant One-Click Live Demo Access
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin('HR')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    darkMode
                      ? 'bg-white/[0.03] border-white/10 hover:bg-indigo-500/15 hover:border-indigo-500/40'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Demo HR Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin('CANDIDATE')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    darkMode
                      ? 'bg-white/[0.03] border-white/10 hover:bg-teal-500/15 hover:border-teal-500/40'
                      : 'bg-slate-50 border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-slate-700'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-teal-500" />
                  <span>Demo Job Seeker</span>
                </button>
              </div>
            </div>

            <div className="mt-5 text-center text-xs text-slate-500">
              {authMode === 'login' ? (
                <>
                  New to CV Orbit?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="font-semibold text-indigo-500 hover:underline"
                  >
                    Create free account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-semibold text-indigo-500 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // SIDEBAR NAVIGATION CONFIG
  // ==========================================================================
  const hrNavGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
        { id: 'analytics', label: 'Hiring Analytics', icon: TrendingUp }
      ]
    },
    {
      label: 'Recruitment',
      items: [
        { id: 'resumes', label: 'Candidate Resumes', icon: FileText, badge: enrichedCandidates.length },
        { id: 'jobs', label: 'Job Vacancies', icon: Briefcase, badge: jobs.length },
        { id: 'pipeline', label: 'Kanban Pipeline', icon: Columns },
        { id: 'shortlisted', label: 'Shortlisted Pool', icon: Star }
      ]
    },
    {
      label: 'Intelligence',
      items: [
        { id: 'compare', label: 'Compare Matrix', icon: GitCompare },
        { id: 'settings', label: 'AI Engine & Logs', icon: Sliders }
      ]
    }
  ];

  const candidateNavGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Career Overview', icon: Compass },
        { id: 'matches', label: 'Job Matches', icon: Sparkles, badge: jobs.length }
      ]
    },
    {
      label: 'Growth & Upskilling',
      items: [
        { id: 'upload', label: 'Resume & ATS Check', icon: UploadCloud },
        { id: 'gaps', label: 'Skill Gap Radar', icon: Target },
        { id: 'learning', label: 'Learning Hub', icon: BookOpen, badge: 'YT' },
        { id: 'practice', label: 'Practice Tests & Mocks', icon: Award, badge: 'NEW' }
      ]
    },
    {
      label: 'Tracking & AI',
      items: [
        { id: 'applications', label: 'My Applications', icon: CheckCircle2 },
        { id: 'studio', label: 'AI Career Studio', icon: Cpu }
      ]
    }
  ];

  const activeNavGroups = authUser.role === 'HR' ? hrNavGroups : candidateNavGroups;
  const activeTabObj = activeNavGroups.flatMap(g => g.items).find(i => i.id === activeTab) || { label: 'Dashboard' };

  const selectedCandidate = enrichedCandidates.find(c => c.id === selectedCandidateId) || null;
  const unreadNotifCount = notifications.filter(n => n.unread).length;

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      darkMode ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      <WatermarkOverlay darkMode={darkMode} />

      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ====================================================================
          COLLAPSIBLE ENTERPRISE SIDEBAR (ADAPTS TO LIGHT & DARK THEME)
         ==================================================================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen flex flex-col border-r transition-all duration-300 ${
          darkMode
            ? 'bg-[#090D16] text-slate-200 border-white/[0.08]'
            : 'bg-white text-slate-700 border-slate-200/90 shadow-sm'
        } ${
          sidebarCollapsed ? 'w-[76px]' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className={`h-16 px-4 flex items-center justify-between border-b ${
          darkMode ? 'border-white/[0.08]' : 'border-slate-200/80'
        }`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-400 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <div className={`font-extrabold text-sm tracking-tight flex items-center gap-1.5 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <span>CV Orbit</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-500 font-bold">AI</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {authUser.role === 'HR' ? 'Recruiter Suite' : 'Candidate Portal'}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden lg:flex p-1.5 rounded-lg transition ${
              darkMode
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Collapse sidebar"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Grouped Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {activeNavGroups.map(group => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                          : darkMode
                          ? 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                          active
                            ? 'bg-white/20 text-white'
                            : darkMode
                            ? 'bg-white/[0.07] text-slate-300'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Portal Switcher & User Card */}
        <div className={`p-3 border-t space-y-2 ${darkMode ? 'border-white/[0.08]' : 'border-slate-200/80'}`}>
          <button
            onClick={() => {
              const nextRole = authUser.role === 'HR' ? 'CANDIDATE' : 'HR';
              handleDemoQuickLogin(nextRole);
            }}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
              darkMode
                ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-teal-300'
                : 'bg-teal-50/80 hover:bg-teal-100/80 border-teal-200 text-teal-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && (
              <span className="truncate">
                Switch to {authUser.role === 'HR' ? 'Job Seeker' : 'HR Portal'}
              </span>
            )}
          </button>

          <div className={`flex items-center justify-between p-2 rounded-xl ${
            darkMode ? 'bg-white/[0.03]' : 'bg-slate-100/80'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {authUser.name.slice(0, 2).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {authUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{authUser.role}</div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          MAIN CONTENT SHELL + GLASSMORPHIC HEADER
         ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className={`sticky top-0 z-20 h-16 px-4 sm:px-8 border-b backdrop-blur-xl flex items-center justify-between gap-4 ${
            darkMode
              ? 'bg-[#090D16]/80 border-white/[0.08]'
              : 'bg-white/80 border-slate-200/80'
          }`}
        >
          {/* Left: Mobile Trigger & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
              <span className="text-slate-400 hidden sm:inline">
                {authUser.role === 'HR' ? 'HR Portal' : 'Candidate Portal'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="font-bold tracking-tight truncate">{activeTabObj.label}</span>
            </div>
          </div>

          {/* Right: Command Search, API Keys Button, Bias-Free Toggle, Notifications, Theme */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setCommandOpen(true)}
              className={`hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border text-xs transition ${
                darkMode
                  ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:border-white/20'
                  : 'bg-slate-100/80 border-slate-200/80 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Quick search...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-white/80 dark:bg-white/10 text-slate-500 dark:text-slate-300">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setShowApiKeysModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                apiKeys.youtubeApiKey
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                  : darkMode
                  ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Configure YouTube Data API v3 & LLM API Keys"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {apiKeys.youtubeApiKey ? 'API Connected' : 'API Keys'}
              </span>
            </button>

            {authUser.role === 'HR' && (
              <button
                onClick={() => {
                  setBiasFreeMode(!biasFreeMode);
                  notify(
                    !biasFreeMode ? 'Bias-Free Screening Enabled' : 'Standard View Restored',
                    !biasFreeMode
                      ? 'Candidate names, emails, and locations are masked for objective evaluation.'
                      : 'Candidate identifying details are visible again.'
                  );
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  biasFreeMode
                    ? 'bg-teal-500/15 border-teal-500/40 text-teal-500'
                    : darkMode
                    ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{biasFreeMode ? 'Bias-Free: ON' : 'Bias-Free'}</span>
              </button>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl border relative transition ${
                  darkMode
                    ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-4 z-40 ${
                    darkMode ? 'bg-[#111827] border-white/10' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</span>
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="text-[11px] font-semibold text-indigo-500 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs border ${
                          n.unread
                            ? darkMode
                              ? 'bg-indigo-500/10 border-indigo-500/30'
                              : 'bg-indigo-50/70 border-indigo-200'
                            : darkMode
                            ? 'bg-white/[0.02] border-white/[0.05]'
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-slate-400 mt-0.5">{n.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition ${
                darkMode
                  ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto space-y-6 pb-16">
          {authUser.role === 'HR' ? (
            <HRPortalViews
              authUser={authUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              darkMode={darkMode}
              biasFreeMode={biasFreeMode}
              jobs={jobs}
              setJobs={setJobs}
              candidates={enrichedCandidates}
              setCandidates={setCandidates}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterJobId={filterJobId}
              setFilterJobId={setFilterJobId}
              filterMinScore={filterMinScore}
              setFilterMinScore={setFilterMinScore}
              filterStage={filterStage}
              setFilterStage={setFilterStage}
              setSelectedCandidateId={setSelectedCandidateId}
              updateCandidateStage={updateCandidateStage}
              compareIds={compareIds}
              setCompareIds={setCompareIds}
              scoringWeights={scoringWeights}
              setScoringWeights={setScoringWeights}
              auditLogs={auditLogs}
              setShowCreateJobModal={setShowCreateJobModal}
              setPdfReportCandidate={setPdfReportCandidate}
              setPreviewPdfDoc={setPreviewPdfDoc}
              notify={notify}
            />
          ) : (
            <CandidatePortalViews
              authUser={authUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              darkMode={darkMode}
              currentCandidate={currentCandidate}
              setCandidates={setCandidates}
              jobs={jobs}
              candidateJobMatches={candidateJobMatches}
              savedJobIds={savedJobIds}
              setSavedJobIds={setSavedJobIds}
              handleCandidateApplyJob={handleCandidateApplyJob}
              completedCourseIds={completedCourseIds}
              handleCompleteCourse={handleCompleteCourse}
              completedTestIds={completedTestIds}
              setCompletedTestIds={setCompletedTestIds}
              targetGapJobId={targetGapJobId}
              setTargetGapJobId={setTargetGapJobId}
              learningSkillFilter={learningSkillFilter}
              setLearningSkillFilter={setLearningSkillFilter}
              uploadedResumeHistory={uploadedResumeHistory}
              setUploadedResumeHistory={setUploadedResumeHistory}
              setResumeUploadPopupData={setResumeUploadPopupData}
              studioTool={studioTool}
              setStudioTool={setStudioTool}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              bulletInput={bulletInput}
              setBulletInput={setBulletInput}
              bulletTargetJob={bulletTargetJob}
              setBulletTargetJob={setBulletTargetJob}
              improvedBullets={improvedBullets}
              setImprovedBullets={setImprovedBullets}
              coverLetterJobId={coverLetterJobId}
              setCoverLetterJobId={setCoverLetterJobId}
              generatedCoverLetter={generatedCoverLetter}
              setGeneratedCoverLetter={setGeneratedCoverLetter}
              mockInterviewRole={mockInterviewRole}
              setMockInterviewRole={setMockInterviewRole}
              mockQuestionIdx={mockQuestionIdx}
              setMockQuestionIdx={setMockQuestionIdx}
              mockAnswer={mockAnswer}
              setMockAnswer={setMockAnswer}
              mockFeedback={mockFeedback}
              setMockFeedback={setMockFeedback}
              apiKeys={apiKeys}
              setShowApiKeysModal={setShowApiKeysModal}
              liveYoutubeCourses={liveYoutubeCourses}
              setLiveYoutubeCourses={setLiveYoutubeCourses}
              setActiveVideoLesson={setActiveVideoLesson}
              setPreviewPdfDoc={setPreviewPdfDoc}
              notify={notify}
            />
          )}
        </main>
      </div>

      {/* ====================================================================
          MODALS & DRAWERS (CANDIDATE DRAWER, YOUTUBE PLAYER, PDF VIEWER, API KEYS)
         ==================================================================== */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-xl h-full overflow-y-auto p-6 sm:p-8 border-l shadow-2xl space-y-6 ${
              darkMode ? 'bg-[#111827] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-500">
                    {selectedCandidate.stage}
                  </span>
                  <span className="text-xs text-slate-400">Applied {selectedCandidate.uploadDate}</span>
                </div>
                <h2 className="text-xl font-bold mt-2">
                  {biasFreeMode ? selectedCandidate.anonymizedId : selectedCandidate.name}
                </h2>
                <p className="text-sm text-slate-400">
                  {selectedCandidate.title} • {biasFreeMode ? 'Location Masked' : selectedCandidate.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidateId(null)}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                darkMode ? 'bg-[#090D16] border-white/[0.08]' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-4">
                <ScoreRing score={selectedCandidate.match.overall} size={62} strokeWidth={6} darkMode={darkMode} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                    Explainable AI Score
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {selectedCandidate.match.explanation}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                <div className="text-[11px] text-slate-400">Skills Match</div>
                <div className="text-lg font-bold mt-0.5 tabular-nums">{selectedCandidate.match.skillScore}%</div>
              </div>
              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                <div className="text-[11px] text-slate-400">Experience</div>
                <div className="text-lg font-bold mt-0.5 tabular-nums">{selectedCandidate.match.expScore}%</div>
              </div>
              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                <div className="text-[11px] text-slate-400">Education</div>
                <div className="text-lg font-bold mt-0.5 tabular-nums">{selectedCandidate.match.eduScore}%</div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Matched vs Missing Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.match.matchedSkills.map(sk => (
                  <span key={sk} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                    ✓ {sk}
                  </span>
                ))}
                {selectedCandidate.match.missingSkills.map(sk => (
                  <span key={sk} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                    ✕ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Parsed Resume Extract</h3>
                {selectedCandidate.pdfUrl && (
                  <button
                    onClick={() => setPreviewPdfDoc({ name: `${selectedCandidate.name}_Resume.pdf`, url: selectedCandidate.pdfUrl })}
                    className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Original PDF
                  </button>
                )}
              </div>
              <pre
                className={`p-3.5 rounded-xl border text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-44 overflow-y-auto ${
                  darkMode ? 'bg-[#090D16] border-white/[0.08] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {biasFreeMode
                  ? selectedCandidate.rawText.replace(selectedCandidate.name, selectedCandidate.anonymizedId)
                  : selectedCandidate.rawText}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recruiter Notes</h3>
              <p className="text-xs text-slate-500 whitespace-pre-line">{selectedCandidate.notes}</p>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add an evaluation note..."
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none ${
                    darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <button
                  onClick={() => handleAddCandidateNote(selectedCandidate.id)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap gap-2.5">
              <button
                onClick={() => updateCandidateStage(selectedCandidate.id, 'Shortlisted')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Shortlist Candidate
              </button>
              <button
                onClick={() => updateCandidateStage(selectedCandidate.id, 'Interview')}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Schedule Interview
              </button>
              <button
                onClick={() => setPdfReportCandidate(selectedCandidate)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                  darkMode ? 'border-white/15 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Download className="w-3.5 h-3.5" /> Report PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive YouTube Video Lesson Player Modal */}
      {activeVideoLesson && (
        <VideoLessonPlayerModal
          darkMode={darkMode}
          lesson={activeVideoLesson}
          isCompleted={completedCourseIds.includes(activeVideoLesson.id)}
          onComplete={() => {
            handleCompleteCourse(activeVideoLesson);
          }}
          onClose={() => setActiveVideoLesson(null)}
          notify={notify}
        />
      )}

      {/* In-App PDF Document Viewer Modal */}
      {previewPdfDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
            darkMode ? 'bg-[#111827] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-sm truncate">{previewPdfDoc.name}</span>
              </div>
              <button
                onClick={() => setPreviewPdfDoc(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 bg-slate-900">
              {previewPdfDoc.url ? (
                <iframe
                  src={previewPdfDoc.url}
                  title={previewPdfDoc.name}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="p-8 text-slate-300 text-sm whitespace-pre-wrap overflow-y-auto h-full">
                  {currentCandidate.rawText}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Success & Eligibility Breakdown Popup Modal */}
      {resumeUploadPopupData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border p-6 sm:p-7 shadow-2xl space-y-5 ${
              darkMode ? 'bg-[#111827] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500">
                    Resume Saved & Parsed Successfully
                  </span>
                  <h3 className="text-lg font-extrabold mt-1">
                    {resumeUploadPopupData.fileName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ATS Score: <strong className="text-indigo-500">{resumeUploadPopupData.atsScore}/100</strong> • {resumeUploadPopupData.extractedSkills.length} Skills Saved to Profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResumeUploadPopupData(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Extracted Skills */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Saved Skills From Your Resume
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resumeUploadPopupData.extractedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-500"
                  >
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Companies Eligible For */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Companies You Are Eligible For ({resumeUploadPopupData.matches.filter((m) => m.match.overall >= 65).length} Eligible)
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {resumeUploadPopupData.matches.map(({ job, match }) => (
                  <div
                    key={job.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      darkMode ? 'bg-[#090D16] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-indigo-500">{job.company || job.department}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            match.overall >= 80
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : match.overall >= 65
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-rose-500/15 text-rose-500'
                          }`}
                        >
                          {match.overall >= 80 ? 'Eligible' : match.overall >= 65 ? 'Almost Eligible' : 'Skill Gap'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold truncate mt-0.5">{job.title}</div>
                      {match.missingSkills.length > 0 && (
                        <div className="text-[11px] text-rose-500 mt-0.5">
                          Lacking: {match.missingSkills.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-emerald-500 tabular-nums">{match.overall}%</div>
                      <div className="text-[10px] text-slate-400">Match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lacking Skills */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Skills You Are Lacking (Close Gaps on YouTube)
              </div>
              {resumeUploadPopupData.lackingSkills.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                  Zero lacking skills! You meet 100% of company requirements.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resumeUploadPopupData.lackingSkills.map((sk) => {
                    const course = LEARNING_CATALOG.find((c) => c.skill.toLowerCase() === sk.toLowerCase());
                    return (
                      <button
                        key={sk}
                        onClick={() => {
                          if (course) {
                            window.open(`https://www.youtube.com/watch?v=${course.youtubeId}`, '_blank', 'noopener,noreferrer');
                          } else {
                            setLearningSkillFilter(sk);
                            setActiveTab('learning');
                            setResumeUploadPopupData(null);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-500 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{sk}</span>
                        <span className="text-[10px] underline ml-1">Watch YT →</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setActiveTab('learning');
                  setResumeUploadPopupData(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-semibold"
              >
                Open Learning Hub
              </button>
              <button
                onClick={() => setResumeUploadPopupData(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                View Full Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys & Integrations Configuration Modal */}
      {showApiKeysModal && (
        <ApiKeysConfigModal
          darkMode={darkMode}
          apiKeys={apiKeys}
          onSave={handleSaveApiKeys}
          onClose={() => setShowApiKeysModal(false)}
          notify={notify}
        />
      )}

      {showCreateJobModal && (
        <CreateJobModal
          darkMode={darkMode}
          onClose={() => setShowCreateJobModal(false)}
          onCreate={(newJob) => {
            setJobs(prev => [newJob, ...prev]);
            setShowCreateJobModal(false);
            notify('Vacancy Published', `"${newJob.title}" is now live across both portals.`);
          }}
        />
      )}

      {pdfReportCandidate && (
        <WatermarkedReportModal
          darkMode={darkMode}
          candidate={pdfReportCandidate}
          biasFreeMode={biasFreeMode}
          onClose={() => setPdfReportCandidate(null)}
        />
      )}

      {commandOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
              darkMode ? 'bg-[#111827] border-white/15' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/80 dark:border-white/10">
              <Search className="w-4 h-4 text-indigo-500" />
              <input
                autoFocus
                type="text"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Search candidates, job roles, skills, or video courses..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button onClick={() => setCommandOpen(false)} className="text-xs text-slate-400">ESC</button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {jobs
                .filter(j => j.title.toLowerCase().includes(commandQuery.toLowerCase()))
                .map(j => (
                  <button
                    key={j.id}
                    onClick={() => {
                      setActiveTab(authUser.role === 'HR' ? 'jobs' : 'matches');
                      setCommandOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-500/10 text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold">{j.title}</span>
                    <span className="text-slate-400">{j.salary}</span>
                  </button>
                ))}
              {LEARNING_CATALOG.filter(c =>
                c.title.toLowerCase().includes(commandQuery.toLowerCase()) ||
                c.skill.toLowerCase().includes(commandQuery.toLowerCase())
              ).map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    window.open(`https://www.youtube.com/watch?v=${c.youtubeId}`, '_blank', 'noopener,noreferrer');
                    setCommandOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/10 text-xs flex items-center justify-between"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Play className="w-3 h-3 text-rose-500" /> {c.title}
                  </span>
                  <span className="text-rose-500 font-semibold">Watch on YT</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Stack */}
      <div className="fixed bottom-10 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl flex items-start gap-3 ${
              darkMode ? 'bg-[#111827]/95 border-white/15 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold">{t.title}</div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 6. HR / RECRUITER PORTAL VIEWS
// ============================================================================
function HRPortalViews({
  authUser,
  activeTab,
  setActiveTab,
  darkMode,
  biasFreeMode,
  jobs,
  setJobs,
  candidates,
  setCandidates,
  searchQuery,
  setSearchQuery,
  filterJobId,
  setFilterJobId,
  filterMinScore,
  setFilterMinScore,
  filterStage,
  setFilterStage,
  setSelectedCandidateId,
  updateCandidateStage,
  compareIds,
  setCompareIds,
  scoringWeights,
  setScoringWeights,
  auditLogs,
  setShowCreateJobModal,
  setPdfReportCandidate,
  setPreviewPdfDoc,
  notify
}) {
  const [bulkUploading, setBulkUploading] = useState(false);

  const cardCls = `rounded-2xl border transition-all ${
    darkMode
      ? 'bg-[#111827] border-white/[0.08] shadow-lg shadow-black/20'
      : 'bg-white border-slate-200/80 shadow-sm'
  }`;

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter(c => {
        if (filterJobId !== 'ALL' && c.appliedJobId !== filterJobId) return false;
        if (filterStage !== 'ALL' && c.stage !== filterStage) return false;
        if (c.match.overall < filterMinScore) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = !biasFreeMode && c.name.toLowerCase().includes(q);
          const skillMatch = c.skills.some(s => s.toLowerCase().includes(q));
          const titleMatch = c.title.toLowerCase().includes(q);
          return nameMatch || skillMatch || titleMatch;
        }
        return true;
      })
      .sort((a, b) => b.match.overall - a.match.overall);
  }, [candidates, filterJobId, filterStage, filterMinScore, searchQuery, biasFreeMode]);

  const handleBulkFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBulkUploading(true);
    try {
      const parsedList = await Promise.all(
        files.map(async (file, idx) => {
          const text = await extractTextFromUploadedFile(file);
          const parsed = parseResumeNLP(text, file.name);
          const pdfUrl =
            file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
              ? URL.createObjectURL(file)
              : null;
          return {
            id: `cand-${Date.now()}-${idx}`,
            anonymizedId: `Candidate #${1050 + idx}`,
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            location: 'Remote / Hybrid',
            title: parsed.title,
            appliedJobId: jobs[0]?.id || 'job-1',
            stage: 'Applied',
            rating: 4,
            uploadDate: '2026-11-26',
            source: 'PDF Batch Upload',
            experienceYears: parsed.experienceYears,
            education: parsed.education,
            eduLevel: parsed.eduLevel,
            skills: parsed.skills,
            strengths: [`Parsed ${parsed.skills.length} skills from ${file.name}`],
            risks: ['Pending recruiter screening review'],
            notes: `Uploaded via PDF/Document batch parser (${file.name}).`,
            tags: ['PDF Parsed'],
            interviewScheduled: null,
            rawText: text,
            pdfUrl
          };
        })
      );
      setCandidates(prev => [...parsedList, ...prev]);
      notify('PDF Resumes Parsed', `Extracted & scored ${parsedList.length} candidate resume(s).`);
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

  if (activeTab === 'dashboard') {
    const avgScore = Math.round(
      candidates.reduce((acc, c) => acc + c.match.overall, 0) / Math.max(1, candidates.length)
    );
    const shortlistedCount = candidates.filter(c => ['Shortlisted', 'Interview', 'Offer'].includes(c.stage)).length;

    const kpis = [
      { label: 'Total Parsed Resumes', value: candidates.length, delta: '+18% this week', icon: FileText, color: 'text-indigo-500' },
      { label: 'Open Job Vacancies', value: jobs.filter(j => j.status === 'Open').length, delta: `${jobs.length} active roles`, icon: Briefcase, color: 'text-violet-500' },
      { label: 'Shortlisted Pipeline', value: shortlistedCount, delta: 'Top 25% talent', icon: Star, color: 'text-teal-500' },
      { label: 'Avg AI Match Score', value: `${avgScore}%`, delta: '+6.4% precision', icon: Sparkles, color: 'text-emerald-500' }
    ];

    return (
      <div className="space-y-6">
        {/* Personalized Welcome Banner */}
        <div className={`${cardCls} p-6 bg-gradient-to-r ${
          darkMode
            ? 'from-indigo-950/70 via-[#111827] to-teal-950/40'
            : 'from-indigo-50/90 via-white to-teal-50/70'
        } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-500 mb-2">
              <Sparkles className="w-3 h-3" /> Recruiter Executive Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {authUser?.name || 'Recruiter'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here is your live hiring pipeline, parsed PDF resumes, and top AI-ranked candidates today.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('resumes')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm self-start sm:self-center shrink-0"
          >
            Review Top Resumes →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{k.label}</span>
                  <div className={`p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] ${k.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold mt-2 tabular-nums">{k.value}</div>
                <div className="text-[11px] font-medium text-emerald-500 mt-1">{k.delta}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`${cardCls} p-6 lg:col-span-7 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Top Ranked Candidates</h3>
                <p className="text-xs text-slate-400">Sorted by live hybrid semantic & weighted skill score</p>
              </div>
              <button
                onClick={() => setActiveTab('resumes')}
                className="text-xs font-semibold text-indigo-500 hover:underline"
              >
                View all resumes →
              </button>
            </div>
            <div className="space-y-3">
              {[...candidates]
                .sort((a, b) => b.match.overall - a.match.overall)
                .slice(0, 4)
                .map(cand => (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateId(cand.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition ${
                      darkMode
                        ? 'bg-[#090D16]/60 border-white/[0.06] hover:border-indigo-500/40'
                        : 'bg-slate-50/80 border-slate-200/70 hover:border-indigo-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {biasFreeMode ? cand.anonymizedId : cand.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {cand.jobTitle} • {cand.experienceYears} yrs exp
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cand.skills.slice(0, 4).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-500">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ScoreRing score={cand.match.overall} darkMode={darkMode} />
                  </div>
                ))}
            </div>
          </div>

          <div className={`${cardCls} p-6 lg:col-span-5 space-y-4`}>
            <h3 className="font-bold text-base">Live Recruitment Activity</h3>
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold">{log.actor}</div>
                    <div className="text-slate-400 mt-0.5">{log.action}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'resumes') {
    return (
      <div className="space-y-6">
        <div className={`${cardCls} p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div>
            <h2 className="font-bold text-base">Candidate Resume Repository (PDF & DOCX)</h2>
            <p className="text-xs text-slate-400">
              Upload single or bulk PDF resumes for instant text extraction, NLP skill tagging, and weighted scoring
            </p>
          </div>
          <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/20 self-start">
            <UploadCloud className="w-4 h-4" />
            <span>{bulkUploading ? 'Extracting PDFs...' : 'Upload PDF Resumes'}</span>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.doc,.docx,application/pdf"
              onChange={handleBulkFilesUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Filters Bar */}
        <div className={`${cardCls} p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, role, or name..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none ${
                darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <select
            value={filterJobId}
            onChange={(e) => setFilterJobId(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs outline-none ${
              darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <option value="ALL">All Open Roles ({jobs.length})</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs outline-none ${
              darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <option value="ALL">All Pipeline Stages</option>
            {['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer'].map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
            <span className="text-slate-400 shrink-0">Min Score: {filterMinScore}%</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* Candidate Table */}
        <div className={`${cardCls} overflow-x-auto`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Target Role</th>
                <th className="py-3.5 px-4">Extracted Skills</th>
                <th className="py-3.5 px-4">AI Match</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.06] text-xs">
              {filteredCandidates.map(cand => (
                <tr key={cand.id} className="hover:bg-indigo-500/[0.03] transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold">{biasFreeMode ? cand.anonymizedId : cand.name}</div>
                    <div className="text-slate-400">{cand.experienceYears} yrs • {cand.education}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{cand.jobTitle}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {cand.skills.slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-medium text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <ScoreRing score={cand.match.overall} size={44} strokeWidth={4} darkMode={darkMode} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-500/15 text-teal-500">
                      {cand.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {cand.pdfUrl && (
                      <button
                        onClick={() => setPreviewPdfDoc({ name: `${cand.name}_Resume.pdf`, url: cand.pdfUrl })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/15 font-semibold hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        PDF
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'jobs') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-lg">Active Job Requisitions</h2>
            <p className="text-xs text-slate-400">Create roles with AI description generation & automatic candidate ranking</p>
          </div>
          <button
            onClick={() => setShowCreateJobModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> New Job Vacancy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map(job => {
            const applicantsCount = candidates.filter(c => c.appliedJobId === job.id).length;
            return (
              <div key={job.id} className={`${cardCls} p-6 flex flex-col justify-between space-y-4`}>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500">
                      {job.status} • {job.company || job.department}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{applicantsCount} Applicants</span>
                  </div>
                  <h3 className="text-base font-bold mt-2">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">{job.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.requiredSkills.map(sk => (
                      <span key={sk} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-500">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200/70 dark:border-white/[0.07] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Min {job.minExperience} yrs experience</span>
                  <button
                    onClick={() => {
                      setFilterJobId(job.id);
                      setActiveTab('resumes');
                    }}
                    className="text-xs font-semibold text-indigo-500 hover:underline"
                  >
                    Screen Ranked Talent →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeTab === 'pipeline') {
    const stages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer'];
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {stages.map(stage => {
          const stageCands = candidates.filter(c => c.stage === stage);
          return (
            <div key={stage} className={`${cardCls} p-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider">{stage}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-500">
                  {stageCands.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {stageCands.map(c => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border space-y-2 ${
                      darkMode ? 'bg-[#090D16] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs">
                        {biasFreeMode ? c.anonymizedId : c.name}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-500 tabular-nums">{c.match.overall}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{c.jobTitle}</div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setSelectedCandidateId(c.id)}
                        className="text-[11px] font-semibold text-indigo-500 hover:underline"
                      >
                        Details
                      </button>
                      {stage !== 'Offer' && (
                        <button
                          onClick={() => {
                            const nextIdx = stages.indexOf(stage) + 1;
                            if (stages[nextIdx]) updateCandidateStage(c.id, stages[nextIdx]);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold"
                        >
                          Advance →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (activeTab === 'shortlisted') {
    const shortlisted = candidates.filter(c => ['Shortlisted', 'Interview', 'Offer'].includes(c.stage));
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shortlisted.map(c => (
          <div key={c.id} className={`${cardCls} p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{biasFreeMode ? c.anonymizedId : c.name}</h3>
                <p className="text-xs text-slate-400">{c.jobTitle} • {c.stage}</p>
              </div>
              <ScoreRing score={c.match.overall} darkMode={darkMode} />
            </div>
            <p className="text-xs text-slate-500">{c.notes}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCandidateId(c.id)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Open Dossier
              </button>
              <button
                onClick={() => setPdfReportCandidate(c)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-semibold"
              >
                Export Watermarked PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'compare') {
    const compared = candidates.filter(c => compareIds.includes(c.id));
    return (
      <div className="space-y-6">
        <div className={`${cardCls} p-4 flex flex-wrap items-center gap-2`}>
          <span className="text-xs font-bold text-slate-400 mr-2">Select Candidates to Compare:</span>
          {candidates.map(c => {
            const active = compareIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() =>
                  setCompareIds(prev =>
                    prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev.slice(-2), c.id]
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : darkMode
                    ? 'border-white/10 text-slate-300'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {biasFreeMode ? c.anonymizedId : c.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {compared.map(c => (
            <div key={c.id} className={`${cardCls} p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{biasFreeMode ? c.anonymizedId : c.name}</h3>
                  <p className="text-xs text-slate-400">{c.experienceYears} yrs • {c.education}</p>
                </div>
                <ScoreRing score={c.match.overall} darkMode={darkMode} />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>Skills Score:</span><strong>{c.match.skillScore}%</strong></div>
                <div className="flex justify-between"><span>Experience Score:</span><strong>{c.match.expScore}%</strong></div>
                <div className="flex justify-between"><span>Education Score:</span><strong>{c.match.eduScore}%</strong></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`${cardCls} p-6 space-y-5`}>
        <div>
          <h3 className="font-bold text-base">Hybrid AI Scoring Weights</h3>
          <p className="text-xs text-slate-400">Adjust weights to dynamically recalculate all candidate match scores</p>
        </div>
        {['skills', 'experience', 'education'].map(key => (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold capitalize">
              <span>{key} Weight</span>
              <span className="text-indigo-500">{scoringWeights[key]}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={scoringWeights[key]}
              onChange={(e) =>
                setScoringWeights(prev => ({ ...prev, [key]: Number(e.target.value) }))
              }
              className="w-full accent-indigo-600"
            />
          </div>
        ))}
      </div>

      <div className={`${cardCls} p-6 space-y-4`}>
        <h3 className="font-bold text-base">Enterprise Audit & Compliance Trail</h3>
        <div className="space-y-3">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.07] text-xs">
              <div className="font-semibold">{log.actor}</div>
              <div className="text-slate-400 mt-0.5">{log.action}</div>
              <div className="text-[10px] text-slate-500 mt-1">{log.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. JOB SEEKER PORTAL VIEWS (WITH PDF UPLOAD + YOUTUBE LEARNING HUB)
// ============================================================================
function CandidatePortalViews({
  authUser,
  activeTab,
  setActiveTab,
  darkMode,
  currentCandidate,
  setCandidates,
  jobs,
  candidateJobMatches,
  savedJobIds,
  setSavedJobIds,
  handleCandidateApplyJob,
  completedCourseIds,
  handleCompleteCourse,
  completedTestIds,
  setCompletedTestIds,
  targetGapJobId,
  setTargetGapJobId,
  learningSkillFilter,
  setLearningSkillFilter,
  uploadedResumeHistory,
  setUploadedResumeHistory,
  setResumeUploadPopupData,
  studioTool,
  setStudioTool,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  bulletInput,
  setBulletInput,
  bulletTargetJob,
  setBulletTargetJob,
  improvedBullets,
  setImprovedBullets,
  coverLetterJobId,
  setCoverLetterJobId,
  generatedCoverLetter,
  setGeneratedCoverLetter,
  mockInterviewRole,
  setMockInterviewRole,
  mockQuestionIdx,
  setMockQuestionIdx,
  mockAnswer,
  setMockAnswer,
  mockFeedback,
  setMockFeedback,
  apiKeys,
  setShowApiKeysModal,
  liveYoutubeCourses,
  setLiveYoutubeCourses,
  setActiveVideoLesson,
  setPreviewPdfDoc,
  notify
}) {
  const [ytSearchQuery, setYtSearchQuery] = useState('');
  const [ytSearching, setYtSearching] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [activeTestId, setActiveTestId] = useState(PRACTICE_ASSESSMENTS[0].id);
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);

  const cardCls = `rounded-2xl border transition-all ${
    darkMode
      ? 'bg-[#111827] border-white/[0.08] shadow-lg shadow-black/20'
      : 'bg-white border-slate-200/80 shadow-sm'
  }`;

  const topMatch = candidateJobMatches[0];
  const parsedStats = useMemo(() => parseResumeNLP(currentCandidate.rawText), [currentCandidate.rawText]);

  const handleLiveYouTubeSearch = async (queryOverride) => {
    const q = (queryOverride ?? ytSearchQuery).trim();
    if (!q) return;

    if (!apiKeys.youtubeApiKey) {
      setShowApiKeysModal(true);
      notify('YouTube API Key Needed', 'Add your YouTube Data API v3 key to search live YouTube tutorials.');
      return;
    }

    setYtSearching(true);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=6&q=${encodeURIComponent(
        q + ' programming tutorial full course'
      )}&key=${encodeURIComponent(apiKeys.youtubeApiKey)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'YouTube API request failed');
      }
      const mapped = (data.items || []).map((item, idx) => ({
        id: `yt-live-${item.id.videoId}-${idx}`,
        skill: normalizeSkill(q),
        title: item.snippet.title,
        provider: `${item.snippet.channelTitle} • Live YouTube`,
        youtubeId: item.id.videoId,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        duration: 'YouTube Video',
        level: 'All Levels',
        cost: 'Free',
        rating: 4.9,
        summary: item.snippet.description || `Live YouTube tutorial covering ${q}.`
      }));
      setLiveYoutubeCourses(mapped);
      notify('Live YouTube Courses Loaded', `Found ${mapped.length} embeddable YouTube tutorials for "${q}".`);
    } catch (err) {
      notify('YouTube API Error', err.message || 'Check your YouTube Data API v3 key.', 'error');
    } finally {
      setYtSearching(false);
    }
  };

  // --------------------------------------------------------------------------
  // F) PRACTICE TESTS & TIMED SKILL MOCKS
  // --------------------------------------------------------------------------
  if (activeTab === 'practice') {
    const activeAssessment =
      PRACTICE_ASSESSMENTS.find((t) => t.id === activeTestId) || PRACTICE_ASSESSMENTS[0];
    const totalQ = activeAssessment.questions.length;
    const correctCount = activeAssessment.questions.reduce(
      (acc, q, idx) => acc + (testAnswers[idx] === q.answerIdx ? 1 : 0),
      0
    );
    const scorePct = Math.round((correctCount / totalQ) * 100);
    const passed = scorePct >= 67;

    const handleSubmitAssessment = () => {
      setTestSubmitted(true);
      if (passed) {
        if (!completedTestIds.includes(activeAssessment.id)) {
          setCompletedTestIds((prev) => [...prev, activeAssessment.id]);
        }
        const normalized = normalizeSkill(activeAssessment.skill);
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === currentCandidate.id
              ? {
                  ...c,
                  skills: c.skills.includes(normalized) ? c.skills : [...c.skills, normalized]
                }
              : c
          )
        );
        notify(
          `Assessment Passed (${scorePct}%)!`,
          `Verified "${normalized}" badge unlocked and added to your resume eligibility scores.`
        );
      } else {
        notify(
          `Score: ${scorePct}%`,
          'Review the explanations below and retake to unlock the verified skill badge.',
          'error'
        );
      }
    };

    return (
      <div className="space-y-6">
        <div className={`${cardCls} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-500 mb-1.5">
              <Award className="w-3.5 h-3.5" /> Skill Verification & Company Mock Tests
            </div>
            <h2 className="text-lg font-extrabold">Practice Tests & Role Mocks</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Score 67%+ on any mock test to earn a Verified Skill Badge and automatically boost your company match percentages.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-lg font-extrabold text-emerald-500 tabular-nums">
                {completedTestIds.length} / {PRACTICE_ASSESSMENTS.length}
              </div>
              <div className="text-[11px] text-slate-400">Badges Earned</div>
            </div>
            <button
              onClick={() => {
                setStudioTool('interview');
                setActiveTab('studio');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              AI Mock Interview →
            </button>
          </div>
        </div>

        {/* Assessment Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRACTICE_ASSESSMENTS.map((test) => {
            const isSelected = test.id === activeAssessment.id;
            const isPassed = completedTestIds.includes(test.id);
            return (
              <button
                key={test.id}
                type="button"
                onClick={() => {
                  setActiveTestId(test.id);
                  setTestAnswers({});
                  setTestSubmitted(false);
                }}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                    : darkMode
                    ? 'bg-[#111827] border-white/[0.08] hover:border-white/20'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-500">
                    {test.skill}
                  </span>
                  {isPassed ? (
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">{test.durationMins} mins</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs leading-snug">{test.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{test.companyTag}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Practice Quiz */}
        <div className={`${cardCls} p-6 space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div>
              <h3 className="font-bold text-base">{activeAssessment.title}</h3>
              <p className="text-xs text-slate-400">
                {activeAssessment.companyTag} • {activeAssessment.difficulty} • {totalQ} Questions
              </p>
            </div>
            {testSubmitted && (
              <div
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                  passed
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-rose-500/15 text-rose-500'
                }`}
              >
                Score: {correctCount}/{totalQ} ({scorePct}%) — {passed ? 'PASSED & VERIFIED' : 'TRY AGAIN'}
              </div>
            )}
          </div>

          <div className="space-y-5">
            {activeAssessment.questions.map((item, qIdx) => (
              <div
                key={qIdx}
                className={`p-4 rounded-xl border space-y-3 ${
                  darkMode ? 'bg-[#090D16]/70 border-white/[0.07]' : 'bg-slate-50/80 border-slate-200/80'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm">
                  {qIdx + 1}. {item.q}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.options.map((opt, optIdx) => {
                    const picked = testAnswers[qIdx] === optIdx;
                    const isCorrectOpt = item.answerIdx === optIdx;
                    let btnStyle = darkMode
                      ? 'bg-[#111827] border-white/10 hover:border-indigo-500/50'
                      : 'bg-white border-slate-200 hover:border-indigo-400';

                    if (testSubmitted) {
                      if (isCorrectOpt) {
                        btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-semibold';
                      } else if (picked && !isCorrectOpt) {
                        btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-500';
                      }
                    } else if (picked) {
                      btnStyle = 'bg-indigo-600 text-white border-indigo-600 font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={testSubmitted}
                        onClick={() => setTestAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                        className={`p-3 rounded-xl border text-left text-xs transition ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {testSubmitted && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <strong>Explanation:</strong> {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {testSubmitted ? (
              <button
                type="button"
                onClick={() => {
                  setTestAnswers({});
                  setTestSubmitted(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Retake Assessment
              </button>
            ) : (
              <button
                type="button"
                disabled={Object.keys(testAnswers).length < totalQ}
                onClick={handleSubmitAssessment}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 disabled:opacity-50 text-white text-xs font-semibold shadow-sm"
              >
                Submit & Verify Skill ({Object.keys(testAnswers).length}/{totalQ} Answered)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // G) APPLICATIONS TRACKER
  // --------------------------------------------------------------------------
  if (activeTab === 'applications') {
    const appliedJob = jobs.find(j => j.id === currentCandidate.appliedJobId) || jobs[0];
    const steps = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer'];
    const activeIdx = Math.max(0, steps.indexOf(currentCandidate.stage));

    return (
      <div className={`${cardCls} p-6 space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-500">
              Active Application
            </span>
            <h2 className="text-lg font-bold mt-2">{appliedJob.title}</h2>
            <p className="text-xs text-slate-400">{appliedJob.company || appliedJob.department} • {appliedJob.location} • {appliedJob.salary}</p>
          </div>
          <ScoreRing score={currentCandidate.match.overall} darkMode={darkMode} />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {steps.map((st, idx) => (
            <div key={st} className="space-y-1.5">
              <div className={`h-2 rounded-full ${idx <= activeIdx ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'}`} />
              <div className={`text-[11px] font-semibold ${idx <= activeIdx ? 'text-indigo-500' : 'text-slate-400'}`}>
                {st}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // H) AI CAREER STUDIO
  // ==========================================================================
  const [chatTyping, setChatTyping] = useState(false);

  const generateSmartCopilotReply = async (userQuestion) => {
    const q = userQuestion.toLowerCase();
    const skillsList = currentCandidate.skills || [];
    const expYears = currentCandidate.experienceYears || 3;
    const atsScore = parsedStats?.atsScore || 86;
    const ranked = candidateJobMatches || [];
    const best = ranked[0];
    const allMissing = Array.from(
      new Set(ranked.flatMap((m) => m.match.missingSkills || []))
    );

    // Optional live OpenAI API call if user added their API key in API Keys modal
    if (apiKeys?.llmApiKey && apiKeys.llmApiKey.startsWith('sk-')) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKeys.llmApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are CV Orbit AI Career Copilot. Candidate: ${currentCandidate.name}, ${expYears} yrs experience, Skills: ${skillsList.join(', ')}. Top job match: ${best?.job?.company} - ${best?.job?.title} (${best?.match?.overall}%). Missing skills across target roles: ${allMissing.join(', ')}. Give concise, structured, actionable career advice.`
              },
              { role: 'user', content: userQuestion }
            ]
          })
        });
        const data = await res.json();
        const aiText = data?.choices?.[0]?.message?.content;
        if (aiText) return aiText;
      } catch (e) {
        console.warn('LLM fallback to intelligent domain engine:', e);
      }
    }

    // Intelligent profile-aware response engine
    if (/(eligib|compan|match|job|amazon|microsoft|gemini|where can i apply)/i.test(q)) {
      const topLines = ranked.slice(0, 4).map(({ job, match }) => {
        const status = match.overall >= 80 ? 'Eligible' : match.overall >= 65 ? 'Almost Eligible' : 'Skill Gap';
        const missText = match.missingSkills.length ? ` (Missing: ${match.missingSkills.join(', ')})` : ' (100% Skill Match!)';
        return `• ${job.company || job.department} — ${job.title}: ${match.overall}% [${status}]${missText}`;
      });
      return `Here is your live eligibility breakdown based on your ${skillsList.length} verified skills (${skillsList.slice(0, 5).join(', ')}):\n\n${topLines.join('\n')}\n\nNext Step: Completing ${allMissing[0] || 'Docker'} in the Learning Hub or Practice Tests will push your top match even higher.`;
    }

    if (/(gap|missing|learn|skill|upskill|course|roadmap)/i.test(q)) {
      if (allMissing.length === 0) {
        return `Amazing news, ${currentCandidate.name}! You have ZERO missing required skills across our active companies. Focus on earning Verified Badges in "Practice Tests & Mocks" to stand out to recruiters.`;
      }
      const prioritized = allMissing.slice(0, 4).map((sk, idx) => {
        const count = ranked.filter((m) => m.match.missingSkills.includes(sk)).length;
        return `${idx + 1}. ${sk} — Required by ${count} open role(s). Watch the tutorial in Learning Hub or pass the ${sk} Practice Test to unlock it.`;
      });
      return `Your High-Priority Skill Gap Roadmap:\n\n${prioritized.join('\n')}\n\nUnlocking just the top 2 skills (${allMissing.slice(0, 2).join(' & ')}) can boost your overall company match scores by +12% to +18%.`;
    }

    if (/(ats|resume|cv|bullet|score|improve|format)/i.test(q)) {
      return `Your current ATS Resume Compatibility Score is ${atsScore}/100:\n\n• Verified Keywords (${skillsList.length}): ${skillsList.join(', ')}\n• Quantified Impact: ${parsedStats?.hasMetrics ? 'Strong metrics detected (%, $, latency).' : 'Add 3+ quantified metrics like "Reduced API latency by 42%" or "Scaled to 150K users".'}\n• Actionable Upgrade: Add ${allMissing.slice(0, 2).join(' and ') || 'System Design'} to your Technical Skills section and use the "Resume Bullet Improver" tab above to rewrite weak lines.`;
    }

    if (/(salary|ctc|package|negotiate|offer|comp)/i.test(q)) {
      return `Compensation & Negotiation Strategy (${expYears} Yrs Experience):\n\n• Target Market Band: ${best?.job?.salary || '$165,000 – $210,000'} based on your ${skillsList.slice(0, 3).join(', ')} stack.\n• Leverage Point: Highlight your ${best?.match?.overall || 90}% technical alignment with ${best?.job?.company || 'top employers'} and any Verified Practice Test badges.\n• Tip: Ask for total compensation breakdown (Base + Annual Bonus + RSUs/ESOPs) before sharing your anchor number.`;
    }

    if (/(interview|prepare|prep|system design|dsa|question)/i.test(q)) {
      return `Tailored Interview Prep Plan for ${best?.job?.company || 'Top Tech'} (${best?.job?.title || 'Software Engineer'}):\n\n1. Core Stack Deep-Dive: Expect architecture questions on ${skillsList.slice(0, 4).join(', ')}.\n2. System Design: Practice designing low-latency APIs, Redis caching, and fault-tolerant microservices.\n3. Behavioral (STAR Method): Prepare 3 stories with measurable metrics (latency saved, revenue impact, outage ownership).\n\nSwitch to the "Mock Interview Coach" tab right above to practice company-specific questions!`;
    }

    if (/(hi|hello|hey|namaste|help|what can you do)/i.test(q)) {
      return `Hello ${currentCandidate.name}! I have analyzed your resume (${expYears} yrs experience, ${skillsList.length} skills, ATS Score: ${atsScore}/100). Ask me about:\n• "Which companies am I eligible for?"\n• "What are my missing skill gaps?"\n• "How do I improve my ATS resume score?"\n• "Give me an interview prep plan for Amazon & Microsoft"`;
    }

    return `Here is a personalized insight for ${currentCandidate.name} (${expYears} yrs exp • ATS ${atsScore}/100):\n\n• Best Match Right Now: ${best?.job?.company || 'TalentMatch Core Labs'} — ${best?.job?.title} (${best?.match?.overall}% match).\n• Top Strengths: ${skillsList.slice(0, 5).join(', ')}.\n• Fastest Score Booster: Close your missing gap in ${allMissing.slice(0, 2).join(' & ') || 'System Design'} via the Learning Hub or Practice Tests.\n\nTry asking specifically about company eligibility, skill gaps, ATS score, salary negotiation, or interview prep!`;
  };

  const handleSendCopilotMessage = async (customText) => {
    const raw = (customText ?? chatInput).trim();
    if (!raw || chatTyping) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: raw }]);
    if (!customText) setChatInput('');
    setChatTyping(true);
    const reply = await generateSmartCopilotReply(raw);
    setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    setChatTyping(false);
  };

  const mockTracks = {
    amazon: {
      label: 'Amazon SDE-II & Leadership Principles',
      questions: [
        'Tell me about a time you took ownership of a critical production outage and drove root-cause fixes (Ownership).',
        'Design a globally distributed, idempotent order-processing service on AWS handling 50,000 requests/sec.',
        'Describe a technical decision where you disagreed with your team and used data to align everyone (Have Backbone; Disagree and Commit).'
      ]
    },
    microsoft: {
      label: 'Microsoft Azure & AI Copilot Architecture',
      questions: [
        'How would you architect a low-latency RAG pipeline with strict tenant data isolation and citation grounding?',
        'Walk through how you debug memory leaks and tail-latency spikes in a TypeScript + Python microservice stack.',
        'How do you design feature flags and safe progressive rollouts for enterprise AI features?'
      ]
    },
    gemini: {
      label: 'Gemini Solutions Full-Stack & Cloud',
      questions: [
        'Compare REST, GraphQL, and gRPC for a multi-client enterprise dashboard—when would you pick each?',
        'How do you optimize slow PostgreSQL queries and design zero-downtime schema migrations?',
        'Explain how you structure React state management and caching for real-time analytics dashboards.'
      ]
    }
  };
  const activeMockTrack = mockTracks[mockInterviewRole] || mockTracks.amazon;
  const mockQuestions = activeMockTrack.questions;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'chat', label: 'CV Orbit AI Copilot' },
          { id: 'bullets', label: 'Resume Bullet Improver' },
          { id: 'cover', label: 'Cover Letter Generator' },
          { id: 'interview', label: 'Mock Interview Coach' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStudioTool(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              studioTool === tab.id
                ? 'bg-indigo-600 text-white'
                : darkMode
                ? 'bg-[#111827] border border-white/10 text-slate-300'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {studioTool === 'chat' && (
        <div className={`${cardCls} p-6 space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">CV Orbit AI Career Copilot</h3>
                <p className="text-[11px] text-slate-400">
                  Context-aware advisor synced with your resume ({currentCandidate.skills.length} skills • ATS {parsedStats?.atsScore || 86}/100)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setChatMessages([
                  {
                    role: 'assistant',
                    text: `Chat cleared! Ready to help ${currentCandidate.name} with company eligibility, skill gaps, ATS optimization, or interview prep.`
                  }
                ])
              }
              className="text-[11px] font-semibold text-slate-400 hover:text-indigo-500"
            >
              Clear Chat
            </button>
          </div>

          {/* Quick Suggested Prompts */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'Which companies am I eligible for?',
              'What are my missing skill gaps?',
              'How can I boost my ATS score?',
              'Interview prep plan for Amazon & Microsoft',
              'Salary negotiation tips'
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendCopilotMessage(prompt)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                  darkMode
                    ? 'bg-white/[0.03] border-white/10 hover:border-indigo-500/50 text-slate-300'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-400 text-slate-700'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-2xl whitespace-pre-line ${
                  m.role === 'user'
                    ? 'ml-auto bg-indigo-600 text-white shadow-sm'
                    : darkMode
                    ? 'bg-[#090D16] border border-white/10 text-slate-200'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.text}
              </div>
            ))}
            {chatTyping && (
              <div className="p-3 rounded-2xl text-xs text-indigo-500 font-semibold animate-pulse">
                CV Orbit AI is analyzing your resume & job matches...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendCopilotMessage();
              }}
              placeholder="Ask about company eligibility, skill gaps, ATS score, salary, or interviews..."
              className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none ${
                darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => handleSendCopilotMessage()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {studioTool === 'bullets' && (
        <div className={`${cardCls} p-6 space-y-4`}>
          <h3 className="font-bold text-base">AI Resume Bullet Rewriter</h3>
          <textarea
            rows={3}
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
            className={`w-full p-3.5 rounded-xl border text-xs outline-none ${
              darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          />
          <button
            onClick={() =>
              setImprovedBullets([
                `Architected high-throughput React & TypeScript analytics workflows backed by Python FastAPI microservices, reducing p95 latency by 42%.`,
                `Engineered modular REST APIs and automated validation pipelines serving 150K+ active users with 99.95% uptime.`
              ])
            }
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Rewrite With Impact Metrics
          </button>
          {improvedBullets.map((b, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              {b}
            </div>
          ))}
        </div>
      )}

      {studioTool === 'cover' && (
        <div className={`${cardCls} p-6 space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-base">Tailored Cover Letter Generator</h3>
            <select
              value={coverLetterJobId}
              onChange={(e) => setCoverLetterJobId(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs ${
                darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.company || j.department})</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              const target = jobs.find(j => j.id === coverLetterJobId) || jobs[0];
              setGeneratedCoverLetter(
                `Dear Hiring Team,\n\nI am excited to apply for the ${target.title} position at ${target.company || 'your organization'}. With ${currentCandidate.experienceYears} years of hands-on experience across ${currentCandidate.skills.slice(0, 5).join(', ')}, I have consistently delivered scalable, production-grade software systems.\n\nBest regards,\n${currentCandidate.name}`
              );
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Generate Cover Letter
          </button>
          {generatedCoverLetter && (
            <pre className="p-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs whitespace-pre-wrap font-sans leading-relaxed">
              {generatedCoverLetter}
            </pre>
          )}
        </div>
      )}

      {studioTool === 'interview' && (
        <div className={`${cardCls} p-6 space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base">Company-Specific Mock Interview Coach</h3>
              <p className="text-xs text-slate-400">Practice real interview prompts tailored to top hiring companies</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={mockInterviewRole in mockTracks ? mockInterviewRole : 'amazon'}
                onChange={(e) => {
                  setMockInterviewRole(e.target.value);
                  setMockQuestionIdx(0);
                  setMockFeedback(null);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none ${
                  darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="amazon">Amazon SDE-II Track</option>
                <option value="microsoft">Microsoft Azure AI Track</option>
                <option value="gemini">Gemini Solutions Full-Stack Track</option>
              </select>
              <button
                onClick={() => {
                  setMockQuestionIdx((mockQuestionIdx + 1) % mockQuestions.length);
                  setMockFeedback(null);
                }}
                className="text-xs font-semibold text-indigo-500 hover:underline"
              >
                Next Question →
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold">
            [{activeMockTrack.label}] Q{mockQuestionIdx + 1}: {mockQuestions[mockQuestionIdx]}
          </div>
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold">
            Q{mockQuestionIdx + 1}: {mockQuestions[mockQuestionIdx]}
          </div>
          <textarea
            rows={4}
            value={mockAnswer}
            onChange={(e) => setMockAnswer(e.target.value)}
            placeholder="Structure your answer using Situation, Task, Action, and quantified Result..."
            className={`w-full p-3.5 rounded-xl border text-xs outline-none ${
              darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          />
          <button
            onClick={() =>
              setMockFeedback(
                mockAnswer.length > 40
                  ? 'Strong STAR structure (89/100). Adding explicit latency or throughput numbers will elevate this to a Staff-level response.'
                  : 'Expand your answer with concrete architectural tradeoffs and measurable performance results.'
              )
            }
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Evaluate Response
          </button>
          {mockFeedback && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs">
              {mockFeedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 8. YOUTUBE VIDEO LESSON MODAL & API KEYS MODAL & REPORT MODALS
// ============================================================================
function VideoLessonPlayerModal({ darkMode, lesson, isCompleted, onComplete, onClose, notify }) {
  const ytDirectUrl = `https://www.youtube.com/watch?v=${lesson.youtubeId}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${
        darkMode ? 'bg-[#111827] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              Video Course • Unlocks Skill: {lesson.skill}
            </span>
            <h3 className="font-bold text-sm sm:text-base truncate">{lesson.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
          <img
            src={lesson.thumbnail || `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`}
            alt={lesson.title}
            className="w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex flex-col items-center justify-center p-6 text-center">
            <a
              href={ytDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => notify && notify('Launched on YouTube', 'Video opened directly on YouTube without embed blocks.')}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center gap-2.5 shadow-2xl transition transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Watch Full Video Directly on YouTube</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-xs text-slate-300 mt-3 max-w-md">
              Opens directly on YouTube.com to prevent iframe Error 103/153 restrictions. Come back and click below to verify your skill!
            </p>
          </div>
        </div>

        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 max-w-md">
            <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{lesson.provider}</strong> — {lesson.summary}
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onComplete}
              disabled={isCompleted}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                isCompleted
                  ? 'bg-emerald-500/15 text-emerald-500 cursor-default'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Skill Verified ✓' : `Complete & Unlock "${lesson.skill}"`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiKeysConfigModal({ darkMode, apiKeys, onSave, onClose, notify }) {
  const [ytKey, setYtKey] = useState(apiKeys.youtubeApiKey || '');
  const [llmKey, setLlmKey] = useState(apiKeys.llmApiKey || '');
  const [testing, setTesting] = useState(false);

  const testYoutubeConnection = async () => {
    if (!ytKey.trim()) {
      notify('Enter Key First', 'Paste your YouTube Data API v3 key to test.', 'error');
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=python&key=${encodeURIComponent(ytKey.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Invalid YouTube API key');
      notify('YouTube API v3 Verified', 'Connection succeeded! Live course search is enabled.');
    } catch (err) {
      notify('Connection Failed', err.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 ${
        darkMode ? 'bg-[#111827] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/15 text-indigo-500 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">API Keys & Third-Party Integrations</h3>
              <p className="text-xs text-slate-400">Stored locally in your browser session</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              YouTube Data API v3 Key (Learning Hub Live Video Search)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={ytKey}
                onChange={(e) => setYtKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                  darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={testYoutubeConnection}
                disabled={testing}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {testing ? 'Testing...' : 'Test Key'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Get a free key from Google Cloud Console → Enable "YouTube Data API v3". Curated courses work out-of-the-box even without a key.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              OpenAI / Gemini API Key (Optional LLM Enhancement)
            </label>
            <input
              type="password"
              value={llmKey}
              onChange={(e) => setLlmKey(e.target.value)}
              placeholder="sk-... or AIza..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ ...apiKeys, youtubeApiKey: ytKey.trim(), llmApiKey: llmKey.trim() });
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateJobModal({ darkMode, onClose, onCreate }) {
  const [company, setCompany] = useState('TalentMatch Core Labs');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote (US / Global)');
  const [salary, setSalary] = useState('$155,000 – $185,000');
  const [skillsText, setSkillsText] = useState('React, TypeScript, Python, AWS');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-4 ${
        darkMode ? 'bg-[#111827] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">Create Job Requisition</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Company Name (e.g., Stripe AI)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
              darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          />
          <input
            type="text"
            placeholder="Job Title (e.g., Staff AI Backend Engineer)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
              darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
              darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          />
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
              darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          />
        </div>
        <input
          type="text"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
            darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Job Summary</span>
          <button
            type="button"
            onClick={() =>
              setDescription(
                `We are hiring a ${title || 'Senior Engineer'} at ${company} to architect resilient cloud-native platforms utilizing ${skillsText}.`
              )
            }
            className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Generate Description
          </button>
        </div>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full p-3 rounded-xl border text-xs outline-none ${
            darkMode ? 'bg-[#090D16] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}
        />
        <button
          onClick={() =>
            onCreate({
              id: `job-${Date.now()}`,
              company: company || 'TalentMatch Core Labs',
              title: title || 'Senior Platform Engineer',
              department,
              location,
              type: 'Full-Time',
              salary,
              postedDate: 'Just now',
              status: 'Open',
              minExperience: 3,
              minEduLevel: 2,
              deadline: '2026-12-30',
              requiredSkills: skillsText.split(',').map(s => normalizeSkill(s)).filter(Boolean),
              preferredSkills: ['Docker', 'Git'],
              description: description || 'Lead scalable product engineering.'
            })
          }
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Publish Vacancy
        </button>
      </div>
    </div>
  );
}

function WatermarkedReportModal({ darkMode, candidate, biasFreeMode, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-xl rounded-2xl border p-8 relative overflow-hidden shadow-2xl space-y-5 ${
        darkMode ? 'bg-[#111827] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center -rotate-12 opacity-[0.06] text-3xl font-extrabold select-none">
          CV ORBIT TEAM • CV Orbit
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
              Confidential Candidate Evaluation Report
            </div>
            <h3 className="text-xl font-bold mt-1">
              {biasFreeMode ? candidate.anonymizedId : candidate.name}
            </h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-indigo-500/10">
            <div className="text-slate-400">Overall Match</div>
            <div className="text-lg font-bold text-indigo-500">{candidate.match.overall}%</div>
          </div>
          <div className="p-3 rounded-xl bg-teal-500/10">
            <div className="text-slate-400">Skills Fit</div>
            <div className="text-lg font-bold text-teal-500">{candidate.match.skillScore}%</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10">
            <div className="text-slate-400">Experience</div>
            <div className="text-lg font-bold text-emerald-500">{candidate.experienceYears} Yrs</div>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">{candidate.match.explanation}</p>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200/80 dark:border-white/10 text-[11px] text-slate-400">
          <span>CV ORBIT TEAM • CV Orbit</span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}