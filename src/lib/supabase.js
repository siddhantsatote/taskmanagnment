import { createClient } from '@supabase/supabase-js';

// Indian Team Seed Data with Points, Streaks, and Achievements
export const DEFAULT_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'Priya Patel',
    role: 'Lead UI/UX & Product Designer',
    email: 'priya.patel@bharattech.in',
    password: 'password123',
    department: 'Design & Experience',
    avatar_color: '#F56B2C',
    points: 980,
    streak_days: 7,
    badges: ['Task Titan 🥇', 'Sprint Champion', 'Zero Overdue 🛡️'],
    kudos: [
      { from: 'Rajesh Sharma', text: 'Stunning Diwali creative assets!', date: 'Yesterday' },
      { from: 'Aarav Mehta', text: 'Loved the fast mobile prototype turnarounds.', date: '3 days ago' }
    ],
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'emp-2',
    name: 'Aarav Mehta',
    role: 'Senior Full-Stack & UPI Dev',
    email: 'aarav.mehta@bharattech.in',
    password: 'password123',
    department: 'Engineering',
    avatar_color: '#3B82F6',
    points: 860,
    streak_days: 5,
    badges: ['Velocity Star 🥈', 'Razorpay Ninja ⚡', 'Bug Crusher'],
    kudos: [
      { from: 'Priya Patel', text: 'Super clean webhook implementation!', date: '2 days ago' }
    ],
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 'emp-3',
    name: 'Sneha Rao',
    role: 'Head of Finance & Operations',
    email: 'sneha.rao@bharattech.in',
    password: 'password123',
    department: 'Finance & Compliance',
    avatar_color: '#10B981',
    points: 810,
    streak_days: 6,
    badges: ['Compliance Hero 🥉', 'GST Master 📑', 'Audit Star'],
    kudos: [
      { from: 'Rajesh Sharma', text: 'Saved us 18% penalty on ITC reconciliation!', date: '1 week ago' }
    ],
    created_at: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 'emp-4',
    name: 'Vikram Malhotra',
    role: 'Client Success & Enterprise Sales',
    email: 'vikram.m@bharattech.in',
    password: 'password123',
    department: 'Sales & Growth',
    avatar_color: '#8B5CF6',
    points: 690,
    streak_days: 4,
    badges: ['Deal Maker 🤝', 'Client Magnet', 'On-Time Pioneer'],
    kudos: [
      { from: 'Sneha Rao', text: 'Great onboarding for Bangalore client!', date: 'Yesterday' }
    ],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'emp-5',
    name: 'Ananya Sen',
    role: 'Digital Marketing & Community Lead',
    email: 'ananya.sen@bharattech.in',
    password: 'password123',
    department: 'Growth Marketing',
    avatar_color: '#EC4899',
    points: 590,
    streak_days: 3,
    badges: ['Growth Hacker 🚀', 'Social Wizard', 'Festive Champ'],
    kudos: [
      { from: 'Vikram Malhotra', text: 'LinkedIn engagement hit 40k views!', date: '4 days ago' }
    ],
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  }
];

// Default Cross-Functional Teams / Pods for Indian MSMEs
export const DEFAULT_TEAMS = [
  {
    id: 'team-1',
    name: 'Tech & UPI Engineering Squad',
    description: 'Core product architecture, Razorpay/UPI gateway integrations, webhooks, and mobile app sprints.',
    department: 'Engineering',
    color: '#3B82F6',
    member_ids: ['emp-2', 'emp-1'],
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'team-2',
    name: 'GST & Statutory Compliance Pod',
    description: 'GSTR-3B filings, Input Tax Credit (ITC) reconciliation, TDS ledgers, MCA filings, and audits.',
    department: 'Finance & Compliance',
    color: '#10B981',
    member_ids: ['emp-3'],
    created_at: new Date(Date.now() - 75 * 86400000).toISOString()
  },
  {
    id: 'team-3',
    name: 'Growth & Client Success Alliance',
    description: 'B2B client onboarding, corporate partner pitches, LinkedIn outbound sales, and festive marketing.',
    department: 'Sales & Growth',
    color: '#8B5CF6',
    member_ids: ['emp-4', 'emp-5', 'emp-1'],
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  }
];

