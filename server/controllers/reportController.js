const Transaction = require('../models/Transaction');
const Clearance = require('../models/Clearance');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @route  GET /api/reports/summary
// @access Admin, Staff
const getFinancialSummary = async (req, res) => {
  try {
    const { academicSession } = req.query;
    const matchFilter = { status: 'success' };
    if (academicSession) matchFilter.academicSession = academicSession;

    // Total collections
    const totalCollection = await Transaction.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // Collections by channel
    const byChannel = await Transaction.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$channel', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // Collections by session
    const bySession = await Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: '$academicSession', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // Clearance stats
    const clearanceStats = await Clearance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Total registered students
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });

    res.status(200).json({
      status: 'success',
      data: {
        totalCollection: totalCollection[0] || { total: 0, count: 0 },
        byChannel,
        bySession,
        clearanceStats,
        totalStudents,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/reports/outstanding
// @access Admin, Staff
const getOutstandingStudents = async (req, res) => {
  try {
    const { academicSession } = req.query;

    // Find all students not cleared for the session
    const clearedStudentIds = await Clearance.find({ status: 'cleared' }).distinct('student');

    const filter = { role: 'student', isActive: true, _id: { $nin: clearedStudentIds } };
    if (academicSession) filter.academicSession = academicSession;

    const outstandingStudents = await User.find(filter)
      .select('fullName matricNumber email academicSession department')
      .sort({ matricNumber: 1 });

    res.status(200).json({
      status: 'success',
      results: outstandingStudents.length,
      data: outstandingStudents,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/reports/audit-log
// @access Admin only
const getAuditLog = async (req, res) => {
  try {
    const { eventType, limit = 50 } = req.query;
    const filter = {};
    if (eventType) filter.eventType = eventType;

    const logs = await AuditLog.find(filter)
      .populate('actingUser', 'fullName email role')
      .populate('targetUser', 'fullName email matricNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/reports/collections-by-date
// @access Admin, Staff
const getCollectionsByDate = async (req, res) => {
  try {
    const { academicSession } = req.query;
    const matchFilter = { status: 'success' };
    if (academicSession) matchFilter.academicSession = academicSession;

    const byDate = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    res.status(200).json({
      status: 'success',
      data: byDate,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getFinancialSummary,
  getOutstandingStudents,
  getAuditLog,
  getCollectionsByDate,
};