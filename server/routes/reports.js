const express = require('express');
const router = express.Router();
const {
  getFinancialSummary,
  getOutstandingStudents,
  getAuditLog,
  getCollectionsByDate,
} = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/summary', restrictTo('admin'), getFinancialSummary);
router.get('/outstanding', restrictTo('admin'), getOutstandingStudents);
router.get('/audit-log', restrictTo('admin'), getAuditLog);
router.get('/collections-by-date', restrictTo('admin'), getCollectionsByDate);

module.exports = router;