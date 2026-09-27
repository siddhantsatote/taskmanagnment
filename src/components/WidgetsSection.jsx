import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { formatIndianDate } from '../lib/supabase';

export default function WidgetsSection({
  tasks = [],
  employees = [],
  onSelectTask,
  onToggleTaskStatus,
  onNavigateToTeam
}) {
  const [activeDueTab, setActiveDueTab] = useState('today'); // 'today' | 'week'

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);

  // Filter Due Today tasks (deadline is today or overdue)
  const dueTodayTasks = tasks.filter((t) => {
    if (t.status === 'Done') return false;
    const d = new Date(t.deadline);
    return d < endOfToday;
  });

  // Filter Due This Week tasks (deadline within the next 7 days)
  const dueThisWeekTasks = tasks.filter((t) => {
    if (t.status === 'Done') return false;
    const d = new Date(t.deadline);
    return d >= endOfToday && d <= endOfWeek;
  });

  const displayedTasks = activeDueTab === 'today' ? dueTodayTasks : dueThisWeekTasks;

  // Map employees for quick lookups
  const empMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp;
    return acc;
  }, {});

  // Calculate team workload ranking (like Salesify Top Products card)
  const teamWorkload = employees.map((emp) => {
    const empTasks = tasks.filter((t) => t.assignee_id === emp.id);
    const total = empTasks.length;
    const done = empTasks.filter((t) => t.status === 'Done').length;
    const overdue = empTasks.filter((t) => t.status !== 'Done' && new Date(t.deadline) < now).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 100;

    return {
      ...emp,
      total,
      done,
      overdue,
      completionRate
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="two-col-grid">
      {/* Widget 1: Due Today & Due This Week Widget Card */}
      <div className="content-card" id="card-due-tasks-widget">
        <div className="card-header-bar">
          <div className="card-header-titles">
            <h2>Deadline Focus</h2>
            <p>Immediate action items for the team</p>
          </div>
          {/* Segmented Tab */}
          <div className="due-widget-tabs">
            <button
              className={`due-tab-btn ${activeDueTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveDueTab('today')}
            >
              Due Today ({dueTodayTasks.length})
            </button>
            <button
              className={`due-tab-btn ${activeDueTab === 'week' ? 'active' : ''}`}
              onClick={() => setActiveDueTab('week')}
            >
              This Week ({dueThisWeekTasks.length})
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="task-widget-list">
          {displayedTasks.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 16px',
                color: 'var(--text-muted)'
              }}
            >
              <CheckCircle2 size={32} style={{ color: '#10B981', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                No pending tasks {activeDueTab === 'today' ? 'for today' : 'this week'}!
              </p>
              <p style={{ fontSize: '12px' }}>Great job, all deadlines in this window are cleared.</p>
            </div>
          ) : (
            displayedTasks.map((task) => {
              const isOverdue = task.status !== 'Done' && new Date(task.deadline) < now;
              const assignee = empMap[task.assignee_id];

              return (
                <div
                  key={task.id}
                  className={`task-widget-item ${isOverdue ? 'overdue' : ''}`}
                >
                  <div className="widget-item-left">
                    <button
                      className="check-circle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskStatus(task.id, task.status === 'Done' ? 'Pending' : 'Done');
                      }}
                      title="Mark as done"
                    >
                      ✓
                    </button>

                    <div
                      className="widget-item-text"
                      onClick={() => onSelectTask(task)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="widget-task-title" title={task.title}>
                        {task.title}
                      </span>
                      <span className="widget-task-sub">
                        {isOverdue ? (
                          <span style={{ color: '#B91C1C', fontWeight: '700' }}>
                            Overdue · Due {formatIndianDate(task.deadline)}
                          </span>
                        ) : (
                          <span>
                            Due {formatIndianDate(task.deadline, true)} IST
                          </span>
                        )}
                        <span>·</span>
                        <span
                          className={`priority-pill priority-${task.priority.toLowerCase()}`}
                          style={{ padding: '1px 6px', fontSize: '10px' }}
                        >
                          {task.priority}
                        </span>
                      </span>
                    </div>
                  </div>

                  {assignee && (
                    <div
                      className="assignee-mini-avatar"
                      style={{ backgroundColor: assignee.avatar_color || '#F56B2C' }}
                      title={`${assignee.name} (${assignee.role})`}
                    >
                      {assignee.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Widget 2: Team Workload (Like Salesify Top Products Card) */}
      <div className="content-card" id="card-team-workload">
        <div className="card-header-bar">
          <div className="card-header-titles">
            <h2>Team Workload & Output</h2>
            <p>Assigned volume and completion rate</p>
          </div>
          <button
            onClick={onNavigateToTeam}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              background: 'none',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="team-workload-list">
          {teamWorkload.slice(0, 4).map((member) => (
            <div key={member.id} className="team-workload-row">
              <div
                className="team-member-avatar"
                style={{ backgroundColor: member.avatar_color || '#F56B2C' }}
              >
                {member.name.split(' ').map((n) => n[0]).join('')}
              </div>

              <div className="team-workload-info">
                <div className="team-member-name-row">
                  <div>
                    <span className="team-member-name">{member.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)', marginLeft: '6px' }}>
                      ({member.role})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {member.overdue > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          color: '#B91C1C',
                          background: '#FEE2E2',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {member.overdue} overdue
                      </span>
                    )}
                    <span className="workload-count-badge">
                      {member.done}/{member.total} ({member.completionRate}%)
                    </span>
                  </div>
                </div>

                {/* Custom Gradient Progress Bar */}
                <div className="workload-progress-bar-bg">
                  <div
                    className="workload-progress-bar-fill"
                    style={{
                      width: `${member.completionRate}%`,
                      background:
                        member.completionRate === 100
                          ? '#10B981'
                          : member.overdue > 0
                          ? 'linear-gradient(90deg, #F56B2C 0%, #EA580C 100%)'
                          : '#F56B2C'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
