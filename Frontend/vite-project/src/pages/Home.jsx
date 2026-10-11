import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// home landing screen
function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="home">
      <h1>Event Management System</h1>
      <p>
        A comprehensive platform for organizing, discovering, and attending campus events, workshops, and college fests.
        Administrators can schedule and manage events, while attendees can explore schedules and reserve seats in real time.
      </p>

      <div className="home-actions">
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline">
              Register
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default Home;