// Helper to get dates relative to today
const today = new Date();
const getDateOffset = (days, hours = 0) => {
  const d = new Date(today.getTime() + days * 86400000 + hours * 3600000);
  return d.toISOString();
};

// Realistic Indian MSME/Startup Business Tasks
const DEFAULT_TASKS = [
  {
    id: 'task-101',
    title: 'GSTR-3B Filing & Input Tax Credit (ITC) Reconciliation',
    description: 'Verify GSTR-2B purchase invoices against supplier uploads on GST Portal before the 20th deadline to prevent penalty interest.',
    assignee_id: 'emp-3',
    assignee_ids: ['emp-3'],
    team_id: 'team-2',
    team_name: 'GST & Statutory Compliance Pod',
    priority: 'Urgent',
    deadline: getDateOffset(-2), // Overdue!
    status: 'In Progress',
    tag: 'GST & Compliance',
    created_at: getDateOffset(-5)
  },
  {
    id: 'task-102',
    title: 'Client Onboarding: Bangalore Retail Tech Pvt Ltd',
    description: 'Finalize Master Services Agreement (MSA), set up enterprise tenant workspace, and schedule founder kickoff call on Google Meet.',
    assignee_id: 'emp-4',
    assignee_ids: ['emp-4', 'emp-5'],
    team_id: 'team-3',
    team_name: 'Growth & Client Success Alliance',
    priority: 'High',
    deadline: getDateOffset(-1), // Overdue!
    status: 'Pending',
    tag: 'Client Deliverable',
    created_at: getDateOffset(-4)
  },
  {
    id: 'task-103',
    title: 'Integrate Razorpay UPI & Netbanking Webhooks v3',
    description: 'Deploy auto-reconciliation webhook handler for instant UPI QR payments and test refund flows in sandbox with Axis Bank gateway.',
    assignee_id: 'emp-2',
    assignee_ids: ['emp-2', 'emp-1'],
    team_id: 'team-1',
    team_name: 'Tech & UPI Engineering Squad',
    priority: 'High',
    deadline: getDateOffset(0, 4), // Due Today!
    status: 'In Progress',
    tag: 'UPI Payments',
    created_at: getDateOffset(-2)
  },
  {
    id: 'task-104',
    title: 'Diwali Festive Sale Creatives & Banners',
    description: 'Design responsive homepage hero banners, Instagram carousel ads, and WhatsApp promotion templates with warm festive colors.',
    assignee_id: 'emp-1',
    assignee_ids: ['emp-1', 'emp-5'],
    team_id: 'team-3',
    team_name: 'Growth & Client Success Alliance',
    priority: 'Medium',
    deadline: getDateOffset(0, 7), // Due Today!
    status: 'Pending',
    tag: 'Festive Campaign',
    created_at: getDateOffset(-3)
  },
  {
    id: 'task-105',
    title: 'TDS Deduction Reconciliation with TRACES Form 26AS',
    description: 'Reconcile vendor TDS deducted under Section 194C & 194J against TRACES portal ledger before quarterly Challan payment.',
    assignee_id: 'emp-3',
    assignee_ids: ['emp-3'],
    team_id: 'team-2',
    team_name: 'GST & Statutory Compliance Pod',
    priority: 'Medium',
    deadline: getDateOffset(2), // Due This Week
    status: 'Pending',
    tag: 'Income Tax TDS',
    created_at: getDateOffset(-1)
  },
  {
    id: 'task-106',
    title: 'WhatsApp Business API Customer Support Bot Setup',
    description: 'Configure automated WhatsApp order status tracking triggers and FAQ responses via Gupshup/Interakt API webhook.',
    assignee_id: 'emp-2',
    assignee_ids: ['emp-2'],
    team_id: 'team-1',
    team_name: 'Tech & UPI Engineering Squad',
    priority: 'Low',
    deadline: getDateOffset(3), // Due This Week
    status: 'In Progress',
    tag: 'WhatsApp Bot',
    created_at: getDateOffset(-2)
  },
  {
    id: 'task-107',
    title: 'B2B Founder Outreach on LinkedIn: Tier-1 Hubs',
    description: 'Execute outbound campaign targeting 150 D2C brands across Mumbai, Gurugram, and Hyderabad for Q3 corporate pilot program.',
    assignee_id: 'emp-5',
    assignee_ids: ['emp-5', 'emp-4'],
    team_id: 'team-3',
    team_name: 'Growth & Client Success Alliance',
    priority: 'Low',
    deadline: getDateOffset(5), // Due This Week
    status: 'Pending',
    tag: 'B2B Sales',
    created_at: getDateOffset(-1)
  },
  {
    id: 'task-108',
    title: 'Annual MCA Compliance & Director KYC Verification',
    description: 'Complete DIR-3 KYC for active directors and submit annual statutory records to Registrar of Companies (ROC Bangalore).',
    assignee_id: 'emp-3',
    assignee_ids: ['emp-3'],
    team_id: 'team-2',
    team_name: 'GST & Statutory Compliance Pod',
    priority: 'High',
    deadline: getDateOffset(-3),
    status: 'Done',
    tag: 'ROC Compliance',
    created_at: getDateOffset(-8)
  },
  {
    id: 'task-109',
    title: 'Mobile App Hindi & Regional Language UI Localization',
    description: 'Translate onboarding strings into Hindi and Marathi for tier-2/tier-3 merchants across India.',
    assignee_id: 'emp-1',
    assignee_ids: ['emp-1', 'emp-2'],
    team_id: 'team-1',
    team_name: 'Tech & UPI Engineering Squad',
    priority: 'Medium',
    deadline: getDateOffset(-4),
    status: 'Done',
    tag: 'Localization',
    created_at: getDateOffset(-9)
  },
  {
    id: 'task-110',
    title: 'Bangalore Tech Summit Booth Collateral & Pitch Deck',
    description: 'Printed QR brochures, standee artwork, and investor summary one-pager prepared for Palace Grounds booth setup.',
    assignee_id: 'emp-4',
    assignee_ids: ['emp-4', 'emp-1'],
    team_id: 'team-3',
    team_name: 'Growth & Client Success Alliance',
    priority: 'Medium',
    deadline: getDateOffset(-1),
    status: 'Done',
    tag: 'Marketing',
    created_at: getDateOffset(-6)
  }
];

