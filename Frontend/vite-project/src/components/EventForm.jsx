import { useState } from 'react';

// admin ke liye create aur edit ka common form
function EventForm({ initialValues, submitLabel = 'Save Event', onSubmit, onCancel }) {
  // edit ho raha hai to purana data load karenge, nahi to blank state
  const [eventData, setEventData] = useState(initialValues || {
    title: '', description: '', date: '', venue: '', organizer: '', capacity: '', category: 'General'
  });

  // saare input fields ka data update karne ke liye
  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // submit dabane pe parent function call hoga
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...eventData, capacity: Number(eventData.capacity) });
  };

  return (
    <form className="form event-form-card" onSubmit={handleSubmit}>
      <h3>{submitLabel}</h3>

      <input name="title" value={eventData.title} onChange={handleChange} placeholder="Event Title" required />
      
      <select name="category" value={eventData.category} onChange={handleChange}>
        <option>General</option>
        <option>Technical</option>
        <option>Cultural</option>
        <option>Sports</option>
        <option>Workshop</option>
      </select>

      <input type="date" name="date" value={eventData.date} onChange={handleChange} required />
      <input name="venue" value={eventData.venue} onChange={handleChange} placeholder="Venue Name" required />
      <input name="organizer" value={eventData.organizer} onChange={handleChange} placeholder="Organizer Name" required />
      <input type="number" name="capacity" value={eventData.capacity} onChange={handleChange} placeholder="Max Capacity" required />
      
      <textarea name="description" value={eventData.description} onChange={handleChange} placeholder="Event Description..." required />

      <div className="actions">
        <button type="submit" className="btn">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}

export default EventForm;
