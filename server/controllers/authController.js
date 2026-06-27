const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper to sign a JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @route  POST /api/auth/register
// @access Public (students) / Admin (staff/admin)
const register = async (req, res) => {
  try {
    const { fullName, firstName, lastName, email, password, role, matricNumber, academicSession, department, level, gender } = req.body;

    // Optional check: decode JWT if present to check for acting admin
    let actingUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        actingUser = await User.findById(decoded.id);
      } catch (err) {
        // ignore token verify errors and treat as public signup
      }
    }

    const targetRole = role || 'student';

    if (targetRole === 'student' && !level) {
      return res.status(400).json({ status: 'error', message: 'Level is required for student registration' });
    }

    // Only admin can register staff or admin accounts
    if (targetRole !== 'student') {
      if (!actingUser || actingUser.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Only admins can register staff or admin accounts' });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const userDefaultHostel = targetRole === 'student'
      ? (gender === 'Female' ? 'Mary & Susanna Hall (Female Only) (Standard)' : 'Elisha Hall (Shared)')
      : undefined;

    const user = await User.create({
      fullName: fullName || (firstName && lastName ? `${lastName} ${firstName}` : ''),
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email,
      password: hashedPassword,
      role: targetRole,
      matricNumber: matricNumber || undefined,
      academicSession: academicSession || undefined,
      department: department || undefined,
      level: level || undefined,
      gender: gender || undefined,
      hostel: userDefaultHostel,
    });

    // Log the event
    await AuditLog.create({
      eventType: 'user_management',
      actingUser: actingUser?._id || user._id,
      targetUser: user._id,
      description: `New ${targetRole} account created for ${email}`,
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    // Find user by email or matricNumber and include password for comparison
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { matricNumber: email }
      ]
    }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Log the login
    await AuditLog.create({
      eventType: 'login',
      actingUser: user._id,
      description: `${user.role} ${user.email} logged in`,
    });

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        matricNumber: user.matricNumber,
        academicSession: user.academicSession,
        department: user.department,
        level: user.level,
        gender: user.gender,
        hostel: user.hostel,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/auth/me
// @access Protected
const getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
};

// @route  PATCH /api/auth/me
// @access Protected
const updateMe = async (req, res) => {
  try {
    const { firstName, lastName, level, stateOfOrigin, parentPhoneNumber, phoneNumber, gender, dateOfBirth, department, hostel } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    
    if (firstName !== undefined || lastName !== undefined) {
      const fName = firstName !== undefined ? firstName : user.firstName;
      const lName = lastName !== undefined ? lastName : user.lastName;
      user.fullName = `${lName} ${fName}`;
    }
    
    if (level !== undefined) user.level = level;
    if (stateOfOrigin !== undefined) user.stateOfOrigin = stateOfOrigin;
    if (parentPhoneNumber !== undefined) user.parentPhoneNumber = parentPhoneNumber;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (department !== undefined) user.department = department;

    const hostelChanged = hostel !== undefined && hostel !== user.hostel;
    if (hostel !== undefined) user.hostel = hostel;

    await user.save();

    // Trigger runClearanceEngine dynamically if hostel selection has changed
    if (hostelChanged && user.role === 'student') {
      const { runClearanceEngine } = require('../services/clearanceEngine');
      await runClearanceEngine(user._id, user.academicSession || '2025/2026');
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: user
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { register, login, getMe, updateMe };