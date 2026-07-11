import React, { useState } from 'react';
import { createRequest } from '../services/requestService';
import { useAuth } from '../context/AuthContext';

export default function RequestForm({ onRequestCreated }) {
  const { getAuthHeader } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Medical Escort');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const headers = getAuthHeader();
      await createRequest({ title, category, description }, headers);

      // Reset form fields
      setTitle('');
      setCategory('Medical Escort');
      setDescription('');

      // Notify parent (Dashboard) to refresh the list
      if (onRequestCreated) onRequestCreated();

      alert(' Request created successfully!');
    } catch (err) {
      console.error('Request creation failed:', err);
      alert(' Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '1.2rem',
        background: '#fafafa',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ marginBottom: '0.8rem' }}>
        <label style={{ fontWeight: 600, color: '#333' }}>Title</label>
        <input
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginTop: '0.2rem',
          }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Need wheelchair assistance to clinic"
          required
        />
      </div>

      <div style={{ marginBottom: '0.8rem' }}>
        <label style={{ fontWeight: 600, color: '#333' }}>Category</label>
        <select
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginTop: '0.2rem',
          }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Medical Escort</option>
          <option>Mobility Aid</option>
          <option>Daily Living Support</option>
          <option>Other</option>
        </select>
      </div>

      <div style={{ marginBottom: '0.8rem' }}>
        <label style={{ fontWeight: 600, color: '#333' }}>Description</label>
        <textarea
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginTop: '0.2rem',
            minHeight: '80px',
          }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="I need someone to help bring me to the hospital on Friday morning."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '0.6rem 1rem',
          background: isSubmitting ? '#6c757d' : '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          transition: 'background 0.2s ease',
        }}
      >
        {isSubmitting ? 'Creating...' : 'Create Request'}
      </button>
    </form>
  );
}
