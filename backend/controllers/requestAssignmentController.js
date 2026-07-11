const Request = require('../models/Request');
const Task = require('../models/Task');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    CSR Rep creates a task from a request and assigns to volunteer
// @route   POST /api/requests/:id/assign
// @access  Private (CSR_REP only)
const assignRequestToVolunteer = async (req, res) => {
  try {
    const { volunteerId, scheduledStart, scheduledEnd, address } = req.body;
    const requestId = req.params.id;

    // Validate request exists
    const request = await Request.findById(requestId).populate('createdBy');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Validate request is open or in progress
    if (request.status === 'Completed') {
      return res.status(400).json({ message: 'Request is already completed' });
    }

    // Validate volunteer exists and has correct role
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (volunteer.role !== 'CORPORATE_VOLUNTEER') {
      return res.status(400).json({ message: 'User is not a corporate volunteer' });
    }

    // Set default scheduling if not provided (24 hours from now)
    const defaultStart = scheduledStart || new Date(Date.now() + 24 * 60 * 60 * 1000);
    const defaultEnd = scheduledEnd || new Date(Date.now() + 26 * 60 * 60 * 1000);

    // Create a Task from the Request
    const task = await Task.create({
      title: request.title,
      description: request.description,
      address: address || 'To be determined',
      category: request.category,
      scheduledStart: defaultStart,
      scheduledEnd: defaultEnd,
      requiredSkills: [request.category],
      status: 'Assigned',
      requestId: request._id,
      personInNeed: request.createdBy._id,
      csrRep: req.user._id,
      assignedTo: volunteerId
    });

    // Update request status
    request.status = 'In Progress';
    request.matchedTo = volunteerId;
    await request.save();

    // Log audit trail
    await AuditLog.logAction(
      req.user._id,
      'TASK_ASSIGNED',
      'Task',
      task._id,
      { volunteerId, volunteerName: volunteer.name, requestId: request._id },
      req
    );

    res.status(200).json({
      message: 'Task created and assigned successfully',
      task,
      request
    });
  } catch (error) {
    console.error('Error assigning request to volunteer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  assignRequestToVolunteer
};
