import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Briefcase,
  Trophy,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserPlus,
  Flame,
  Star,
  Check
} from 'lucide-react';
import { apiCreateEmployee, DEFAULT_EMPLOYEES } from '../lib/supabase';

export default function LoginPage({
  employees = [],
  onLoginSuccess,
  showToast
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loginRole, setLoginRole] = useState('admin'); // 'admin' | 'employee'

  const availableEmployees = employees && employees.length > 0 ? employees : DEFAULT_EMPLOYEES;

  // Admin login credentials
  const [adminEmail, setAdminEmail] = useState('rajesh@bharattech.in');
  const [adminPassword, setAdminPassword] = useState('••••••••');

  // Employee email & password login credentials
  const [empEmail, setEmpEmail] = useState('priya.patel@bharattech.in');
  const [empPassword, setEmpPassword] = useState('password123');
  const [empError, setEmpError] = useState('');

  // New Employee Registration Form
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Engineering');
  const [regAvatarColor, setRegAvatarColor] = useState('#F56B2C');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorOptions = [
    '#F56B2C', // Orange
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#0F172A'  // Slate
  ];

  // Handle Admin Sign In
  const handleAdminLogin = (e) => {
    e?.preventDefault();
    const adminUser = {
      role: 'admin',
      id: 'admin-rajesh',
      name: 'Rajesh Sharma',
      email: 'rajesh@bharattech.in',
      roleTitle: 'Founder & MD',
      department: 'Executive Leadership',
      avatar_color: '#0F172A'
    };
    onLoginSuccess(adminUser);
    showToast('👋 Welcome back, Rajesh Sharma! Founder View activated.');
  };

  // Handle Employee Email + Password Sign In
  const handleEmployeeLoginSubmit = (e) => {
    e?.preventDefault();
    setEmpError('');

    const trimmedEmail = empEmail.trim().toLowerCase();
    const targetEmp = availableEmployees.find(
      (emp) => emp.email?.toLowerCase().trim() === trimmedEmail
    );

    if (!targetEmp) {
      setEmpError('No employee found with this email. Please check credentials or register below.');
      return;
    }

    const expectedPassword = targetEmp.password || 'password123';
    if (empPassword !== expectedPassword) {
      setEmpError('Incorrect password. Default demo password is password123.');
      return;
    }

    const empUser = {
      role: 'employee',
      id: targetEmp.id,
      name: targetEmp.name,
      email: targetEmp.email,
      roleTitle: targetEmp.role,
      department: targetEmp.department,
      avatar_color: targetEmp.avatar_color,
      points: targetEmp.points || 0,
      streak_days: targetEmp.streak_days || 1,
      badges: targetEmp.badges || ['Team Member']
    };
    onLoginSuccess(empUser);
    showToast(`🌟 Signed in as ${targetEmp.name}! Your workspace & tasks are ready.`);
  };

  const handleSelectQuickPersona = (emp) => {
    setEmpEmail(emp.email);
    setEmpPassword(emp.password || 'password123');
    setEmpError('');
  };

  // Handle New Employee Registration with Password
  const handleRegisterEmployee = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Full Name is required');
      return;
    }
    if (!regRole.trim()) {
      setRegError('Job Title / Role is required');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Work Email is required');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters');
      return;
    }

    const emailExists = availableEmployees.some(
      (emp) => emp.email?.toLowerCase().trim() === regEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setRegError('An employee with this email already exists. Please sign in above.');
      return;
    }

    setIsSubmitting(true);
    setRegError('');

    try {
      const newEmployeeData = {
        name: regName.trim(),
        role: regRole.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword.trim(),
        department: regDepartment,
        avatar_color: regAvatarColor
      };

      const createdEmp = await apiCreateEmployee(newEmployeeData);

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F56B2C', '#10B981', '#3B82F6', '#FFD700']
      });

      const empUser = {
        role: 'employee',
        id: createdEmp.id,
        name: createdEmp.name,
        email: createdEmp.email,
        roleTitle: createdEmp.role,
        department: createdEmp.department,
        avatar_color: createdEmp.avatar_color,
        points: createdEmp.points || 100,
        streak_days: 1,
        badges: createdEmp.badges || ['New Joiner ⭐']
      };

      onLoginSuccess(empUser);
      showToast(`🎉 Shandaar! Welcome to the team, ${createdEmp.name}! Starter points awarded.`);
    } catch (err) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-family)'
      }}
    >
      <div
        className="login-card-layout"
        style={{
          width: '100%',
          maxWidth: '1020px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 20px 60px -15px rgba(15, 23, 42, 0.08), 0 2px 10px rgba(0,0,0,0.02)',
          border: '1px solid var(--border-light)',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1.15fr',
          overflow: 'hidden'
        }}
      >
        {/* Left Side: Brand Story & MSME Highlights */}
        <div
          style={{
            background: 'linear-gradient(145deg, #FFF7ED 0%, #FFF4EE 50%, #FED7AA 100%)',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid #FFE7DB',
            position: 'relative'
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 18px rgba(245, 107, 44, 0.35)'
                }}
              >
                <Sparkles size={24} />
              </div>
              <div>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Task<span style={{ color: 'var(--primary)' }}>Flow</span>
                </span>
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: '#F56B2C',
                    color: '#FFFFFF',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  BHARAT
                </span>
                <p style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                  India's MSME & Startup Task Suite
                </p>
              </div>
            </div>

            <h2
              style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: '1.25',
                marginBottom: '16px'
              }}
            >
              Deliver on-time, every time. Motivate your team to excel.
            </h2>

            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '32px' }}>
              Built specifically for Indian businesses. Manage GST timelines, client deliverables, and UPI integrations with gamified employee rewards.
            </p>

            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    flexShrink: 0
                  }}
                >
                  <Trophy size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    Gamified Champions Leaderboard
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    Points, streaks, and peer kudos that encourage on-time task delivery.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    GST & Compliance Ready (IST)
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    Automated overdue flags for GSTR-3B, TDS 26AS, and ROC milestones.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    1-Click WhatsApp Reminders
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    Instantly ping team members on WhatsApp with formatted task cards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div
            style={{
              paddingTop: '28px',
              borderTop: '1px solid rgba(245, 107, 44, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748B'
            }}
          >
            <span>🇮🇳 Acme Infotech India Pvt Ltd</span>
            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>GSTIN Verified</span>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Main Top Tab Switcher: Sign In vs Register */}
          <div
            style={{
              display: 'flex',
              background: '#F1F5F9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '28px',
              gap: '4px'
            }}
          >
            <button
              onClick={() => {
                setAuthMode('login');
                setRegError('');
              }}
              style={{
                flex: 1,
                border: 'none',
                background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                padding: '9px 16px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In to Workspace
            </button>

            <button
              onClick={() => {
                setAuthMode('register');
                setRegError('');
              }}
              style={{
                flex: 1,
                border: 'none',
                background: authMode === 'register' ? '#FFFFFF' : 'transparent',
                color: authMode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: authMode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                padding: '9px 16px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              + Register New Employee
            </button>
          </div>

          {/* VIEW A: SIGN IN FORM */}
          {authMode === 'login' && (
            <div>
              {/* Role Toggle: Founder vs Team Member */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Select Sign-In Portal:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setLoginRole('admin')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: loginRole === 'admin' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: loginRole === 'admin' ? 'var(--primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: loginRole === 'admin' ? 'var(--primary)' : '#F1F5F9',
                        color: loginRole === 'admin' ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', display: 'block', color: 'var(--text-primary)' }}>
                        Founder / Admin
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Full access & DB
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginRole('employee')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: loginRole === 'employee' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: loginRole === 'employee' ? 'var(--primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: loginRole === 'employee' ? 'var(--primary)' : '#F1F5F9',
                        color: loginRole === 'employee' ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Trophy size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', display: 'block', color: 'var(--text-primary)' }}>
                        Employee Portal
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        My tasks & Ranks
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ADMIN LOGIN */}
              {loginRole === 'admin' && (
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Founder Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Security Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', height: '44px', fontSize: '14px', marginTop: '6px' }}
                  >
                    <span>Sign In as Founder (Rajesh Sharma)</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* EMPLOYEE LOGIN WITH EMAIL & PASSWORD */}
              {loginRole === 'employee' && (
                <form onSubmit={handleEmployeeLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {empError && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#FEE2E2',
                        color: '#B91C1C',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                    >
                      {empError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Work Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g., priya.patel@bharattech.in"
                      value={empEmail}
                      onChange={(e) => {
                        setEmpEmail(e.target.value);
                        setEmpError('');
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Password *</label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Demo: password123</span>
                    </div>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter employee password"
                      value={empPassword}
                      onChange={(e) => {
                        setEmpPassword(e.target.value);
                        setEmpError('');
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', height: '44px', fontSize: '14px', marginTop: '4px' }}
                  >
                    <span>Sign In to Employee Portal</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Quick Fill Demo Credentials */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      ⚡ Instant Demo Fill (Click any member):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {availableEmployees.slice(0, 4).map((emp) => {
                        const isSelected = empEmail === emp.email;
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => handleSelectQuickPersona(emp)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                              background: isSelected ? 'var(--primary-light)' : '#F8FAFC',
                              color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: emp.avatar_color || '#F56B2C'
                              }}
                            />
                            <span>{emp.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({emp.points || 0} pts)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* VIEW B: REGISTER NEW EMPLOYEE FORM WITH EMAIL & PASSWORD */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Join Bharat Tech Team
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Register to get your personal task queue, starter points (+100 pts), and rank.
                </p>
              </div>

              {regError && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#FEE2E2',
                    color: '#B91C1C',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                >
                  {regError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Rohan Verma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Job Title / Role *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Junior React Dev"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design & Experience">Design & UX</option>
                    <option value="Finance & Compliance">Finance & Operations</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Growth Marketing">Growth Marketing</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Work Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rohan@bharattech.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password * (min. 6 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create your employee password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {/* Avatar Accent Color Picker */}
              <div className="form-group">
                <label className="form-label">Choose Avatar Color</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {colorOptions.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setRegAvatarColor(c)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        backgroundColor: c,
                        border: regAvatarColor === c ? '3px solid #0F172A' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transform: regAvatarColor === c ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', height: '44px', fontSize: '14px', marginTop: '6px' }}
              >
                <UserPlus size={16} />
                <span>{isSubmitting ? 'Registering...' : 'Register & Enter Workspace (+100 Pts)'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
