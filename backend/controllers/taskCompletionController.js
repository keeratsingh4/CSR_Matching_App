const Task = require('../models/Task');
const VolunteerHourLog = require('../models/VolunteerHourLog');
const AuditLog = require('../models/AuditLog');

// ────────────────────────────────
// Corporate Volunteer completes a task
// ────────────────────────────────
const completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const volunteerId = req.user._id;
    const { hours, notes, proofType, proofUrl } = req.body;

    // Validate hours range
    if (!hours || hours < 0.5 || hours > 24) {
      return res.status(400).json({ message: 'Hours must be between 0.5 and 24' });
    }

    // Validate task
    const task = await Task.findById(taskId)
      .populate('csrRep', 'name email')
      .populate('personInNeed', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Ensure assigned volunteer
    if (task.assignedTo.toString() !== volunteerId.toString()) {
      return res.status(403).json({ message: 'This task is not assigned to you' });
    }

    // Check status
    if (!['Confirmed', 'InProgress'].includes(task.status)) {
      return res.status(400).json({
        message: 'Task must be in Confirmed or InProgress status to be completed'
      });
    }

    // Update task completion
    task.status = 'Completed';
    task.completedAt = new Date();
    task.actualHours = hours;
    await task.save();

    // Create hour log
    const hourLog = await VolunteerHourLog.create({
      taskId,
      volunteerId,
      hours,
      notes: notes || '',
      proofType: proofType || 'None',
      proofUrl: proofUrl || null,
      verified: false,
      disputed: false,
      timestamp: new Date()
    });

    // Log audit
    await AuditLog.logAction(
      volunteerId,
      'TASK_COMPLETED',
      'Task',
      taskId,
      {
        taskTitle: task.title,
        hours,
        hourLogId: hourLog._id
      },
      req
    );

    res.status(200).json({
      message: 'Task completed successfully',
      task,
      hourLog
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ────────────────────────────────
// Volunteer’s completed tasks history
// ────────────────────────────────
const getCompletedHistory = async (req, res) => {
  try {
    const volunteerId = req.user._id;

    const completedTasks = await Task.find({
      assignedTo: volunteerId,
      status: 'Completed'
    })
      .populate('personInNeed', 'name email')
      .populate('csrRep', 'name email company')
      .sort({ completedAt: -1 });

    const taskIds = completedTasks.map(t => t._id);
    const hourLogs = await VolunteerHourLog.find({
      taskId: { $in: taskIds },
      volunteerId
    });

    // Merge
    const history = completedTasks.map(task => {
      const log = hourLogs.find(l => l.taskId.toString() === task._id.toString());
      return { task, hourLog: log };
    });

    res.status(200).json({ count: history.length, history });
  } catch (error) {
    console.error('Error fetching completed history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ────────────────────────────────
// CSR Rep verifies volunteer hours
// ────────────────────────────────
const verifyVolunteerHours = async (req, res) => {
  try {
    const hourLogId = req.params.id;
    const csrRepId = req.user._id;

    const hourLog = await VolunteerHourLog.findById(hourLogId)
      .populate('taskId')
      .populate('volunteerId', 'name email');
    if (!hourLog) return res.status(404).json({ message: 'Hour log not found' });

    const task = await Task.findById(hourLog.taskId);
    if (task.csrRep.toString() !== csrRepId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to verify this hour log' });
    }

    // Update verification fields
    hourLog.verified = true;
    hourLog.verifiedBy = csrRepId;
    hourLog.verifiedAt = new Date();
    hourLog.disputed = false; // clear dispute if any
    await hourLog.save();

    await AuditLog.logAction(
      csrRepId,
      'HOURS_VERIFIED',
      'VolunteerHourLog',
      hourLogId,
      {
        volunteerId: hourLog.volunteerId._id,
        volunteerName: hourLog.volunteerId.name,
        hours: hourLog.hours
      },
      req
    );

    res.status(200).json({
      message: 'Hours verified successfully',
      hourLog
    });
  } catch (error) {
    console.error('Error verifying hours:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ────────────────────────────────
// CSR Rep disputes volunteer hours
// ────────────────────────────────
const disputeVolunteerHours = async (req, res) => {
  try {
    const hourLogId = req.params.id;
    const csrRepId = req.user._id;
    const { disputeReason } = req.body;

    const hourLog = await VolunteerHourLog.findById(hourLogId)
      .populate('taskId')
      .populate('volunteerId', 'name email');
    if (!hourLog) return res.status(404).json({ message: 'Hour log not found' });

    const task = await Task.findById(hourLog.taskId);
    if (task.csrRep.toString() !== csrRepId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to dispute this hour log' });
    }

    // ✅ Mark as disputed
    hourLog.disputed = true;
    hourLog.disputeReason = disputeReason || 'No reason provided';
    hourLog.disputedAt = new Date();
    hourLog.verified = false;
    await hourLog.save();

    await AuditLog.logAction(
      csrRepId,
      'HOURS_DISPUTED',
      'VolunteerHourLog',
      hourLogId,
      {
        volunteerId: hourLog.volunteerId._id,
        volunteerName: hourLog.volunteerId.name,
        hours: hourLog.hours,
        disputeReason
      },
      req
    );

    res.status(200).json({
      message: 'Hour log disputed successfully',
      hourLog
    });
  } catch (error) {
    console.error('Error disputing hours:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ────────────────────────────────
// CSR Rep company-wide volunteer hour report
// ────────────────────────────────
const getCompanyHourReport = async (req, res) => {
  try {
    const csrRepId = req.user._id;
    const { startDate, endDate, volunteerId } = req.query;

    const tasks = await Task.find({ csrRep: csrRepId });
    const taskIds = tasks.map(t => t._id);

    let query = { taskId: { $in: taskIds } };
    if (volunteerId) query.volunteerId = volunteerId;
    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const hourLogs = await VolunteerHourLog.find(query)
      .populate('volunteerId', 'name email')
      .populate('taskId', 'title category')
      .sort({ timestamp: -1 });

    const totalHours = hourLogs.reduce((sum, log) => sum + log.hours, 0);
    const verifiedHours = hourLogs.filter(l => l.verified).reduce((sum, l) => sum + l.hours, 0);

    res.status(200).json({
      count: hourLogs.length,
      totalHours,
      verifiedHours,
      hourLogs
    });
  } catch (error) {
    console.error('Error fetching company hour report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ────────────────────────────────
module.exports = {
  completeTask,
  getCompletedHistory,
  verifyVolunteerHours,
  disputeVolunteerHours,
  getCompanyHourReport
};
