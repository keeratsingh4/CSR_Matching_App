import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { assignTask } from '../services/taskService';

export default function CSRDashboard() {
  const { getAuthHeader } = useAuth();
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchVolunteers();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await API.get('/requests', { headers: getAuthHeader() });
      setRequests(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await API.get('/auth/users', { headers: getAuthHeader() });
      // Filter only corporate volunteers
      const cvList = response.data.filter(user => user.role === 'CORPORATE_VOLUNTEER');
      setVolunteers(cvList);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
    }
  };

  const handleOpenAssignModal = (request) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  const handleAssignVolunteer = async (volunteerId) => {
    if (!selectedRequest) return;

    if (!window.confirm('Are you sure you want to assign this volunteer to the task?')) {
      return;
    }

    try {
      await assignTask(selectedRequest._id, volunteerId, getAuthHeader());
      alert('Task assigned successfully!');
      setShowAssignModal(false);
      setSelectedRequest(null);
      fetchRequests(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return '#28a745'; // Green
      case 'Matched':
        return '#007bff'; // Blue
      case 'Completed':
        return '#6c757d'; // Gray
      default:
        return '#ffc107'; // Yellow
    }
  };

  if (loading) return <div style={styles.loading}>Loading CSR Dashboard...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>CSR Representative Dashboard</h2>
      <p style={styles.subtitle}>Manage volunteer opportunities and assign tasks</p>

      {error && <div style={styles.error}>{error}</div>}

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '36px' }}>
            {requests.filter(r => r.status === 'Open').length}
          </h3>
          <p style={{ color: 'white', margin: 0 }}>Open Requests</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '36px' }}>
            {requests.filter(r => r.status === 'Matched').length}
          </h3>
          <p style={{ color: 'white', margin: 0 }}>Matched Requests</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '36px' }}>
            {volunteers.length}
          </h3>
          <p style={{ color: 'white', margin: 0 }}>Available Volunteers</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '36px' }}>
            {requests.filter(r => r.status === 'Completed').length}
          </h3>
          <p style={{ color: 'white', margin: 0 }}>Completed Services</p>
        </div>
      </div>

      {/* Request List */}
      <div style={styles.requestSection}>
        <h3>Service Requests</h3>
        {requests.length === 0 ? (
          <div style={styles.noRequests}>
            <p>No service requests available.</p>
          </div>
        ) : (
          <div style={styles.requestGrid}>
            {requests.map(request => (
              <div key={request._id} style={styles.requestCard}>
                <div style={styles.requestHeader}>
                  <h4 style={styles.requestTitle}>{request.title}</h4>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(request.status)
                    }}
                  >
                    {request.status}
                  </span>
                </div>

                <div style={styles.requestBody}>
                  <p><strong>Category:</strong> {request.category}</p>
                  <p><strong>Requester:</strong> {request.createdBy?.name}</p>
                  <p><strong>Description:</strong> {request.description}</p>
                  <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                </div>

                <div style={styles.requestActions}>
                  <button
                    onClick={() => handleOpenAssignModal(request)}
                    style={styles.btnAssign}
                    disabled={request.status === 'Completed'}
                  >
                    {request.status === 'Matched' ? 'Reassign Volunteer' : 'Assign Volunteer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Volunteer Modal */}
      {showAssignModal && selectedRequest && (
        <div style={styles.modal} onClick={() => setShowAssignModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Assign Volunteer to Task</h3>
            <div style={styles.taskInfo}>
              <p><strong>Task:</strong> {selectedRequest.title}</p>
              <p><strong>Category:</strong> {selectedRequest.category}</p>
              <p><strong>Description:</strong> {selectedRequest.description}</p>
            </div>

            <h4 style={{ marginTop: '1.5rem' }}>Select a Volunteer:</h4>

            {volunteers.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: '#666' }}>
                No corporate volunteers available.
              </p>
            ) : (
              <div style={styles.volunteerList}>
                {volunteers.map(volunteer => (
                  <div key={volunteer._id} style={styles.volunteerCard}>
                    <div style={styles.volunteerInfo}>
                      <strong>{volunteer.name}</strong>
                      <span style={styles.volunteerEmail}>{volunteer.email}</span>
                      {volunteer.company && (
                        <span style={styles.volunteerCompany}>
                          {volunteer.company}
                        </span>
                      )}
                      {volunteer.skills && volunteer.skills.length > 0 && (
                        <div style={styles.skillTags}>
                          {volunteer.skills.map((skill, idx) => (
                            <span key={idx} style={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleAssignVolunteer(volunteer._id)}
                      style={styles.btnSelectVolunteer}
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAssignModal(false)}
              style={styles.btnClose}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px'
  },
  title: {
    textAlign: 'center',
    color: '#007bff',
    marginBottom: '0.5rem'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem'
  },
  error: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  requestSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  noRequests: {
    textAlign: 'center',
    padding: '50px',
    color: '#666',
    fontStyle: 'italic'
  },
  requestGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  requestCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px'
  },
  requestTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#333'
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  requestBody: {
    marginBottom: '15px',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  requestActions: {
    display: 'flex',
    gap: '10px'
  },
  btnAssign: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1
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
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  taskInfo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '10px'
  },
  volunteerList: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  volunteerCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  },
  volunteerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  volunteerEmail: {
    fontSize: '14px',
    color: '#666'
  },
  volunteerCompany: {
    fontSize: '13px',
    color: '#007bff'
  },
  skillTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginTop: '5px'
  },
  skillTag: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px'
  },
  btnSelectVolunteer: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  btnClose: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%'
  }
};
