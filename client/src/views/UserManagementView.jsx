import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Pencil, 
  X, 
  Save, 
  UserPlus, 
  ShieldAlert, 
  UserCheck, 
  UserX,
  Key,
  Shield,
  Layers,
  CircleDot,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deactivateUser, 
  reactivateUser 
} from '../api/users';
import { getAllHostels } from '../api/hostels';

export default function UserManagementView() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [hostels, setHostels] = useState([]);

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    matricNumber: '',
    academicSession: '2025/2026',
    department: 'Computer Science',
    level: '100 Level',
    gender: 'Male',
    hostel: '',
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusLoadingMap, setStatusLoadingMap] = useState({});

  const loadUsers = () => {
    setLoading(true);
    // Fetch users for the current role selection
    const fetchRole = roleFilter === 'All' ? null : roleFilter.toLowerCase();
    getAllUsers(fetchRole)
      .then((res) => {
        setUsers(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load user list:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadHostelsList = () => {
    getAllHostels()
      .then((res) => {
        setHostels(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load hostels list:', err);
      });
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  useEffect(() => {
    loadHostelsList();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormError('');
    setShowPassword(false);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'student',
      matricNumber: '',
      academicSession: '2025/2026',
      department: 'Computer Science',
      level: '100 Level',
      gender: 'Male',
      hostel: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormError('');
    setShowPassword(false);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '', // Leave blank unless changing
      role: user.role || 'student',
      matricNumber: user.matricNumber || '',
      academicSession: user.academicSession || '2025/2026',
      department: user.department || 'Computer Science',
      level: user.level || '100 Level',
      gender: user.gender || 'Male',
      hostel: user.hostel || '',
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingUser) {
        // Edit User
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password; // Do not send empty password
        }
        // If changing to non-student, strip student fields
        if (payload.role !== 'student') {
          delete payload.matricNumber;
          delete payload.academicSession;
          delete payload.level;
          delete payload.hostel;
        }

        const res = await updateUser(editingUser._id, payload);
        if (res.status === 'success') {
          setShowModal(false);
          loadUsers();
        } else {
          setFormError(res.message || 'Failed to update user.');
        }
      } else {
        // Create User
        if (!formData.password) {
          setFormError('Password is required for new accounts.');
          setSubmitting(false);
          return;
        }
        const payload = { ...formData };
        if (payload.role !== 'student') {
          delete payload.matricNumber;
          delete payload.academicSession;
          delete payload.level;
          delete payload.hostel;
        }

        const res = await createUser(payload);
        if (res.status === 'success') {
          setShowModal(false);
          loadUsers();
        } else {
          setFormError(res.message || 'Failed to create user.');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user) => {
    const uId = user._id;
    setStatusLoadingMap(prev => ({ ...prev, [uId]: true }));
    try {
      if (user.isActive) {
        await deactivateUser(uId);
      } else {
        await reactivateUser(uId);
      }
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user account status.');
    } finally {
      setStatusLoadingMap(prev => ({ ...prev, [uId]: false }));
    }
  };

  // Filter list locally for search value
  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    const nameMatch = u.fullName?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    const matricMatch = u.matricNumber?.toLowerCase().includes(query);
    return nameMatch || emailMatch || matricMatch;
  });

  const departmentList = [
    'Computer Science',
    'Mass Communication',
    'Law',
    'Microbiology',
    'Accounting',
    'Architecture'
  ];

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">User Account Management</h1>
          <p className="text-xs text-gray-500 mt-1 hidden md:block">
            Create, modify, and manage status logs for students, bursary staff officers, and other administrators.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="group h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] hover:scale-[1.02] flex items-center gap-2 cursor-pointer duration-200"
        >
          <UserPlus className="w-4 h-4 text-emerald-100" />
          Create User Account
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by name, email or matric number..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all"
          />
        </div>

        {/* Role Filtering tab buttons */}
        <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-xl">
          {['All', 'Student', 'Staff', 'Admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 h-8 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                roleFilter === role
                  ? 'bg-white text-secondary shadow-sm font-black'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {role}s
            </button>
          ))}
        </div>
      </div>

      {/* Users table list */}
      <div className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
              <UserX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">No Accounts Found</h4>
              <p className="text-xs text-gray-400 max-w-[280px] mx-auto">No accounts matched your filters or search query.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-200">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role & Dept</th>
                  <th className="px-6 py-4">Student Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isStudent = u.role === 'student';
                  const isStaff = u.role === 'staff';
                  const isAdminRole = u.role === 'admin';

                  let roleBadge = 'bg-blue-50 border-blue-100 text-blue-600';
                  if (isStudent) roleBadge = 'bg-green-50 border-green-100 text-primary';
                  if (isAdminRole) roleBadge = 'bg-purple-50 border-purple-100 text-purple-600';

                  const isToggling = statusLoadingMap[u._id];

                  return (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{u.fullName || 'No Name'}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{u.email}</div>
                      </td>

                      {/* Role & Dept */}
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${roleBadge}`}>
                          {u.role}
                        </span>
                        {isStudent && (
                          <div className="text-[11px] text-slate-500 mt-1">{u.department || 'N/A'}</div>
                        )}
                      </td>

                      {/* Student Info */}
                      <td className="px-6 py-4">
                        {isStudent ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-700 font-medium">Matric: <span className="font-mono text-[11px] font-bold">{u.matricNumber || 'N/A'}</span></div>
                            <div className="text-[10px] text-gray-400 font-semibold">{u.level} | {u.academicSession || '2025/2026'} | {u.hostel || 'No Hostel'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Not Applicable</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                          u.isActive ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          <CircleDot className={`w-2.5 h-2.5 ${u.isActive ? 'fill-emerald-500 text-emerald-500' : 'fill-red-400 text-red-400'}`} />
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="h-8 w-8 rounded-lg border border-gray-200 hover:border-slate-350 text-slate-600 hover:text-slate-900 bg-white shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                            title="Edit User Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isToggling}
                            className={`h-8 px-3 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                              u.isActive
                                ? 'bg-red-50 hover:bg-red-100 border-red-100 text-red-600'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-600'
                            }`}
                            title={u.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                          >
                            {isToggling ? (
                              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            ) : u.isActive ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Create / Edit Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center select-none bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl max-w-[550px] w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-[17px] font-black text-secondary">
                  {editingUser ? 'Modify User Account' : 'Create User Account'}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {editingUser ? `Update account registry settings for ${formData.email}` : 'Add a new credentials profile to Caleb University ledger.'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg border border-gray-150 hover:bg-gray-50 text-gray-450 hover:text-secondary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error notifications */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Account Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  disabled={editingUser !== null} // Role cannot be changed post-creation to prevent token contamination
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="student">Student Account</option>
                  <option value="staff">Bursary Staff Officer</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. j.doe@caleb.edu.ng"
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  {editingUser ? 'Reset Password (Leave blank to keep current)' : 'Account Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required={!editingUser}
                    placeholder={editingUser ? '••••••••' : 'Password (min. 8 characters)'}
                    className="w-full h-10 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-slate-650 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Department - Students Only */}
              {formData.role === 'student' && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold cursor-pointer"
                  >
                    {departmentList.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Student Only Fields */}
              {formData.role === 'student' && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Matric Number</label>
                      <input
                        type="text"
                        name="matricNumber"
                        value={formData.matricNumber}
                        onChange={handleFormChange}
                        required
                        placeholder="e.g. 23/CS/1043"
                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Academic Session</label>
                      <select
                        name="academicSession"
                        value={formData.academicSession}
                        onChange={handleFormChange}
                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold cursor-pointer"
                      >
                        <option value="2025/2026">2025/2026</option>
                        <option value="2024/2025">2024/2025</option>
                        <option value="2023/2024">2023/2024</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Level</label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleFormChange}
                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold cursor-pointer"
                      >
                        <option value="100 Level">100 Level</option>
                        <option value="200 Level">200 Level</option>
                        <option value="300 Level">300 Level</option>
                        <option value="400 Level">400 Level</option>
                        <option value="500 Level">500 Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Hostel Hall</label>
                      <select
                        name="hostel"
                        value={formData.hostel}
                        onChange={handleFormChange}
                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-bold cursor-pointer"
                      >
                        <option value="">Default (by Gender)</option>
                        {hostels.map(h => (
                          <option key={h._id} value={h.name}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-10 px-5 bg-white border border-gray-250 hover:bg-gray-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-emerald-100" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
