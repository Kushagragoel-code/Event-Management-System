import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const init = {
  title: '',
  description: '',
  date: '',
  venue: '',
  organizer: '',
  capacity: '',
  category: 'General'
};

function Dashboard() {
  const { user, userRole, token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(init);
  const [edit, setEdit] = useState(null);
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('default');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(null);

  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        const data = await res.json();
        if (data.data) {
          setList(data.data);
        }
      } catch (e) {
        setErr(e.message);
      }
    }
    load();
  }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    let url = `${API_URL}/api/events`;
    let method = 'POST';
    if (edit) {
      url = `${API_URL}/api/events/${edit}`;
      method = 'PUT';
    }

    let headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify({ ...form, capacity: Number(form.capacity) })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Error saving event');
        return;
      }

      if (edit) {
        setList(list.map((ev) => {
          if (ev._id === edit) return data.data;
          return ev;
        }));
        setEdit(null);
      } else {
        setList([data.data, ...list]);
      }
      setForm(init);
    } catch (e) {
      alert(e.message);
    }
  }

  function onEdit(ev) {
    setEdit(ev._id);
    let d = '';
    if (ev.date) {
      d = ev.date.split('T')[0];
    }
    setForm({
      title: ev.title,
      description: ev.description,
      date: d,
      venue: ev.venue,
      organizer: ev.organizer,
      capacity: ev.capacity,
      category: ev.category || 'General'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onDelete(id) {
    if (!confirm('Delete this event?')) return;
    try {
      let headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: headers
      });
      if (!res.ok) {
        alert('Could not delete event');
        return;
      }
      setList(list.filter((ev) => ev._id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  function onCancel() {
    setEdit(null);
    setForm(init);
  }

  async function onRSVP(id) {
    setBusy(id);
    try {
      const res = await fetch(`${API_URL}/api/events/${id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'RSVP failed');
        setBusy(null);
        return;
      }
      setList(list.map((ev) => {
        if (ev._id === id) return data.data;
        return ev;
      }));
      alert('Registered successfully!');
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  }

  function onClear() {
    setCat('All');
    setSort('default');
  }

  function checkReg(ev) {
    if (!user || !ev.attendees) return false;
    const uid = String(user.id || user._id || '');
    for (let att of ev.attendees) {
      let aid = att;
      if (typeof att === 'object' && att !== null) {
        aid = att._id || att.id;
      }
      if (String(aid) === uid) {
        return true;
      }
    }
    return false;
  }

  const cats = ['All', ...new Set(list.map((ev) => ev.category || 'General'))];

  let items = list;
  if (cat !== 'All') {
    items = items.filter((ev) => (ev.category || 'General') === cat);
  }
  if (sort === 'asc') {
    items = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  if (sort === 'desc') {
    items = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  let formTitle = 'Add New Event';
  let formBtn = 'Create Event';
  if (edit) {
    formTitle = 'Edit Event';
    formBtn = 'Update Event';
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Event Dashboard</h1>
        {user && <span className="user-badge">{user.name} ({userRole})</span>}
      </div>

      {isAdmin && (
        <form className="event-form" onSubmit={onSubmit}>
          <h2>{formTitle}</h2>
          <div className="form-grid">
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={onChange}
              required
            />
            <input
              name="venue"
              placeholder="Venue"
              value={form.venue}
              onChange={onChange}
              required
            />
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={onChange}
              required
            />
            <input
              name="organizer"
              placeholder="Organizer"
              value={form.organizer}
              onChange={onChange}
              required
            />
            <input
              name="capacity"
              type="number"
              placeholder="Capacity"
              value={form.capacity}
              onChange={onChange}
              required
            />
            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={onChange}
            />
          </div>
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={onChange}
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {formBtn}
            </button>
            {edit && (
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Category</label>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by Date</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Default</option>
            <option value="asc">Earliest First</option>
            <option value="desc">Latest First</option>
          </select>
        </div>

        <button type="button" className="clear-btn" onClick={onClear}>
          Clear Filters
        </button>
      </div>

      {err && <p className="error">{err}</p>}

      <div className="events-list">
        <h2>Events ({items.length})</h2>
        {items.length === 0 && <p className="empty">No events found.</p>}
        {items.map((ev) => {
          const isReg = checkReg(ev);
          const count = ev.attendees ? ev.attendees.length : 0;
          const isFull = count >= ev.capacity;
          const isBusy = busy === ev._id;

          let btnTxt = 'RSVP';
          if (isBusy) {
            btnTxt = 'Saving...';
          } else if (isReg) {
            btnTxt = 'Registered';
          } else if (isFull) {
            btnTxt = 'Full';
          }

          let canRSVP = true;
          if (isReg || isFull || isBusy || busy !== null) {
            canRSVP = false;
          }

          let dateStr = '';
          if (ev.date) {
            dateStr = new Date(ev.date).toLocaleDateString();
          }

          return (
            <div key={ev._id} className="event-card">
              <div className="event-card-header">
                <div className="card-title-group">
                  <h3>{ev.title}</h3>
                  <span className="badge">{ev.category || 'General'}</span>
                </div>
                {isAdmin && (
                  <div className="card-actions">
                    <button type="button" className="btn-edit" onClick={() => onEdit(ev)}>
                      Edit
                    </button>
                    <button type="button" className="btn-delete" onClick={() => onDelete(ev._id)}>
                      Delete
                    </button>
                  </div>
                )}
                {user && userRole === 'User' && (
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn-rsvp"
                      disabled={!canRSVP}
                      onClick={() => onRSVP(ev._id)}
                    >
                      {btnTxt}
                    </button>
                  </div>
                )}
              </div>
              <p className="desc">{ev.description}</p>
              <div className="event-meta">
                <span><strong>Date:</strong> {dateStr}</span>
                <span><strong>Venue:</strong> {ev.venue}</span>
                <span><strong>Organizer:</strong> {ev.organizer}</span>
                <span><strong>Capacity:</strong> {count} / {ev.capacity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
