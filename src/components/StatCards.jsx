import React from 'react';
import {
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';

export default function StatCards({ tasks = [] }) {
  const now = new Date();

  // Calculate statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  
  // Overdue: status is NOT Done AND deadline < now
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'Done' && new Date(t.deadline) < now
  ).length;

  // Completed this week: status is Done and updated/created recently
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
  const completedThisWeek = tasks.filter((t) => {
    if (t.status !== 'Done') return false;
    const taskDate = new Date(t.updated_at || t.created_at);
    return taskDate >= oneWeekAgo;
  }).length;

  return (
    <div className="stat-cards-grid">
      {/* 1. Total Tasks (White Card) */}
      <div className="stat-card" id="stat-total-tasks">
        <div className="stat-card-header">
          <span className="stat-card-label">Total Tasks</span>
          <div className="stat-card-icon-badge badge-blue">
            <Layers size={22} />
          </div>
        </div>
        <div className="stat-card-value">{totalTasks}</div>
        <div className="stat-card-footer">
          <span className="trend-badge trend-up">
            <TrendingUp size={12} /> +12%
          </span>
          <span className="trend-text">vs last month</span>
        </div>
      </div>

      {/* 2. Pending Tasks (White Card) */}
      <div className="stat-card" id="stat-pending-tasks">
        <div className="stat-card-header">
          <span className="stat-card-label">Pending</span>
          <div className="stat-card-icon-badge badge-amber">
            <Clock size={22} />
          </div>
        </div>
        <div className="stat-card-value">{pendingTasks}</div>
        <div className="stat-card-footer">
          <span className="trend-badge trend-neutral">
            {inProgressTasks} active in progress
          </span>
        </div>
      </div>

      {/* 3. Overdue (BOLD SOLID ORANGE HERO CARD) */}
      <div className="stat-card hero-orange" id="stat-overdue-hero">
        <div className="stat-card-header">
          <span className="stat-card-label">Overdue Tasks</span>
          <div className="stat-card-icon-badge">
            <AlertTriangle size={22} />
          </div>
        </div>
        <div className="stat-card-value">{overdueTasks}</div>
        <div className="stat-card-footer">
          <span className="trend-badge">
            <ArrowUpRight size={12} /> +1 vs last week
          </span>
          <span className="trend-text">Needs attention</span>
        </div>
      </div>

      {/* 4. Completed This Week (White Card) */}
      <div className="stat-card" id="stat-completed-tasks">
        <div className="stat-card-header">
          <span className="stat-card-label">Completed This Week</span>
          <div className="stat-card-icon-badge badge-green">
            <CheckCircle2 size={22} />
          </div>
        </div>
        <div className="stat-card-value">{completedThisWeek}</div>
        <div className="stat-card-footer">
          <span className="trend-badge trend-up">
            <TrendingUp size={12} /> +18%
          </span>
          <span className="trend-text">vs last week</span>
        </div>
      </div>
    </div>
  );
}
