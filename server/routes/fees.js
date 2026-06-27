const express = require('express');
const router = express.Router();
const {
  createFeeStructure,
  getAllFeeStructures,
  getFeeStructureById,
  getFeeBySessionAndCategory,
  updateFeeStructure,
  deleteFeeStructure,
} = require('../controllers/feeController');
const { protect, restrictTo } = require('../middleware/auth');

// All fee routes require authentication
router.use(protect);

router.get('/session/:session/category/:category', getFeeBySessionAndCategory);
router.get('/', getAllFeeStructures);
router.get('/:id', getFeeStructureById);
router.post('/', restrictTo('admin'), createFeeStructure);
router.patch('/:id', restrictTo('admin'), updateFeeStructure);
router.delete('/:id', restrictTo('admin'), deleteFeeStructure);

module.exports = router;