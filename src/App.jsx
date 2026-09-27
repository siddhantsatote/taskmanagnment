import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Plus,
  Download,
  UserPlus,
  Database,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Trophy,
  Briefcase
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatCards from './components/StatCards';
import ChartsSection from './components/ChartsSection';
import WidgetsSection from './components/WidgetsSection';
import TasksTable from './components/TasksTable';
import KanbanBoard from './components/KanbanBoard';
import EmployeePortal from './components/EmployeePortal';
import TaskModal from './components/TaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import TeamPage from './components/TeamPage';
import AnalyticsView from './components/AnalyticsView';
import SupabaseModal from './components/SupabaseModal';
import LoginPage from './components/LoginPage';
import TaskFlowCanvas from './components/TaskFlowCanvas';

import {
  apiGetTasks,
  apiGetEmployees,
  apiGetTeams,
  apiCreateTeam,
  apiUpdateTeam,
  apiDeleteTeam,
  apiCreateTask,
  apiUpdateTask,
  apiDeleteTask,
  apiCreateEmployee,
  exportTasksToCSV,
  getActiveEmployeeId,
  setActiveEmployeeId as persistActiveEmployeeId,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth
} from './lib/supabase';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => getStoredAuth());

  // Navigation & UI state
  const [currentView, setCurrentView] = useState(() => {
    const auth = getStoredAuth();
    return auth?.role === 'employee' ? 'portal' : 'dashboard';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEmployeeId, setActiveEmployeeIdState] = useState(() => {
    const auth = getStoredAuth();
    return auth?.role === 'employee' ? auth.id : getActiveEmployeeId();
  });

  // Data state
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [initialTeamForModal, setInitialTeamForModal] = useState(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const handleSetActiveEmployeeId = (id) => {
    setActiveEmployeeIdState(id);
    persistActiveEmployeeId(id);
  };

  // Load all tasks, employees, and teams
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedTasks, fetchedEmployees, fetchedTeams] = await Promise.all([
        apiGetTasks(),
        apiGetEmployees(),
        apiGetTeams()
      ]);
      setTasks(fetchedTasks || []);
      setEmployees(fetchedEmployees || []);
      setTeams(fetchedTeams || []);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Strict task isolation: Employees only see their own assigned tasks (individual or whole team)
  const visibleTasks = useMemo(() => {
    if (currentUser?.role === 'employee') {
      return tasks.filter((t) => {
        if (t.assignee_id === currentUser.id) return true;
        if (Array.isArray(t.assignee_ids) && t.assignee_ids.includes(currentUser.id)) return true;
        return false;
      });
    }
    return tasks;
  }, [tasks, currentUser]);

  // Disallow employee from accessing founder overview
  useEffect(() => {
    if (currentUser?.role === 'employee' && currentView === 'dashboard') {
      setCurrentView('portal');
    }
  }, [currentUser, currentView]);

  // Overdue and Due Today calculations for notifications (IST context)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000);

  const overdueTasks = useMemo(() => {
    return visibleTasks.filter((t) => t.status !== 'Done' && new Date(t.deadline) < now);
  }, [visibleTasks, now]);

  const dueTodayTasks = useMemo(() => {
    return visibleTasks.filter((t) => {
      if (t.status === 'Done') return false;
      const d = new Date(t.deadline);
      return d >= now && d < endOfToday;
    });
  }, [visibleTasks, now, endOfToday]);

  // Counts for sidebar badges (scoped to employee's tasks for employees)
  const counts = {
    pending: visibleTasks.filter((t) => t.status === 'Pending').length,
    inProgress: visibleTasks.filter((t) => t.status === 'In Progress').length,
    done: visibleTasks.filter((t) => t.status === 'Done').length,
    employees: employees.length
  };

  // Handlers for Tasks
  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      const updated = await apiUpdateTask(editingTask.id, taskData);
      if (updated) {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        if (selectedTask && selectedTask.id === updated.id) {
          setSelectedTask(updated);
        }
        showToast(`Task "${updated.title}" updated`);
      }
    } else {
      const created = await apiCreateTask(taskData);
      if (created) {
        setTasks((prev) => [created, ...prev]);
        showToast(`New task created: "${created.title}"`);
      }
    }
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  const handleToggleTaskStatus = async (taskId, nextStatus) => {
    const updated = await apiUpdateTask(taskId, { status: nextStatus });
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updated);
      }
      // Reload employees to reflect updated gamification points
      apiGetEmployees().then((emps) => setEmployees(emps));

      if (nextStatus === 'Done') {
        confetti({
          particleCount: 60,
          spread: 65,
          origin: { y: 0.7 },
          colors: ['#F56B2C', '#10B981', '#3B82F6', '#FFD700']
        });
        showToast('🎉 Shandaar! Task completed (+100 Points to assignee)!');
      } else {
        showToast(`Task moved to ${nextStatus}`);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    const success = await apiDeleteTask(taskId);
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
      showToast(`Task removed from pipeline`);
    }
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Handlers for Employees
  const handleAddEmployee = async (employeeData) => {
    const created = await apiCreateEmployee(employeeData);
    if (created) {
      setEmployees((prev) => [...prev, created]);
      showToast(`Added ${created.name} to Bharat Tech team directory!`);
    }
  };

  // Handlers for Teams & Pods
  const handleCreateTeam = async (teamData) => {
    const created = await apiCreateTeam(teamData);
    if (created) {
      setTeams((prev) => [created, ...prev]);
      showToast(`Team "${created.name}" created successfully!`);
      return created;
    }
  };

  const handleDeleteTeam = async (teamId) => {
    const ok = await apiDeleteTeam(teamId);
    if (ok) {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      showToast('Team removed from directory');
    }
  };

  const handleAssignTaskToTeam = (team) => {
    setInitialTeamForModal(team);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setStoredAuth(user);
    setCurrentUser(user);
    if (user.role === 'employee') {
      handleSetActiveEmployeeId(user.id);
      setCurrentView('portal');
    } else {
      setCurrentView('dashboard');
    }
    loadData();
  };

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    showToast('👋 You have signed out successfully.');
  };

  // Unauthenticated screen: render LoginPage
  if (!currentUser) {
    return (
      <>
        <LoginPage
          employees={employees}
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
        />
        {toast && (
          <div className="toast-container">
            <div className="toast">
              <Sparkles size={16} style={{ color: '#F56B2C' }} />
              <span>{toast}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        counts={counts}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Area */}
      <div className={`main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenNewTaskModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          overdueTasks={overdueTasks}
          dueTodayTasks={dueTodayTasks}
          onSelectTask={(task) => setSelectedTask(task)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Content */}
        <main className="page-content">
          {/* VIEW 1: DASHBOARD OVERVIEW (FOUNDER VIEW - ADMIN ONLY) */}
          {currentView === 'dashboard' && currentUser?.role === 'admin' && (
            <>
              {/* Header */}
              <div className="dashboard-header">
                <div className="dashboard-title-area">
                  <h1>Dashboard Overview</h1>
                  <p>Acme Infotech India · Track deliverables, GST timelines, and team productivity in IST</p>
                </div>

                <div className="dashboard-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setCurrentView('portal')}
                    style={{ color: 'var(--primary)', borderColor: 'var(--primary-subtle)', background: '#FFF7ED' }}
                    title="Switch to Employee Workspace & Leaderboard"
                  >
                    <Trophy size={15} />
                    <span>Employee Portal & Leaderboard</span>
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => exportTasksToCSV(tasks, employees)}
                    title="Export tasks to CSV spreadsheet"
                  >
                    <Download size={15} />
                    <span>Export CSV</span>
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    id="dashboard-new-task-btn"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>New Task</span>
                  </button>
                </div>
              </div>

              {/* 1. Stat Cards Row (4 cards, Hero Orange Overdue card) */}
              <StatCards tasks={tasks} />

              {/* 2. Charts Row (Smooth Line 7-day trend + Bar Priority chart) */}
              <ChartsSection tasks={tasks} />

              {/* 3. Widgets Row (Due Today/Week + Team Workload Top Products card) */}
              <WidgetsSection
                tasks={tasks}
                employees={employees}
                onSelectTask={(task) => setSelectedTask(task)}
                onToggleTaskStatus={handleToggleTaskStatus}
                onNavigateToTeam={() => setCurrentView('team')}
              />

              {/* 4. Filterable & Sortable Tasks Table */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Operations & Deliverables Pipeline
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Filter by date recency, GST status, priority, or switch to Kanban board view
                  </p>
                </div>
                <TasksTable
                  tasks={tasks}
                  employees={employees}
                  teams={teams}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onToggleTaskStatus={handleToggleTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  onOpenNewTaskModal={() => {
                    setEditingTask(null);
                    setInitialTeamForModal(null);
                    setIsTaskModalOpen(true);
                  }}
                />
              </div>
            </>
          )}

          {/* VIEW 2: EMPLOYEE PORTAL & GAMIFIED LEADERBOARD */}
          {currentView === 'portal' && (
            <EmployeePortal
              employees={employees}
              teams={teams}
              tasks={visibleTasks}
              activeEmployeeId={activeEmployeeId}
              setActiveEmployeeId={handleSetActiveEmployeeId}
              onToggleTaskStatus={handleToggleTaskStatus}
              onSelectTask={(task) => setSelectedTask(task)}
              onRefreshData={loadData}
              showToast={showToast}
              currentUser={currentUser}
            />
          )}

          {/* VIEW 3: KANBAN BOARD */}
          {currentView === 'kanban' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="dashboard-header">
                <div className="dashboard-title-area">
                  <h1>{currentUser?.role === 'employee' ? 'My Kanban Task Board' : 'Interactive Kanban Task Board'}</h1>
                  <p>
                    {currentUser?.role === 'employee'
                      ? 'Your personal task deliverables across Pending, In Progress, and Completed stages'
                      : 'Visual pipeline workflow across Pending, In Progress, and Completed stages'}
                  </p>
                </div>

                <div className="dashboard-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setEditingTask(null);
                      setInitialTeamForModal(null);
                      setIsTaskModalOpen(true);
                    }}
                  >
                    <Plus size={16} />
                    <span>Create Task</span>
                  </button>
                </div>
              </div>

              <KanbanBoard
                tasks={visibleTasks}
                employees={employees}
                teams={teams}
                onSelectTask={(task) => setSelectedTask(task)}
                onToggleTaskStatus={handleToggleTaskStatus}
                onOpenNewTaskModal={() => {
                  setEditingTask(null);
                  setInitialTeamForModal(null);
                  setIsTaskModalOpen(true);
                }}
              />
            </div>
          )}

          {/* VIEW: WORKFLOW CANVAS (FIGMA / MIRO STYLE) */}
          {currentView === 'canvas' && (
            <TaskFlowCanvas
              tasks={visibleTasks}
              employees={employees}
              teams={teams}
              onSelectTask={(task) => setSelectedTask(task)}
              onToggleTaskStatus={handleToggleTaskStatus}
              onOpenNewTaskModal={() => {
                setEditingTask(null);
                setInitialTeamForModal(null);
                setIsTaskModalOpen(true);
              }}
              currentUser={currentUser}
            />
          )}

          {/* VIEW 4: ALL TASKS TABLE */}
          {currentView === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="dashboard-header">
                <div className="dashboard-title-area">
                  <h1>{currentUser?.role === 'employee' ? 'My Assigned Tasks' : 'Task Directory & Management'}</h1>
                  <p>
                    {currentUser?.role === 'employee'
                      ? 'Your personal task pipeline with status filters, WhatsApp alerts, and CSV export'
                      : 'Comprehensive task backlog with multi-dimensional filtering, WhatsApp alerts, and CSV export'}
                  </p>
                </div>

                <div className="dashboard-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setEditingTask(null);
                      setInitialTeamForModal(null);
                      setIsTaskModalOpen(true);
                    }}
                  >
                    <Plus size={16} />
                    <span>Create Task</span>
                  </button>
                </div>
              </div>

              <TasksTable
                tasks={visibleTasks}
                employees={employees}
                teams={teams}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectTask={(task) => setSelectedTask(task)}
                onToggleTaskStatus={handleToggleTaskStatus}
                onDeleteTask={handleDeleteTask}
                onOpenNewTaskModal={() => {
                  setEditingTask(null);
                  setInitialTeamForModal(null);
                  setIsTaskModalOpen(true);
                }}
              />
            </div>
          )}

          {/* VIEW 5: TEAM DIRECTORY */}
          {currentView === 'team' && (
            <TeamPage
              employees={employees}
              teams={teams}
              tasks={visibleTasks}
              onAddEmployee={handleAddEmployee}
              onAddTeam={handleCreateTeam}
              onDeleteTeam={handleDeleteTeam}
              onAssignTaskToTeam={handleAssignTaskToTeam}
              onSelectTask={(task) => setSelectedTask(task)}
              currentUser={currentUser}
            />
          )}

          {/* VIEW 6: ANALYTICS & INSIGHTS (ADMIN ONLY) */}
          {currentView === 'analytics' && currentUser?.role === 'admin' && (
            <AnalyticsView tasks={tasks} employees={employees} />
          )}
        </main>
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setInitialTeamForModal(null);
        }}
        onSubmit={handleSaveTask}
        employees={employees}
        teams={teams}
        initialData={editingTask}
        initialTeam={initialTeamForModal}
        onAddTeam={handleCreateTeam}
      />

      {/* Task Detail Modal with Activity Notes Log */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        employees={employees}
        teams={teams}
        onUpdateStatus={handleToggleTaskStatus}
        onEditTask={handleOpenEditTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Supabase Configuration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={loadData}
        onResetDemo={loadData}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <Sparkles size={16} style={{ color: '#F56B2C' }} />
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
