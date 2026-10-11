import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import EventForm from '../components/EventForm';
import { getEvents, createEvent, updateEvent, deleteEvent, registerForEvent, cancelRegistration } from '../api/api';

function Dashboard() {
  const { user, userRole, token } = useAuth();
  const isAdmin = userRole === 'Admin';

  // events list aur filters ki state
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // form open/close aur edit state
  const [showForm, setShowForm] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  // events reload karne ke liye function
  const loadEvents = async () => {
    try {
      const data = await getEvents(category, search);
      setEvents(data);
    } catch {
      alert('Failed to load events. Please try again.');
    }
  };

  // category badalne pe ya page start hone pe events fetch honge
  useEffect(() => {
    getEvents(category, '')
      .then((data) => setEvents(data))
      .catch(() => alert('Failed to load events. Please try again.'));
  }, [category]);

  // admin event save ya update karega
  const handleSaveEvent = async (formData) => {
    if (eventToEdit) {
      await updateEvent(eventToEdit._id, formData, token);
    } else {
      await createEvent(formData, token);
    }
    
    // form band karke list refresh kar rahe
    setShowForm(false);
    setEventToEdit(null);
    loadEvents();
  };

  // admin event delete karega
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(id, token);
      loadEvents();
    }
  };

  // edit form open karne ke liye
  const openEditForm = (ev) => {
    const formattedEvent = { ...ev, date: ev.date ? ev.date.split('T')[0] : '' };
    setEventToEdit(formattedEvent);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // user rsvp register karega
  const handleRsvp = async (id) => {
    await registerForEvent(id, token);
    loadEvents();
  };

  // user rsvp cancel karega
  const handleCancelRsvp = async (id) => {
    await cancelRegistration(id, token);
    loadEvents();
  };

  return (
    <section>
      <div className="page-head">
        <h1>Events Dashboard</h1>
        {isAdmin && !showForm && (
          <button className="btn" onClick={() => setShowForm(true)}>+ Create Event</button>
        )}
      </div>

      {/* admin ka add ya edit form */}
      {showForm && (
        <EventForm
          submitLabel={eventToEdit ? 'Update Event' : 'Create Event'}
          initialValues={eventToEdit}
          onSubmit={handleSaveEvent}
          onCancel={() => {
            setShowForm(false);
            setEventToEdit(null);
          }}
        />
      )}

      {/* search aur filter bar */}
      <div className="toolbar">
        <form onSubmit={(e) => { e.preventDefault(); loadEvents(); }}>
          <input 
            placeholder="Search events..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button type="submit" className="btn btn-small">Search</button>
        </form>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="General">General</option>
          <option value="Technical">Technical</option>
          <option value="Cultural">Cultural</option>
        </select>
      </div>

      {/* events list render kar rahe */}
      <div className="grid">
        {events.map((ev) => {
          // check kar rahe user registered hai ya nahi
          const isRegistered = ev.attendees?.some((a) => (a._id || a) === user?.id);
          const isFull = ev.attendees?.length >= ev.capacity;

          return (
            <div key={ev._id} className="card">
              <h2>{ev.title} <span className="badge">{ev.category}</span></h2>
              <p>{ev.description}</p>
              
              <p><strong>Date:</strong> {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD'}</p>
              <p><strong>Venue:</strong> {ev.venue}</p>
              <p><strong>Organizer:</strong> {ev.organizer}</p>
              <p><strong>Seats:</strong> {ev.attendees?.length || 0} / {ev.capacity}</p>

              <div className="actions">
                {isAdmin ? (
                  <>
                    <button className="btn btn-small" onClick={() => openEditForm(ev)}>Edit</button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(ev._id)}>Delete</button>
                  </>
                ) : (
                  <>
                    {isRegistered ? (
                      <button className="btn btn-small btn-danger" onClick={() => handleCancelRsvp(ev._id)}>Cancel RSVP</button>
                    ) : (
                      <button 
                        className="btn btn-small btn-primary" 
                        disabled={isFull} 
                        onClick={() => handleRsvp(ev._id)}
                      >
                        {isFull ? 'Sold Out' : 'RSVP Now'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Dashboard;
