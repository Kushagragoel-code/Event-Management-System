import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emptyForm = {
  title: '',
  description: '',
  date: '',
  venue: '',
  organizer: '',
  capacity: ''
};

function Dashboard() {
  const { user, userRole, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setEvents(data.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/api/events/${editingId}` : `${API_URL}/api/events`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ...formData, capacity: Number(formData.capacity) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      if (editingId) {
        setEvents(events.map((ev) => (ev._id === editingId ? data.data : ev)));
        setEditingId(null);
      } else {
        setEvents([data.data, ...events]);
      }
      setFormData(emptyForm);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date ? event.date.split('T')[0] : '',
      venue: event.venue,
      organizer: event.organizer,
      capacity: event.capacity
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setEvents(events.filter((ev) => ev._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Event Dashboard</h1>
        {user && <span className="user-badge">Logged in as: {user.name} ({userRole})</span>}
      </div>

      {isAdmin && (
        <form className="event-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Event' : 'Add New Event'}</h2>
          <div className="form-grid">
            <input
              name="title"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <input
              name="venue"
              placeholder="Venue"
              value={formData.venue}
              onChange={handleChange}
              required
            />
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <input
              name="organizer"
              placeholder="Organizer"
              value={formData.organizer}
              onChange={handleChange}
              required
            />
            <input
              name="capacity"
              type="number"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </div>
          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Event' : 'Create Event'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      <div className="events-list">
        <h2>All Events</h2>
        {events.length === 0 ? (
          <p className="empty">No events found.</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-card-header">
                <h3>{event.title}</h3>
                {isAdmin && (
                  <div className="card-actions">
                    <button type="button" className="btn-edit" onClick={() => handleEdit(event)}>
                      Edit
                    </button>
                    <button type="button" className="btn-delete" onClick={() => handleDelete(event._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="desc">{event.description}</p>
              <div className="event-meta">
                <span><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</span>
                <span><strong>Venue:</strong> {event.venue}</span>
                <span><strong>Organizer:</strong> {event.organizer}</span>
                <span><strong>Capacity:</strong> {event.capacity}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
