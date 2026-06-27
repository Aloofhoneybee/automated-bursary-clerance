const express = require('express');
const router = express.Router();
const { getAllHostels, updateHostelRate } = require('../controllers/hostelController');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/', getAllHostels);
router.patch('/:id', restrictTo('admin'), updateHostelRate);

module.exports = router;
