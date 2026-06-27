const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const FeeStructure = require('../models/FeeStructure');
const Clearance = require('../models/Clearance');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

const runClearanceEngine = async (studentId, academicSession, transactionId) => {
  try {
    // Check if there is an existing manual override for the student
    const existingClearance = await Clearance.findOne({ student: studentId });
    if (existingClearance && existingClearance.staffOverride && existingClearance.staffOverride.overriddenBy) {
      console.log(`Clearance engine: Student ${studentId} has a manual override (${existingClearance.status}, scope: ${existingClearance.scope}). Skipping automated evaluation.`);
      return;
    }

    // Step 1 — Get total amount paid by student for this session
    const successfulTransactions = await Transaction.find({
      student: studentId,
      academicSession,
      status: 'success',
    });

    const totalPaid = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Step 2 — Get the student's applicable fee structure
    const student = await require('../models/User').findById(studentId);
    let feeStructure = await FeeStructure.findOne({
      academicSession,
      department: student.department,
      studentCategory: student.level || '100 Level',
      isActive: true,
    }).sort({ createdAt: -1 });

    if (!feeStructure) {
      feeStructure = await FeeStructure.findOne({
        academicSession,
        department: student.department,
        isActive: true,
      }).sort({ createdAt: -1 });
    }

    if (!feeStructure) {
      await AuditLog.create({
        eventType: 'clearance_update',
        actingUser: studentId,
        description: `Clearance engine could not find fee structure for session ${academicSession}`,
        metadata: { studentId, academicSession },
      });
      return;
    }

    // Find the student's selected hostel or gender-based default
    const Hostel = require('../models/Hostel');
    const defaultHostelName = student.gender === 'Female' 
      ? 'Mary & Susanna Hall (Female Only) (Standard)'
      : 'Elisha Hall (Shared)';
    const selectedHostelName = student.hostel || defaultHostelName;
    const hostel = await Hostel.findOne({ name: selectedHostelName });
    const hostelAmount = hostel ? hostel.amount : (student.gender === 'Female' ? 250000 : 270000);

    const totalRequired = feeStructure.totalAmount + hostelAmount;
    const outstanding = totalRequired - totalPaid;

    // Step 3 — Determine clearance status and scope
    let status;
    let scope = 'none';
    if (totalPaid >= totalRequired) {
      status = 'cleared';
      scope = 'full';
    } else if (totalPaid >= totalRequired * 0.5) {
      status = 'cleared';
      scope = 'first_semester';
    } else {
      status = 'not_cleared';
      scope = 'none';
    }

    // Step 4 — Generate QR token if cleared
    let verificationToken;
    if (status === 'cleared') {
      verificationToken = crypto.randomUUID();
    }

    // Step 5 — Update or create clearance record
    const clearanceData = {
      student: studentId,
      academicSession,
      status,
      scope,
      triggeringTransaction: transactionId,
      ...(status === 'cleared' && {
        verificationToken,
        clearedAt: new Date(),
      }),
    };

    await Clearance.findOneAndUpdate(
      { student: studentId },
      clearanceData,
      { upsert: true, returnDocument: 'after' }
    );

    // Create Notification
    const statusText = status === 'cleared' 
      ? (scope === 'first_semester' ? 'Cleared (1st Semester Only)' : 'Cleared (Full Session)')
      : 'Not Cleared';
    await Notification.create({
      user: studentId,
      title: 'Clearance Status Updated',
      description: status === 'cleared'
        ? (scope === 'first_semester'
          ? `Congratulations! Your academic session ${academicSession} bursary clearance check is approved for the First Semester. Settle the remaining balance to stay cleared for the Second Semester.`
          : `Congratulations! Your academic session ${academicSession} bursary clearance check is fully approved. Your clear digital certificate is ready for download.`)
        : `Your bursary clearance status is: ${statusText}. Please review your outstanding balance.`,
      type: status === 'cleared' ? 'clearance' : 'system',
      unread: true
    });

    // Step 6 — Log the outcome
    await AuditLog.create({
      eventType: 'clearance_update',
      actingUser: studentId,
      description: `Clearance engine ran for student ${student?.matricNumber} — status: ${status}, scope: ${scope}. Paid: ₦${totalPaid}, Required: ₦${totalRequired}`,
      metadata: { studentId, academicSession, totalPaid, totalRequired, outstanding, status, scope },
    });

    console.log(`Clearance engine: ${student?.matricNumber} → ${status} (${scope}) (paid ₦${totalPaid} of ₦${totalRequired})`);
  } catch (err) {
    console.error('Clearance engine error:', err.message);
  }
};

module.exports = { runClearanceEngine };