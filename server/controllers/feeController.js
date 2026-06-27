const FeeStructure = require('../models/FeeStructure');
const AuditLog = require('../models/AuditLog');

// @route  POST /api/fees
// @access Admin, Staff
const createFeeStructure = async (req, res) => {
  try {
    const { academicSession, studentCategory, feeItems, department } = req.body;

    const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

    const feeStructure = await FeeStructure.create({
      academicSession,
      studentCategory,
      department,
      feeItems,
      totalAmount,
    });

    await AuditLog.create({
      eventType: 'fee_structure_change',
      actingUser: req.user._id,
      description: `Fee structure created for ${studentCategory} - ${academicSession}`,
      metadata: { feeStructureId: feeStructure._id, totalAmount },
    });

    res.status(201).json({
      status: 'success',
      message: 'Fee structure created successfully',
      data: feeStructure,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/fees
// @access Admin, Staff
const getAllFeeStructures = async (req, res) => {
  try {
    const fees = await FeeStructure.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: fees.length,
      data: fees,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/fees/:id
// @access Admin, Staff, Student
const getFeeStructureById = async (req, res) => {
  try {
    const fee = await FeeStructure.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ status: 'error', message: 'Fee structure not found' });
    }
    res.status(200).json({ status: 'success', data: fee });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  GET /api/fees/session/:session/category/:category
// @access Admin, Staff, Student
const getFeeBySessionAndCategory = async (req, res) => {
  try {
    const { session, category } = req.params;
    const { department } = req.query;
    const query = {
      academicSession: session,
      studentCategory: category,
      isActive: true,
    };
    if (department) {
      query.department = department;
    }
    const fee = await FeeStructure.findOne(query);
    if (!fee) {
      return res.status(404).json({ status: 'error', message: 'No active fee structure found for this session, category, and department' });
    }
    res.status(200).json({ status: 'success', data: fee });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  PATCH /api/fees/:id
// @access Admin only
const updateFeeStructure = async (req, res) => {
  try {
    const { feeItems, isActive, department, academicSession, studentCategory } = req.body;

    const update = {};
    if (feeItems) {
      update.feeItems = feeItems;
      update.totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);
    }
    if (typeof isActive !== 'undefined') update.isActive = isActive;
    if (department) update.department = department;
    if (academicSession) update.academicSession = academicSession;
    if (studentCategory) update.studentCategory = studentCategory;

    const fee = await FeeStructure.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!fee) {
      return res.status(404).json({ status: 'error', message: 'Fee structure not found' });
    }

    await AuditLog.create({
      eventType: 'fee_structure_change',
      actingUser: req.user._id,
      description: `Fee structure updated for ${fee.studentCategory} - ${fee.academicSession}`,
      metadata: { feeStructureId: fee._id },
    });

    res.status(200).json({ status: 'success', message: 'Fee structure updated', data: fee });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  DELETE /api/fees/:id
// @access Admin only
const deleteFeeStructure = async (req, res) => {
  try {
    const fee = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ status: 'error', message: 'Fee structure not found' });
    }

    await AuditLog.create({
      eventType: 'fee_structure_change',
      actingUser: req.user._id,
      description: `Fee structure deleted for ${fee.studentCategory} - ${fee.academicSession}`,
      metadata: { feeStructureId: fee._id },
    });

    res.status(200).json({ status: 'success', message: 'Fee structure deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  createFeeStructure,
  getAllFeeStructures,
  getFeeStructureById,
  getFeeBySessionAndCategory,
  updateFeeStructure,
  deleteFeeStructure,
};