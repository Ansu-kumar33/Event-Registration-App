const AUTH_TOKEN_KEY = "event_registration_auth_token"
const AUTH_USER_KEY = "event_registration_auth_user"
const DEFAULT_SECTION = "home"

const apiBaseUrl =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://event-registration-app-8eei.onrender.com/api"

export const initializeLegacyApp = () => {
  const sections = document.querySelectorAll(".page-section")
  const navLinks = document.querySelectorAll("[data-section-link]")
  const navToggle = document.querySelector(".nav-toggle")
  const navMenu = document.querySelector(".nav")
  const sectionButtons = document.querySelectorAll("[data-go-to]")

  const authSummary = document.getElementById("authSummary")
  const authSummarySubtext = document.getElementById("authSummarySubtext")
  const loginNavLink = document.getElementById("loginNavLink")
  const signupNavLink = document.getElementById("signupNavLink")
  const myRegistrationsNavLink = document.getElementById("myRegistrationsNavLink")
  const adminDashboardNavLink = document.getElementById("adminDashboardNavLink")
  const createEventNavLink = document.getElementById("createEventNavLink")
  const logoutButton = document.getElementById("logoutButton")

  const loginForm = document.getElementById("loginForm")
  const loginEmailInput = document.getElementById("loginEmail")
  const loginPasswordInput = document.getElementById("loginPassword")
  const loginMessage = document.getElementById("loginMessage")

  const signupForm = document.getElementById("signupForm")
  const signupNameInput = document.getElementById("signupName")
  const signupEmailInput = document.getElementById("signupEmail")
  const signupPasswordInput = document.getElementById("signupPassword")
  const signupMessage = document.getElementById("signupMessage")

  const createEventForm = document.getElementById("createEventForm")
  const createMessage = document.getElementById("createMessage")
  const createEventButton = document.getElementById("createEventButton")
  const registrationForm = document.getElementById("registrationForm")
  const registerMessage = document.getElementById("registerMessage")
  const registerAuthHint = document.getElementById("registerAuthHint")
  const selectedEventNotice = document.getElementById("selectedEventNotice")
  const eventSearch = document.getElementById("eventSearch")
  const loadEventsBtn = document.getElementById("loadEventsBtn")
  const statusMessage = document.getElementById("statusMessage")
  const eventsContainer = document.getElementById("eventsContainer")
  const loadDashboardBtn = document.getElementById("loadDashboardBtn")
  const dashboardMessage = document.getElementById("dashboardMessage")
  const totalEventsCount = document.getElementById("totalEventsCount")
  const totalRegistrationsCount = document.getElementById("totalRegistrationsCount")
  const recentEventsList = document.getElementById("recentEventsList")
  const recentRegistrationsList = document.getElementById("recentRegistrationsList")
  const loadMyRegistrationsBtn = document.getElementById("loadMyRegistrationsBtn")
  const myRegistrationsMessage = document.getElementById("myRegistrationsMessage")
  const myRegistrationsContainer = document.getElementById("myRegistrationsContainer")

  const titleInput = document.getElementById("title")
  const descriptionInput = document.getElementById("description")
  const dateInput = document.getElementById("date")
  const locationInput = document.getElementById("location")
  const registrationNameInput = document.getElementById("name")
  const registrationEmailInput = document.getElementById("email")
  const registrationEventIdInput = document.getElementById("eventId")

  let allEvents = []
  let editingEventId = null
  let currentToken = null
  let currentUser = null
  let pendingSectionId = null
  let pendingEventId = null

  if (!sections.length) {
    return
  }

  if (document.body.dataset.legacyAppInitialized === "true") {
    return
  }

  document.body.dataset.legacyAppInitialized = "true"

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null")
    } catch {
      return null
    }
  }

  const isLoggedIn = () => Boolean(currentToken && currentUser)
  const isAdmin = () => currentUser?.role === "admin"

  const setAuthSession = (token, user) => {
    currentToken = token
    currentUser = user
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }

  const clearAuthSession = () => {
    currentToken = null
    currentUser = null
    pendingEventId = null
    pendingSectionId = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  }

  const authFetch = async (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
    }

    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  const getSectionIdFromHash = () => {
    const hashValue = window.location.hash.replace(/^#/, "")
    const sectionExists = Array.from(sections).some((section) => section.id === hashValue)

    return sectionExists ? hashValue : DEFAULT_SECTION
  }

  const formatDate = (value) => {
    if (!value) {
      return "Unknown date"
    }

    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (value) => {
    if (!value) {
      return "Unknown date"
    }

    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getErrorMessage = async (response, fallbackMessage) => {
    try {
      const responseData = await response.json()
      return responseData.message || responseData.error || fallbackMessage
    } catch {
      return fallbackMessage
    }
  }

  const setMessage = (element, text, type = "") => {
    if (!element) {
      return
    }

    const baseClass = element.classList.contains("status") ? "status" : "message"
    element.textContent = text
    element.className = type ? `${baseClass} ${type}` : baseClass
  }

  const resetMessages = (...elements) => {
    elements.forEach((element) => {
      if (!element) {
        return
      }

      const baseClass = element.classList.contains("status") ? "status" : "message"
      element.textContent = ""
      element.className = baseClass
    })
  }

  const fillCreateEventForm = (event) => {
    if (!titleInput || !descriptionInput || !dateInput || !locationInput) {
      return
    }

    titleInput.value = event.title ?? ""
    descriptionInput.value = event.description ?? ""
    dateInput.value = event.date ? event.date.split("T")[0] : ""
    locationInput.value = event.location ?? ""
  }

  const resetCreateEventFormMode = () => {
    editingEventId = null

    if (createEventButton) {
      createEventButton.textContent = "Create Event"
    }
  }

  const setSelectedEvent = (event) => {
    if (!registrationEventIdInput || !selectedEventNotice) {
      return
    }

    registrationEventIdInput.value = event._id
    selectedEventNotice.hidden = false
    selectedEventNotice.textContent = `Selected event: ${event.title} (${formatDate(event.date)})`
    selectedEventNotice.className = "status success"
  }

  const updateAuthSummary = () => {
    if (!authSummary || !authSummarySubtext) {
      return
    }

    if (!isLoggedIn()) {
      authSummary.textContent = "You are browsing as a guest."
      authSummarySubtext.textContent = "Log in to register for events and view your personal registrations."
      return
    }

    authSummary.textContent = `Logged in as ${currentUser.name} (${currentUser.role}).`
    authSummarySubtext.textContent = isAdmin()
      ? "Your account can create, edit, and delete events."
      : "You can register for events and review your registrations from your account."
  }

  const updateRegistrationIdentity = () => {
    const loggedIn = isLoggedIn()

    if (registrationNameInput) {
      registrationNameInput.value = loggedIn ? currentUser.name : ""
      registrationNameInput.readOnly = true
    }

    if (registrationEmailInput) {
      registrationEmailInput.value = loggedIn ? currentUser.email : ""
      registrationEmailInput.readOnly = true
    }

    if (registerAuthHint) {
      setMessage(
        registerAuthHint,
        loggedIn
          ? "You are registering using your logged-in account details."
          : "Please log in to register for an event.",
        loggedIn ? "success" : "error"
      )
    }
  }

  const updateAuthUi = () => {
    updateAuthSummary()
    updateRegistrationIdentity()

    loginNavLink?.classList.toggle("hidden", isLoggedIn())
    signupNavLink?.classList.toggle("hidden", isLoggedIn())
    logoutButton?.classList.toggle("hidden", !isLoggedIn())
    myRegistrationsNavLink?.classList.toggle("hidden", !isLoggedIn())
    adminDashboardNavLink?.classList.toggle("hidden", !isAdmin())
    createEventNavLink?.classList.toggle("hidden", !isAdmin())
  }

  const renderDashboardList = (listElement, items, emptyText, renderItem) => {
    if (!listElement) {
      return
    }

    listElement.innerHTML = ""

    if (!Array.isArray(items) || items.length === 0) {
      const listItem = document.createElement("li")
      listItem.textContent = emptyText
      listElement.appendChild(listItem)
      return
    }

    items.forEach((item) => {
      const listItem = document.createElement("li")
      listItem.innerHTML = renderItem(item)
      listElement.appendChild(listItem)
    })
  }

  const renderMyRegistrations = (registrations) => {
    if (!myRegistrationsContainer || !myRegistrationsMessage) {
      return
    }

    myRegistrationsContainer.innerHTML = ""

    if (!registrations.length) {
      setMessage(myRegistrationsMessage, "You have not registered for any events yet.", "error")
      return
    }

    setMessage(
      myRegistrationsMessage,
      `${registrations.length} registration${registrations.length === 1 ? "" : "s"} loaded successfully.`,
      "success"
    )

    registrations.forEach((registration) => {
      const card = document.createElement("article")
      card.className = "event-card registration-card"

      const event = registration.event
      card.innerHTML = `
        <h3>${event?.title || "Event not found"}</h3>
        <p><span class="label">Registered:</span> ${formatDateTime(registration.createdAt)}</p>
        <p><span class="label">Event ID:</span> ${registration.eventId}</p>
        <p><span class="label">Location:</span> ${event?.location || "Unavailable"}</p>
        <p><span class="label">Date:</span> ${event?.date ? formatDate(event.date) : "Unavailable"}</p>
      `

      myRegistrationsContainer.appendChild(card)
    })
  }

  const handleUnauthorizedAccess = (message, sectionId = "login") => {
    pendingSectionId = sectionId
    setMessage(loginMessage, message, "error")
    showSection("login")
  }

  const startEditEvent = (eventId) => {
    if (!isAdmin()) {
      showSection("view-events")
      setMessage(statusMessage, "Only admin users can edit events.", "error")
      return
    }

    const selectedEvent = allEvents.find((event) => event._id === eventId)

    if (!selectedEvent) {
      setMessage(createMessage, "Could not find the selected event.", "error")
      return
    }

    editingEventId = selectedEvent._id
    fillCreateEventForm(selectedEvent)

    if (createEventButton) {
      createEventButton.textContent = "Update Event"
    }

    setMessage(createMessage, "Edit the event details and submit the form to update this event.")
    showSection("create-event")
  }

  const startRegisterEvent = (eventId) => {
    const selectedEvent = allEvents.find((event) => event._id === eventId)

    if (!selectedEvent) {
      setMessage(registerMessage, "Could not find the selected event.", "error")
      showSection("register-event")
      return
    }

    if (!isLoggedIn()) {
      pendingSectionId = "register-event"
      pendingEventId = eventId
      handleUnauthorizedAccess("Please log in before registering for an event.")
      return
    }

    resetMessages(registerMessage)
    setSelectedEvent(selectedEvent)
    showSection("register-event")
    registrationEventIdInput?.focus()
  }

  const ensureSectionAccess = (sectionId) => {
    if ((sectionId === "register-event" || sectionId === "my-registrations") && !isLoggedIn()) {
      pendingSectionId = sectionId
      handleUnauthorizedAccess("Please log in to continue.")
      return "login"
    }

    if ((sectionId === "create-event" || sectionId === "admin-dashboard") && !isAdmin()) {
      if (!isLoggedIn()) {
        pendingSectionId = sectionId
        handleUnauthorizedAccess("Please log in with an admin account to continue.")
        return "login"
      }

      setMessage(statusMessage, "Only admin users can access that section.", "error")
      return "home"
    }

    return sectionId
  }

  const runSectionLoaders = async (sectionId) => {
    if (sectionId === "admin-dashboard") {
      await loadDashboard()
    }

    if (sectionId === "view-events") {
      await loadEvents()
    }

    if (sectionId === "my-registrations") {
      await loadMyRegistrations()
    }
  }

  const showSection = (requestedSectionId, options = {}) => {
    const { updateHash = true } = options
    const sectionId = ensureSectionAccess(requestedSectionId)

    sections.forEach((section) => {
      section.classList.toggle("active", section.id === sectionId)
    })

    navLinks.forEach((link) => {
      const isActive = link.dataset.sectionLink === sectionId
      link.classList.toggle("active", isActive)
    })

    if (updateHash) {
      window.location.hash = sectionId
    }

    if (window.innerWidth <= 900 && navMenu) {
      navMenu.classList.remove("open")
      navToggle?.setAttribute("aria-expanded", "false")
    }
  }

  const renderEvents = (events) => {
    if (!eventsContainer || !statusMessage) {
      return
    }

    eventsContainer.innerHTML = ""

    if (!events.length) {
      setMessage(statusMessage, "No events found.", "error")
      return
    }

    setMessage(
      statusMessage,
      `${events.length} event${events.length === 1 ? "" : "s"} loaded successfully.`,
      "success"
    )

    events.forEach((event) => {
      const card = document.createElement("article")
      card.className = "event-card"
      const adminActions = isAdmin()
        ? `
            <button class="edit-btn" type="button" data-edit-event="${event._id}">Edit Event</button>
            <button class="delete-btn" type="button" data-delete-event="${event._id}">Delete Event</button>
          `
        : ""

      card.innerHTML = `
        <h3>${event.title}</h3>
        <p><span class="label">ID:</span> ${event._id}</p>
        <p><span class="label">Description:</span> ${event.description}</p>
        <p><span class="label">Date:</span> ${formatDate(event.date)}</p>
        <p><span class="label">Location:</span> ${event.location}</p>
        <div class="event-actions">
          <button class="register-btn" type="button" data-register-event="${event._id}">
            ${isLoggedIn() ? "Register" : "Login to Register"}
          </button>
          ${adminActions}
        </div>
      `

      eventsContainer.appendChild(card)
    })

    eventsContainer.querySelectorAll("[data-register-event]").forEach((button) => {
      button.addEventListener("click", () => {
        const eventId = button.dataset.registerEvent

        if (eventId) {
          startRegisterEvent(eventId)
        }
      })
    })

    eventsContainer.querySelectorAll("[data-edit-event]").forEach((button) => {
      button.addEventListener("click", () => {
        const eventId = button.dataset.editEvent

        if (eventId) {
          startEditEvent(eventId)
        }
      })
    })

    eventsContainer.querySelectorAll("[data-delete-event]").forEach((button) => {
      button.addEventListener("click", async () => {
        const eventId = button.dataset.deleteEvent

        if (!eventId) {
          return
        }

        if (!isAdmin()) {
          setMessage(statusMessage, "Only admin users can delete events.", "error")
          return
        }

        const confirmed = window.confirm("Delete this event?")

        if (!confirmed) {
          return
        }

        try {
          const response = await authFetch(`${apiBaseUrl}/events/${eventId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error(await getErrorMessage(response, "Failed to delete the event."))
          }

          if (registrationEventIdInput?.value === eventId) {
            registrationEventIdInput.value = ""
            if (selectedEventNotice) {
              selectedEventNotice.hidden = true
              selectedEventNotice.textContent = ""
            }
          }

          await loadEvents()
        } catch (error) {
          console.error("Error deleting event:", error)
          setMessage(statusMessage, error.message || "Could not delete the event.", "error")
        }
      })
    })
  }

  const filterEventsByTitle = async () => {
    if (!statusMessage || !eventsContainer) {
      return
    }

    const searchTerm = eventSearch?.value.trim() || ""

    if (!searchTerm) {
      await loadEvents()
      return
    }

    try {
      setMessage(statusMessage, "Searching events...")
      eventsContainer.innerHTML = ""

      const response = await fetch(`${apiBaseUrl}/events/search?title=${encodeURIComponent(searchTerm)}`)

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to search events."))
      }

      const matchingEvents = await response.json()
      allEvents = matchingEvents
      renderEvents(matchingEvents)
    } catch (error) {
      console.error("Error searching events:", error)
      setMessage(statusMessage, error.message || "Could not search events.", "error")
    }
  }

  const loadEvents = async () => {
    if (!statusMessage || !eventsContainer) {
      return
    }

    setMessage(statusMessage, "Loading events...")
    eventsContainer.innerHTML = ""

    try {
      const response = await fetch(`${apiBaseUrl}/events`)

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to load events."))
      }

      const events = await response.json()
      allEvents = events
      renderEvents(events)
    } catch (error) {
      console.error("Error loading events:", error)
      setMessage(statusMessage, error.message || "Could not load events.", "error")
    }
  }

  const loadDashboard = async () => {
    if (
      !dashboardMessage ||
      !totalEventsCount ||
      !totalRegistrationsCount ||
      !recentEventsList ||
      !recentRegistrationsList
    ) {
      return
    }

    setMessage(dashboardMessage, "Loading dashboard...")

    try {
      const response = await fetch(`${apiBaseUrl}/dashboard`)

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to load the dashboard."))
      }

      const dashboardData = await response.json()

      totalEventsCount.textContent = String(dashboardData.totalEvents ?? 0)
      totalRegistrationsCount.textContent = String(dashboardData.totalRegistrations ?? 0)
      renderDashboardList(
        recentEventsList,
        dashboardData.recentEvents,
        "No recent events yet.",
        (event) =>
          `<strong>${event.title}</strong><span>${event.location} | ${formatDateTime(
            event.createdAt || event.date
          )}</span>`
      )
      renderDashboardList(
        recentRegistrationsList,
        dashboardData.recentRegistrations,
        "No recent registrations yet.",
        (registration) =>
          `<strong>${registration.name}</strong><span>${registration.email} | Event ID: ${
            registration.eventId
          } | ${formatDateTime(registration.createdAt)}</span>`
      )
      setMessage(dashboardMessage, "Dashboard loaded successfully.", "success")
    } catch (error) {
      console.error("Error loading dashboard:", error)
      setMessage(dashboardMessage, error.message || "Could not load the dashboard.", "error")
    }
  }

  const loadMyRegistrations = async () => {
    if (!myRegistrationsContainer || !myRegistrationsMessage) {
      return
    }

    if (!isLoggedIn()) {
      handleUnauthorizedAccess("Please log in to view your registrations.", "my-registrations")
      return
    }

    setMessage(myRegistrationsMessage, "Loading your registrations...")
    myRegistrationsContainer.innerHTML = ""

    try {
      const response = await authFetch(`${apiBaseUrl}/register/my-registrations`)

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to load your registrations."))
      }

      const registrations = await response.json()
      renderMyRegistrations(registrations)
    } catch (error) {
      console.error("Error loading registrations:", error)
      setMessage(myRegistrationsMessage, error.message || "Could not load your registrations.", "error")
    }
  }

  const syncCurrentUser = async () => {
    if (!currentToken) {
      currentUser = null
      return
    }

    try {
      const response = await authFetch(`${apiBaseUrl}/auth/me`)

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Session expired."))
      }

      const responseData = await response.json()
      currentUser = responseData.user
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser))
    } catch (error) {
      console.error("Failed to sync current user:", error)
      clearAuthSession()
      setMessage(loginMessage, "Your session expired. Please log in again.", "error")
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault()

      const targetSection = link.dataset.sectionLink || DEFAULT_SECTION
      showSection(targetSection)
      await runSectionLoaders(targetSection)
    })
  })

  sectionButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const targetSection = button.dataset.goTo || DEFAULT_SECTION
      showSection(targetSection)
      await runSectionLoaders(targetSection)
    })
  })

  navToggle?.addEventListener("click", () => {
    if (!navMenu) {
      return
    }

    const isOpen = navMenu.classList.toggle("open")
    navToggle.setAttribute("aria-expanded", String(isOpen))
  })

  logoutButton?.addEventListener("click", () => {
    clearAuthSession()
    updateAuthUi()
    resetCreateEventFormMode()
    createEventForm?.reset()
    registrationForm?.reset()
    if (selectedEventNotice) {
      selectedEventNotice.hidden = true
      selectedEventNotice.textContent = ""
    }
    setMessage(loginMessage, "You have been logged out.")
    showSection("login")
  })

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault()
    resetMessages(loginMessage, signupMessage)

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmailInput?.value.trim() || "",
          password: loginPasswordInput?.value || "",
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Login failed.")
      }

      setAuthSession(responseData.token, responseData.user)
      updateAuthUi()
      loginForm.reset()
      setMessage(loginMessage, "Login successful.", "success")

      if (pendingEventId) {
        const eventId = pendingEventId
        pendingEventId = null
        startRegisterEvent(eventId)
        return
      }

      const nextSection = pendingSectionId || (isAdmin() ? "admin-dashboard" : "my-registrations")
      pendingSectionId = null
      showSection(nextSection)
      await runSectionLoaders(nextSection)
    } catch (error) {
      console.error("Login failed:", error)
      setMessage(loginMessage, error.message || "Login failed.", "error")
    }
  })

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault()
    resetMessages(signupMessage, loginMessage)

    try {
      const response = await fetch(`${apiBaseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupNameInput?.value.trim() || "",
          email: signupEmailInput?.value.trim() || "",
          password: signupPasswordInput?.value || "",
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Signup failed.")
      }

      signupForm.reset()
      setMessage(signupMessage, responseData.message || "Account created successfully.", "success")
      setMessage(loginMessage, "Your account is ready. Please log in.", "success")
      showSection("login")
    } catch (error) {
      console.error("Signup failed:", error)
      setMessage(signupMessage, error.message || "Signup failed.", "error")
    }
  })

  createEventForm?.addEventListener("submit", async (event) => {
    event.preventDefault()

    if (!isAdmin()) {
      setMessage(createMessage, "Only admin users can create or edit events.", "error")
      return
    }

    const title = titleInput?.value.trim() || ""
    const description = descriptionInput?.value.trim() || ""
    const date = dateInput?.value || ""
    const location = locationInput?.value.trim() || ""

    resetMessages(createMessage)

    try {
      const isEditingEvent = editingEventId !== null
      const requestUrl = isEditingEvent ? `${apiBaseUrl}/events/${editingEventId}` : `${apiBaseUrl}/events`
      const requestMethod = isEditingEvent ? "PUT" : "POST"

      const response = await authFetch(requestUrl, {
        method: requestMethod,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          date,
          location,
        }),
      })

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            isEditingEvent ? "Event update failed." : "Event creation failed."
          )
        )
      }

      setMessage(
        createMessage,
        isEditingEvent ? "Event updated successfully." : "Event created successfully.",
        "success"
      )
      createEventForm.reset()
      resetCreateEventFormMode()
      await loadEvents()
      showSection("view-events")
    } catch (error) {
      console.error("Error saving event:", error)
      setMessage(createMessage, error.message || "Could not save the event.", "error")
    }
  })

  loadEventsBtn?.addEventListener("click", async () => {
    await loadEvents()
  })

  loadDashboardBtn?.addEventListener("click", async () => {
    await loadDashboard()
  })

  loadMyRegistrationsBtn?.addEventListener("click", async () => {
    await loadMyRegistrations()
  })

  eventSearch?.addEventListener("input", async () => {
    await filterEventsByTitle()
  })

  registrationForm?.addEventListener("submit", async (event) => {
    event.preventDefault()
    resetMessages(registerMessage)

    if (!isLoggedIn()) {
      handleUnauthorizedAccess("Please log in before registering for an event.", "register-event")
      return
    }

    const eventId = registrationEventIdInput?.value.trim() || ""

    if (!eventId) {
      setMessage(registerMessage, "Please choose an event before submitting.", "error")
      return
    }

    try {
      const response = await authFetch(`${apiBaseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Registration failed.")
      }

      setMessage(registerMessage, responseData.message || "Registration successful.", responseData.emailSent === false ? "error" : "success")
      registrationForm.reset()
      updateRegistrationIdentity()

      if (selectedEventNotice) {
        selectedEventNotice.hidden = true
        selectedEventNotice.textContent = ""
      }
    } catch (error) {
      console.error("Registration request failed:", error)
      setMessage(registerMessage, error.message || "Registration failed.", "error")
    }
  })

  window.addEventListener("hashchange", async () => {
    const sectionId = getSectionIdFromHash()
    showSection(sectionId, { updateHash: false })
    await runSectionLoaders(sectionId)
  })

  const initializeApp = async () => {
    currentToken = localStorage.getItem(AUTH_TOKEN_KEY)
    currentUser = getStoredUser()
    await syncCurrentUser()
    updateAuthUi()

    const today = new Date().toISOString().split("T")[0]

    if (dateInput) {
      dateInput.min = today
    }

    const initialSection = getSectionIdFromHash()
    showSection(initialSection, { updateHash: false })
    await runSectionLoaders(initialSection)
  }

  initializeApp()
}
