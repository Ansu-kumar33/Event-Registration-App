import { useEffect } from 'react'
import '../style.css'
import { initializeLegacyApp } from '../script.js'

function App() {
  useEffect(() => {
    initializeLegacyApp()
  }, [])

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#home" data-section-link="home" aria-label="Event Registration System home">
          <span className="brand-mark">ERS</span>
          <span className="brand-text">Event Registration System</span>
        </a>

        <button className="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">
          Menu
        </button>

        <nav id="primary-navigation" className="nav">
          <a href="#home" data-section-link="home" className="nav-link active">
            Home
          </a>
          <a href="#view-events" data-section-link="view-events" className="nav-link">
            View Events
          </a>
          <a href="#register-event" data-section-link="register-event" className="nav-link">
            Register Event
          </a>
          <a
            href="#my-registrations"
            data-section-link="my-registrations"
            className="nav-link hidden"
            id="myRegistrationsNavLink"
          >
            My Registrations
          </a>
          <a
            href="#admin-dashboard"
            data-section-link="admin-dashboard"
            className="nav-link hidden"
            id="adminDashboardNavLink"
          >
            Admin Dashboard
          </a>
          <a
            href="#create-event"
            data-section-link="create-event"
            className="nav-link hidden"
            id="createEventNavLink"
          >
            Create Event
          </a>
          <a href="#login" data-section-link="login" className="nav-link" id="loginNavLink">
            Login
          </a>
          <a href="#signup" data-section-link="signup" className="nav-link" id="signupNavLink">
            Signup
          </a>
          <button type="button" className="nav-link nav-button hidden" id="logoutButton">
            Logout
          </button>
        </nav>
      </header>

      <main className="app-shell">
        <section id="home" className="page-section active" data-section="home" aria-labelledby="home-title">
          <div className="hero card">
            <p className="eyebrow">Welcome</p>
            <h1 id="home-title">Event Registration System</h1>
            <p className="subtitle">
              Manage events, explore upcoming sessions, and register from one clean dashboard.
            </p>

            <div className="auth-banner">
              <strong id="authSummary">You are browsing as a guest.</strong>
              <p id="authSummarySubtext" className="section-copy compact-copy">
                Log in to register for events and view your personal registrations.
              </p>
            </div>

            <div className="action-grid">
              <button className="cta cta-secondary" type="button" data-go-to="view-events">
                View Events
              </button>
              <button className="cta cta-accent" type="button" data-go-to="register-event">
                Register Event
              </button>
              <button className="cta cta-dashboard" type="button" data-go-to="my-registrations">
                My Registrations
              </button>
              <button className="cta cta-primary" type="button" data-go-to="login">
                Login
              </button>
            </div>
          </div>
        </section>

        <section id="login" className="page-section" data-section="login" aria-labelledby="login-title">
          <div className="card section-card auth-card">
            <div className="section-heading">
              <p className="eyebrow">Access</p>
              <h2 id="login-title">Login</h2>
            </div>

            <p className="section-copy">Log in to register for events, see your registrations, and access admin tools.</p>

            <form id="loginForm" className="form-grid">
              <label htmlFor="loginEmail">Email</label>
              <input type="email" id="loginEmail" name="loginEmail" placeholder="Enter your email" required />

              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                name="loginPassword"
                placeholder="Enter your password"
                minLength={6}
                required
              />

              <button className="submit-btn" type="submit">
                Login
              </button>
            </form>

            <p id="loginMessage" className="message" aria-live="polite"></p>
          </div>
        </section>

        <section id="signup" className="page-section" data-section="signup" aria-labelledby="signup-title">
          <div className="card section-card auth-card">
            <div className="section-heading">
              <p className="eyebrow">Create Account</p>
              <h2 id="signup-title">Signup</h2>
            </div>

            <p className="section-copy">Create your account to register for events and track your activity.</p>

            <form id="signupForm" className="form-grid">
              <label htmlFor="signupName">Full Name</label>
              <input type="text" id="signupName" name="signupName" placeholder="Enter your name" required />

              <label htmlFor="signupEmail">Email</label>
              <input type="email" id="signupEmail" name="signupEmail" placeholder="Enter your email" required />

              <label htmlFor="signupPassword">Password</label>
              <input
                type="password"
                id="signupPassword"
                name="signupPassword"
                placeholder="Create a password"
                minLength={6}
                required
              />

              <button className="submit-btn" type="submit">
                Create Account
              </button>
            </form>

            <p id="signupMessage" className="message" aria-live="polite"></p>
          </div>
        </section>

        <section id="admin-dashboard" className="page-section" data-section="admin-dashboard" aria-labelledby="admin-dashboard-title">
          <div className="card section-card">
            <div className="section-heading">
              <p className="eyebrow">Admin</p>
              <h2 id="admin-dashboard-title">Admin Dashboard</h2>
            </div>

            <p className="section-copy">
              View totals and the latest activity across events and registrations in one place.
            </p>

            <button id="loadDashboardBtn" className="submit-btn" type="button">
              Load Dashboard
            </button>

            <p id="dashboardMessage" className="status" aria-live="polite"></p>

            <div className="dashboard-grid">
              <article className="dashboard-card">
                <p className="dashboard-label">Total Events</p>
                <h3 id="totalEventsCount" className="dashboard-value">
                  0
                </h3>
              </article>

              <article className="dashboard-card">
                <p className="dashboard-label">Total Registrations</p>
                <h3 id="totalRegistrationsCount" className="dashboard-value">
                  0
                </h3>
              </article>
            </div>

            <div className="dashboard-panels">
              <article className="dashboard-panel">
                <h3>Recent Events</h3>
                <ul id="recentEventsList" className="dashboard-list">
                  <li>No recent events yet.</li>
                </ul>
              </article>

              <article className="dashboard-panel">
                <h3>Recent Registrations</h3>
                <ul id="recentRegistrationsList" className="dashboard-list">
                  <li>No recent registrations yet.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="create-event" className="page-section" data-section="create-event" aria-labelledby="create-event-title">
          <div className="card section-card">
            <div className="section-heading">
              <p className="eyebrow">Create</p>
              <h2 id="create-event-title">Create Event</h2>
            </div>

            <p className="section-copy">Add a new event by filling in the form below.</p>

            <form id="createEventForm" className="form-grid">
              <label htmlFor="title">Event Title</label>
              <input type="text" id="title" name="title" placeholder="Enter event title" required />

              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" placeholder="Enter event description" required></textarea>

              <label htmlFor="date">Date</label>
              <input type="date" id="date" name="date" required />

              <label htmlFor="location">Location</label>
              <input type="text" id="location" name="location" placeholder="Enter event location" required />

              <button id="createEventButton" className="submit-btn" type="submit">
                Create Event
              </button>
            </form>

            <p id="createMessage" className="message" aria-live="polite"></p>
          </div>
        </section>

        <section id="view-events" className="page-section" data-section="view-events" aria-labelledby="view-events-title">
          <div className="card section-card">
            <div className="section-heading">
              <p className="eyebrow">Browse</p>
              <h2 id="view-events-title">View Events</h2>
            </div>

            <p className="section-copy">Load events from MongoDB and view them in a dashboard layout.</p>

            <label className="search-label" htmlFor="eventSearch">
              Search by title
            </label>
            <input
              id="eventSearch"
              className="search-input"
              type="search"
              placeholder="Type a title to filter events"
              autoComplete="off"
            />

            <button id="loadEventsBtn" className="submit-btn" type="button">
              Load Events
            </button>

            <p id="statusMessage" className="status" aria-live="polite"></p>
            <div id="eventsContainer" className="events-grid"></div>
          </div>
        </section>

        <section id="register-event" className="page-section" data-section="register-event" aria-labelledby="register-event-title">
          <div className="card section-card">
            <div className="section-heading">
              <p className="eyebrow">Register</p>
              <h2 id="register-event-title">Register Event</h2>
            </div>

            <p className="section-copy">Log in, choose an event, and submit your registration.</p>

            <p id="registerAuthHint" className="status" aria-live="polite"></p>
            <div id="selectedEventNotice" className="status" hidden></div>

            <form id="registrationForm" className="form-grid">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your name will appear here after login" readOnly />

              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Your email will appear here after login" readOnly />

              <label htmlFor="eventId">Event ID</label>
              <input type="text" id="eventId" name="eventId" placeholder="Select an event from View Events" required />

              <button className="submit-btn" type="submit">
                Register
              </button>
            </form>

            <p id="registerMessage" className="message" aria-live="polite"></p>
          </div>
        </section>

        <section
          id="my-registrations"
          className="page-section"
          data-section="my-registrations"
          aria-labelledby="my-registrations-title"
        >
          <div className="card section-card">
            <div className="section-heading">
              <p className="eyebrow">Personal</p>
              <h2 id="my-registrations-title">My Registrations</h2>
            </div>

            <p className="section-copy">Review the events you have already registered for.</p>

            <button id="loadMyRegistrationsBtn" className="submit-btn" type="button">
              Load My Registrations
            </button>

            <p id="myRegistrationsMessage" className="status" aria-live="polite"></p>
            <div id="myRegistrationsContainer" className="events-grid"></div>
          </div>
        </section>
      </main>
    </>
  )
}

export default App
