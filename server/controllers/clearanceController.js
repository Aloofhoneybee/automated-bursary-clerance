const Clearance = require('../models/Clearance');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateClearanceCertificate } = require('../services/certGenerator');
const crypto = require('crypto');

// @route  GET /api/clearance/my-status
// @access Student only
const getMyClearanceStatus = async (req, res) => {
  try {
    const clearance = await Clearance.findOne({ student: req.user._id })
      .populate('student', 'fullName matricNumber email academicSession department')
      .populate('triggeringTransaction', 'amount channel paidAt paystackReference');

    if (!clearance) {
      return res.status(404).json({
        status: 'error',
        message: 'No clearance record found. Please make a payment first.',
      });
    }

    res.status(200).json({ status: 'success', data: clearance });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/clearance/verify/:token
// @access Public (for QR code scanning)
const verifyClearanceCertificate = async (req, res) => {
  try {
    const clearance = await Clearance.findOne({ verificationToken: req.params.token })
      .populate('student', 'fullName matricNumber department academicSession hostel gender');

    if (!clearance || clearance.status !== 'cleared') {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate is invalid or could not be verified',
      });
    }

    const defaultHostel = clearance.student.gender === 'Female' ? 'Mary & Susanna Hall (Female Only) (Standard)' : 'Elisha Hall (Shared)';
    const hostelName = clearance.student.hostel || defaultHostel;

    res.status(200).json({
      status: 'success',
      message: 'Certificate is valid',
      data: {
        fullName: clearance.student.fullName,
        matricNumber: clearance.student.matricNumber,
        department: clearance.student.department,
        academicSession: clearance.academicSession,
        clearedAt: clearance.clearedAt,
        verificationToken: clearance.verificationToken,
        hostelName: hostelName,
        scope: clearance.scope,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/clearance/all
// @access Admin, Staff
const getAllClearances = async (req, res) => {
  try {
    const clearances = await Clearance.find()
      .populate('student', 'fullName matricNumber email academicSession department')
      .populate('triggeringTransaction', 'amount channel paidAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: clearances.length,
      data: clearances,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/clearance/certificate
// @access Student only
const downloadCertificate = async (req, res) => {
  try {
    const clearance = await Clearance.findOne({ student: req.user._id })
      .populate('student', 'fullName matricNumber department academicSession hostel gender');

    if (!clearance || clearance.status !== 'cleared') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not cleared. Certificate is only available for cleared students.',
      });
    }

    const defaultHostel = clearance.student.gender === 'Female' ? 'Mary & Susanna Hall (Female Only) (Standard)' : 'Elisha Hall (Shared)';
    const hostelName = clearance.student.hostel || defaultHostel;

    // Resolve the total session fees paid
    const FeeStructure = require('../models/FeeStructure');
    const feeStructure = await FeeStructure.findOne({
      academicSession: clearance.academicSession,
      department: clearance.student.department,
      isActive: true,
    });
    const Hostel = require('../models/Hostel');
    const hostel = await Hostel.findOne({ name: hostelName });
    const hostelAmount = hostel ? hostel.amount : (clearance.student.gender === 'Female' ? 250000 : 270000);
    const totalFees = feeStructure ? (feeStructure.totalAmount + hostelAmount) : 0;

    await generateClearanceCertificate(res, {
      fullName: clearance.student.fullName,
      matricNumber: clearance.student.matricNumber,
      department: clearance.student.department,
      academicSession: clearance.academicSession,
      clearedAt: clearance.clearedAt,
      verificationToken: clearance.verificationToken,
      hostelName: hostelName,
      totalFees: totalFees,
      scope: clearance.scope,
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  PATCH /api/clearance/override/:studentId
// @access Admin, Staff
const overrideClearance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, comment, scope: overrideScope } = req.body;

    if (!status || !['cleared', 'not_cleared'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid clearance status' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ status: 'error', message: 'Comment is required for manual override' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    const academicSession = student.academicSession || '2025/2026';
    const verificationToken = status === 'cleared' ? crypto.randomUUID() : undefined;
    const resolvedScope = status === 'cleared' ? (overrideScope || 'full') : 'none';

    const updateData = {
      student: studentId,
      academicSession,
      status,
      scope: resolvedScope,
      clearedAt: status === 'cleared' ? new Date() : null,
      verificationToken: status === 'cleared' ? verificationToken : null,
      staffOverride: {
        overriddenBy: req.user._id,
        comment,
        overriddenAt: new Date(),
      }
    };

    const clearance = await Clearance.findOneAndUpdate(
      { student: studentId },
      updateData,
      { upsert: true, new: true }
    );

    // Log the override action
    await AuditLog.create({
      eventType: 'clearance_update',
      actingUser: req.user._id,
      targetUser: studentId,
      description: `Bursary clearance status manually overridden to '${status}' by ${req.user.fullName}. Reason: ${comment}`,
      metadata: { status, comment },
    });

    // Create Notification for the student
    const statusText = status === 'cleared' ? 'Cleared' : 'Not Cleared';
    await Notification.create({
      user: studentId,
      title: 'Clearance Overridden by Bursary',
      description: `Your clearance status has been manually updated to '${statusText}' by the Bursary Department. Comment: "${comment}"`,
      type: 'clearance',
      unread: true
    });

    res.status(200).json({
      status: 'success',
      message: `Student clearance status manually updated to '${status}'`,
      data: clearance,
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getMyClearanceStatus,
  verifyClearanceCertificate,
  getAllClearances,
  downloadCertificate,
  overrideClearance,
};