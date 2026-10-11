const API = import.meta.env.VITE_API_URL || 'https://event-management-system-1y7c.onrender.com/api';

// backend api request bhejne ke liye common helper function
async function request(endpoint, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };

  // agar token present hai to Authorization header lagayenge
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(API + endpoint, {
    method: method,
    headers: headers,
    body: data ? JSON.stringify(data) : undefined
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(`Server returned error (${res.status}). Please try again.`);
    }
    throw new Error('Server returned unexpected response format.');
  }

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Something went wrong. Please try again.');

  return result;
}

// user login karne ke liye
export const loginUser = (data) => request('/auth/login', 'POST', data);

// naya account register karne ke liye
export const registerUser = (data) => request('/auth/register', 'POST', data);

// events fetch karenge (filters aur search ke sath)
export const getEvents = (category, search, sort) => {
  let url = '/events?';
  if (category && category !== 'All') url += `category=${category}&`;
  if (search) url += `search=${search}&`;
  if (sort && sort !== 'default') url += `sort=${sort}`;
  return request(url);
};

// naya event add karne ke liye (admin)
export const createEvent = (data, token) => request('/events', 'POST', data, token);

// event update karne ke liye (admin)
export const updateEvent = (id, data, token) => request(`/events/${id}`, 'PUT', data, token);

// event delete karne ke liye (admin)
export const deleteEvent = (id, token) => request(`/events/${id}`, 'DELETE', null, token);

// event me rsvp register karne ke liye
export const registerForEvent = (id, token) => request(`/events/${id}/register`, 'POST', null, token);

// rsvp cancel karne ke liye
export const cancelRegistration = (id, token) => request(`/events/${id}/cancel`, 'POST', null, token);
