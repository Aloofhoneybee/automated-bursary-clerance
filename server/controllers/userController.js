const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// @route  GET /api/users
// @access Admin only
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    // Default to student role to prevent role contamination and accidental leaks of staff/admin
    const filter = { role: 'student' };
    if (role && ['student', 'staff', 'admin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/users/:id
// @access Admin only
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  PATCH /api/users/:id/deactivate
// @access Admin only
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await AuditLog.create({
      eventType: 'user_management',
      actingUser: req.user._id,
      targetUser: user._id,
      description: `Account deactivated for ${user.email} by ${req.user.fullName}`,
    });

    res.status(200).json({
      status: 'success',
      message: `${user.fullName}'s account has been deactivated`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  PATCH /api/users/:id/reactivate
// @access Admin only
const reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await AuditLog.create({
      eventType: 'user_management',
      actingUser: req.user._id,
      targetUser: user._id,
      description: `Account reactivated for ${user.email} by ${req.user.fullName}`,
    });

    res.status(200).json({
      status: 'success',
      message: `${user.fullName}'s account has been reactivated`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  PATCH /api/users/:id/reset-password
// @access Admin only
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await AuditLog.create({
      eventType: 'user_management',
      actingUser: req.user._id,
      targetUser: user._id,
      description: `Password reset for ${user.email} by ${req.user.fullName}`,
    });

    res.status(200).json({
      status: 'success',
      message: `Password reset successfully for ${user.fullName}`,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  PATCH /api/users/my-password
// @access All authenticated users
const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    await AuditLog.create({
      eventType: 'user_management',
      actingUser: req.user._id,
      description: `${user.email} updated their own password`,
    });

    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      fullName,
      firstName,
      lastName,
      email,
      password,
      role,
      matricNumber,
      academicSession,
      department,
      level,
      gender,
      hostel,
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'Email, password and role are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const targetRole = role || 'student';

    const userDefaultHostel = targetRole === 'student'
      ? (gender === 'Female' ? 'Mary & Susanna Hall (Female Only) (Standard)' : 'Elisha Hall (Shared)')
      : undefined;

    const user = await User.create({
      fullName: fullName || (firstName && lastName ? `${lastName} ${firstName}` : ''),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: targetRole,
      matricNumber: targetRole === 'student' ? matricNumber : undefined,
      academicSession: targetRole === 'student' ? academicSession : undefined,
      department,
      level: targetRole === 'student' ? level : undefined,
      gender,
      hostel: hostel || userDefaultHostel,
    });

    if (targetRole === 'student') {
      const { runClearanceEngine } = require('../services/clearanceEngine');
      await runClearanceEngine(user._id, user.academicSession || '2025/2026');
    }

    await AuditLog.create({
      eventType: 'user_management',
      actingUser: req.user._id,
      targetUser: user._id,
      description: `New ${targetRole} account created for ${email} by Admin ${req.user.fullName}`,
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: user,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const {
      fullName,
      firstName,
      lastName,
      email,
      role,
      matricNumber,
      academicSession,
      department,
      level,
      gender,
      hostel,
      isActive,
      password,
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ status: 'error', message: 'Email already in use' });
      }
      user.email = email;
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    
    if (firstName !== undefined || lastName !== undefined) {
      const fName = firstName !== undefined ? firstName : (user.firstName || '');
      const lName = lastName !== undefined ? lastName : (user.lastName || '');
      user.fullName = `${lName} ${fName}`.trim() || user.fullName;
    }

    if (role !== undefined) user.role = role;
    if (matricNumber !== undefined) user.matricNumber = matricNumber;
    if (academicSession !== undefined) user.academicSession = academicSession;
    if (department !== undefined) user.department = department;
    if (level !== undefined) user.level = level;
    if (gender !== undefined) user.gender = gender;
    if (isActive !== undefined) user.isActive = isActive;

    const hostelChanged = hostel !== undefined && hostel !== user.hostel;
    if (hostel !== undefined) user.hostel = hostel;

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    if (user.role === 'student' && (hostelChanged || role === 'student')) {
      const { runClearanceEngine } = require('../services/clearanceEngine');
      await runClearanceEngine(user._id, user.academicSession || '2025/2026');
    }

    await AuditLog.create({
      eventType: 'user_management',
      actingUser: req.user._id,
      targetUser: user._id,
      description: `User account details updated for ${user.email} by Admin ${req.user.fullName}`,
    });

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deactivateUser,
  reactivateUser,
  resetUserPassword,
  updateMyPassword,
  createUser,
  updateUser,
};