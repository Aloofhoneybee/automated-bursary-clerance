const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  deactivateUser,
  reactivateUser,
  resetUserPassword,
  updateMyPassword,
  createUser,
  updateUser,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// Any authenticated user can update their own password
router.patch('/my-password', updateMyPassword);

// Admin and Staff routes
router.get('/', restrictTo('admin', 'staff'), getAllUsers);
router.post('/', restrictTo('admin'), createUser);
router.get('/:id', restrictTo('admin', 'staff'), getUserById);
router.patch('/:id', restrictTo('admin'), updateUser);
router.patch('/:id/deactivate', restrictTo('admin'), deactivateUser);
router.patch('/:id/reactivate', restrictTo('admin'), reactivateUser);
router.patch('/:id/reset-password', restrictTo('admin'), resetUserPassword);

module.exports = router;