const Hostel = require('../models/Hostel');

// @route  GET /api/hostels
// @access Protect
const getAllHostels = async (req, res) => {
  try {
    let hostels = await Hostel.find().sort({ name: 1 });
    
    // Seed default hostels if none exist in the database
    if (hostels.length === 0) {
      const defaultHostels = [
        { name: 'Mary & Susanna Hall (Female Only) (Standard)', amount: 250000, allocated: 635, paid: 526, pending: 109 },
        { name: 'Elisha Hall (Shared)', amount: 270000, allocated: 320, paid: 276, pending: 44 },
        { name: 'En-suite Room (6 bedded)', amount: 300000, allocated: 210, paid: 180, pending: 30 },
        { name: 'En-suite Room (4 bedded)', amount: 320000, allocated: 80, paid: 50, pending: 30 },
        { name: 'David Hostel (Premium)', amount: 500000, allocated: 40, paid: 30, pending: 10 }
      ];
      await Hostel.insertMany(defaultHostels);
      hostels = await Hostel.find().sort({ name: 1 });
    }

    res.status(200).json({
      status: 'success',
      results: hostels.length,
      data: hostels
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  PATCH /api/hostels/:id
// @access Admin/Staff only
const updateHostelRate = async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount === 'undefined' || isNaN(amount) || amount < 0) {
      return res.status(400).json({ status: 'error', message: 'Please provide a valid fee rate amount.' });
    }

    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      { amount: parseFloat(amount) },
      { new: true }
    );

    if (!hostel) {
      return res.status(404).json({ status: 'error', message: 'Hostel not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Hostel fee rate updated successfully',
      data: hostel
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getAllHostels,
  updateHostelRate
};
