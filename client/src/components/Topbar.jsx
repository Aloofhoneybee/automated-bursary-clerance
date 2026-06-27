import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ currentRole, studentData, onToggleMobileSidebar, searchVal, setSearchVal, setCurrentTab, hasUnread }) {
  const { user, logout } = useAuth();
  const isStudent = currentRole === 'student';
  const isOfficer = currentRole === 'officer';
  const isAdmin = currentRole === 'admin';

  const formatStudentName = (name) => {
    if (!name) return '';
    let lastName = '';
    let firstName = '';

    if (name.includes(',')) {
      const parts = name.split(',');
      lastName = parts[0].trim();
      firstName = parts[1].trim();
    } else {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      } else {
        lastName = name;
      }
    }

    const capLastName = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase() : '';
    const capFirstName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : '';

    return capFirstName ? `${capLastName} ${capFirstName}` : capLastName;
  };

  const rawName = user?.fullName || (isStudent ? studentData.name : isOfficer ? 'Bursary Officer' : 'System Admin');
  const displayName = isStudent ? formatStudentName(rawName) : rawName;
  const displaySub = isStudent ? (user?.matricNumber || studentData.matricNo) : isOfficer ? 'Officer' : 'Admin';
  const avatarInitials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="h-[80px] bg-white border-b border-gray-200 sticky top-0 right-0 z-20 flex items-center justify-between px-4 md:px-8 select-none">
      {/* Left side: Hamburger Toggle */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-50 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img 
          src="/cul_logo_rect.png" 
          alt="Caleb University Logo" 
          className="h-8 w-auto object-contain lg:hidden"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button 
          onClick={() => {
            if (setCurrentTab) setCurrentTab('notifications');
          }}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl relative transition-all"
        >
          <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        <div className="h-[28px] w-px bg-gray-200 hidden sm:block" />

        {/* User Details */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => {
              if (isStudent && setCurrentTab) setCurrentTab('biodata');
            }}
            className={`flex items-center gap-3 ${
              isStudent ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
            }`}
          >
            <div className="hidden sm:block text-right">
              <h3 className="text-[13px] font-bold text-secondary truncate max-w-[150px]">
                {displayName}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase text-center">
                {displaySub}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary border border-primary/20 select-none">
              {avatarInitials}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Sign out"
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}