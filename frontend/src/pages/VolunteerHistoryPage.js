import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCompletedHistory } from '../services/taskService';

const VolunteerHistoryPage = () => {
  const { getAuthHeader } = useAuth();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalHours, setTotalHours] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    from: '',
    to: ''
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getCompletedHistory(getAuthHeader());
      const data = response.data.history || [];

      setHistory(data);
      setFilteredHistory(data);

      // Only sum verified & non-disputed hours
      const total = data.reduce(
        (sum, item) =>
          sum +
          ((item.hourLog?.verified && !item.hourLog?.disputed)
            ? item.hourLog.hours
            : 0),
        0
      );
      setTotalHours(total);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter input change
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    let filtered = [...history];

    if (filters.category) {
      filtered = filtered.filter((item) => item.task.category === filters.category);
    }

    if (filters.from) {
      const fromDate = new Date(filters.from);
      filtered = filtered.filter((item) => new Date(item.task.completedAt) >= fromDate);
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => new Date(item.task.completedAt) <= toDate);
    }

    setFilteredHistory(filtered);

    // Only verified + non-disputed count toward total
    const total = filtered.reduce(
      (sum, item) =>
        sum +
        ((item.hourLog?.verified && !item.hourLog?.disputed)
          ? item.hourLog.hours
          : 0),
      0
    );
    setTotalHours(total);
  };

  const clearFilters = () => {
    setFilters({ category: '', from: '', to: '' });
    setFilteredHistory(history);

    // Recalculate verified total hours
    const total = history.reduce(
      (sum, item) =>
        sum +
        ((item.hourLog?.verified && !item.hourLog?.disputed)
          ? item.hourLog.hours
          : 0),
      0
    );
    setTotalHours(total);
  };

  if (loading) {
    return <div style={styles.loading}>Loading your volunteer history...</div>;
  }

  return (
    <div style={styles.container}>
      <h2>My Volunteer History</h2>

      {error && <div style={styles.error}>{error}</div>}

      {/* --- Filter Section --- */}
      <form onSubmit={applyFilters} style={styles.filterForm}>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          style={styles.select}
        >
          <option value="">All Categories</option>
          <option value="Medical Escort">Medical Escort</option>
          <option value="Mobility Aid">Mobility Aid</option>
          <option value="Daily Living Support">Daily Living Support</option>
          <option value="Transportation">Transportation</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="date"
          name="from"
          value={filters.from}
          onChange={handleFilterChange}
          style={styles.input}
        />

        <input
          type="date"
          name="to"
          value={filters.to}
          onChange={handleFilterChange}
          style={styles.input}
        />

        <button type="submit" style={styles.buttonPrimary}>
          Apply Filters
        </button>
        <button type="button" onClick={clearFilters} style={styles.buttonSecondary}>
          Clear
        </button>
      </form>

      {/* --- Stats --- */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h3>{filteredHistory.length}</h3>
          <p>Completed Tasks</p>
        </div>

        {/* Verified total hours only */}
        <div style={styles.statCard}>
          <h3>{totalHours.toFixed(1)}</h3>
          <p>Verified Total Hours</p>
        </div>

        {/* Show total verified logs (count) */}
        <div style={styles.statCard}>
          <h3>
            {filteredHistory.filter(
              (h) => h.hourLog?.verified && !h.hourLog?.disputed
            ).length}
          </h3>
          <p>Verified Entries</p>
        </div>
      </div>

      {/* --- History List --- */}
      {filteredHistory.length === 0 ? (
        <div style={styles.noHistory}>
          <p>No matching completed tasks found.</p>
        </div>
      ) : (
        <div style={styles.historyList}>
          {filteredHistory.map((item) => {
            const log = item.hourLog;
            const isDisputed = log?.disputed;
            const isVerified = log?.verified;
            const badgeStyle = {
              ...styles.badge,
              backgroundColor: isDisputed
                ? '#f44336' // Red for disputed
                : isVerified
                ? '#4CAF50' // Green for verified
                : '#FF9800' // Orange for pending
            };
            const badgeText = isDisputed
              ? '⚠ Disputed Please Contact Support'
              : isVerified
              ? 'Verified'
              : 'Pending Verification';

            return (
              <div
                key={item.task._id}
                style={{
                  ...styles.historyCard,
                  border: isDisputed ? '2px solid #f44336' : '1px solid #ddd'
                }}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.taskTitle}>{item.task.title}</h3>
                  <span style={styles.completedDate}>
                    {new Date(item.task.completedAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Category:</span>
                    <span>{item.task.category}</span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.label}>Person in Need:</span>
                    <span>{item.task.personInNeed?.name}</span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.label}>CSR Rep:</span>
                    <span>
                      {item.task.csrRep?.name} ({item.task.csrRep?.company})
                    </span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.label}>Hours Logged:</span>
                    <span style={styles.hours}>{log?.hours || 'N/A'} hours</span>
                  </div>

                  {log && (
                    <>
                      <div style={styles.detailRow}>
                        <span style={styles.label}>Verification Status:</span>
                        <span style={badgeStyle}>{badgeText}</span>
                      </div>

                      {isDisputed && log.disputeReason && (
                        <div style={styles.notes}>
                          <strong>Dispute Reason:</strong> {log.disputeReason}
                        </div>
                      )}

                      {log.notes && (
                        <div style={styles.notes}>
                          <strong>Notes:</strong> {log.notes}
                        </div>
                      )}

                      {log.proofType !== 'None' && (
                        <div style={styles.detailRow}>
                          <span style={styles.label}>Proof:</span>
                          <span>{log.proofType}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────── Styles ────────────────────────────────
const styles = {
  container: {
    maxWidth: '1000px',
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
  filterForm: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '25px',
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px'
  },
  select: { padding: '8px', borderRadius: '4px', minWidth: '200px' },
  input: { padding: '8px', borderRadius: '4px' },
  buttonPrimary: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 14px',
    cursor: 'pointer'
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 14px',
    cursor: 'pointer'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  noHistory: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0'
  },
  taskTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#333'
  },
  completedDate: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'bold'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  },
  label: {
    fontWeight: 'bold',
    color: '#555'
  },
  hours: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  badge: {
    padding: '5px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  notes: {
    backgroundColor: '#f5f5f5',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
    fontSize: '14px'
  }
};

export default VolunteerHistoryPage;
