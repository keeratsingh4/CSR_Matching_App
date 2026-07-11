const Request = require('../models/Request');

// POST /api/requests
// private (PIN creates request)
async function createRequest(req, res) {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newReq = await Request.create({
      title,
      description,
      category,
      createdBy: req.user._id,
      status: 'Open'
    });

    return res.status(201).json(newReq);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET /api/requests
// public (CSR Rep can browse)
async function listRequests(req, res) {
  try {
    const requests = await Request.find()
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { createRequest, listRequests };
