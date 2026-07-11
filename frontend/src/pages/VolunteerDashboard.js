import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyTasks, acceptTask, declineTask, getTaskDetails } from '../services/taskService';

const VolunteerDashboard = () => {
  const { user, getAuthHeader } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [taskToDecline, setTaskToDecline] = useState(null);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await getMyTasks(null, getAuthHeader());
      setTasks(response.data.tasks);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to accept this task?')) return;

    try {
      const response = await acceptTask(taskId, getAuthHeader());
      alert(response.data.message);
      fetchMyTasks(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept task');
    }
  };

  const openDeclineModal = (taskId) => {
    setTaskToDecline(taskId);
    setShowDeclineModal(true);
  };

  const handleDeclineTask = async () => {
    if (!taskToDecline) return;

    try {
      const response = await declineTask(taskToDecline, declineReason, getAuthHeader());
      alert(response.data.message);
      setShowDeclineModal(false);
      setDeclineReason('');
      setTaskToDecline(null);
      fetchMyTasks(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline task');
    }
  };

  const handleViewDetails = async (taskId) => {
    try {
      const response = await getTaskDetails(taskId, getAuthHeader());
      setSelectedTask(response.data.task);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch task details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned':
        return '#FFA500'; // Orange
      case 'Confirmed':
        return '#4CAF50'; // Green
      case 'InProgress':
        return '#2196F3'; // Blue
      case 'Completed':
        return '#9E9E9E'; // Grey
      default:
        return '#000';
    }
  };

  // Calculate statistics
  const getTaskStats = () => {
    return {
      total: tasks.length,
      assigned: tasks.filter(t => t.status === 'Assigned').length,
      confirmed: tasks.filter(t => t.status === 'Confirmed').length,
      inProgress: tasks.filter(t => t.status === 'InProgress').length,
      completed: tasks.filter(t => t.status === 'Completed').length
    };
  };

  const stats = getTaskStats();

  // Get upcoming task
  const getUpcomingTask = () => {
    const upcoming = tasks
      .filter(t => t.status === 'Confirmed' || t.status === 'Assigned')
      .sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart));
    return upcoming[0] || null;
  };

  const upcomingTask = getUpcomingTask();

  if (loading) return <div style={styles.loading}>Loading your tasks...</div>;

  return (
    <div style={styles.container}>
      {/* Welcome Header */}
      <div style={styles.welcomeSection}>
        <div>
          <h1 style={styles.welcomeTitle}>Welcome back, {user?.name}!</h1>
          <p style={styles.welcomeSubtitle}>Here's your volunteer dashboard overview</p>
        </div>
        <div style={styles.volunteerBadge}>
          <span style={styles.badgeText}>Corporate Volunteer</span>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Statistics Cards */}
      {tasks.length > 0 && (
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, ...styles.statCardTotal}}>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Tasks</div>
            </div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardAssigned}}>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.assigned}</div>
              <div style={styles.statLabel}>Pending Review</div>
            </div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardConfirmed}}>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.confirmed}</div>
              <div style={styles.statLabel}>Accepted</div>
            </div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardCompleted}}>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.completed}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Task Highlight */}
      {upcomingTask && (
        <div style={styles.upcomingSection}>
          <h3 style={styles.sectionTitle}>Next Upcoming Task</h3>
          <div style={styles.upcomingCard}>
            <div style={styles.upcomingHeader}>
              <div>
                <h4 style={styles.upcomingTitle}>{upcomingTask.title}</h4>
                <p style={styles.upcomingCategory}>{upcomingTask.category}</p>
              </div>
              <span style={{...styles.statusBadge, backgroundColor: getStatusColor(upcomingTask.status)}}>
                {upcomingTask.status}
              </span>
            </div>
            <div style={styles.upcomingDetails}>
              <div style={styles.upcomingDetailItem}>
                <span>Date: {new Date(upcomingTask.scheduledStart).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}</span>
              </div>
              <div style={styles.upcomingDetailItem}>
                <span>Time: {new Date(upcomingTask.scheduledStart).toLocaleTimeString([], {
                  hour: '2-digit', minute: '2-digit'
                })} - {new Date(upcomingTask.scheduledEnd).toLocaleTimeString([], {
                  hour: '2-digit', minute: '2-digit'
                })}</span>
              </div>
              <div style={styles.upcomingDetailItem}>
                <span>Person: {upcomingTask.personInNeed?.name}</span>
              </div>
            </div>
            <button
              onClick={() => handleViewDetails(upcomingTask._id)}
              style={styles.upcomingButton}
            >
              View Full Details →
            </button>
          </div>
        </div>
      )}

      {/* Main Tasks Section */}
      <h2 style={styles.mainTitle}>
        {tasks.length > 0 ? 'All My Tasks' : 'My Volunteer Tasks'}
      </h2>

      {tasks.length === 0 ? (
        <div style={styles.noTasks}>
          <h3 style={styles.emptyStateTitle}>No Tasks Assigned Yet</h3>
          <p style={styles.emptyStateText}>
            You don't have any volunteer tasks at the moment.
          </p>
          <div style={styles.emptyStateInstructions}>
            <p><strong>What happens next?</strong></p>
            <ol style={styles.instructionsList}>
              <li>A CSR Representative will review service requests from people in need</li>
              <li>They will match your skills and availability with suitable opportunities</li>
              <li>Once assigned, tasks will appear here with all the details</li>
              <li>You'll be able to accept or decline each assignment</li>
            </ol>
          </div>
          <div style={styles.emptyStateInfo}>
            <p><strong>Tip:</strong> Make sure your profile is complete with your skills and availability to get matched with the best opportunities!</p>
          </div>
        </div>
      ) : (
        <div style={styles.taskGrid}>
          {tasks.map(task => (
            <div key={task._id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <h3 style={styles.taskTitle}>{task.title}</h3>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(task.status)
                  }}
                >
                  {task.status}
                </span>
              </div>

              <div style={styles.taskDetails}>
                <p><strong>Category:</strong> {task.category}</p>
                <p><strong>Scheduled:</strong> {new Date(task.scheduledStart).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(task.scheduledStart).toLocaleTimeString()} - {new Date(task.scheduledEnd).toLocaleTimeString()}</p>
                <p><strong>Person in Need:</strong> {task.personInNeed?.name}</p>
                <p><strong>CSR Rep:</strong> {task.csrRep?.name} ({task.csrRep?.company})</p>

                {task.status !== 'Assigned' && task.address && (
                  <p><strong>Address:</strong> {task.address}</p>
                )}
              </div>

              <div style={styles.taskActions}>
                <button
                  onClick={() => handleViewDetails(task._id)}
                  style={styles.btnSecondary}
                >
                  View Details
                </button>

                {task.status === 'Assigned' && (
                  <>
                    <button
                      onClick={() => handleAcceptTask(task._id)}
                      style={styles.btnAccept}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => openDeclineModal(task._id)}
                      style={styles.btnDecline}
                    >
                      Decline
                    </button>
                  </>
                )}

                {task.status === 'Confirmed' && (
                  <button
                    onClick={() => window.location.href = `/tasks/${task._id}/complete`}
                    style={styles.btnPrimary}
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div style={styles.modal} onClick={() => setSelectedTask(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedTask.title}</h3>
            <p><strong>Description:</strong> {selectedTask.description}</p>
            <p><strong>Category:</strong> {selectedTask.category}</p>
            <p><strong>Status:</strong> {selectedTask.status}</p>
            <p><strong>Scheduled:</strong> {new Date(selectedTask.scheduledStart).toLocaleString()}</p>
            <p><strong>Duration:</strong> {new Date(selectedTask.scheduledEnd).toLocaleString()}</p>
            <p><strong>Address:</strong> {selectedTask.address}</p>
            <p><strong>Required Skills:</strong> {selectedTask.requiredSkills?.join(', ') || 'None specified'}</p>
            <p><strong>Views:</strong> {selectedTask.viewCount}</p>
            <button onClick={() => setSelectedTask(null)} style={styles.btnClose}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div style={styles.modal} onClick={() => setShowDeclineModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Decline Task</h3>
            <p>Please provide a reason for declining this task (optional):</p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining..."
              style={styles.textarea}
              rows="4"
            />
            <div style={styles.modalActions}>
              <button onClick={handleDeclineTask} style={styles.btnDecline}>
                Confirm Decline
              </button>
              <button onClick={() => setShowDeclineModal(false)} style={styles.btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#f5f7fa'
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  welcomeTitle: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    color: '#1a202c',
    fontWeight: '600'
  },
  welcomeSubtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#718096'
  },
  volunteerBadge: {
    backgroundColor: '#4299e1',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600'
  },
  badgeText: {
    fontSize: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
    borderLeft: '4px solid'
  },
  statCardTotal: {
    borderLeftColor: '#667eea'
  },
  statCardAssigned: {
    borderLeftColor: '#f6ad55'
  },
  statCardConfirmed: {
    borderLeftColor: '#48bb78'
  },
  statCardCompleted: {
    borderLeftColor: '#9f7aea'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d3748',
    lineHeight: 1.2
  },
  statLabel: {
    fontSize: '14px',
    color: '#718096',
    marginTop: '4px',
    fontWeight: '500'
  },
  upcomingSection: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#2d3748',
    marginBottom: '15px',
    fontWeight: '600'
  },
  upcomingCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '2px solid #4299e1'
  },
  upcomingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0'
  },
  upcomingTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    color: '#2d3748',
    fontWeight: '600'
  },
  upcomingCategory: {
    margin: 0,
    fontSize: '14px',
    color: '#718096'
  },
  upcomingDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  upcomingDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    color: '#4a5568'
  },
  upcomingButton: {
    padding: '12px 24px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    width: '100%',
    transition: 'background-color 0.2s'
  },
  mainTitle: {
    fontSize: '24px',
    color: '#2d3748',
    marginBottom: '20px',
    fontWeight: '600'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px'
  },
  error: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  noTasks: {
    textAlign: 'center',
    padding: '60px 40px',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '2px dashed #cbd5e0',
    maxWidth: '800px',
    margin: '40px auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  emptyStateTitle: {
    color: '#333',
    fontSize: '24px',
    marginBottom: '10px'
  },
  emptyStateText: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '30px'
  },
  emptyStateInstructions: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'left',
    border: '1px solid #e0e0e0'
  },
  instructionsList: {
    textAlign: 'left',
    paddingLeft: '20px',
    lineHeight: '1.8',
    color: '#555'
  },
  emptyStateInfo: {
    backgroundColor: '#e3f2fd',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #90caf9',
    fontSize: '14px'
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px',
    marginTop: '20px'
  },
  taskCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    borderBottom: '2px solid #edf2f7',
    paddingBottom: '12px'
  },
  taskTitle: {
    margin: 0,
    fontSize: '19px',
    color: '#2d3748',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  taskDetails: {
    marginBottom: '18px',
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#4a5568'
  },
  taskActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '16px'
  },
  btnPrimary: {
    padding: '10px 20px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    minWidth: '120px'
  },
  btnSecondary: {
    padding: '10px 20px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    minWidth: '120px'
  },
  btnAccept: {
    padding: '10px 20px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    minWidth: '100px'
  },
  btnDecline: {
    padding: '10px 20px',
    backgroundColor: '#f56565',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    minWidth: '100px'
  },
  btnClose: {
    padding: '12px 24px',
    backgroundColor: '#718096',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '15px',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '16px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    marginBottom: '15px',
    fontFamily: 'inherit'
  },
  modalActions: {
    display: 'flex',
    gap: '10px'
  }
};

export default VolunteerDashboard;
