import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State for storing events fetched from API
  const [events, setEvents] = useState([]);

  // State for category filter
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // State for date sorting
  const [sortOrder, setSortOrder] = useState('Default');

  // State for tracking fetch errors
  const [error, setError] = useState('');

  // Fetch events from backend API on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        setError('Failed to fetch events from server.');
        console.error('Error fetching events:', err);
      });
  }, []);

  // Dynamically collect unique categories from available event data
  const availableCategories = ['All Categories'];
  events.forEach((event) => {
    const categoryName = event.category || 'Other';
    if (!availableCategories.includes(categoryName)) {
      availableCategories.push(categoryName);
    }
  });

  // Step 1: Filter events by category
  let filteredEvents = events.filter((event) => {
    if (selectedCategory === 'All Categories') {
      return true;
    }
    const eventCategory = event.category || 'Other';
    return eventCategory === selectedCategory;
  });

  // Step 2: Sort filtered events by date without mutating the original state array
  if (sortOrder === 'Earliest First') {
    filteredEvents = [...filteredEvents].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  } else if (sortOrder === 'Latest First') {
    filteredEvents = [...filteredEvents].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }

  // Handle Clear Filters: resets category to 'All Categories' and sort to 'Default'
  const handleClearFilters = () => {
    setSelectedCategory('All Categories');
    setSortOrder('Default');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Event Management System</h1>
        <p>Explore, filter, and sort scheduled events</p>
      </header>

      {/* Filtering and Sorting Controls */}
      <section className="filter-controls" aria-label="Event filters and sorting">
        {/* Category Filter */}
        <div className="filter-group">
          <label htmlFor="category-select">Category</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date Sorting */}
        <div className="filter-group">
          <label htmlFor="sort-select">Sort by Date</label>
          <select
            id="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="Default">Default</option>
            <option value="Earliest First">Earliest First</option>
            <option value="Latest First">Latest First</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="filter-group filter-btn-group">
          <button
            type="button"
            className="clear-btn"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Error Message */}
      {error && <p className="error-msg">{error}</p>}

      {/* Event Cards Display */}
      {!error && (
        <section className="events-list" aria-label="Event list">
          {filteredEvents.length === 0 ? (
            <p className="no-events-msg">No events found.</p>
          ) : (
            filteredEvents.map((event) => {
              const eventDate = new Date(event.date);
              const formattedDate = !isNaN(eventDate.getTime())
                ? eventDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : event.date;

              return (
                <div key={event._id || event.id || event.title} className="event-card">
                  <div className="event-card-header">
                    <h3>{event.title}</h3>
                    <span className="event-badge">{event.category || 'Other'}</span>
                  </div>
                  <p className="event-date"><strong>Date:</strong> {formattedDate}</p>
                </div>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}

export default App;
