import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Send,
  Trash2,
  Edit,
  Tag,
  MessageCircle,
  Share2
} from 'lucide-react';
import { apiGetTaskNotes, apiCreateTaskNote, formatIndianDate, generateWhatsAppTaskShareUrl } from '../lib/supabase';

export default function TaskDetailModal({
  task,
  onClose,
  employees = [],
  teams = [],
  onUpdateStatus,
  onEditTask,
  onDeleteTask
}) {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(true);

  const now = new Date();
  const isOverdue = task && task.status !== 'Done' && new Date(task.deadline) < now;

  // Find assignee(s)
  const assignee = task ? employees.find((e) => e.id === task.assignee_id) : null;
  const assigneesList = task
    ? (Array.isArray(task.assignee_ids) && task.assignee_ids.length > 0)
      ? task.assignee_ids.map((id) => employees.find((e) => e.id === id)).filter(Boolean)
      : (assignee ? [assignee] : [])
    : [];

  const displayName = task?.team_name
    ? `${task.team_name} Squad (${assigneesList.length} members)`
    : assigneesList.length > 1
    ? `${assigneesList.map((m) => m.name.split(' ')[0]).join(', ')}`
    : assignee?.name;

  const whatsappUrl = task ? generateWhatsAppTaskShareUrl(task, displayName) : '#';

  // Load notes
  useEffect(() => {
    if (task) {
      setLoadingNotes(true);
      apiGetTaskNotes(task.id).then((fetchedNotes) => {
        setNotes(fetchedNotes);
        setLoadingNotes(false);
      });
    }
  }, [task]);

  if (!task) return null;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const added = await apiCreateTaskNote(task.id, 'Rajesh Sharma (Founder)', newNoteText);
    setNotes((prev) => [...prev, added]);
    setNewNoteText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isOverdue ? (
              <span className="status-badge overdue">
                <AlertTriangle size={12} /> Overdue
              </span>
            ) : (
              <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                {task.status === 'Done' ? <CheckCircle size={12} /> : '● '}
                {task.status}
              </span>
            )}

            <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
              {task.priority} Priority
            </span>

            {task.tag && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#475569',
                  background: '#F1F5F9',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                🏷️ {task.tag}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                height: '32px',
                padding: '0 10px',
                fontSize: '12px',
                color: '#15803D',
                background: '#F0FDF4',
                borderColor: '#BBF7D0'
              }}
              title="Share task on WhatsApp with assignee"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>

            <button
              className="action-icon-btn"
              onClick={() => onEditTask(task)}
              title="Edit Task Details"
            >
              <Edit size={16} />
            </button>
            <button
              className="action-icon-btn delete"
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Title */}
          <div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '8px'
              }}
            >
              {task.title}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                background: '#F8FAFC',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)'
              }}
            >
              {task.description || 'No additional context or description provided.'}
            </p>
          </div>

          {/* Quick Status Changers */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid var(--border-light)',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Update Pipeline Status:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`filter-pill-btn ${task.status === 'Pending' ? 'active' : ''}`}
                onClick={() => onUpdateStatus(task.id, 'Pending')}
              >
                Pending
              </button>
              <button
                className={`filter-pill-btn ${task.status === 'In Progress' ? 'active' : ''}`}
                onClick={() => onUpdateStatus(task.id, 'In Progress')}
              >
                In Progress
              </button>
              <button
                className={`filter-pill-btn ${task.status === 'Done' ? 'active' : ''}`}
                onClick={() => onUpdateStatus(task.id, 'Done')}
                style={{
                  background: task.status === 'Done' ? '#10B981' : undefined,
                  color: task.status === 'Done' ? '#FFFFFF' : undefined
                }}
              >
                ✓ Mark Done (+100 Pts)
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="form-row-2">
            {/* Assignee Card */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: task.team_name || assigneesList.length > 1 ? 'column' : 'row',
                alignItems: task.team_name || assigneesList.length > 1 ? 'flex-start' : 'center',
                gap: '10px'
              }}
            >
              {task.team_name || assigneesList.length > 1 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '11px', color: '#0369A1', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      👥 {task.team_name ? 'Assigned Squad / Team' : 'Multi-Member Assignment'}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      {assigneesList.length} Members
                    </span>
                  </div>

                  {task.team_name && (
                    <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {task.team_name}
                    </p>
                  )}

                  {/* Member avatars & names */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: '2px' }}>
                    {assigneesList.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#F8FAFC',
                          padding: '4px 8px',
                          borderRadius: '8px'
                        }}
                      >
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
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
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {m.name}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          · {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : assignee ? (
                <>
                  <div
                    className="team-member-avatar"
                    style={{
                      backgroundColor: assignee.avatar_color || '#F56B2C',
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px'
                    }}
                  >
                    {assignee.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Assigned To
                    </span>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {assignee.name}
                    </p>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {assignee.role}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} style={{ color: 'var(--text-light)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    No member assigned
                  </span>
                </div>
              )}
            </div>

            {/* Deadline Card */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: isOverdue ? '#FFF5F5' : '#FFFFFF'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isOverdue ? '#FEE2E2' : '#F1F5F9',
                  color: isOverdue ? '#B91C1C' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar size={18} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Target Deadline (IST)
                </span>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: isOverdue ? '#B91C1C' : 'var(--text-primary)'
                  }}
                >
                  {formatIndianDate(task.deadline, true)}
                </p>
                <span style={{ fontSize: '11px', color: isOverdue ? '#B91C1C' : 'var(--text-muted)' }}>
                  {isOverdue ? 'Overdue - follow up on WhatsApp' : 'On schedule'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Notes Log */}
          <div className="notes-log-section">
            <div className="notes-log-title">
              <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
              <span>Activity & Notes Log ({notes.length})</span>
            </div>

            <div className="notes-timeline">
              {loadingNotes ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading activity log...</p>
              ) : notes.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No comments or activity notes yet. Add one below!
                </p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="note-bubble">
                    <div className="note-bubble-meta">
                      <span className="note-author">{note.author}</span>
                      <span className="note-time">
                        {formatIndianDate(note.created_at, true)}
                      </span>
                    </div>
                    <p className="note-content">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="add-note-box">
              <input
                type="text"
                placeholder="Write an internal note, GST reference, or client update..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
                disabled={!newNoteText.trim()}
              >
                <Send size={14} />
                <span>Post Note</span>
              </button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