const DEFAULT_NOTES = [
  {
    id: 'note-1',
    task_id: 'task-101',
    author: 'Sneha Rao (Finance)',
    content: 'Uploaded ₹14.8 Lakh invoices to the CA portal. 2 vendor invoices still pending verification for input tax credit.',
    created_at: getDateOffset(-1, -4)
  },
  {
    id: 'note-2',
    task_id: 'task-102',
    author: 'Vikram Malhotra (Sales)',
    content: 'Client founder requested kickoff call scheduled for Thursday 3:30 PM IST. Sent Zoom link and welcome pack on WhatsApp.',
    created_at: getDateOffset(0, -10)
  },
  {
    id: 'note-3',
    task_id: 'task-103',
    author: 'Aarav Mehta (Dev)',
    content: 'Razorpay UPI auto-capture tested with test UPI ID @okhdfcbank. 100% success rate on 15 test transactions.',
    created_at: getDateOffset(0, -2)
  },
  {
    id: 'note-4',
    task_id: 'task-104',
    author: 'Priya Patel (Design)',
    content: 'Exported high-res creatives in Hindi and English. Ready for Meta ads and WhatsApp blast.',
    created_at: getDateOffset(0, -5)
  }
];

// LocalStorage Keys
const STORAGE_KEYS = {
  SUPABASE_URL: 'taskflow_sb_url',
  SUPABASE_KEY: 'taskflow_sb_key',
  EMPLOYEES: 'taskflow_employees_india_v2',
  TASKS: 'taskflow_tasks_india_v2',
  TEAMS: 'taskflow_teams_india_v2',
  NOTES: 'taskflow_notes_india_v2',
  ACTIVE_USER_ID: 'taskflow_active_employee_id',
  AUTH_SESSION: 'taskflow_auth_session_v1'
};

