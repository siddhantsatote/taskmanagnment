import React from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Target
} from 'lucide-react';
import ChartsSection from './ChartsSection';

export default function AnalyticsView({ tasks = [], employees = [] }) {
  const now = new Date();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Done').length;
  const overdue = tasks.filter((t) => t.status !== 'Done' && new Date(t.deadline) < now).length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;

  const onTimeCompletionRate = total > 0 ? Math.round(((completed) / (total)) * 100) : 0;
  const overdueRatio = total > 0 ? Math.round((overdue / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>Productivity & Performance Analytics</h1>
          <p>Real-time metrics on team throughput, SLA adherence, and priority distribution</p>
        </div>
      </div>

      {/* KPI Overview Row */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Overall Completion</span>
            <div className="stat-card-icon-badge badge-green">
              <CheckCircle size={22} />
            </div>
          </div>
          <div className="stat-card-value">{onTimeCompletionRate}%</div>
          <div className="stat-card-footer">
            <span className="trend-badge trend-up">
              <TrendingUp size={12} /> High efficiency
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Active Throughput</span>
            <div className="stat-card-icon-badge badge-blue">
              <Target size={22} />
            </div>
          </div>
          <div className="stat-card-value">{inProgress} tasks</div>
          <div className="stat-card-footer">
            <span className="trend-badge trend-neutral">Currently in execution</span>
          </div>
        </div>

        <div className="stat-card hero-orange">
          <div className="stat-card-header">
            <span className="stat-card-label">Overdue At-Risk</span>
            <div className="stat-card-icon-badge">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="stat-card-value">{overdueRatio}%</div>
          <div className="stat-card-footer">
            <span className="trend-badge">{overdue} tasks past deadline</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Active Staff</span>
            <div className="stat-card-icon-badge badge-purple">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-card-value">{employees.length} members</div>
          <div className="stat-card-footer">
            <span className="trend-badge trend-up">Full capacity</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <ChartsSection tasks={tasks} />
    </div>
  );
}
