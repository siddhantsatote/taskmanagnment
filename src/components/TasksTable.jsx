import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
  Calendar,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  MessageCircle,
  Kanban,
  Table as TableIcon
} from 'lucide-react';
import { exportTasksToCSV, formatIndianDate, generateWhatsAppTaskShareUrl } from '../lib/supabase';
import KanbanBoard from './KanbanBoard';

export default function TasksTable({
  tasks = [],
  employees = [],
  teams = [],
  searchQuery,
  setSearchQuery,
  onSelectTask,
  onToggleTaskStatus,
  onDeleteTask,
  onOpenNewTaskModal
}) {
  // View mode: Table vs Kanban
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // Filters state
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'In Progress' | 'Done' | 'OVERDUE'
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'RECENT_7_DAYS' | 'TODAY' | 'THIS_WEEK' | 'OVERDUE'

  // Sorting state (Default to 'created_at' and 'desc' for most recent first)
  const [sortField, setSortField] = useState('created_at'); // 'created_at' | 'deadline' | 'priority' | 'title' | 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  // Employee mapping
  const empMap = useMemo(() => {
    return (employees || []).reduce((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {});
  }, [employees]);

  // Priority weight for sorting
  const priorityWeights = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  const statusWeights = {
    'Pending': 1,
    'In Progress': 2,
    'Done': 3
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const isOverdue = task.status !== 'Done' && new Date(task.deadline) < now;

        // Status Filter
        if (statusFilter === 'OVERDUE') {
          if (!isOverdue) return false;
        } else if (statusFilter !== 'ALL') {
          if (task.status !== statusFilter) return false;
        }

        // Priority Filter
        if (priorityFilter !== 'ALL') {
          if (task.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
        }

        // Assignee Filter (supports individual empId or "TEAM:teamId")
        if (assigneeFilter !== 'ALL') {
          if (assigneeFilter.startsWith('TEAM:')) {
            const tId = assigneeFilter.replace('TEAM:', '');
            const targetTeam = teams.find((t) => t.id === tId);
            const matchesTeamId = task.team_id === tId;
            const matchesTeamName = targetTeam && task.team_name && task.team_name.toLowerCase() === targetTeam.name.toLowerCase();
            const matchesTeamMembers = targetTeam && Array.isArray(task.assignee_ids) && targetTeam.member_ids?.some((m) => task.assignee_ids.includes(m));
            if (!matchesTeamId && !matchesTeamName && !matchesTeamMembers) return false;
          } else {
            const matchesSingle = task.assignee_id === assigneeFilter;
            const matchesMulti = Array.isArray(task.assignee_ids) && task.assignee_ids.includes(assigneeFilter);
            if (!matchesSingle && !matchesMulti) return false;
          }
        }

        // Date Filter
        if (dateFilter === 'RECENT_7_DAYS') {
          const createdDate = new Date(task.created_at || task.deadline);
          if (createdDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'TODAY') {
          const d = new Date(task.deadline);
          if (d < startOfToday || d >= endOfToday) return false;
        } else if (dateFilter === 'THIS_WEEK') {
          const d = new Date(task.deadline);
          if (d < startOfToday || d > endOfWeek) return false;
        } else if (dateFilter === 'OVERDUE') {
          if (!isOverdue) return false;
        }

        // Search Query (Title, Description, Assignee Name, Team Name, Tag)
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(q);
          const descMatch = (task.description || '').toLowerCase().includes(q);
          const tagMatch = (task.tag || '').toLowerCase().includes(q);
          const teamMatch = (task.team_name || '').toLowerCase().includes(q);
          const emp = empMap[task.assignee_id];
          const empMatch = emp && emp.name.toLowerCase().includes(q);
          // Also check all assigned members in multi-assigned task
          const multiEmpMatch = Array.isArray(task.assignee_ids) && task.assignee_ids.some((id) => {
            const m = empMap[id];
            return m && m.name.toLowerCase().includes(q);
          });
          if (!titleMatch && !descMatch && !empMatch && !tagMatch && !teamMatch && !multiEmpMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA;
        let valB;

        if (sortField === 'created_at') {
          valA = new Date(a.created_at || 0).getTime();
          valB = new Date(b.created_at || 0).getTime();
        } else if (sortField === 'deadline') {
          valA = new Date(a.deadline).getTime();
          valB = new Date(b.deadline).getTime();
        } else if (sortField === 'priority') {
          valA = priorityWeights[a.priority] || 0;
          valB = priorityWeights[b.priority] || 0;
        } else if (sortField === 'status') {
          valA = statusWeights[a.status] || 0;
          valB = statusWeights[b.status] || 0;
        } else if (sortField === 'assignee') {
          const empA = empMap[a.assignee_id]?.name || '';
          const empB = empMap[b.assignee_id]?.name || '';
          return sortOrder === 'asc'
            ? empA.localeCompare(empB)
            : empB.localeCompare(empA);
        } else if (sortField === 'title') {
          valA = (a.title || '').toLowerCase();
          valB = (b.title || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    tasks,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    dateFilter,
    searchQuery,
    sortField,
    sortOrder,
    empMap,
    now,
    startOfToday,
    endOfToday,
    endOfWeek,
    sevenDaysAgo
  ]);

  // Handle Header Click Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      if (field === 'created_at' || field === 'priority') {
        setSortOrder('desc');
      } else {
        setSortOrder('asc');
      }
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setAssigneeFilter('ALL');
    setDateFilter('ALL');
    setSortField('created_at');
    setSortOrder('desc');
    if (setSearchQuery) setSearchQuery('');
  };

  const isFiltered =
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    assigneeFilter !== 'ALL' ||
    dateFilter !== 'ALL' ||
    (searchQuery && searchQuery.trim().length > 0);

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} style={{ color: 'var(--primary)' }} />
    ) : (
      <ArrowDown size={12} style={{ color: 'var(--primary)' }} />
    );
  };

  return (
    <div className="table-card" id="tasks-table-container">
      {/* 1. Primary Filter Bar (View Mode + Status Pills + Action Buttons) */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                border: 'none',
                background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                padding: '5px 10px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                border: 'none',
                background: viewMode === 'kanban' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'kanban' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                padding: '5px 10px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Kanban size={14} />
              <span>Kanban</span>
            </button>
          </div>

          {/* Status Pills */}
          <div className="status-filter-pills">
            <button
              className={`filter-pill-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({tasks.length})
            </button>
            <button
              className={`filter-pill-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Pending')}
            >
              Pending
            </button>
            <button
              className={`filter-pill-btn ${statusFilter === 'In Progress' ? 'active' : ''}`}
              onClick={() => setStatusFilter('In Progress')}
            >
              In Progress
            </button>
            <button
              className={`filter-pill-btn ${statusFilter === 'Done' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Done')}
            >
              Done
            </button>
            <button
              className={`filter-pill-btn ${statusFilter === 'OVERDUE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('OVERDUE')}
              style={{
                color: statusFilter === 'OVERDUE' ? '#B91C1C' : undefined,
                fontWeight: statusFilter === 'OVERDUE' ? '800' : undefined
              }}
            >
              Overdue
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => exportTasksToCSV(filteredAndSortedTasks, employees)}
            title="Download CSV report of tasks in Indian format"
            id="export-csv-btn"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            className="btn-primary"
            onClick={onOpenNewTaskModal}
            style={{ padding: '7px 14px', fontSize: '13px' }}
          >
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. Secondary Filter & Sorting Toolbar */}
      <div
        style={{
          padding: '10px 20px',
          background: '#F8FAFC',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        {/* Left Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} />
            <span>Filter:</span>
          </span>

          <select
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ height: '32px', fontSize: '12px', padding: '0 8px' }}
          >
            <option value="ALL">All Dates</option>
            <option value="RECENT_7_DAYS">✨ Added Recently (7 Days)</option>
            <option value="TODAY">⏰ Due Today</option>
            <option value="THIS_WEEK">📆 Due This Week</option>
            <option value="OVERDUE">⚠️ Past Due / Overdue</option>
          </select>

          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ height: '32px', fontSize: '12px', padding: '0 8px' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="filter-select"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            style={{ height: '32px', fontSize: '12px', padding: '0 8px' }}
          >
            <option value="ALL">All Assignees & Squads</option>
            {teams.length > 0 && (
              <optgroup label="👥 Squads / Teams">
                {teams.map((t) => (
                  <option key={t.id} value={`TEAM:${t.id}`}>
                    👥 {t.name} ({t.member_ids?.length || 0})
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="👤 Individual Members">
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Right Sort Controls & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SlidersHorizontal size={12} />
            <span>Sort:</span>
          </span>

          <select
            className="filter-select"
            style={{ height: '32px', fontSize: '12px', padding: '0 8px', background: '#FFFFFF' }}
            value={sortField}
            onChange={(e) => {
              const field = e.target.value;
              setSortField(field);
              if (field === 'created_at' || field === 'priority') {
                setSortOrder('desc');
              } else {
                setSortOrder('asc');
              }
            }}
          >
            <option value="created_at">Date Created (Recent)</option>
            <option value="deadline">Deadline Date</option>
            <option value="priority">Priority Level</option>
            <option value="title">Title (A-Z)</option>
            <option value="status">Status</option>
            <option value="assignee">Assignee</option>
          </select>

          <button
            type="button"
            onClick={toggleSortOrder}
            className="btn-secondary"
            style={{
              height: '32px',
              padding: '0 10px',
              fontSize: '11px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#FFFFFF'
            }}
            title={sortOrder === 'asc' ? 'Ascending (click to switch to Descending)' : 'Descending (click to switch to Ascending)'}
          >
            {sortOrder === 'asc' ? (
              <>
                <ArrowUp size={13} style={{ color: 'var(--primary)' }} />
                <span>Asc</span>
              </>
            ) : (
              <>
                <ArrowDown size={13} style={{ color: 'var(--primary)' }} />
                <span>Desc</span>
              </>
            )}
          </button>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginLeft: '4px' }}>
            ({filteredAndSortedTasks.length} tasks)
          </span>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                marginLeft: '6px'
              }}
              title="Clear all filters and search"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div style={{ padding: '20px' }}>
          <KanbanBoard
            tasks={filteredAndSortedTasks}
            employees={employees}
            teams={teams}
            onSelectTask={onSelectTask}
            onToggleTaskStatus={onToggleTaskStatus}
            onOpenNewTaskModal={onOpenNewTaskModal}
          />
        </div>
      ) : (
        /* VIEW: RESPONSIVE DATA TABLE */
        <div className="data-table-container">
          <table className="data-table" style={{ minWidth: '850px' }}>
            <thead>
              <tr>
                <th
                  className="sortable"
                  onClick={() => handleSort('title')}
                  style={{ width: '35%' }}
                  title="Click to sort by Title"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Task Title & Context</span>
                    {renderSortIndicator('title')}
                  </div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('assignee')}
                  style={{ width: '16%' }}
                  title="Click to sort by Assignee"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Assignee</span>
                    {renderSortIndicator('assignee')}
                  </div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('priority')}
                  style={{ width: '11%' }}
                  title="Click to sort by Priority"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Priority</span>
                    {renderSortIndicator('priority')}
                  </div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('deadline')}
                  style={{ width: '14%' }}
                  title="Click to sort by Deadline"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Deadline (IST)</span>
                    {renderSortIndicator('deadline')}
                  </div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('created_at')}
                  style={{ width: '10%' }}
                  title="Click to sort by Date Created (Recency)"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Created</span>
                    {renderSortIndicator('created_at')}
                  </div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('status')}
                  style={{ width: '11%' }}
                  title="Click to sort by Status"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Status</span>
                    {renderSortIndicator('status')}
                  </div>
                </th>
                <th style={{ width: '8%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      <Search size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                      <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        No tasks matched your filter criteria
                      </p>
                      <p style={{ fontSize: '13px', marginTop: '4px' }}>
                        Try adjusting the date, status, priority, or search query.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="btn-secondary"
                        style={{ marginTop: '14px', fontSize: '12px' }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedTasks.map((task) => {
                  const isOverdue = task.status !== 'Done' && new Date(task.deadline) < now;
                  const assignee = empMap[task.assignee_id];
                  const whatsappUrl = generateWhatsAppTaskShareUrl(task, assignee?.name);

                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderLeft: isOverdue ? '4px solid #F56B2C' : undefined,
                        backgroundColor: isOverdue ? '#FFFDFB' : undefined
                      }}
                    >
                      {/* Task Title */}
                      <td>
                        <div className="task-title-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span
                              className="task-title-main"
                              onClick={() => onSelectTask(task)}
                              title="Click to view details & activity log"
                            >
                              {task.title}
                            </span>
                            {task.tag && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#64748B',
                                  background: '#F1F5F9',
                                  padding: '1px 5px',
                                  borderRadius: '4px'
                                }}
                              >
                                {task.tag}
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <span className="task-desc-preview" title={task.description}>
                              {task.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td>
                        {task.team_name || (Array.isArray(task.assignee_ids) && task.assignee_ids.length > 1) ? (
                          <div className="assignee-cell" style={{ gap: '8px' }}>
                            {/* Avatar Stack */}
                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                              {(Array.isArray(task.assignee_ids) ? task.assignee_ids : [task.assignee_id])
                                .slice(0, 3)
                                .map((mId, i) => {
                                  const m = empMap[mId];
                                  if (!m) return null;
                                  return (
                                    <div
                                      key={mId}
                                      className="assignee-mini-avatar"
                                      style={{
                                        backgroundColor: m.avatar_color || '#F56B2C',
                                        marginLeft: i > 0 ? '-8px' : '0',
                                        border: '2px solid #FFFFFF',
                                        zIndex: 3 - i,
                                        width: '26px',
                                        height: '26px',
                                        fontSize: '10px'
                                      }}
                                      title={m.name}
                                    >
                                      {m.name.split(' ').map((n) => n[0]).join('')}
                                    </div>
                                  );
                                })}
                            </div>

                            <div>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: '800',
                                  fontSize: '12px',
                                  color: '#0369A1',
                                  background: '#E0F2FE',
                                  padding: '2px 8px',
                                  borderRadius: '6px'
                                }}
                              >
                                👥 {task.team_name || `${task.assignee_ids?.length || 2} Squad Members`}
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '11px',
                                  color: 'var(--text-muted)',
                                  marginTop: '2px',
                                  maxWidth: '160px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                                title={(task.assignee_ids || []).map((id) => empMap[id]?.name).filter(Boolean).join(', ')}
                              >
                                {(task.assignee_ids || []).map((id) => empMap[id]?.name.split(' ')[0]).filter(Boolean).join(', ')}
                              </span>
                            </div>
                          </div>
                        ) : assignee ? (
                          <div className="assignee-cell">
                            <div
                              className="assignee-mini-avatar"
                              style={{ backgroundColor: assignee.avatar_color || '#F56B2C' }}
                            >
                              {assignee.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>
                                {assignee.name}
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '11px',
                                  color: 'var(--text-muted)'
                                }}
                              >
                                {assignee.role}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td>
                        <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td>
                        <div className={`deadline-cell ${isOverdue ? 'is-overdue' : ''}`}>
                          {isOverdue ? (
                            <AlertTriangle size={14} style={{ color: '#B91C1C' }} />
                          ) : (
                            <Clock size={14} style={{ color: 'var(--text-light)' }} />
                          )}
                          <span>{formatIndianDate(task.deadline)}</span>
                        </div>
                      </td>

                      {/* Created Date (Recency) */}
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatIndianDate(task.created_at)}
                        </span>
                      </td>

                      {/* Status with Color-Coded Badges */}
                      <td>
                        {isOverdue ? (
                          <span
                            className="status-badge overdue"
                            title="This task missed its scheduled deadline"
                          >
                            <AlertTriangle size={12} /> Overdue
                          </span>
                        ) : task.status === 'Done' ? (
                          <span className="status-badge done">
                            <CheckCircle size={12} /> Done
                          </span>
                        ) : task.status === 'In Progress' ? (
                          <span className="status-badge in-progress">
                            ● In Progress
                          </span>
                        ) : (
                          <span className="status-badge pending">
                            ● Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-action-btns" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-icon-btn"
                            style={{ color: '#15803D' }}
                            title="Send task reminder on WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>

                          <button
                            className="action-icon-btn"
                            onClick={() => onSelectTask(task)}
                            title="View task detail and notes log"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="action-icon-btn delete"
                            onClick={() => onDeleteTask(task.id)}
                            title="Delete task"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