// Auth session helpers
export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredAuth = (authData) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(authData));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
};

// Initialize LocalStorage with seed data if empty
export const initLocalData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
  } else {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
      let updated = false;
      const patched = existing.map(e => {
        if (!e.password) {
          updated = true;
          return { ...e, password: 'password123' };
        }
        return e;
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(patched));
      }
    } catch (err) {}
  }

  // Initialize Teams
  if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(DEFAULT_TEAMS));
  }

  // Initialize Tasks & migrate to multi-assignee structure
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
  } else {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      let updated = false;
      const patched = existing.map(t => {
        let changed = false;
        let newTask = { ...t };
        if (!newTask.assignee_ids && newTask.assignee_id) {
          newTask.assignee_ids = [newTask.assignee_id];
          changed = true;
        }
        // Match default demo tasks if missing team info
        const defaultMatch = DEFAULT_TASKS.find(dt => dt.id === newTask.id);
        if (defaultMatch && !newTask.team_name && defaultMatch.team_name) {
          newTask.team_name = defaultMatch.team_name;
          newTask.team_id = defaultMatch.team_id;
          newTask.assignee_ids = defaultMatch.assignee_ids;
          changed = true;
        }
        if (changed) updated = true;
        return newTask;
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(patched));
      }
    } catch (err) {}
  }

  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
  }
};

// Indian Date Formatter (DD/MM/YYYY or DD MMM YYYY in IST)
export const formatIndianDate = (dateString, includeTime = false) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return d.toLocaleDateString('en-IN', options);
};

// WhatsApp Task Share Generator
export const generateWhatsAppTaskShareUrl = (task, assigneeName) => {
  const text = `🇮🇳 *TaskFlow India - Work Assignment*
📌 *Task:* ${task.title}
⚡ *Priority:* ${task.priority}
📊 *Status:* ${task.status}
⏳ *Deadline:* ${formatIndianDate(task.deadline, true)} IST
👤 *Assigned To:* ${assigneeName || 'Unassigned'}
${task.description ? `\n📝 *Notes:* ${task.description}` : ''}

_Please update your progress on the TaskFlow Portal!_`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};

// Active Employee for Employee Portal
export const getActiveEmployeeId = () => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || 'emp-1';
};

export const setActiveEmployeeId = (empId) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, empId);
};

// Supabase client configuration
export const getSupabaseConfig = () => {
  return {
    url: localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || import.meta.env.VITE_SUPABASE_URL || '',
    key: localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

export const saveSupabaseConfig = (url, key) => {
  if (url) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);

  if (key) localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
};

let cachedClient = null;
let cachedConfigKey = '';

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  const currentConfigKey = `${url}___${key}`;
  if (cachedClient && cachedConfigKey === currentConfigKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false }
    });
    cachedConfigKey = currentConfigKey;
    return cachedClient;
  } catch (e) {
    console.error('Supabase client init error:', e);
    return null;
  }
};

// Test Supabase Connection
export const testSupabaseConnection = async (url, key) => {
  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await client.from('tasks').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205') {
        return {
          success: true,
          needSchema: true,
          message: 'Connected to Supabase! Run the SQL schema script in your Supabase SQL editor to create the tables.'
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, needSchema: false, message: 'Connected to Supabase! All tables are active.' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed' };
  }
};

// Data API: Employees
export const apiGetEmployees = async () => {
  initLocalData();
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('employees').select('*').order('points', { ascending: false });
      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch employees failed, using local storage:', e);
    }
  }
  const local = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  return local ? JSON.parse(local) : DEFAULT_EMPLOYEES;
};

