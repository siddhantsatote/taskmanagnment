import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  Send,
  MessageCircle,
  Heart,
  ChevronRight,
  TrendingUp,
  Share2,
  Calendar,
  Sparkles,
  UserCheck
} from 'lucide-react';
import {
  formatIndianDate,
  generateWhatsAppTaskShareUrl,
  apiGiveKudos
} from '../lib/supabase';

export default function EmployeePortal({
  employees = [],
  teams = [],
  tasks = [],
  activeEmployeeId,
  setActiveEmployeeId,
  onToggleTaskStatus,
  onSelectTask,
  onRefreshData,
  showToast,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'leaderboard' | 'kudos'
  const [taskStatusFilter, setTaskStatusFilter] = useState('ACTIVE'); // 'ACTIVE' | 'ALL' | 'DONE'
  const [kudosRecipientId, setKudosRecipientId] = useState('');
  const [kudosMessage, setKudosMessage] = useState('');
  const [isSendingKudos, setIsSendingKudos] = useState(false);

  const now = new Date();

  // Current active employee (if employee is logged in, default to their profile)
  const effectiveEmpId =
    currentUser?.role === 'employee'
      ? currentUser.id
      : activeEmployeeId || employees[0]?.id;

  const currentEmployee =
    employees.find((e) => e.id === effectiveEmpId) ||
    (currentUser?.role === 'employee' ? currentUser : employees[0]) ||
    {};

  // Tasks assigned to current employee (individually or as squad member)
  const myTasks = tasks.filter((t) => {
    if (t.assignee_id === currentEmployee.id) return true;
    if (Array.isArray(t.assignee_ids) && t.assignee_ids.includes(currentEmployee.id)) return true;
    return false;
  });
  const myActiveTasks = myTasks.filter((t) => t.status !== 'Done');
  const myDoneTasks = myTasks.filter((t) => t.status === 'Done');
  const myOverdueTasks = myActiveTasks.filter((t) => new Date(t.deadline) < now);

  // Filtered task list
  const displayedMyTasks = myTasks.filter((t) => {
    if (taskStatusFilter === 'ACTIVE') return t.status !== 'Done';
    if (taskStatusFilter === 'DONE') return t.status === 'Done';
    return true;
  });

  // Ranked team members by points
  const sortedLeaderboard = [...employees].sort((a, b) => (b.points || 0) - (a.points || 0));
  const myRank = sortedLeaderboard.findIndex((e) => e.id === currentEmployee.id) + 1;

  // Handle Mark Done with celebratory feedback
  const handleCompleteMyTask = (taskId) => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F56B2C', '#10B981', '#3B82F6', '#FFD700']
    });
    onToggleTaskStatus(taskId, 'Done');
    showToast(`🎯 Shandaar! Task completed. +100 Points added to your rank!`);
  };

  // Handle Send Kudos
  const handleSendKudos = async (e) => {
    e.preventDefault();
    if (!kudosRecipientId || !kudosMessage.trim()) return;

    setIsSendingKudos(true);
    await apiGiveKudos(kudosRecipientId, currentEmployee.name, kudosMessage.trim());
    setIsSendingKudos(false);
    setKudosMessage('');
    onRefreshData();
    showToast(`🌟 Kudos sent! +25 bonus points awarded to your teammate.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Clean Employee Workspace Header & Persona Switcher (Salesify White Card Style) */}
      <div
        className="content-card"
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: currentEmployee.avatar_color || '#F56B2C',
              color: '#FFFFFF',
              fontSize: '22px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(245, 107, 44, 0.25)',
              flexShrink: 0
            }}
          >
            {currentEmployee.name ? currentEmployee.name.split(' ').map((n) => n[0]).join('') : 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {currentEmployee.name}
              </h1>
              <span
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: '1px solid var(--primary-subtle)'
                }}
              >
                Rank #{myRank} on Leaderboard
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {currentEmployee.role} · {currentEmployee.department}
            </p>
          </div>
        </div>

        {/* Persona Switcher / Session Badge */}
        {currentUser?.role === 'employee' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#15803D',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)'
              }}
            >
              <UserCheck size={16} />
              <span>Employee Portal · {currentEmployee.name}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Founder Mode (Inspect Member):
            </span>
            <select
              className="filter-select"
              value={effectiveEmpId}
              onChange={(e) => setActiveEmployeeId(e.target.value)}
              style={{
                height: '38px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role}) - {emp.points || 0} pts
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4 Gamified Metric Cards */}
      <div className="stat-cards-grid">
        {/* Points & Score Card */}
        <div className="stat-card hero-orange" style={{ background: 'var(--primary-gradient)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">My Productivity Points</span>
            <div className="stat-card-icon-badge">
              <Star size={22} />
            </div>
          </div>
          <div className="stat-card-value">{currentEmployee.points || 0}</div>
          <div className="stat-card-footer">
            <span className="trend-badge">
              +100 pts per completed task
            </span>
          </div>
        </div>

        {/* Team Leaderboard Standing */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Leaderboard Standing</span>
            <div className="stat-card-icon-badge badge-amber">
              <Trophy size={22} />
            </div>
          </div>
          <div className="stat-card-value">
            #{myRank} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>of {employees.length}</span>
          </div>
          <div className="stat-card-footer">
            <span className="trend-badge trend-up">
              {myRank === 1 ? '🥇 Top Performer' : myRank === 2 ? '🥈 Silver Rank' : 'Active Contender'}
            </span>
          </div>
        </div>

        {/* Daily On-Time Streak */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">On-Time Streak</span>
            <div className="stat-card-icon-badge badge-purple">
              <Flame size={22} style={{ color: '#F97316' }} />
            </div>
          </div>
          <div className="stat-card-value">
            {currentEmployee.streak_days || 1} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Days</span>
          </div>
          <div className="stat-card-footer">
            <span className="trend-badge trend-up">
              🔥 Delivering on-time
            </span>
          </div>
        </div>

        {/* My Tasks Pending */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">My Pending Deliverables</span>
            <div className="stat-card-icon-badge badge-blue">
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-card-value">{myActiveTasks.length}</div>
          <div className="stat-card-footer">
            {myOverdueTasks.length > 0 ? (
              <span className="trend-badge trend-alert">
                <AlertTriangle size={12} /> {myOverdueTasks.length} overdue
              </span>
            ) : (
              <span className="trend-badge trend-up">
                <CheckCircle size={12} /> 0 overdue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '2px',
          flexWrap: 'wrap'
        }}
      >
        <button
          className={`filter-pill-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
          style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
        >
          My Assigned Tasks ({myActiveTasks.length})
        </button>

        <button
          className={`filter-pill-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
          style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
        >
          🏆 Team Champions Leaderboard
        </button>

        <button
          className={`filter-pill-btn ${activeTab === 'kudos' ? 'active' : ''}`}
          onClick={() => setActiveTab('kudos')}
          style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
        >
          🎖️ Badges & Kudos ({(currentEmployee.kudos || []).length})
        </button>
      </div>

      {/* TAB 1: MY ASSIGNED TASKS */}
      {activeTab === 'tasks' && (
        <div className="table-card">
          <div className="table-filter-bar">
            <div className="status-filter-pills">
              <button
                className={`filter-pill-btn ${taskStatusFilter === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setTaskStatusFilter('ACTIVE')}
              >
                Pending & In Progress ({myActiveTasks.length})
              </button>
              <button
                className={`filter-pill-btn ${taskStatusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setTaskStatusFilter('ALL')}
              >
                All My Tasks ({myTasks.length})
              </button>
              <button
                className={`filter-pill-btn ${taskStatusFilter === 'DONE' ? 'active' : ''}`}
                onClick={() => setTaskStatusFilter('DONE')}
              >
                Completed ({myDoneTasks.length})
              </button>
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Completed deliverables award <strong>+100 Points</strong> to your profile!
            </span>
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayedMyTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                <CheckCircle size={36} style={{ color: '#10B981', margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  All Caught Up!
                </h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  No pending deliverables in this filter view. Great job!
                </p>
              </div>
            ) : (
              displayedMyTasks.map((task) => {
                const isOverdue = task.status !== 'Done' && new Date(task.deadline) < now;
                const isDone = task.status === 'Done';
                const whatsappUrl = generateWhatsAppTaskShareUrl(task, currentEmployee.name);

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: isOverdue ? '1px solid #FECACA' : '1px solid var(--border-light)',
                      borderLeft: isOverdue ? '4px solid #F56B2C' : isDone ? '4px solid #10B981' : '4px solid #3B82F6',
                      background: isDone ? '#FAFAFA' : isOverdue ? '#FFFBF9' : '#FFFFFF',
                      gap: '16px',
                      flexWrap: 'wrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Left: Quick Action Button & Details */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '260px' }}>
                      <button
                        className={`check-circle-btn ${isDone ? 'done' : ''}`}
                        onClick={() => {
                          if (isDone) {
                            onToggleTaskStatus(task.id, 'Pending');
                          } else {
                            handleCompleteMyTask(task.id);
                          }
                        }}
                        style={{ marginTop: '2px', width: '24px', height: '24px' }}
                        title={isDone ? 'Mark as Pending' : 'Mark as Complete (+100 pts)'}
                      >
                        ✓
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            onClick={() => onSelectTask(task)}
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {task.title}
                          </span>

                          {task.team_name && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '800',
                                color: '#0369A1',
                                background: '#E0F2FE',
                                padding: '1px 7px',
                                borderRadius: '4px'
                              }}
                            >
                              👥 Squad: {task.team_name}
                            </span>
                          )}

                          {task.tag && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: '#475569',
                                background: '#F1F5F9',
                                padding: '1px 5px',
                                borderRadius: '4px'
                              }}
                            >
                              {task.tag}
                            </span>
                          )}

                          <span className={`priority-pill priority-${task.priority.toLowerCase()}`} style={{ fontSize: '10px' }}>
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              marginTop: '3px',
                              lineHeight: '1.4'
                            }}
                          >
                            {task.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '12px', flexWrap: 'wrap' }}>
                          <span style={{ color: isOverdue ? '#B91C1C' : 'var(--text-muted)', fontWeight: isOverdue ? '700' : '500' }}>
                            📅 Due: {formatIndianDate(task.deadline, true)} IST
                          </span>

                          {Array.isArray(task.assignee_ids) && task.assignee_ids.length > 1 && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600' }}>
                              🤝 Squad Teammates: {task.assignee_ids
                                .filter((id) => id !== currentEmployee.id)
                                .map((id) => employees.find((e) => e.id === id)?.name.split(' ')[0])
                                .filter(Boolean)
                                .join(', ') || 'Shared'}
                            </span>
                          )}

                          {isOverdue && (
                            <span style={{ color: '#B91C1C', fontWeight: '800' }}>
                              ⚠️ Past Deadline!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {/* WhatsApp Share Button */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{
                          height: '32px',
                          padding: '0 10px',
                          fontSize: '11px',
                          color: '#15803D',
                          borderColor: '#BBF7D0',
                          background: '#F0FDF4'
                        }}
                        title="Share task reminder on WhatsApp"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </a>

                      {/* Status Toggle Buttons */}
                      {!isDone ? (
                        <>
                          {task.status !== 'In Progress' && (
                            <button
                              className="btn-secondary"
                              onClick={() => onToggleTaskStatus(task.id, 'In Progress')}
                              style={{ height: '32px', padding: '0 10px', fontSize: '11px' }}
                            >
                              Start
                            </button>
                          )}
                          <button
                            className="btn-primary"
                            onClick={() => handleCompleteMyTask(task.id)}
                            style={{ height: '32px', padding: '0 12px', fontSize: '11px' }}
                          >
                            ✓ Done (+100)
                          </button>
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#15803D',
                            background: '#DCFCE7',
                            padding: '4px 10px',
                            borderRadius: '6px'
                          }}
                        >
                          Completed ✨
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TEAM LEADERBOARD & PODIUM */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top 3 Podium Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {sortedLeaderboard.slice(0, 3).map((member, index) => {
              const medals = ['🥇 Gold Champion', '🥈 Silver Runner-Up', '🥉 Bronze Contender'];
              const borders = ['#F56B2C', '#94A3B8', '#B45309'];
              const bgs = ['#FFF7ED', '#F8FAFC', '#FEFCE8'];

              return (
                <div
                  key={member.id}
                  style={{
                    background: bgs[index],
                    border: `2px solid ${borders[index]}`,
                    borderRadius: 'var(--radius-card)',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-card)',
                    position: 'relative'
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '800',
                      color: borders[index],
                      marginBottom: '12px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {medals[index]}
                  </span>

                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '18px',
                      background: member.avatar_color || '#F56B2C',
                      color: '#FFFFFF',
                      fontSize: '22px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      marginBottom: '12px'
                    }}
                  >
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {member.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {member.role}
                  </p>

                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: '900',
                      color: 'var(--primary)',
                      margin: '4px 0'
                    }}
                  >
                    {member.points || 0} <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>pts</span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#15803D',
                      background: '#DCFCE7',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    🔥 {member.streak_days || 1}-day streak
                  </span>
                </div>
              );
            })}
          </div>

          {/* Full Leaderboard Table */}
          <div className="table-card">
            <div className="card-header-bar" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Overall Team Standings</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Points earned by completing tasks on-time and receiving peer kudos
                </p>
              </div>
            </div>

            <div className="data-table-container">
              <table className="data-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Rank</th>
                    <th style={{ width: '38%' }}>Team Member</th>
                    <th style={{ width: '18%' }}>Department</th>
                    <th style={{ width: '14%' }}>Streak</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>Points</th>
                    <th style={{ width: '8%', textAlign: 'right' }}>Cheer</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((member, idx) => {
                    const isMe = member.id === currentEmployee.id;

                    return (
                      <tr key={member.id} style={{ backgroundColor: isMe ? '#FFF9F5' : undefined }}>
                        <td>
                          <span style={{ fontSize: '14px', fontWeight: '800' }}>
                            {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              className="assignee-mini-avatar"
                              style={{ backgroundColor: member.avatar_color || '#F56B2C' }}
                            >
                              {member.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <span style={{ fontWeight: '700', fontSize: '13px' }}>
                                {member.name} {isMe && <span style={{ color: 'var(--primary)', fontSize: '11px' }}>(You)</span>}
                              </span>
                              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                                {member.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {member.department}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              color: '#EA580C',
                              background: '#FFF7ED',
                              padding: '2px 6px',
                              borderRadius: '6px'
                            }}
                          >
                            🔥 {member.streak_days || 1} Days
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {member.points || 0}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!isMe && (
                            <button
                              onClick={() => {
                                setKudosRecipientId(member.id);
                                setActiveTab('kudos');
                              }}
                              className="btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '11px' }}
                              title="Send peer recognition kudos"
                            >
                              <Heart size={12} style={{ color: '#E11D48' }} />
                              <span>Kudos</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BADGES & KUDOS */}
      {activeTab === 'kudos' && (
        <div className="two-col-grid">
          {/* Left: My Earned Badges & Kudos Received */}
          <div className="content-card">
            <div className="card-header-bar">
              <div className="card-header-titles">
                <h2>My Badges & Accolades</h2>
                <p>Milestones and achievements earned by {currentEmployee.name}</p>
              </div>
            </div>

            {/* Badges List */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {(currentEmployee.badges || ['Task Starter ⭐']).map((badge, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    color: '#C2410C',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                >
                  <Award size={15} />
                  <span>{badge}</span>
                </div>
              ))}
            </div>

            {/* Received Kudos List */}
            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>
              Kudos Received ({(currentEmployee.kudos || []).length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
              {(currentEmployee.kudos || []).length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  No kudos received yet. Complete high-priority deliverables to earn appreciation!
                </p>
              ) : (
                currentEmployee.kudos.map((k, idx) => (
                  <div key={idx} className="note-bubble">
                    <div className="note-bubble-meta">
                      <span className="note-author" style={{ color: 'var(--primary)' }}>
                        ❤️ From {k.from}
                      </span>
                      <span className="note-time">{k.date}</span>
                    </div>
                    <p className="note-content">"{k.text}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Send Kudos to a Colleague */}
          <div className="content-card">
            <div className="card-header-bar">
              <div className="card-header-titles">
                <h2>Give Kudos to a Teammate</h2>
                <p>Recognize great work and boost team morale (+25 bonus points)</p>
              </div>
            </div>

            <form onSubmit={handleSendKudos} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Select Colleague *</label>
                <select
                  className="form-select"
                  value={kudosRecipientId}
                  onChange={(e) => setKudosRecipientId(e.target.value)}
                  required
                >
                  <option value="">Choose a team member...</option>
                  {employees
                    .filter((e) => e.id !== currentEmployee.id)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Appreciation Message *</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g., Thank you for helping with the GST filing reconciliation and fast turnarounds!"
                  value={kudosMessage}
                  onChange={(e) => setKudosMessage(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSendingKudos || !kudosRecipientId || !kudosMessage.trim()}
                style={{ alignSelf: 'flex-start', marginTop: '4px' }}
              >
                <Sparkles size={15} />
                <span>{isSendingKudos ? 'Sending...' : 'Send Kudos (+25 pts)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
