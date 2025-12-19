// Clean and Simple MERN Stack Event Management App

import { useState, useEffect } from 'react'
import { authAPI, eventsAPI, bookingsAPI, adminAPI, setAuthToken, setUser, getUser, logout as logoutUser } from './services/api'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [currentUser, setCurrentUser] = useState(null)
  const [events, setEvents] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [adminStats, setAdminStats] = useState(null)

  useEffect(() => {
    const savedUser = getUser()
    if (savedUser) {
      setCurrentUser(savedUser)
    }
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventsAPI.getAll()
      setEvents(response.data.events)
      setError(null)
    } catch (err) {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings()
      setBookings(response.data.bookings)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers(),
        adminAPI.getAllEvents()
      ])
      setAdminStats(statsRes.data.stats)
      setUsers(usersRes.data.users)
      setEvents(eventsRes.data.events)
    } catch (err) {
      setError('Failed to load admin data')
    }
  }

  const handleLogin = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authAPI.login({ email, password })

      if (response.data.success) {
        const { token, user } = response.data
        setAuthToken(token)
        setUser(user)
        setCurrentUser(user)
        setCurrentPage(user.role)

        if (user.role === 'user') {
          await fetchBookings()
        } else if (user.role === 'admin') {
          await fetchAdminData()
        }

        return true
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (name, email, password, role) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authAPI.register({ name, email, password, role })

      if (response.data.success) {
        const { token, user } = response.data
        setAuthToken(token)
        setUser(user)
        setCurrentUser(user)
        setCurrentPage(user.role)
        return true
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    setCurrentUser(null)
    setCurrentPage('home')
    setBookings([])
    setUsers([])
    setAdminStats(null)
  }

  const handleBookEvent = async (eventId, seats = 1) => {
    try {
      setLoading(true)
      const response = await bookingsAPI.create({ eventId, seats })

      if (response.data.success) {
        await fetchEvents()
        await fetchBookings()
        alert('Booking successful!')
        return true
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      setLoading(true)
      const response = await bookingsAPI.cancel(bookingId)
      if (response.data.success) {
        await fetchBookings()
        await fetchEvents()
        alert('Booking cancelled successfully!')
        return true
      }
    } catch (err) {
      alert('Failed to cancel booking')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (eventData) => {
    try {
      setLoading(true)
      const response = await eventsAPI.create(eventData)

      if (response.data.success) {
        await fetchEvents()
        alert('Event created successfully!')
        return true
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await eventsAPI.delete(eventId)
      if (response.data.success) {
        await fetchEvents()
        return true
      }
    } catch (err) {
      alert('Failed to delete event')
      return false
    }
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="flex-between">
            <h1
              style={{
                cursor: 'pointer',
                fontSize: '26px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
              onClick={() => setCurrentPage('home')}
            >
              🎉 EventPulse
            </h1>
            <div className="flex gap-10">
              {currentUser ? (
                <>
                  <span style={{ fontWeight: '600', color: '#495057' }}>👋 {currentUser.name}</span>
                  <button onClick={() => setCurrentPage('home')} className="btn btn-primary">
                    🏠 Home
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage(currentUser.role)
                      if (currentUser.role === 'user') fetchBookings()
                      if (currentUser.role === 'admin') fetchAdminData()
                    }}
                    className="btn btn-success"
                  >
                    📊 Dashboard
                  </button>
                  <button onClick={handleLogout} className="btn btn-danger">
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setCurrentPage('login')} className="btn btn-primary">
                    🔐 Login
                  </button>
                  <button onClick={() => setCurrentPage('register')} className="btn btn-success">
                    ✨ Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading && <div className="spinner"></div>}

        {currentPage === 'home' && <HomePage events={events} currentUser={currentUser} onBookEvent={handleBookEvent} />}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
        {currentPage === 'register' && <RegisterPage onRegister={handleRegister} />}
        {currentPage === 'user' && currentUser && <UserDashboard bookings={bookings} onCancelBooking={handleCancelBooking} />}
        {currentPage === 'organizer' && <OrganizerDashboard events={events} onCreateEvent={handleCreateEvent} onDeleteEvent={handleDeleteEvent} />}
        {currentPage === 'admin' && <AdminDashboard users={users} events={events} stats={adminStats} />}
      </div>
    </div>
  )
}

// Home Page
function HomePage({ events, currentUser, onBookEvent }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const categories = ['all', 'conference', 'workshop', 'concert', 'sports', 'festival', 'other']

  // Filter and sort events
  let filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  filteredEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date) - new Date(b.date)
    } else if (sortBy === 'price') {
      return a.price - b.price
    } else if (sortBy === 'popular') {
      const aBooked = (a.totalSeats || 100) - (a.availableSeats || 0)
      const bBooked = (b.totalSeats || 100) - (b.availableSeats || 0)
      return bBooked - aBooked
    }
    return 0
  })

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Browse Events</h2>
        <p className="page-subtitle">Find and book tickets for upcoming events</p>
      </div>

      <input
        type="text"
        placeholder="Search events..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex-between mb-20">
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input"
          style={{ width: 'auto', marginBottom: 0 }}
        >
          <option value="date">Sort by Date</option>
          <option value="price">Sort by Price</option>
          <option value="popular">Sort by Popularity</option>
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No events found</div>
          <p style={{ color: '#6c757d' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid">
          {filteredEvents.map(event => {
            const capacity = event.totalSeats || 100
            const available = event.availableSeats || 0
            const booked = capacity - available
            const percentage = (booked / capacity) * 100

            return (
              <div key={event._id} className="card event-card">
                <div className="flex-between mb-10">
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', margin: 0 }}>
                    {event.title}
                  </h3>
                  <span className="badge badge-primary">
                    {event.category || 'other'}
                  </span>
                </div>

                <div className="event-detail">
                  <span className="event-detail-icon">📅</span>
                  <span>{new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>

                <div className="event-detail">
                  <span className="event-detail-icon">💰</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#0d6efd' }}>
                    ₹{event.price}
                  </span>
                </div>

                <div className="event-detail">
                  <span className="event-detail-icon">🎫</span>
                  <span>
                    <strong>{available}</strong> / {capacity} seats
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: percentage > 80 ? '#dc3545' : '#198754'
                    }}
                  ></div>
                </div>

                {event.location && (
                  <div className="event-detail">
                    <span className="event-detail-icon">📍</span>
                    <span>{event.location}</span>
                  </div>
                )}

                {currentUser?.role === 'user' && (
                  <div style={{ marginTop: '15px' }}>
                    {available > 0 ? (
                      <button
                        onClick={() => {
                          const seats = prompt('How many seats?', '1');
                          if (seats) onBookEvent(event._id, parseInt(seats));
                        }}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        Book Now
                      </button>
                    ) : (
                      <div className="badge badge-danger" style={{ width: '100%', textAlign: 'center', padding: '10px' }}>
                        Sold Out
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Login Page
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await onLogin(email, password)
    if (success) {
      alert('Login successful!')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
          Login
        </h2>
        <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '24px' }}>
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#495057' }}>
            Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#495057' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            Login
          </button>
        </form>

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <p style={{ fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#495057' }}>
            Test Account:
          </p>
          <p style={{ fontSize: '12px', color: '#6c757d', margin: '2px 0' }}>
            Email: admin@admin.com
          </p>
          <p style={{ fontSize: '12px', color: '#6c757d', margin: '2px 0' }}>
            Password: admin
          </p>
        </div>
      </div>
    </div>
  )
}

// Register Page
function RegisterPage({ onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await onRegister(name, email, password, role)
    if (success) {
      alert('Registration successful!')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
          Register
        </h2>
        <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '24px' }}>
          Create a new account
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#495057' }}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#495057' }}>
            Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#495057' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Create password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#495057' }}>
            Role
          </label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '12px' }}>
            Register
          </button>
        </form>
      </div>
    </div>
  )
}

// User Dashboard
function UserDashboard({ bookings, onCancelBooking }) {
  const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0)
  const totalSeats = bookings.reduce((sum, b) => sum + b.seats, 0)

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Bookings</h2>
        <p className="page-subtitle">View and manage your bookings</p>
      </div>

      <div className="grid-3 mb-30">
        <div className="stat-card">
          <div className="stat-number">{bookings.length}</div>
          <div className="stat-label">Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalSeats}</div>
          <div className="stat-label">Seats</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">₹{totalSpent}</div>
          <div className="stat-label">Spent</div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <div className="empty-state-text">No bookings yet</div>
          <p style={{ color: '#6c757d' }}>Start booking events now</p>
        </div>
      ) : (
        <div className="grid-2">
          {bookings.map(booking => {
            const isPast = new Date(booking.event?.date) < new Date()

            return (
              <div key={booking._id} className="card">
                <div className="flex-between mb-10">
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    {booking.event?.title}
                  </h3>
                  <span className="badge badge-success">Confirmed</span>
                </div>

                <div className="event-detail">
                  <span className="event-detail-icon">📅</span>
                  <span>{new Date(booking.event?.date).toLocaleDateString()}</span>
                </div>

                <div className="event-detail">
                  <span className="event-detail-icon">🎫</span>
                  <span><strong>{booking.seats}</strong> Seats</span>
                </div>

                <div className="event-detail">
                  <span className="event-detail-icon">💰</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#198754' }}>
                    ₹{booking.totalPrice}
                  </span>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #dee2e6', fontSize: '13px', color: '#6c757d' }}>
                  Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                </div>

                {!isPast && (
                  <button
                    onClick={() => {
                      if (confirm('Cancel this booking?')) {
                        onCancelBooking(booking._id)
                      }
                    }}
                    className="btn btn-danger"
                    style={{ width: '100%', marginTop: '12px' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Organizer Dashboard
function OrganizerDashboard({ events, onCreateEvent, onDeleteEvent }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    price: '',
    totalSeats: '',
    description: '',
    location: '',
    category: 'other'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await onCreateEvent({
      ...formData,
      price: parseInt(formData.price),
      totalSeats: parseInt(formData.totalSeats)
    })
    if (success) {
      setFormData({
        title: '',
        date: '',
        price: '',
        totalSeats: '',
        description: '',
        location: '',
        category: 'other'
      })
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Organizer Dashboard</h2>
        <p className="page-subtitle">Create and manage events</p>
      </div>

      <div className="card mb-30">
        <h3>Create New Event</h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>
                Event Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Event name"
                className="input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>
                Date
              </label>
              <input
                type="date"
                name="date"
                className="input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                placeholder="500"
                className="input"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>
                Total Seats
              </label>
              <input
                type="number"
                name="totalSeats"
                placeholder="100"
                className="input"
                value={formData.totalSeats}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="City, Venue"
                className="input"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>
                Category
              </label>
              <select
                name="category"
                className="input"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="concert">Concert</option>
                <option value="sports">Sports</option>
                <option value="festival">Festival</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              name="description"
              placeholder="Event description..."
              className="input"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '12px' }}>
            Create Event
          </button>
        </form>
      </div>

      <h3>My Events</h3>
      <div className="grid">
        {events.map(event => {
          const capacity = event.totalSeats || 100
          const available = event.availableSeats || 0
          const sold = capacity - available
          const revenue = event.revenue || 0

          return (
            <div key={event._id} className="card">
              <div className="flex-between mb-10">
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{event.title}</h3>
                <span className="badge badge-info">{event.category}</span>
              </div>

              <div className="event-detail">
                <span className="event-detail-icon">📅</span>
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>

              <div className="event-detail">
                <span className="event-detail-icon">💰</span>
                <span style={{ fontWeight: '600' }}>₹{event.price}</span>
              </div>

              <div className="event-detail">
                <span className="event-detail-icon">🎫</span>
                <span>Total: {capacity} | Available: {available}</span>
              </div>

              <div className="event-detail">
                <span className="event-detail-icon">📊</span>
                <span style={{ fontWeight: '600', color: '#198754' }}>Sold: {sold}</span>
              </div>

              <div className="event-detail">
                <span className="event-detail-icon">💵</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#198754' }}>
                  Revenue: ₹{revenue}
                </span>
              </div>

              <button
                onClick={() => {
                  if (confirm('Delete this event?')) {
                    onDeleteEvent(event._id)
                  }
                }}
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '12px' }}
              >
                Delete Event
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Admin Dashboard
function AdminDashboard({ users, events, stats }) {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Admin Dashboard</h2>
        <p className="page-subtitle">System overview</p>
      </div>

      {stats && (
        <div className="grid-3 mb-30">
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalEvents}</div>
            <div className="stat-label">Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalBookings}</div>
            <div className="stat-label">Bookings</div>
          </div>
        </div>
      )}

      <div className="card mb-30">
        <h3>All Users</h3>
        <div>
          {users.map(user => (
            <div
              key={user._id}
              className="flex-between"
              style={{ padding: '10px 0', borderBottom: '1px solid #dee2e6' }}
            >
              <div>
                <strong>{user.name}</strong>
                <span style={{ color: '#6c757d', marginLeft: '8px', fontSize: '14px' }}>
                  {user.email}
                </span>
              </div>
              <span className={`badge ${user.role === 'admin' ? 'badge-warning' :
                user.role === 'organizer' ? 'badge-primary' :
                  'badge-success'
                }`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>All Events</h3>
        <div>
          {events.map(event => (
            <div
              key={event._id}
              style={{ padding: '12px 0', borderBottom: '1px solid #dee2e6' }}
            >
              <div className="flex-between">
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>
                    {event.title}
                  </strong>
                  <span style={{ color: '#6c757d', fontSize: '14px' }}>
                    {new Date(event.date).toLocaleDateString()} • ₹{event.price}
                  </span>
                </div>
                {event.revenue !== undefined && (
                  <span className="badge badge-success">
                    ₹{event.revenue}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App