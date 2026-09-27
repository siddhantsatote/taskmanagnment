import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Users,
  Flag,
  AlertCircle,
  FileText,
  Tag,
  Plus,
  Check,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  employees = [],
  teams = [],
  initialData = null,
  initialTeam = null,
  onAddTeam
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tag, setTag] = useState('GST & Compliance');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState('');

  // Assignment modes: 'individual' | 'team' | 'custom'
  const [assignMode, setAssignMode] = useState('individual');
  const [assigneeId, setAssigneeId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Option to save custom group as a reusable team
  const [saveAsTeam, setSaveAsTeam] = useState(false);
  const [customTeamName, setCustomTeamName] = useState('');

  // Inline team creation mini-modal state
  const [isInlineTeamModalOpen, setIsInlineTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDept, setNewTeamDept] = useState('Engineering');
  const [newTeamColor, setNewTeamColor] = useState('#3B82F6');
  const [newTeamMemberIds, setNewTeamMemberIds] = useState([]);
  const [inlineTeamError, setInlineTeamError] = useState('');

  // Employee mapping
  const empMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp;
    return acc;
  }, {});

  // Reset or initialize state
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'Medium');
      setTag(initialData.tag || 'GST & Compliance');
      setStatus(initialData.status || 'Pending');

      if (initialData.deadline) {
        const d = new Date(initialData.deadline);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDeadline(formatted);
      }

      // Detect assignment mode from initialData
      if (initialData.team_id || initialData.team_name) {
        setAssignMode('team');
        const matched = teams.find(
          (t) => t.id === initialData.team_id || t.name === initialData.team_name
        );
        setSelectedTeamId(matched ? matched.id : (teams[0]?.id || ''));
        setSelectedMemberIds(initialData.assignee_ids || []);
      } else if (Array.isArray(initialData.assignee_ids) && initialData.assignee_ids.length > 1) {
        setAssignMode('custom');
        setSelectedMemberIds(initialData.assignee_ids);
      } else {
        setAssignMode('individual');
        setAssigneeId(initialData.assignee_id || (employees[0]?.id || ''));
      }
    } else if (initialTeam) {
      // Triggered specifically to assign to a team
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setTag('Tech Sprint');
      setStatus('Pending');
      setAssignMode('team');
      setSelectedTeamId(initialTeam.id);
      setSelectedMemberIds(initialTeam.member_ids || []);

      const tomorrow = new Date(Date.now() + 86400000);
      tomorrow.setHours(17, 0, 0, 0);
      const pad = (n) => String(n).padStart(2, '0');
      const formatted = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
      setDeadline(formatted);
    } else {
      setTitle('');
      setDescription('');
      setAssignMode('individual');
      setAssigneeId(employees.length > 0 ? employees[0].id : '');
      setSelectedTeamId(teams.length > 0 ? teams[0].id : '');
      setSelectedMemberIds([]);
      setPriority('Medium');
      setTag('GST & Compliance');
      setStatus('Pending');
      setSaveAsTeam(false);
      setCustomTeamName('');

      const tomorrow = new Date(Date.now() + 86400000);
      tomorrow.setHours(17, 0, 0, 0);
      const pad = (n) => String(n).padStart(2, '0');
      const formatted = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
      setDeadline(formatted);
    }
    setError('');
  }, [initialData, initialTeam, employees, teams, isOpen]);

  if (!isOpen) return null;

  // Currently selected team object
  const currentSelectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Toggle member selection in custom mode
  const handleToggleMember = (empId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  // Toggle member in inline team creation
  const handleToggleInlineTeamMember = (empId) => {
    setNewTeamMemberIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  // Quick Inline Team Creation
  const handleSaveInlineTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setInlineTeamError('Team name is required');
      return;
    }
    if (newTeamMemberIds.length === 0) {
      setInlineTeamError('Please select at least 1 employee for this team');
      return;
    }

    if (onAddTeam) {
      const created = await onAddTeam({
        name: newTeamName.trim(),
        department: newTeamDept,
        color: newTeamColor,
        member_ids: newTeamMemberIds,
        description: `Cross-functional squad for ${newTeamDept}`
      });

      if (created) {
        setSelectedTeamId(created.id);
        setAssignMode('team');
      }
    }

    setNewTeamName('');
    setNewTeamMemberIds([]);
    setInlineTeamError('');
    setIsInlineTeamModalOpen(false);
  };

  // Main Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!deadline) {
      setError('Deadline is required');
      return;
    }

    let finalAssigneeId = null;
    let finalAssigneeIds = [];
    let finalTeamId = null;
    let finalTeamName = null;

    if (assignMode === 'team') {
      if (!currentSelectedTeam) {
        setError('Please select or create a team');
        return;
      }
      finalTeamId = currentSelectedTeam.id;
      finalTeamName = currentSelectedTeam.name;
      finalAssigneeIds = Array.isArray(currentSelectedTeam.member_ids) ? currentSelectedTeam.member_ids : [];
      finalAssigneeId = finalAssigneeIds[0] || null;
    } else if (assignMode === 'custom') {
      if (selectedMemberIds.length === 0) {
        setError('Please select at least one employee for this task');
        return;
      }
      finalAssigneeIds = selectedMemberIds;
      finalAssigneeId = selectedMemberIds[0] || null;

      // Check if user requested saving as a reusable team
      if (saveAsTeam && customTeamName.trim() && onAddTeam) {
        const createdTeam = await onAddTeam({
          name: customTeamName.trim(),
          department: 'Cross-Functional',
          color: '#F56B2C',
          member_ids: selectedMemberIds,
          description: `Created from task assignment: "${title.trim()}"`
        });
        if (createdTeam) {
          finalTeamId = createdTeam.id;
          finalTeamName = createdTeam.name;
        }
      }
    } else {
      // Individual mode
      finalAssigneeId = assigneeId || null;
      finalAssigneeIds = assigneeId ? [assigneeId] : [];
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assignee_id: finalAssigneeId,
      assignee_ids: finalAssigneeIds,
      team_id: finalTeamId,
      team_name: finalTeamName,
      priority,
      tag,
      deadline: new Date(deadline).toISOString(),
      status
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
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
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800' }}>
                {initialData ? 'Edit Task' : 'Create New Deliverable'}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Bharat Tech MSME Suite · Assign to individuals or entire squads
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: '16px' }}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#FEE2E2',
                  color: '#B91C1C',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Task Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., GSTR-3B Return Filing & Reconciliation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Category / Department Tag */}
            <div className="form-group">
              <label className="form-label">Category / Department Tag</label>
              <select
                className="form-select"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="GST & Compliance">GST & Compliance</option>
                <option value="Client Deliverable">Client Deliverable</option>
                <option value="UPI Payments">UPI & Payments</option>
                <option value="Festive Campaign">Diwali / Festive Campaign</option>
                <option value="Vendor Payouts">Vendor Payouts</option>
                <option value="Tech Sprint">Tech / Engineering Sprint</option>
                <option value="Operations">Operations & Logistics</option>
                <option value="Sales & Outreach">Sales & Growth</option>
              </select>
            </div>

            {/* =========================================================================
                ASSIGNMENT SECTION: Individual vs Whole Team vs Multi-Member Group
                ========================================================================= */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-light)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: '800', color: 'var(--text-primary)' }}>
                  Task Assignment Mode
                </label>

                {/* Assignment Mode Pills */}
                <div style={{ display: 'flex', gap: '6px', background: '#E2E8F0', padding: '3px', borderRadius: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAssignMode('individual')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: assignMode === 'individual' ? '#FFFFFF' : 'transparent',
                      color: assignMode === 'individual' ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: assignMode === 'individual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    👤 1 Employee
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignMode('team')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: assignMode === 'team' ? '#FFFFFF' : 'transparent',
                      color: assignMode === 'team' ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: assignMode === 'team' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    👥 Whole Team / Pod
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignMode('custom')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: assignMode === 'custom' ? '#FFFFFF' : 'transparent',
                      color: assignMode === 'custom' ? 'var(--primary)' : 'var(--text-secondary)',
                      boxShadow: assignMode === 'custom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    ✨ Multi-Select Group
                  </button>
                </div>
              </div>

              {/* MODE 1: INDIVIDUAL EMPLOYEE */}
              {assignMode === 'individual' && (
                <div>
                  <select
                    className="form-select"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.role} ({emp.department})
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Assigned strictly to this single employee. Only they will view it on their portal.
                  </p>
                </div>
              )}

              {/* MODE 2: WHOLE TEAM / POD */}
              {assignMode === 'team' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-select"
                      style={{ flex: 1 }}
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                      {teams.length === 0 && <option value="">No teams available. Create one!</option>}
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.member_ids?.length || 0} members) — {t.department}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsInlineTeamModalOpen(true)}
                      style={{ fontSize: '12px', padding: '0 12px', whiteSpace: 'nowrap' }}
                      title="Create a new team right now"
                    >
                      <Plus size={14} />
                      <span>New Team</span>
                    </button>
                  </div>

                  {/* Team Preview Card */}
                  {currentSelectedTeam && (
                    <div
                      style={{
                        padding: '12px 14px',
                        background: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid var(--border-light)',
                        borderLeft: `4px solid ${currentSelectedTeam.color || '#3B82F6'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                          👥 {currentSelectedTeam.name}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: currentSelectedTeam.color || '#3B82F6',
                            background: '#F0F9FF',
                            padding: '2px 8px',
                            borderRadius: '9999px'
                          }}
                        >
                          {currentSelectedTeam.member_ids?.length || 0} Members
                        </span>
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {currentSelectedTeam.description || 'Cross-functional operational squad.'}
                      </p>

                      {/* Member list chips */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
                          Squad Members:
                        </span>
                        {(currentSelectedTeam.member_ids || []).map((mId) => {
                          const m = empMap[mId];
                          if (!m) return null;
                          return (
                            <span
                              key={mId}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#F1F5F9',
                                color: 'var(--text-secondary)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: m.avatar_color || '#F56B2C'
                                }}
                              />
                              {m.name}
                            </span>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '11px',
                          color: '#0369A1',
                          background: '#E0F2FE',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>All {currentSelectedTeam.member_ids?.length || 0} squad members will see this deliverable on their personal portal!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 3: MULTI-MEMBER CUSTOM GROUP */}
              {assignMode === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      Select colleagues ({selectedMemberIds.length} chosen):
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedMemberIds(employees.map((e) => e.id))}
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
                        onClick={() => setSelectedMemberIds([])}
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

                  {/* Checklist of employees */}
                  <div
                    style={{
                      maxHeight: '170px',
                      overflowY: 'auto',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px',
                      padding: '8px'
                    }}
                  >
                    {employees.map((emp) => {
                      const isSelected = selectedMemberIds.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleToggleMember(emp.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isSelected ? 'var(--primary-light)' : 'transparent',
                            transition: 'background 0.1s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: isSelected ? '2px solid var(--primary)' : '2px solid #CBD5E1',
                                background: isSelected ? 'var(--primary)' : '#FFFFFF',
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

                  {/* Save as Team option */}
                  <div style={{ marginTop: '4px', borderTop: '1px dashed var(--border-light)', paddingTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={saveAsTeam}
                        onChange={(e) => setSaveAsTeam(e.target.checked)}
                      />
                      <span>💾 Save these {selectedMemberIds.length} members as a reusable Team</span>
                    </label>

                    {saveAsTeam && (
                      <div style={{ marginTop: '8px' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., Growth & Onboarding Pod"
                          value={customTeamName}
                          onChange={(e) => setCustomTeamName(e.target.value)}
                          style={{ height: '36px', fontSize: '12px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description & Deliverables</label>
              <textarea
                className="form-textarea"
                placeholder="Add deliverables, WhatsApp notes, invoice numbers, or links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Row 2: Priority and Status */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pipeline Stage</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            {/* Row 3: Deadline */}
            <div className="form-group">
              <label className="form-label">Deadline (IST) *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="save-task-btn">
              {initialData ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>

        {/* INLINE MINI MODAL: Fast Team Creation */}
        {isInlineTeamModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsInlineTeamModalOpen(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Create New Team / Pod</h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsInlineTeamModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              {inlineTeamError && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#FEE2E2',
                    color: '#B91C1C',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {inlineTeamError}
                </div>
              )}

              <form onSubmit={handleSaveInlineTeam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Team Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Tech & UPI Engineering Squad"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={newTeamDept}
                      onChange={(e) => setNewTeamDept(e.target.value)}
                    >
                      <option value="Engineering">Engineering & UPI</option>
                      <option value="Finance & Compliance">Finance & Compliance</option>
                      <option value="Sales & Growth">Sales & Growth</option>
                      <option value="Design & Experience">Design & UX</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Badge Color</label>
                    <select
                      className="form-select"
                      value={newTeamColor}
                      onChange={(e) => setNewTeamColor(e.target.value)}
                    >
                      <option value="#3B82F6">Blue (Engineering)</option>
                      <option value="#10B981">Emerald (Finance/GST)</option>
                      <option value="#8B5CF6">Purple (Growth)</option>
                      <option value="#F56B2C">Orange (TaskFlow Brand)</option>
                      <option value="#EC4899">Pink (Marketing)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Team Members ({newTeamMemberIds.length} selected) *</label>
                  <div
                    style={{
                      maxHeight: '140px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '6px'
                    }}
                  >
                    {employees.map((emp) => {
                      const isChecked = newTeamMemberIds.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleToggleInlineTeamMember(emp.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: isChecked ? '#EFF6FF' : 'transparent'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ pointerEvents: 'none' }}
                          />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>
                            {emp.name}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ({emp.role})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsInlineTeamModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create & Select Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
