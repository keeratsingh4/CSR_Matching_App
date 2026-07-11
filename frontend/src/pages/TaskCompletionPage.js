import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTaskDetails, completeTask } from '../services/taskService';

const TaskCompletionPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [proofType, setProofType] = useState('None');
  const [proofUrl, setProofUrl] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await getTaskDetails(taskId, getAuthHeader());
      setTask(response.data.task);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum < 0.5 || hoursNum > 24) {
      alert('Please enter valid hours between 0.5 and 24');
      return;
    }

    if (!window.confirm(`Are you sure you want to mark this task as complete with ${hours} hours logged?`)) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await completeTask(
        taskId,
        hoursNum,
        notes,
        proofType,
        proofUrl,
        getAuthHeader()
      );

      alert(response.data.message);
      navigate('/volunteer-dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete task');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading task details...</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={() => navigate('/volunteer-dashboard')} style={styles.btnSecondary}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!task) {
    return <div style={styles.container}>Task not found</div>;
  }

  return (
    <div style={styles.container}>
      <h2>Complete Task</h2>

      <div style={styles.taskSummary}>
        <h3>{task.title}</h3>
        <p><strong>Description:</strong> {task.description}</p>
        <p><strong>Category:</strong> {task.category}</p>
        <p><strong>Scheduled:</strong> {new Date(task.scheduledStart).toLocaleString()}</p>
        <p><strong>Person in Need:</strong> {task.personInNeed?.name}</p>
        <p><strong>Address:</strong> {task.address}</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>Log Your Hours</h3>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Hours Spent <span style={styles.required}>*</span>
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            style={styles.input}
            placeholder="e.g., 2.5"
          />
          <small style={styles.helpText}>Enter hours between 0.5 and 24</small>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.textarea}
            rows="4"
            placeholder="Add any notes about the task completion..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Proof of Completion (Optional)</label>
          <select
            value={proofType}
            onChange={(e) => setProofType(e.target.value)}
            style={styles.select}
          >
            <option value="None">None</option>
            <option value="Photo">Photo</option>
            <option value="Document">Document</option>
          </select>
        </div>

        {proofType !== 'None' && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Proof URL</label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              style={styles.input}
              placeholder="https://..."
            />
            <small style={styles.helpText}>Upload your proof elsewhere and paste the URL here</small>
          </div>
        )}

        <div style={styles.formActions}>
          <button
            type="submit"
            disabled={submitting}
            style={styles.btnPrimary}
          >
            {submitting ? 'Submitting...' : 'Complete Task'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/volunteer-dashboard')}
            style={styles.btnSecondary}
          >
            Cancel
          </button>
        </div>
      </form>

      <div style={styles.infoBox}>
        <h4>Important Information:</h4>
        <ul>
          <li>Your CSR Representative will be notified of the completion</li>
          <li>Hours will be added to your volunteer history</li>
          <li>Your CSR Rep can verify or dispute the logged hours</li>
          <li>Provide accurate information for proper tracking</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px'
  },
  error: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  taskSummary: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px'
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333'
  },
  required: {
    color: '#f44336'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  helpText: {
    display: 'block',
    marginTop: '5px',
    fontSize: '12px',
    color: '#666'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '30px'
  },
  btnPrimary: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  },
  btnSecondary: {
    padding: '12px 24px',
    backgroundColor: '#9E9E9E',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '30px',
    border: '1px solid #2196F3'
  }
};

export default TaskCompletionPage;