export const apiCreateEmployee = async (employeeData) => {
  initLocalData();
  const newEmp = {
    id: 'emp-' + Date.now().toString(36),
    avatar_color: employeeData.avatar_color || '#F56B2C',
    points: 100,
    streak_days: 1,
    badges: ['New Joiner ⭐'],
    kudos: [],
    created_at: new Date().toISOString(),
    ...employeeData
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('employees').insert([newEmp]);
    } catch (e) {
      console.warn('Supabase create employee failed:', e);
    }
  }

  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
  list.push(newEmp);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
  return newEmp;
};

// Kudos System
export const apiGiveKudos = async (toEmpId, fromName, message) => {
  initLocalData();
  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
  const idx = list.findIndex(e => e.id === toEmpId);
  if (idx !== -1) {
    if (!list[idx].kudos) list[idx].kudos = [];
    list[idx].kudos.unshift({
      from: fromName || 'Team Mate',
      text: message,
      date: 'Just now'
    });
    // Add +25 bonus points for receiving kudos
    list[idx].points = (list[idx].points || 0) + 25;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    return list[idx];
  }
  return null;
};

// Data API: Teams & Pods
export const apiGetTeams = async () => {
  initLocalData();
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('teams').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch teams failed, using local storage:', e);
    }
  }
  const local = localStorage.getItem(STORAGE_KEYS.TEAMS);
  return local ? JSON.parse(local) : DEFAULT_TEAMS;
};

export const apiCreateTeam = async (teamData) => {
  initLocalData();
  const newTeam = {
    id: 'team-' + Date.now().toString(36),
    name: teamData.name || 'New Team',
    description: teamData.description || '',
    department: teamData.department || 'General',
    color: teamData.color || '#F56B2C',
    member_ids: Array.isArray(teamData.member_ids) ? teamData.member_ids : [],
    created_at: new Date().toISOString(),
    ...teamData
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('teams').insert([newTeam]);
    } catch (e) {
      console.warn('Supabase create team failed:', e);
    }
  }

  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
  list.unshift(newTeam);
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(list));
  return newTeam;
};

export const apiUpdateTeam = async (teamId, updates) => {
  initLocalData();
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('teams').update(updates).eq('id', teamId);
    } catch (e) {
      console.warn('Supabase update team failed:', e);
    }
  }

  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
  const idx = list.findIndex(t => t.id === teamId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(list));
    return list[idx];
  }
  return null;
};

export const apiDeleteTeam = async (teamId) => {
  initLocalData();
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('teams').delete().eq('id', teamId);
    } catch (e) {
      console.warn('Supabase delete team failed:', e);
    }
  }

  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
  const filtered = list.filter(t => t.id !== teamId);
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(filtered));
  return true;
};

// Data API: Tasks
export const apiGetTasks = async () => {
  initLocalData();
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('tasks').select('*').order('deadline', { ascending: true });
      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch tasks failed, using local storage:', e);
    }
  }
  const local = localStorage.getItem(STORAGE_KEYS.TASKS);
  return local ? JSON.parse(local) : DEFAULT_TASKS;
};

export const apiCreateTask = async (taskData) => {
  initLocalData();
  const assigneeIds = Array.isArray(taskData.assignee_ids) && taskData.assignee_ids.length > 0
    ? taskData.assignee_ids
    : (taskData.assignee_id ? [taskData.assignee_id] : []);

  const newTask = {
    id: 'task-' + Date.now().toString(36),
    created_at: new Date().toISOString(),
    status: taskData.status || 'Pending',
    priority: taskData.priority || 'Medium',
    tag: taskData.tag || 'General',
    ...taskData,
    assignee_ids: assigneeIds,
    assignee_id: taskData.assignee_id || assigneeIds[0] || null
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('tasks').insert([newTask]);
    } catch (e) {
      console.warn('Supabase create task failed:', e);
    }
  }

  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  list.unshift(newTask);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(list));

  const assignmentNote = newTask.team_name
    ? `Assigned to team "${newTask.team_name}" (${assigneeIds.length} members).`
    : assigneeIds.length > 1
    ? `Assigned to ${assigneeIds.length} team members.`
    : 'Assigned this task.';

  await apiCreateTaskNote(newTask.id, 'Rajesh Sharma (Owner)', assignmentNote);
  return newTask;
};

