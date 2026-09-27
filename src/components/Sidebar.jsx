import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BarChart3,
  Database,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  Trophy,
  Kanban,
  LogOut,
  User,
  Workflow
} from 'lucide-react';

export default function Sidebar({
  currentView,
  setCurrentView,
  isCollapsed,
  setIsCollapsed,
  counts,
  onOpenSupabaseModal,
  currentUser,
  onLogout
}) {
  const isEmployee = currentUser?.role === 'employee';

  const navItems = isEmployee
    ? [
        {
          id: 'portal',
          label: 'My Workspace & Ranks',
          icon: Trophy,
          badge: `${currentUser?.points || 0} pts`,
          isHighlight: true
        },
        {
          id: 'canvas',
          label: 'Workflow Canvas',
          icon: Workflow,
          badge: 'Flow'
        },
        {
          id: 'kanban',
          label: 'My Kanban Board',
          icon: Kanban,
          badge: null
        },
        {
          id: 'tasks',
          label: 'My Assigned Tasks',
          icon: CheckSquare,
          badge: counts.pending + counts.inProgress
        },
        {
          id: 'team',
          label: 'Team Leaderboard',
          icon: Users,
          badge: counts.employees
        }
      ]
    : [
        {
          id: 'dashboard',
          label: 'Owner Overview',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'canvas',
          label: 'Workflow Canvas',
          icon: Workflow,
          badge: 'Miro / Flow'
        },
        {
          id: 'tasks',
          label: 'Task Pipeline',
          icon: CheckSquare,
          badge: counts.pending + counts.inProgress
        },
        {
          id: 'kanban',
          label: 'Kanban Board',
          icon: Kanban,
          badge: null
        },
        {
          id: 'portal',
          label: 'Employee Portal',
          icon: Trophy,
          badge: 'Leaderboard',
          isHighlight: true
        },
        {
          id: 'team',
          label: 'Team Directory',
          icon: Users,
          badge: counts.employees
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          badge: null
        }
      ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header / Logo */}
      <div className="sidebar-header">
        <div className="brand-wrapper" title="TaskFlow India MSME Suite">
          <div className="brand-logo-icon">
            <Sparkles size={22} />
          </div>
          {!isCollapsed && (
            <div className="brand-meta">
              <span className="brand-title">
                Task<span>Flow</span> <span style={{ fontSize: '12px', background: '#FFF4EE', color: 'var(--primary)', padding: '1px 6px', borderRadius: '4px' }}>IN</span>
              </span>
              <span className="brand-subtitle">Bharat Business Suite</span>
            </div>
          )}
        </div>

        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {!isCollapsed && <div className="nav-section-title">Operations & Tasks</div>}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              title={isCollapsed ? item.label : undefined}
              style={item.isHighlight && !isActive ? { color: '#C2410C' } : undefined}
            >
              <Icon className="nav-icon" style={item.isHighlight ? { color: 'var(--primary)' } : undefined} />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className="nav-badge"
                      style={
                        item.isHighlight
                          ? { background: '#FFF7ED', color: '#EA580C', fontWeight: '800' }
                          : undefined
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}

        <div style={{ margin: '14px 0', borderTop: '1px solid var(--border-light)' }} />

        {!isCollapsed && <div className="nav-section-title">Cloud Backend</div>}

        <button
          className="nav-item-btn"
          onClick={onOpenSupabaseModal}
          title={isCollapsed ? 'Supabase Settings' : undefined}
        >
          <Database className="nav-icon" style={{ color: '#10B981' }} />
          {!isCollapsed && (
            <>
              <span>Supabase DB</span>
              <span className="nav-badge" style={{ color: '#10B981', background: '#ECFDF5' }}>
                Connected
              </span>
            </>
          )}
        </button>
      </nav>

      {/* Workspace Footer Profile */}
      <div className="sidebar-footer">
        {isEmployee ? (
          <div
            className="business-workspace-card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div
                className="workspace-avatar"
                style={{
                  background: currentUser?.avatar_color || '#F56B2C',
                  fontSize: '12px',
                  fontWeight: '800'
                }}
              >
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'U'}
              </div>
              {!isCollapsed && (
                <div className="workspace-info" style={{ minWidth: 0 }}>
                  <span
                    className="workspace-name"
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {currentUser?.name}
                  </span>
                  <span className="workspace-badge" style={{ fontSize: '10px' }}>
                    {currentUser?.points || 0} pts · Online
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && onLogout && (
              <button
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Log Out"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        ) : (
          <div
            className="business-workspace-card"
            title="Acme Infotech India Pvt Ltd"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="workspace-avatar" style={{ background: '#F56B2C' }}>
                🇮🇳
              </div>
              {!isCollapsed && (
                <div className="workspace-info">
                  <span className="workspace-name">Acme Infotech India</span>
                  <span className="workspace-badge" style={{ fontSize: '10px' }}>
                    GSTIN: 29AABCU9603R1ZX
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && onLogout && (
              <button
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Log Out"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
