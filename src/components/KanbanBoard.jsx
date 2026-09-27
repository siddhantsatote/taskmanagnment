import React from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { formatIndianDate, generateWhatsAppTaskShareUrl } from '../lib/supabase';

export default function KanbanBoard({
  tasks = [],
  employees = [],
  teams = [],
  onSelectTask,
  onToggleTaskStatus,
  onOpenNewTaskModal
}) {
  const now = new Date();

  // Employee mapping
  const empMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp;
    return acc;
  }, {});

  const columns = [
    {
      id: 'Pending',
      title: 'Pending & Backlog',
      color: '#B45309',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      items: tasks.filter((t) => t.status === 'Pending')
    },
    {
      id: 'In Progress',
      title: 'In Progress & Active',
      color: '#0369A1',
      bgColor: '#E0F2FE',
      borderColor: '#BAE6FD',
      items: tasks.filter((t) => t.status === 'In Progress')
    },
    {
      id: 'Done',
      title: 'Completed & Delivered',
      color: '#15803D',
      bgColor: '#DCFCE7',
      borderColor: '#BBF7D0',
      items: tasks.filter((t) => t.status === 'Done')
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start', width: '100%' }}>
      {columns.map((col) => (
        <div
          key={col.id}
          style={{
            background: '#F8FAFC',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-light)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            minHeight: '500px'
          }}
        >
          {/* Column Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: col.color
                }}
              />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {col.title}
              </h3>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: col.color,
                background: col.bgColor,
                padding: '2px 8px',
                borderRadius: '9999px'
              }}
            >
              {col.items.length}
            </span>
          </div>

          {/* Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {col.items.map((task) => {
              const isOverdue = task.status !== 'Done' && new Date(task.deadline) < now;
              const assignee = empMap[task.assignee_id];
              const whatsappUrl = generateWhatsAppTaskShareUrl(task, assignee?.name);

              return (
                <div
                  key={task.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-inner)',
                    border: '1px solid var(--border-light)',
                    borderLeft: isOverdue ? '4px solid #F56B2C' : `4px solid ${col.color}`,
                    padding: '16px',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Category Tag & Priority */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: 'var(--text-muted)',
                        background: '#F1F5F9',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {task.tag || 'General'}
                    </span>

                    <span className={`priority-pill priority-${task.priority.toLowerCase()}`} style={{ fontSize: '10px' }}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h4
                      onClick={() => onSelectTask(task)}
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        lineHeight: '1.4'
                      }}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Deadline & Overdue */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    {isOverdue ? (
                      <span style={{ color: '#B91C1C', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={13} /> Overdue: {formatIndianDate(task.deadline)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> Due: {formatIndianDate(task.deadline)}
                      </span>
                    )}
                  </div>

                  {/* Assignee & Card Footer Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '10px'
                    }}
                  >
                    {task.team_name || (Array.isArray(task.assignee_ids) && task.assignee_ids.length > 1) ? (
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        title={`Squad: ${task.team_name || 'Team Assignment'} (${(task.assignee_ids || []).map((id) => empMap[id]?.name).filter(Boolean).join(', ')})`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
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
                                    backgroundColor: m.avatar_color || '#3B82F6',
                                    marginLeft: i > 0 ? '-6px' : '0',
                                    border: '1.5px solid #FFFFFF',
                                    zIndex: 3 - i,
                                    width: '22px',
                                    height: '22px',
                                    fontSize: '9px'
                                  }}
                                >
                                  {m.name.split(' ').map((n) => n[0]).join('')}
                                </div>
                              );
                            })}
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#0369A1',
                            background: '#E0F2FE',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            maxWidth: '110px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          👥 {task.team_name ? task.team_name.split(' ')[0] : `${task.assignee_ids?.length} Squad`}
                        </span>
                      </div>
                    ) : assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          className="assignee-mini-avatar"
                          style={{
                            backgroundColor: assignee.avatar_color || '#F56B2C',
                            width: '24px',
                            height: '24px',
                            fontSize: '10px'
                          }}
                        >
                          {assignee.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          {assignee.name.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Unassigned</span>
                    )}

                    {/* Quick Move Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-icon-btn"
                        style={{ color: '#15803D' }}
                        title="Share on WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>

                      {col.id === 'Pending' && (
                        <button
                          className="action-icon-btn"
                          onClick={() => onToggleTaskStatus(task.id, 'In Progress')}
                          title="Move to In Progress"
                          style={{ color: '#0369A1' }}
                        >
                          <ArrowRight size={14} />
                        </button>
                      )}

                      {col.id === 'In Progress' && (
                        <>
                          <button
                            className="action-icon-btn"
                            onClick={() => onToggleTaskStatus(task.id, 'Pending')}
                            title="Move back to Pending"
                          >
                            <ArrowLeft size={14} />
                          </button>
                          <button
                            className="action-icon-btn"
                            onClick={() => onToggleTaskStatus(task.id, 'Done')}
                            title="Mark as Done"
                            style={{ color: '#15803D' }}
                          >
                            <CheckCircle size={14} />
                          </button>
                        </>
                      )}

                      {col.id === 'Done' && (
                        <button
                          className="action-icon-btn"
                          onClick={() => onToggleTaskStatus(task.id, 'In Progress')}
                          title="Reopen Task"
                        >
                          <ArrowLeft size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {col.items.length === 0 && (
              <div
                style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  color: 'var(--text-light)',
                  fontSize: '13px',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '12px'
                }}
              >
                No tasks in {col.title}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
