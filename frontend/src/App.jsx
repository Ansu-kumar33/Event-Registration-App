import { useEffect, useState } from 'react'
import './App.css'

const initialFormData = {
  name: '',
  email: '',
  eventId: '',
}

const apiBaseUrl =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://event-registration-app-8eei.onrender.com/api'

function App() {
  const [formData, setFormData] = useState(initialFormData)
  const [events, setEvents] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      console.log('FRONTEND: Loading events for registration form...')
      setIsLoadingEvents(true)
      setError('')

      try {
        const response = await fetch(`${apiBaseUrl}/events`)
        const responseData = await response.json()

        console.log('FRONTEND: Events API status:', response.status)
        console.log('FRONTEND: Events API response:', responseData)

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to load events.')
        }

        setEvents(Array.isArray(responseData) ? responseData : [])
      } catch (loadError) {
        console.error('FRONTEND: Failed to load events for registration:', loadError)
        setError(loadError.message || 'Could not load events.')
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    console.log('FRONTEND: Registration submit started')
    console.log('FRONTEND: Registration form data:', formData)

    try {
      if (!formData.name || !formData.email || !formData.eventId) {
        throw new Error('Please fill in name, email, and select an event.')
      }

      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()

      console.log('FRONTEND: Registration API status:', response.status)
      console.log('FRONTEND: Registration API response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Registration failed')
      }

      setMessage(responseData.message || 'Registration successful.')
      setFormData(initialFormData)
    } catch (error) {
      console.error('FRONTEND: Registration submit failed:', error)
      setError(error.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Event Registration</p>
        <h1>Register for an event</h1>
        <p className="subtitle">
          Fill in your details and send them to the backend with one click.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </label>

          <label className="field">
            <span>Select Event</span>
            <select
              name="eventId"
              value={formData.eventId}
              onChange={handleChange}
              required
              disabled={isLoadingEvents || isSubmitting}
            >
              <option value="">
                {isLoadingEvents ? 'Loading events...' : 'Choose an event'}
              </option>
              {events.map((eventOption) => (
                <option key={eventOption._id} value={eventOption._id}>
                  {eventOption.title} - {eventOption.location}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Submit Registration'}
          </button>
        </form>

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}
      </section>
    </main>
  )
}

export default App
