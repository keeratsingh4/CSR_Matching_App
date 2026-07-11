import api from './api';

// Task Assignment Services (CV-01)
export const getTaskDetails = async (taskId, headers) => {
  return api.get(`/tasks/${taskId}`, { headers });
};

export const getMyTasks = async (status, headers) => {
  const params = status ? { status } : {};
  return api.get('/tasks/my-tasks', { headers, params });
};

export const acceptTask = async (taskId, headers) => {
  return api.post(`/tasks/${taskId}/accept`, {}, { headers });
};

export const declineTask = async (taskId, reason, headers) => {
  return api.post(`/tasks/${taskId}/decline`, { reason }, { headers });
};

export const assignTask = async (requestId, volunteerId, headers) => {
  // This assigns a request to a volunteer (creates a task internally)
  return api.post(`/requests/${requestId}/assign`, { volunteerId }, { headers });
};

export const assignTaskDirect = async (taskId, volunteerId, headers) => {
  // This assigns an existing task to a volunteer
  return api.post(`/tasks/${taskId}/assign`, { volunteerId }, { headers });
};

// Task Completion Services (CV-05)
export const completeTask = async (taskId, hours, notes, proofType, proofUrl, headers) => {
  return api.post(`/tasks/${taskId}/complete`, {
    hours,
    notes,
    proofType,
    proofUrl
  }, { headers });
};

export const getCompletedHistory = async (headers) => {
  return api.get('/tasks/completed-history', { headers });
};

// Hour Log Services
export const verifyHours = async (hourLogId, headers) => {
  return api.post(`/hour-logs/${hourLogId}/verify`, {}, { headers });
};

export const disputeHours = async (hourLogId, disputeReason, headers) => {
  return api.post(`/hour-logs/${hourLogId}/dispute`, { disputeReason }, { headers });
};

export const getCompanyHourReport = async (filters, headers) => {
  return api.get('/hour-logs/company-report', { headers, params: filters });
};
