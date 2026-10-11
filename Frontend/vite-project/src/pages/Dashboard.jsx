import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const [list, setlist] = useState([]);
  const [form, setform] = useState(init);
  const [edit, setedit] = useState(null);
  const [cat, setcat] = useState('All');
  const [sort, setsort] = useState('default');
  const [err, seterr] = useState('');
  const [registeringId, setRegisteringId] = useState(null);

  const adm = userRole === 'Admin';

  useEffect(() => {
    async function get() {
      try {
        const res = await fetch(`${url}/api/events`);
        const data = await res.json();
        if (res.ok && data.data) {
          setlist(data.data);
        } else {
          seterr(data.message || 'Failed to fetch events');
        }
      } catch {
        seterr('Failed to connect to server');
      }
    }
    get();
  }, []);

  function set(e) {
    setform({ ...form, [e.target.name]: e.target.value });
  }

  async function sub(e) {
    e.preventDefault();
    let api = `${url}/api/events`;
    let req = 'POST';
    if (edit) {
      api = `${url}/api/events/${edit}`;
      req = 'PUT';
    }

    let head = { 'Content-Type': 'application/json' };
    if (token) {
      head.Authorization = `Bearer ${token}`;
    }

    try {
      const res = await fetch(api, {
        method: req,
        headers: head,
        body: JSON.stringify({ ...form, capacity: Number(form.capacity) })
      });
      const data = await res.json();
      if (!res.ok || !data.data) {
        alert(data.message || 'Operation failed');
        return;
      }

      if (edit) {
        setlist((prev) =>
          prev.map((ev) => {
            if (ev._id === edit) return data.data;
            return ev;
          })
        );
        setedit(null);
      } else {
        setlist((prev) => [data.data, ...prev]);
      }
      setform(init);
    } catch {
      alert('Failed to save event');
    }
  }

  function pick(ev) {
    setedit(ev._id);
    let d = '';
    if (ev.date) {
      d = ev.date.split('T')[0];
    }
    setform({
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

  async function del(id) {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    let head = {};
    if (token) {
      head.Authorization = `Bearer ${token}`;
    }
    try {
      const res = await fetch(`${url}/api/events/${id}`, {
        method: 'DELETE',
        headers: head
      });
      const data = await res.json();
      if (res.ok) {
        setlist((prev) => prev.filter((ev) => ev._id !== id));
      } else {
        alert(data.message || 'Failed to delete event');
      }
    } catch {
      alert('Failed to delete event');
    }
  }

  function stop() {
    setedit(null);
    setform(init);
  }

  async function rsvp(id) {
    try {
      setRegisteringId(id);
      const res = await fetch(`${url}/api/events/${id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setlist((prev) =>
          prev.map((ev) => {
            if (ev._id === id) return data.data;
            return ev;
          })
        );
        alert(data.message || 'Registered for event successfully');
      } else {
        alert(data.message || 'Failed to register for event');
      }
    } catch {
      alert('Failed to register for event');
    } finally {
      setRegisteringId(null);
    }
  }

  function wipe() {
    setcat('All');
    setsort('default');
  }

  function done(ev) {
    if (!user) return false;
    if (!ev.attendees) return false;
    let me = String(user.id || user._id || '');
    for (let att of ev.attendees) {
      let id = att;
      if (typeof att === 'object' && att !== null) {
        id = att._id || att.id;
      }
      if (String(id) === me) {
        return true;
      }
    }
    return false;
  }

  const cats = ['All', ...new Set(list.map((ev) => ev.category || 'General'))];

  let rows = list;
  if (cat !== 'All') {
    rows = rows.filter((ev) => (ev.category || 'General') === cat);
  }
  if (sort === 'asc') {
    rows = [...rows].sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  if (sort === 'desc') {
    rows = [...rows].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  let head = 'Add New Event';
  let btn = 'Create Event';
  if (edit) {
    head = 'Edit Event';
    btn = 'Update Event';
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Event Dashboard</h1>
        {user && <span className="user-badge">{user.name} ({userRole})</span>}
      </div>

      {adm && (
        <form className="event-form" onSubmit={sub}>
          <h2>{head}</h2>
          <div className="form-grid">
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={set}
              required
            />
            <input
              name="venue"
              placeholder="Venue"
              value={form.venue}
              onChange={set}
              required
            />
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={set}
              required
            />
            <input
              name="organizer"
              placeholder="Organizer"
              value={form.organizer}
              onChange={set}
              required
            />
            <input
              name="capacity"
              type="number"
              placeholder="Capacity"
              value={form.capacity}
              onChange={set}
              required
            />
            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={set}
            />
          </div>
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={set}
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {btn}
            </button>
            {edit && (
              <button type="button" className="btn-secondary" onClick={stop}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Category</label>
          <select value={cat} onChange={(e) => setcat(e.target.value)}>
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by Date</label>
          <select value={sort} onChange={(e) => setsort(e.target.value)}>
            <option value="default">Default</option>
            <option value="asc">Earliest First</option>
            <option value="desc">Latest First</option>
          </select>
        </div>

        <button type="button" className="clear-btn" onClick={wipe}>
          Clear Filters
        </button>
      </div>

      {err && <p className="error">{err}</p>}

      <div className="events-list">
        <h2>Events ({rows.length})</h2>
        {rows.length === 0 && <p className="empty">No events found.</p>}
        {rows.map((ev) => {
          const reg = done(ev);
          let num = 0;
          if (ev.attendees) {
            num = ev.attendees.length;
          }
          const full = num >= ev.capacity;
          const isBusy = registeringId === ev._id;

          let txt = 'RSVP';
          if (isBusy) {
            txt = 'Registering...';
          } else if (reg) {
            txt = 'Registered';
          } else if (full) {
            txt = 'Full';
          }

          let dis = false;
          if (reg || full || isBusy || registeringId !== null) {
            dis = true;
          }

          let date = '';
          if (ev.date) {
            date = new Date(ev.date).toLocaleDateString();
          }

          return (
            <div key={ev._id} className="event-card">
              <div className="event-card-header">
                <div className="card-title-group">
                  <h3>{ev.title}</h3>
                  <span className="badge">{ev.category || 'General'}</span>
                </div>
                {adm && (
                  <div className="card-actions">
                    <button type="button" className="btn-edit" onClick={() => pick(ev)}>
                      Edit
                    </button>
                    <button type="button" className="btn-delete" onClick={() => del(ev._id)}>
                      Delete
                    </button>
                  </div>
                )}
                {user && userRole === 'User' && (
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn-rsvp"
                      disabled={dis}
                      onClick={() => rsvp(ev._id)}
                    >
                      {txt}
                    </button>
                  </div>
                )}
              </div>
              <p className="desc">{ev.description}</p>
              <div className="event-meta">
                <span><strong>Date:</strong> {date}</span>
                <span><strong>Venue:</strong> {ev.venue}</span>
                <span><strong>Organizer:</strong> {ev.organizer}</span>
                <span><strong>Capacity:</strong> {num} / {ev.capacity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
