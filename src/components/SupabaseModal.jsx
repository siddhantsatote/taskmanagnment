import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  resetToDemoData
} from '../lib/supabase';

export default function SupabaseModal({
  isOpen,
  onClose,
  onConfigSaved,
  onResetDemo
}) {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSql, setShowSql] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({ success: false, message: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url.trim(), key.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    saveSupabaseConfig(url, key);
    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleClear = () => {
    setUrl('');
    setKey('');
    saveSupabaseConfig('', '');
    setTestResult({ success: true, message: 'Switched to Local Offline Demo mode.' });
    if (onConfigSaved) onConfigSaved();
  };

  const sqlCode = `-- TaskFlow Database Setup
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    department TEXT DEFAULT 'Operations',
    avatar_color TEXT DEFAULT '#F56B2C',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Done')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS task_notes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author TEXT NOT NULL DEFAULT 'Business Owner',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all" ON task_notes FOR ALL USING (true) WITH CHECK (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800' }}>Supabase Backend Settings</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Single business owner view · Direct cloud database sync
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <ShieldCheck size={20} style={{ color: '#10B981', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Single Business Owner Architecture:</strong> TaskFlow is designed for instant setup. All tasks and employee activity sync to your Supabase tables or automatically persist locally.
            </div>
          </div>

          {/* Test Result Alert */}
          {testResult && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: testResult.success ? '#DCFCE7' : '#FEE2E2',
                color: testResult.success ? '#15803D' : '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* URL Input */}
          <div className="form-group">
            <label className="form-label">Supabase Project URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://xyzabcdef.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Anon Key Input */}
          <div className="form-group">
            <label className="form-label">Supabase Anon Public API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          {/* Test & Clear Controls */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleTest}
              disabled={isTesting}
              style={{ fontSize: '13px' }}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClear}
              style={{ fontSize: '13px', color: '#64748B' }}
            >
              Reset to Local Offline Mode
            </button>
          </div>

          {/* SQL Schema helper */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Database SQL Schema
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={copySql}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {copiedSchema ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedSchema ? 'Copied!' : 'Copy SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSql(!showSql)}
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {showSql ? 'Hide SQL' : 'View SQL'}
                </button>
              </div>
            </div>

            {showSql && (
              <pre
                style={{
                  background: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '11px',
                  padding: '12px',
                  borderRadius: '10px',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  lineHeight: '1.4'
                }}
              >
                {sqlCode}
              </pre>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (window.confirm('Reset sample demo tasks and activity log?')) {
                resetToDemoData();
                if (onResetDemo) onResetDemo();
                onClose();
              }
            }}
            style={{ marginRight: 'auto', color: 'var(--primary)' }}
          >
            <RefreshCw size={13} />
            <span>Reset Demo Data</span>
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