export const apiUpdateTask = async (taskId, updates) => {
  initLocalData();
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('tasks').update(updates).eq('id', taskId);
    } catch (e) {
      console.warn('Supabase update task failed:', e);
    }
  }

  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  const idx = list.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    const prevStatus = list[idx].status;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(list));

    // Award Gamification Points if marked Done to all assigned members
    if (updates.status === 'Done' && prevStatus !== 'Done') {
      const empList = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
      const bonus = (list[idx].priority === 'Urgent' || list[idx].priority === 'High') ? 150 : 100;
      const targets = Array.isArray(list[idx].assignee_ids) && list[idx].assignee_ids.length > 0
        ? list[idx].assignee_ids
        : (list[idx].assignee_id ? [list[idx].assignee_id] : []);

      let changed = false;
      targets.forEach(targetId => {
        const empIdx = empList.findIndex(e => e.id === targetId);
        if (empIdx !== -1) {
          empList[empIdx].points = (empList[empIdx].points || 0) + bonus;
          empList[empIdx].streak_days = (empList[empIdx].streak_days || 0) + 1;
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(empList));
      }
    }

    return list[idx];
  }
  return null;
};

export const apiDeleteTask = async (taskId) => {
  initLocalData();
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('tasks').delete().eq('id', taskId);
    } catch (e) {
      console.warn('Supabase delete task failed:', e);
    }
  }

  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
  const filtered = list.filter(t => t.id !== taskId);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  return true;
};

// Data API: Task Notes / Activity Log
export const apiGetTaskNotes = async (taskId) => {
  initLocalData();
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('task_notes').select('*').eq('task_id', taskId).order('created_at', { ascending: true });
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch notes failed:', e);
    }
  }

  const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
  return notes.filter(n => n.task_id === taskId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

export const apiCreateTaskNote = async (taskId, author, content) => {
  initLocalData();
  const newNote = {
    id: 'note-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    task_id: taskId,
    author: author || 'Rajesh Sharma',
    content: content.trim(),
    created_at: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('task_notes').insert([newNote]);
    } catch (e) {
      console.warn('Supabase create note failed:', e);
    }
  }

  const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
  notes.push(newNote);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  return newNote;
};

// Reset to initial Indian demo data
export const resetToDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(DEFAULT_TEAMS));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
};

// CSV Export Helper with Indian Formats
export const exportTasksToCSV = (tasks, employees) => {
  const empMap = (employees || []).reduce((acc, emp) => {
    acc[emp.id] = emp.name;
    return acc;
  }, {});

  const headers = ['Task ID', 'Title', 'Category/Tag', 'Description', 'Assignee', 'Priority', 'Status', 'Deadline (IST)', 'Is Overdue', 'Created At (IST)'];
  
  const now = new Date();
  const rows = tasks.map(t => {
    const isOverdue = t.status !== 'Done' && new Date(t.deadline) < now;
    const cleanDesc = (t.description || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const cleanTitle = (t.title || '').replace(/"/g, '""');
    const assigneeName = empMap[t.assignee_id] || 'Unassigned';

    return [
      `"${t.id}"`,
      `"${cleanTitle}"`,
      `"${t.tag || 'General'}"`,
      `"${cleanDesc}"`,
      `"${assigneeName}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${formatIndianDate(t.deadline, true)}"`,
      `"${isOverdue ? 'YES' : 'NO'}"`,
      `"${formatIndianDate(t.created_at, true)}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TaskFlow_India_Tasks_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
