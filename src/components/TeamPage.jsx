import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Layers,
  Plus,
  Trash2,
  Check,
  Send,
  Zap,
  ShieldAlert
} from 'lucide-react';

export default function TeamPage({
  employees = [],
  teams = [],
  tasks = [],
  onAddEmployee,
  onAddTeam,
  onDeleteTeam,
  onAssignTaskToTeam,
  onSelectTask,
  currentUser
}) {
  // Main view tab: 'directory' | 'teams'
  const [activeTab, setActiveTab] = useState('teams');

  // Add Employee Modal
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDepartment, setEmpDepartment] = useState('Engineering');
  const [empAvatarColor, setEmpAvatarColor] = useState('#F56B2C');
  const [empError, setEmpError] = useState('');

  // Create Team Modal
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDept, setTeamDept] = useState('Engineering');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamColor, setTeamColor] = useState('#3B82F6');
  const [teamMemberIds, setTeamMemberIds] = useState([]);
  const [teamError, setTeamError] = useState('');

  const now = new Date();

  // Employee mapping
  const empMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp;
    return acc;
  }, {});

  const colorOptions = [
    '#F56B2C', // Orange
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#0F172A'  // Slate
  ];

  // Submit new employee
  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!empName.trim()) {
      setEmpError('Employee name is required');
      return;
    }
    if (!empRole.trim()) {
      setEmpError('Role / Title is required');
      return;
    }

    onAddEmployee({
      name: empName.trim(),
      role: empRole.trim(),
      email: empEmail.trim() || `${empName.toLowerCase().replace(/\s+/g, '.')}@bharattech.in`,
      department: empDepartment,
      avatar_color: empAvatarColor
    });

    setEmpName('');
    setEmpRole('');
    setEmpEmail('');
    setEmpError('');
    setIsAddEmployeeModalOpen(false);
  };

  // Toggle member selection in Create Team modal
  const handleToggleTeamMember = (empId) => {
    setTeamMemberIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  // Submit new team
  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setTeamError('Team name is required');
      return;
    }
    if (teamMemberIds.length === 0) {
      setTeamError('Please select at least 1 employee for this team');
      return;
    }

    if (onAddTeam) {
      onAddTeam({
        name: teamName.trim(),
        department: teamDept,
        description: teamDescription.trim() || `Cross-functional pod for ${teamDept}`,
        color: teamColor,
        member_ids: teamMemberIds
      });
    }

    setTeamName('');
    setTeamDept('Engineering');
    setTeamDescription('');
    setTeamColor('#3B82F6');
    setTeamMemberIds([]);
    setTeamError('');
    setIsCreateTeamModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Tab Navigation */}
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>{activeTab === 'teams' ? 'Teams & Cross-Functional Pods' : 'Employee Directory & Workloads'}</h1>
          <p>
            {activeTab === 'teams'
              ? 'Organize employees into teams and pods (Tech, GST Compliance, Sales) to assign shared deliverables.'
              : 'Manage individual staff, monitor active deliverable loads, and review productivity records.'}
          </p>
        </div>

        <div className="dashboard-actions" style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'teams' ? (
            <button
              className="btn-primary"
              onClick={() => setIsCreateTeamModalOpen(true)}
              id="create-new-team-btn"
            >
              <Users size={16} />
              <span>+ Create New Team</span>
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => setIsAddEmployeeModalOpen(true)}
              id="add-team-member-btn"
            >
              <UserPlus size={16} />
              <span>+ Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '4px'
        }}
      >
        <button
          className={`filter-pill-btn ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
          style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
        >
          👥 Teams & Pods ({teams.length})
        </button>

        <button
          className={`filter-pill-btn ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
          style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
        >
          👤 All Employees ({employees.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: TEAMS & CROSS-FUNCTIONAL PODS
          ========================================================================= */}
      {activeTab === 'teams' && (
        <div>
          {teams.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-card)',
                padding: '48px 24px',
                textAlign: 'center',
                border: '1px solid var(--border-light)'
              }}
            >
              <Users size={40} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>No Teams Created Yet</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 16px' }}>
                Create your first cross-functional squad to assign deliverables to multiple employees at once!
              </p>
              <button
                className="btn-primary"
                onClick={() => setIsCreateTeamModalOpen(true)}
              >
                <Plus size={16} />
                <span>Create First Team</span>
              </button>
            </div>
          ) : (
            <div className="team-grid">
              {teams.map((team) => {
                // Find all tasks assigned to this team or containing this team's members
                const teamTasks = tasks.filter((t) => {
                  if (t.team_id && t.team_id === team.id) return true;
                  if (t.team_name && t.team_name.toLowerCase() === team.name.toLowerCase()) return true;
                  // If task is multi-assigned and matches all member IDs
                  if (Array.isArray(t.assignee_ids) && t.assignee_ids.length > 1) {
                    return team.member_ids && team.member_ids.some((m) => t.assignee_ids.includes(m));
                  }
                  return false;
                });

                const totalTasks = teamTasks.length;
                const doneTasks = teamTasks.filter((t) => t.status === 'Done').length;
                const activeTasks = teamTasks.filter((t) => t.status !== 'Done');
                const overdueCount = activeTasks.filter((t) => new Date(t.deadline) < now).length;
                const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 100;

                const members = (team.member_ids || []).map((id) => empMap[id]).filter(Boolean);

                return (
                  <div
                    key={team.id}
                    className="employee-card"
                    style={{
                      borderTop: `4px solid ${team.color || '#3B82F6'}`,
                      position: 'relative'
                    }}
                  >
                    {/* Team Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {team.name}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              color: team.color || '#3B82F6',
                              background: '#F0F9FF',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {team.department || 'Operations'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            · {members.length} {members.length === 1 ? 'Member' : 'Members'}
                          </span>
                        </div>
                      </div>

                      {overdueCount > 0 && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            color: '#B91C1C',
                            background: '#FEE2E2',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <AlertTriangle size={12} /> {overdueCount} Overdue
                        </span>
                      )}
                    </div>

                    {/* Team Description */}
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                      {team.description || 'Cross-functional pod collaborating on company objectives.'}
                    </p>

                    {/* Member Avatars & List */}
                    <div style={{ marginTop: '14px', background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Squad Members ({members.length})
                      </span>

                      {/* Avatar Cluster */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {members.map((m) => (
                          <div
                            key={m.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#FFFFFF',
                              border: '1px solid var(--border-light)',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: m.avatar_color || '#F56B2C',
                                color: '#FFFFFF',
                                fontSize: '9px',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {m.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                            <span style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Task Stats Row */}
                    <div className="employee-stats-row" style={{ marginTop: '14px' }}>
                      <div className="emp-stat-box">
                        <h4>{totalTasks}</h4>
                        <p>Team Tasks</p>
                      </div>
                      <div className="emp-stat-box">
                        <h4 style={{ color: '#0284C7' }}>{activeTasks.length}</h4>
                        <p>Active</p>
                      </div>
                      <div className="emp-stat-box">
                        <h4 style={{ color: '#10B981' }}>{doneTasks}</h4>
                        <p>Delivered</p>
                      </div>
                    </div>

                    {/* Completion Rate Bar */}
                    <div className="completion-rate-container" style={{ marginTop: '12px' }}>
                      <div className="completion-rate-header">
                        <span style={{ color: 'var(--text-muted)' }}>Throughput</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{completionRate}%</span>
                      </div>
                      <div className="workload-progress-bar-bg" style={{ height: '7px' }}>
                        <div
                          className="workload-progress-bar-fill"
                          style={{
                            width: `${completionRate}%`,
                            background: team.color || 'var(--primary)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '16px',
                        borderTop: '1px solid var(--border-light)',
                        paddingTop: '12px'
                      }}
                    >
                      <button
                        className="btn-secondary"
                        onClick={() => onAssignTaskToTeam && onAssignTaskToTeam(team)}
                        style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--primary)', borderColor: 'var(--primary-subtle)' }}
                        title="Open task modal with this team pre-selected"
                      >
                        <Zap size={14} />
                        <span>Assign Task to Squad</span>
                      </button>

                      {currentUser?.role === 'admin' && (
                        <button
                          className="action-icon-btn delete"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the team "${team.name}"?`)) {
                              onDeleteTeam && onDeleteTeam(team.id);
                            }
                          }}
                          title="Delete Team"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: INDIVIDUAL EMPLOYEE DIRECTORY
          ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="team-grid">
          {employees.map((member) => {
            const memberTasks = tasks.filter((t) => {
              if (t.assignee_id === member.id) return true;
              if (Array.isArray(t.assignee_ids) && t.assignee_ids.includes(member.id)) return true;
              return false;
            });

            const totalCount = memberTasks.length;
            const doneCount = memberTasks.filter((t) => t.status === 'Done').length;
            const pendingCount = memberTasks.filter((t) => t.status === 'Pending').length;
            const inProgressCount = memberTasks.filter((t) => t.status === 'In Progress').length;
            const overdueCount = memberTasks.filter(
              (t) => t.status !== 'Done' && new Date(t.deadline) < now
            ).length;

            const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 100;

            // Teams this employee belongs to
            const memberTeams = teams.filter((t) => t.member_ids && t.member_ids.includes(member.id));

            return (
              <div key={member.id} className="employee-card">
                {/* Card Top */}
                <div className="employee-card-top">
                  <div className="employee-main-info">
                    <div
                      className="employee-card-avatar"
                      style={{ backgroundColor: member.avatar_color || '#F56B2C' }}
                    >
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="employee-card-name">{member.name}</h3>
                      <p className="employee-card-role">{member.role}</p>
                      <p className="employee-card-dept">{member.department || 'Operations'}</p>
                    </div>
                  </div>

                  {overdueCount > 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#B91C1C',
                        background: '#FEE2E2',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {overdueCount} Overdue
                    </span>
                  )}
                </div>

                {/* Email */}
                {member.email && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '10px'
                    }}
                  >
                    <Mail size={13} />
                    <span>{member.email}</span>
                  </div>
                )}

                {/* Squad Memberships */}
                {memberTeams.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Squads:</span>
                    {memberTeams.map((t) => (
                      <span
                        key={t.id}
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: t.color || '#3B82F6',
                          background: '#F1F5F9',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        👥 {t.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Task Stat Counters */}
                <div className="employee-stats-row">
                  <div className="emp-stat-box">
                    <h4>{totalCount}</h4>
                    <p>Assigned</p>
                  </div>
                  <div className="emp-stat-box">
                    <h4 style={{ color: '#0284C7' }}>{inProgressCount + pendingCount}</h4>
                    <p>Active</p>
                  </div>
                  <div className="emp-stat-box">
                    <h4 style={{ color: '#10B981' }}>{doneCount}</h4>
                    <p>Done</p>
                  </div>
                </div>

                {/* Completion Rate Bar */}
                <div className="completion-rate-container">
                  <div className="completion-rate-header">
                    <span style={{ color: 'var(--text-muted)' }}>Completion Rate</span>
                    <span style={{ color: 'var(--text-primary)' }}>{completionRate}%</span>
                  </div>
                  <div className="workload-progress-bar-bg" style={{ height: '8px' }}>
                    <div
                      className="workload-progress-bar-fill"
                      style={{
                        width: `${completionRate}%`,
                        background:
                          completionRate === 100
                            ? '#10B981'
                            : overdueCount > 0
                            ? 'linear-gradient(90deg, #F56B2C 0%, #EA580C 100%)'
                            : '#F56B2C'
                      }}
                    />
                  </div>
                </div>

                {/* Recent Tasks List */}
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                    {currentUser?.role === 'employee' && member.id !== currentUser.id
                      ? 'Task Privacy'
                      : `Active Deliverables (${memberTasks.filter((t) => t.status !== 'Done').length})`}
                  </span>
                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {currentUser?.role === 'employee' && member.id !== currentUser.id ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        🔒 Tasks private to assignee
                      </span>
                    ) : (
                      <>
                        {memberTasks.filter((t) => t.status !== 'Done').slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            onClick={() => onSelectTask(t)}
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '6px',
                              background: '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                              {t.title}
                            </span>
                            <span className={`priority-pill priority-${t.priority.toLowerCase()}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                              {t.priority}
                            </span>
                          </div>
                        ))}
                        {memberTasks.filter((t) => t.status !== 'Done').length === 0 && (
                          <span style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                            No active tasks currently.
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CREATE NEW TEAM / POD
          ========================================================================= */}
      {isCreateTeamModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateTeamModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800' }}>Create Squad / Team</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Combine multiple employees so tasks can be assigned to the whole team
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsCreateTeamModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit}>
              <div className="modal-body" style={{ gap: '14px' }}>
                {teamError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {teamError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Team / Squad Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Tech & UPI Engineering Squad"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={teamDept}
                      onChange={(e) => setTeamDept(e.target.value)}
                    >
                      <option value="Engineering">Engineering & UPI</option>
                      <option value="Finance & Compliance">Finance & Compliance</option>
                      <option value="Sales & Growth">Sales & Growth</option>
                      <option value="Design & Experience">Design & Creative</option>
                      <option value="Operations">Operations & Logistics</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Theme Color</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {colorOptions.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setTeamColor(c)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: c,
                            border: teamColor === c ? '3px solid #0F172A' : '1px solid rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transform: teamColor === c ? 'scale(1.15)' : 'scale(1)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mandate / Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="What responsibilities or deliverables belong to this team?"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Team Members Multi-Select Checklist */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Select Squad Members ({teamMemberIds.length} selected) *
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setTeamMemberIds(employees.map((e) => e.id))}
                        style={{
                          fontSize: '11px',
                          color: 'var(--primary)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '700'
                        }}
                      >
                        Select All
                      </button>
                      <span style={{ color: '#CBD5E1' }}>|</span>
                      <button
                        type="button"
                        onClick={() => setTeamMemberIds([])}
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      maxHeight: '180px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px',
                      padding: '8px',
                      background: '#F8FAFC'
                    }}
                  >
                    {employees.map((emp) => {
                      const isSelected = teamMemberIds.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleToggleTeamMember(emp.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isSelected ? '#EFF6FF' : '#FFFFFF',
                            marginBottom: '4px',
                            border: isSelected ? '1px solid #BFDBFE' : '1px solid var(--border-light)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: isSelected ? '2px solid #3B82F6' : '2px solid #CBD5E1',
                                background: isSelected ? '#3B82F6' : '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                fontSize: '11px'
                              }}
                            >
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>

                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                background: emp.avatar_color || '#F56B2C',
                                color: '#FFFFFF',
                                fontSize: '10px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {emp.name.split(' ').map((n) => n[0]).join('')}
                            </div>

                            <div>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {emp.name}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                                · {emp.role}
                              </span>
                            </div>
                          </div>

                          <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600' }}>
                            {emp.department}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCreateTeamModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" id="save-team-btn">
                  Create Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD EMPLOYEE
          ========================================================================= */}
      {isAddEmployeeModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddEmployeeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserPlus size={18} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '800' }}>Add Team Member</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddEmployeeModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body">
                {empError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {empError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Jennifer Alvarez"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Role / Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Senior Inventory Specialist"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Work Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="jennifer@bharattech.in"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={empDepartment}
                      onChange={(e) => setEmpDepartment(e.target.value)}
                    >
                      <option value="Operations">Operations</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Finance & Compliance">Finance & Compliance</option>
                      <option value="Design & Experience">Design & Creative</option>
                      <option value="Sales & Growth">Sales & Growth</option>
                    </select>
                  </div>
                </div>

                {/* Avatar Accent Color Picker */}
                <div className="form-group">
                  <label className="form-label">Avatar Badge Color</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {colorOptions.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setEmpAvatarColor(c)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: c,
                          border: empAvatarColor === c ? '3px solid #0F172A' : '1px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transform: empAvatarColor === c ? 'scale(1.1)' : 'scale(1)',
                          transition: 'transform 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" id="save-employee-btn">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
