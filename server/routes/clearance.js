const express = require('express');
const router = express.Router();
const {
  getMyClearanceStatus,
  verifyClearanceCertificate,
  getAllClearances,
  downloadCertificate,
  overrideClearance,
} = require('../controllers/clearanceController');
const { protect, restrictTo } = require('../middleware/auth');

// Public — QR code verification
router.get('/verify/:token', verifyClearanceCertificate);

// Protected routes
router.use(protect);

router.get('/my-status', restrictTo('student'), getMyClearanceStatus);
router.get('/certificate', restrictTo('student'), downloadCertificate);
router.get('/all', restrictTo('admin', 'staff'), getAllClearances);
router.patch('/override/:studentId', restrictTo('admin', 'staff'), overrideClearance);

module.exports = router;