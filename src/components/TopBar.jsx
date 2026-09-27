import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  Database,
  ExternalLink,
  ShieldCheck,
  Trophy,
  Briefcase,
  LogOut,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { formatIndianDate } from '../lib/supabase';

export default function TopBar({
  searchQuery,
  setSearchQuery,
  currentView,
  setCurrentView,
  onOpenNewTaskModal,
  onOpenSupabaseModal,
  onOpenAICopilot,
  overdueTasks = [],
  dueTodayTasks = [],
  onSelectTask,
  currentUser,
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const totalAlerts = overdueTasks.length + dueTodayTasks.length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      {/* Search Bar */}
      <div className="topbar-left">
        <div className="topbar-search-box">
          <Search className="topbar-search-icon" />
          <input
            type="text"
            placeholder="Search tasks, GST, team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '44px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-light)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕
            </button>
          )}
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="topbar-right" style={{ flexShrink: 0 }}>
        {/* Sleek Dual Mode Switcher: Founder View vs Employee Portal */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#F1F5F9',
            padding: '3px',
            borderRadius: '10px',
            gap: '2px'
          }}
        >
          {currentUser?.role === 'employee' ? (
            <>
              <button
                onClick={() => setCurrentView('portal')}
                style={{
                  border: 'none',
                  background: currentView === 'portal' ? '#FFFFFF' : 'transparent',
                  color: currentView === 'portal' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: currentView === 'portal' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Trophy size={13} style={{ color: '#EA580C' }} />
                <span>My Portal & Tasks</span>
              </button>

              <button
                onClick={() => setCurrentView('kanban')}
                style={{
                  border: 'none',
                  background: currentView === 'kanban' ? '#FFFFFF' : 'transparent',
                  color: currentView === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: currentView === 'kanban' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <CheckSquare size={13} style={{ color: 'var(--primary)' }} />
                <span>Kanban Board</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('dashboard')}
                style={{
                  border: 'none',
                  background: currentView !== 'portal' ? '#FFFFFF' : 'transparent',
                  color: currentView !== 'portal' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: currentView !== 'portal' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Briefcase size={13} style={{ color: currentView !== 'portal' ? 'var(--primary)' : undefined }} />
                <span>Founder</span>
              </button>

              <button
                onClick={() => setCurrentView('portal')}
                style={{
                  border: 'none',
                  background: currentView === 'portal' ? '#FFFFFF' : 'transparent',
                  color: currentView === 'portal' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: currentView === 'portal' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Trophy size={13} style={{ color: '#EA580C' }} />
                <span>Portal & Ranks</span>
              </button>
            </>
          )}
        </div>

        {/* AI Founder Copilot Trigger */}
        <button
          onClick={onOpenAICopilot}
          id="topbar-ai-copilot-btn"
          style={{
            padding: '7px 13px',
            borderRadius: '9px',
            border: '1px solid #FED7AA',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            color: '#C2410C',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 5px rgba(245, 107, 44, 0.12)',
            transition: 'all 0.15s ease'
          }}
          title="Open Founder AI Copilot for insights, task assignment, and custom flowcharts"
        >
          <Sparkles size={15} style={{ color: '#EA580C' }} />
          <span>Ask AI</span>
        </button>

        {/* Create Task Button */}
        <button className="btn-primary" onClick={onOpenNewTaskModal} id="topbar-new-task-btn" style={{ padding: '8px 14px' }}>
          <Plus size={16} strokeWidth={2.5} />
          <span>New Task</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            id="topbar-notifications-btn"
          >
            <Bell size={18} />
            {totalAlerts > 0 && <span className="badge-count">{totalAlerts}</span>}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Activity & Deadlines (IST)
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {totalAlerts} pending attention item{totalAlerts !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>

              <div className="notif-list">
                {overdueTasks.length === 0 && dueTodayTasks.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle size={28} style={{ color: '#10B981', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '13px', fontWeight: '600' }}>All caught up!</p>
                    <p style={{ fontSize: '12px' }}>No overdue or immediate tasks right now.</p>
                  </div>
                ) : (
                  <>
                    {overdueTasks.map((task) => (
                      <div
                        key={task.id}
                        className="notif-item unread"
                        onClick={() => {
                          onSelectTask(task);
                          setShowNotifications(false);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: '#FEE2E2',
                            color: '#B91C1C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <AlertTriangle size={15} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: '13px',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            Overdue: {task.title}
                          </p>
                          <p style={{ fontSize: '11px', color: '#B91C1C', fontWeight: '600' }}>
                            Due {formatIndianDate(task.deadline)} IST · Action required
                          </p>
                        </div>
                      </div>
                    ))}

                    {dueTodayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="notif-item"
                        onClick={() => {
                          onSelectTask(task);
                          setShowNotifications(false);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: '#FEF3C7',
                            color: '#B45309',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Clock size={15} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            Due Today: {task.title}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Priority: {task.priority}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            className="user-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            id="topbar-user-profile-btn"
          >
            <div
              className="user-avatar"
              style={{
                background:
                  currentUser?.role === 'admin'
                    ? '#0F172A'
                    : currentUser?.avatar_color || 'var(--primary)'
              }}
            >
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : 'RS'}
            </div>
            <div className="user-meta">
              <span className="user-name">{currentUser?.name || 'Rajesh Sharma'}</span>
              <span className="user-role">
                {currentUser?.role === 'admin'
                  ? 'Founder (Admin)'
                  : `${currentUser?.roleTitle || 'Team Member'} (${currentUser?.points || 0} pts)`}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '4px' }} />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '240px',
                background: '#FFFFFF',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-dropdown)',
                border: '1px solid var(--border-light)',
                padding: '8px',
                zIndex: 150,
                animation: 'dropdownSlide 0.15s ease'
              }}
            >
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {currentUser?.name || 'Rajesh Sharma'}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {currentUser?.email || 'rajesh@bharattech.in'}
                </p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: currentUser?.role === 'admin' ? '#15803D' : '#EA580C',
                    background: currentUser?.role === 'admin' ? '#DCFCE7' : '#FFF7ED',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginTop: '6px'
                  }}
                >
                  {currentUser?.role === 'admin' ? (
                    <>
                      <ShieldCheck size={12} /> MSME Enterprise Admin
                    </>
                  ) : (
                    <>
                      <Trophy size={12} /> {currentUser?.points || 0} Points · {currentUser?.roleTitle || 'Employee'}
                    </>
                  )}
                </span>
              </div>

              <div style={{ padding: '4px 0' }}>
                {currentUser?.role === 'admin' ? (
                  <>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setCurrentView('portal');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Trophy size={15} />
                      <span>Open Employee Portal</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenSupabaseModal();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Database size={15} style={{ color: '#10B981' }} />
                      <span>Supabase Backend Config</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setCurrentView('portal');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Trophy size={15} />
                      <span>My Tasks & Leaderboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setCurrentView('kanban');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <CheckSquare size={15} style={{ color: '#3B82F6' }} />
                      <span>Kanban Workflow</span>
                    </button>
                  </>
                )}

                <div style={{ margin: '4px 0', borderTop: '1px solid var(--border-light)' }} />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  id="topbar-logout-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#DC2626',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={15} />
                  <span>Log Out (Switch Account)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
