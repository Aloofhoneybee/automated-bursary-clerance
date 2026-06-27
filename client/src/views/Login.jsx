import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/auth';
import { GraduationCap, User, Shield, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const { login, error: authError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [academicSession, setAcademicSession] = useState('2025/2026');
  const [department, setDepartment] = useState('Computer Science');
  const [level, setLevel] = useState('100 Level');
  const [gender, setGender] = useState('Male');
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setLocalError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setMatricNumber('');
    setAcademicSession('2025/2026');
    setDepartment('Computer Science');
    setLevel('100 Level');
    setGender('Male');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const user = await login(email.trim(), password);
        setLoading(false);
        onLogin(user);
      } else {
        if (
          !email.endsWith('@caleb.edu.ng') &&
          !email.endsWith('@calebuniversity.edu.ng') &&
          email !== 'student@caleb.edu.ng'
        ) {
          throw new Error('Please register using your official Caleb University student email address.');
        }

        await registerApi({
          firstName,
          lastName,
          email,
          password,
          role: 'student',
          matricNumber: matricNumber.trim(),
          academicSession,
          department,
          level,
          gender,
        });

        setSuccessMsg('Account registered successfully! Initiating session login...');

        setTimeout(async () => {
          try {
            const user = await login(email, password);
            setLoading(false);
            onLogin(user);
          } catch (loginErr) {
            setLocalError('Account registered, but auto-login failed. Please sign in manually.');
            setIsLoginMode(true);
            setLoading(false);
          }
        }, 1200);
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#1F2937] flex items-center justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .login-flex-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
        }
        .login-left-wrapper {
          display: none;
          width: 80%;
          padding: 18px;
          box-sizing: border-box;
        }
        .login-right-panel {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .login-flex-container {
            flex-direction: row;
            align-items: stretch;
          }
          .login-left-wrapper {
            display: flex;
            flex: 1.15;
          }
          .login-right-panel {
            flex: 0.85;
          }
        }
        
        /* ── WELCOME CARD STYLES ── */
        .login-right-panel-wrapper {
          width: 440px;
          min-height: auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
          margin-top: 48px;
          margin-bottom: 24px;
        }
        
        .login-card {
          width: 440px;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0px 8px 32px rgba(15, 23, 42, 0.06);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        
        .login-input {
          width: 100%;
          height: 50px;
          border-radius: 12px;
          border: 1px solid #CBD5E1;
          background-color: #FFFFFF;
          padding-left: 48px;
          padding-right: 18px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          color: #0F172A;
          box-sizing: border-box;
          outline: none;
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        
        .login-input::placeholder {
          color: #94A3B8;
        }
        
        .login-input:focus {
          border-color: #16A34A;
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.10);
        }
        
        .login-input-password {
          padding-right: 48px;
        }
        
        .login-btn-primary {
          width: 100%;
          height: 50px;
          background-color: #16A34A;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0px 8px 20px rgba(22, 163, 74, 0.25);
          font-family: 'Inter', sans-serif;
          transition: transform 200ms ease, background-color 200ms ease, box-shadow 200ms ease;
        }
        
        .login-btn-primary:hover {
          background-color: #15803D;
          transform: translateY(-1px);
        }
        
        .login-btn-primary:active {
          transform: translateY(0);
        }
        
        .login-btn-primary:disabled {
          background-color: #A0AEC0;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .role-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100%;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          transition: background-color 200ms ease-in-out, color 200ms ease-in-out;
        }
        
        .role-tab.active {
          background-color: #ECFDF5;
          color: #059669;
          font-weight: 600;
        }
        
        .role-tab.inactive {
          background-color: transparent;
          color: #334155;
        }
        
        .role-tab.inactive:hover {
          background-color: rgba(241, 245, 249, 0.8);
        }
        
        .forgot-password-link {
          color: #059669;
          font-weight: 500;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          transition: color 200ms ease;
        }
        
        .forgot-password-link:hover {
          color: #047857;
          text-decoration: underline;
        }
        
        .new-user-btn {
          height: 44px;
          padding-left: 24px;
          padding-right: 24px;
          background-color: #FFFFFF;
          border: 1px solid #16A34A;
          border-radius: 12px;
          color: #16A34A;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
        }
        
        .new-user-btn:hover {
          background-color: #ECFDF5;
        }
        
        .name-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        @media (min-width: 480px) {
          .name-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 540px) {
          .login-right-panel-wrapper {
            width: 100%;
            padding: 0 16px;
          }
          .login-card {
            width: 100%;
            padding: 24px;
          }
        }
      `}</style>
      <div
        style={{
          width: '100%',
          maxWidth: '1600px',
          margin: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div className="login-flex-container">
          {/* ── LEFT PANEL ── */}
          <div className="hidden lg:flex login-left-wrapper">
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '28px',
                width: '100%',
                minHeight: '750px',
                background: 'linear-gradient(180deg, #0D9F6E 8%)',
              }}
            >
              <img
                src="/caleb-campus-login.jpg"
                alt="Caleb University Campus"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '55%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '55%',
                  background: 'linear-gradient(to top, #16a34a, transparent, transparent)',
                  zIndex: 10,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '35%',
                  left: 0,
                  right: 0,
                  height: '20%',
                  background: 'linear-gradient(180deg, transparent, #0D9F6E)',
                  zIndex: 11,
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: '35%',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    color: 'white',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: '24px',
                      marginBottom: '24px',
                      width: '100%',
                    }}
                  >
                    <img
                      src="/caleb-logo.jpg"
                      alt="Caleb Logo"
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid rgba(255, 255, 255, 0.3)',
                        background: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                      }}
                    >
                      <h1
                        style={{
                          fontSize: '40px',
                          fontWeight: 500,
                          lineHeight: 1.0,
                          margin: 0,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.5px',
                        }}
                      >
                        CALEB UNIVERSITY
                      </h1>
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: 500,
                          letterSpacing: '1px',
                          marginTop: '6px',
                          color: 'rgba(255,255,255,0.88)',
                        }}
                      >
                        BURSARY PORTAL
                      </div>
                    </div>
                  </div>

                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      margin: 0,
                      marginBottom: '20px',
                      lineHeight: 1.2,
                      textAlign: 'left',
                    }}
                  >
                    Secure. Transparent. Efficient.
                  </h2>

                  <p
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      fontWeight: 400,
                      margin: 0,
                      marginBottom: '28px',
                      color: 'rgba(255,255,255,0.88)',
                      textAlign: 'left',
                    }}
                  >
                    Manage your school fees, make payments, and track your clearance status with ease.
                  </p>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                    {[
                      {
                        label: 'Secure Payments',
                        path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                      },
                      {
                        label: 'Real-time Updates',
                        path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                      },
                      {
                        label: 'Digital Certificates',
                        path: 'M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V22l4-2 4 2v-7.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z M9 9l2 2 4-4',
                      },
                    ].map((f) => (
                      <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.path} />
                        </svg>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="login-right-panel" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="login-right-panel-wrapper">
              
              {/* New User Section (outside-card-top-right) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  marginBottom: '16px',
                }}
              >
                <span style={{ color: '#64748B', fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                  {isLoginMode ? 'New here?' : 'Already have an account?'}
                </span>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="new-user-btn"
                >
                  {isLoginMode ? 'Create an account' : 'Sign In'}
                </button>
              </div>

              {/* Login/Signup Card */}
              <div className="login-card">

                {/* Card Header */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                  <img
                    src="/caleb-logo.jpg"
                    alt="Caleb Logo"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #E2E8F0',
                      marginBottom: '8px',
                    }}
                  />
                  <h2
                    style={{
                      fontSize: '36px',
                      fontWeight: 700,
                      lineHeight: '44px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#0F172A',
                      margin: 0,
                      textAlign: 'center',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {isLoginMode ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#64748B',
                      margin: 0,
                      marginTop: '4px',
                      textAlign: 'center',
                    }}
                  >
                    {isLoginMode ? 'Sign in to your bursary portal' : 'Register your student profile'}
                  </p>
                </div>

                {/* Error and Success notifications */}
                {(localError || authError) && (
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {localError || authError}
                  </div>
                )}

                {successMsg && (
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" />
                    </svg>
                    {successMsg}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>

                  {isLoginMode ? (
                    <>
                      {/* Role Selector: Segmented Control */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '16px',
                          padding: '6px',
                          height: '50px',
                          alignItems: 'center',
                          boxSizing: 'border-box',
                          marginBottom: '16px',
                        }}
                      >
                        {[
                          { role: 'student', label: 'Student', Icon: GraduationCap },
                          { role: 'staff', label: 'Staff', Icon: User },
                          { role: 'admin', label: 'Admin', Icon: Shield },
                        ].map(({ role, label, Icon }) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`role-tab ${selectedRole === role ? 'active' : 'inactive'}`}
                          >
                            <Icon style={{ width: '18px', height: '18px' }} />
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Input 1: Login ID */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
                          {selectedRole === 'student'
                            ? 'Matric Number or Student Email'
                            : selectedRole === 'staff'
                            ? 'Staff ID or Staff Email'
                            : 'Admin ID or Admin Email'}
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                          <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '18px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: '#94A3B8' }}>
                            <User style={{ width: '20px', height: '20px' }} />
                          </span>
                          <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={
                              selectedRole === 'student'
                                ? 'Enter your matric number or student email'
                                : selectedRole === 'staff'
                                ? 'Enter your staff ID or staff email'
                                : 'Enter your admin ID or admin email'
                            }
                            className="login-input"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Signup Fields */}
                      {/* Name Grid */}
                      <div className="name-grid">
                        {/* First Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>First Name</label>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First name"
                            className="login-input"
                            style={{ paddingLeft: '18px' }}
                          />
                        </div>

                        {/* Last Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Last Name</label>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                            className="login-input"
                            style={{ paddingLeft: '18px' }}
                          />
                        </div>
                      </div>

                      {/* Matric Number */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Matric Number</label>
                        <input
                          type="text"
                          required
                          value={matricNumber}
                          onChange={(e) => setMatricNumber(e.target.value)}
                          placeholder="e.g. 22/0001"
                          className="login-input"
                          style={{ paddingLeft: '18px', fontFamily: 'monospace' }}
                        />
                      </div>

                      {/* Department */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Department</label>
                        <div style={{ position: 'relative', width: '100%' }}>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="login-input"
                            style={{ paddingLeft: '18px', paddingRight: '40px', appearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mass Communication">Mass Communication</option>
                            <option value="Law">Law</option>
                            <option value="Microbiology">Microbiology</option>
                            <option value="Accounting">Accounting</option>
                            <option value="Architecture">Architecture</option>
                          </select>
                          <span style={{ position: 'absolute', right: '18px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: '#64748B' }}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* Level */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Level</label>
                        <div style={{ position: 'relative', width: '100%' }}>
                          <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="login-input"
                            style={{ paddingLeft: '18px', paddingRight: '40px', appearance: 'none', cursor: 'pointer' }}
                          >
                            <option value="100 Level">100 Level</option>
                            <option value="200 Level">200 Level</option>
                            <option value="300 Level">300 Level</option>
                            <option value="400 Level">400 Level</option>
                            <option value="500 Level">500 Level</option>
                          </select>
                          <span style={{ position: 'absolute', right: '18px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: '#64748B' }}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* Gender Radio Group */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Gender</label>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '50px', paddingLeft: '4px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#1F2937', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                            <input
                              type="radio"
                              name="gender"
                              value="Male"
                              checked={gender === 'Male'}
                              onChange={(e) => setGender(e.target.value)}
                              style={{
                                width: '20px',
                                height: '20px',
                                accentColor: '#16A34A',
                                cursor: 'pointer'
                              }}
                            />
                            Male
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#1F2937', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                            <input
                              type="radio"
                              name="gender"
                              value="Female"
                              checked={gender === 'Female'}
                              onChange={(e) => setGender(e.target.value)}
                              style={{
                                width: '20px',
                                height: '20px',
                                accentColor: '#16A34A',
                                cursor: 'pointer'
                              }}
                            />
                            Female
                          </label>
                        </div>
                      </div>

                      {/* Email Address */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@caleb.edu.ng"
                          className="login-input"
                          style={{ paddingLeft: '18px' }}
                        />
                      </div>
                    </>
                  )}

                  {/* Password Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Password</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '18px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: '#94A3B8' }}>
                        <Lock style={{ width: '20px', height: '20px' }} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="login-input login-input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, paddingRight: '18px', display: 'flex', alignItems: 'center', color: '#94A3B8', border: 'none', background: 'none', cursor: 'pointer' }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff style={{ width: '20px', height: '20px' }} />
                        ) : (
                          <Eye style={{ width: '20px', height: '20px' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {isLoginMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-[#16A34A] focus:ring-[#16A34A]"
                        />
                        Remember me
                      </label>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert("Please visit the Bursary Block A or contact helpcentre@caleb.edu.ng to reconcile or recover your password."); }}
                        className="forgot-password-link"
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}

                  {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="login-btn-primary"
                  >
                    {!loading && <Lock style={{ width: '20px', height: '20px' }} />}
                    {loading ? (isLoginMode ? 'Signing In...' : 'Registering...') : (isLoginMode ? 'Sign In' : 'Sign Up')}
                  </button>
                </form>
              </div>

              {/* Footer */}
              <footer style={{ marginTop: '24px', textAlign: 'center', width: '100%' }}>
                <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                  © 2026 Okorie Richard. All rights reserved.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}