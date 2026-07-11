const Task = require('../models/Task');
const User = require('../models/User');
const AssignmentDecision = require('../models/AssignmentDecision');
const AuditLog = require('../models/AuditLog');

// @desc    CSR Rep assigns a task to a Corporate Volunteer
// @route   POST /api/tasks/:id/assign
// @access  Private (CSR_REP only)
const assignTaskToVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const taskId = req.params.id;

    // Validate task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Validate task is available
    if (task.status !== 'Available') {
      return res.status(400).json({ message: 'Task is not available for assignment' });
    }

    // Validate volunteer exists and has correct role
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (volunteer.role !== 'CORPORATE_VOLUNTEER') {
      return res.status(400).json({ message: 'User is not a corporate volunteer' });
    }

    if (!volunteer.profileCompleted) {
      return res.status(400).json({ message: 'Volunteer profile is incomplete' });
    }

    // Assign task
    task.assignedTo = volunteerId;
    task.csrRep = req.user._id;
    task.status = 'Assigned';
    await task.save();

    // Log audit trail
    await AuditLog.logAction(
      req.user._id,
      'TASK_ASSIGNED',
      'Task',
      taskId,
      { volunteerId, volunteerName: volunteer.name },
      req
    );

    // Schedule timeout job (48 hours)
    // This will be handled by a background job scheduler
    const timeoutDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

    res.status(200).json({
      message: 'Task assigned successfully',
      task,
      timeoutDate
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Corporate Volunteer accepts a task assignment
// @route   POST /api/tasks/:id/accept
// @access  Private (CORPORATE_VOLUNTEER only)
const acceptTaskAssignment = async (req, res) => {
  try {
    const taskId = req.params.id;
    const volunteerId = req.user._id;

    // Validate task exists
    const task = await Task.findById(taskId).populate('csrRep', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Validate task is assigned to this volunteer
    if (task.assignedTo.toString() !== volunteerId.toString()) {
      return res.status(403).json({ message: 'This task is not assigned to you' });
    }

    // Validate task status
    if (task.status !== 'Assigned') {
      return res.status(400).json({ message: 'Task cannot be accepted in current state' });
    }

    // Use atomic update to prevent race conditions
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, status: 'Assigned', assignedTo: volunteerId },
      {
        $set: {
          status: 'Confirmed',
          confirmedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).populate('csrRep personInNeed', 'name email');

    if (!updatedTask) {
      return res.status(409).json({ message: 'Task was already accepted by another volunteer' });
    }

    // Record decision
    await AssignmentDecision.create({
      taskId,
      volunteerId,
      decision: 'Accept',
      timestamp: new Date()
    });

    // Log audit trail
    await AuditLog.logAction(
      volunteerId,
      'TASK_ACCEPTED',
      'Task',
      taskId,
      { taskTitle: task.title },
      req
    );

    // TODO: Send notification to CSR Rep
    // This will be handled by the notification service

    res.status(200).json({
      message: 'Task accepted successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error accepting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Corporate Volunteer declines a task assignment
// @route   POST /api/tasks/:id/decline
// @access  Private (CORPORATE_VOLUNTEER only)
const declineTaskAssignment = async (req, res) => {
  try {
    const taskId = req.params.id;
    const volunteerId = req.user._id;
    const { reason } = req.body;

    // Validate task exists
    const task = await Task.findById(taskId).populate('csrRep', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Validate task is assigned to this volunteer
    if (task.assignedTo.toString() !== volunteerId.toString()) {
      return res.status(403).json({ message: 'This task is not assigned to you' });
    }

    // Validate task status
    if (task.status !== 'Assigned') {
      return res.status(400).json({ message: 'Task cannot be declined in current state' });
    }

    // Update task status
    task.status = 'Declined';
    task.assignedTo = null;
    await task.save();

    // Record decision
    await AssignmentDecision.create({
      taskId,
      volunteerId,
      decision: 'Decline',
      reason: reason || 'No reason provided',
      timestamp: new Date()
    });

    // Log audit trail
    await AuditLog.logAction(
      volunteerId,
      'TASK_DECLINED',
      'Task',
      taskId,
      { taskTitle: task.title, reason },
      req
    );

    // Mark task as available for reassignment
    task.status = 'Available';
    await task.save();

    // TODO: Notify CSR Rep of decline

    res.status(200).json({
      message: 'Task declined successfully',
      task
    });
  } catch (error) {
    console.error('Error declining task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get task details
// @route   GET /api/tasks/:id
// @access  Private
const getTaskDetails = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId)
      .populate('personInNeed', 'name email')
      .populate('csrRep', 'name email company')
      .populate('assignedTo', 'name email skills');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Increment view count and track who viewed
    if (!task.viewedBy.includes(req.user._id)) {
      task.viewCount += 1;
      task.viewedBy.push(req.user._id);
      await task.save();
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get tasks assigned to a volunteer
// @route   GET /api/tasks/my-tasks
// @access  Private (CORPORATE_VOLUNTEER only)
const getMyTasks = async (req, res) => {
  try {
    const volunteerId = req.user._id;
    const { status } = req.query;

    let query = { assignedTo: volunteerId };

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('personInNeed', 'name email')
      .populate('csrRep', 'name email company')
      .sort({ scheduledStart: 1 });

    res.status(200).json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching volunteer tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Handle timeout for unresponded tasks (called by scheduler)
// @route   POST /api/tasks/:id/timeout
// @access  Private (System/Admin only)
const handleTaskTimeout = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only process if still in Assigned state
    if (task.status !== 'Assigned') {
      return res.status(400).json({ message: 'Task is not in Assigned state' });
    }

    const volunteerId = task.assignedTo;

    // Record timeout decision
    await AssignmentDecision.create({
      taskId,
      volunteerId,
      decision: 'Timeout',
      reason: 'No response within 48 hours',
      timestamp: new Date()
    });

    // Mark task as available for reassignment
    task.status = 'Available';
    task.assignedTo = null;
    await task.save();

    // Log audit trail
    await AuditLog.logAction(
      volunteerId,
      'TASK_TIMEOUT',
      'Task',
      taskId,
      { taskTitle: task.title },
      req
    );

    // TODO: Notify CSR Rep of timeout

    res.status(200).json({
      message: 'Task timeout processed successfully',
      task
    });
  } catch (error) {
    console.error('Error handling task timeout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  assignTaskToVolunteer,
  acceptTaskAssignment,
  declineTaskAssignment,
  getTaskDetails,
  getMyTasks,
  handleTaskTimeout
};
