export const initializeLegacyApp = () => {
const DEFAULT_SECTION = "home"
const sections = document.querySelectorAll(".page-section")
const navLinks = document.querySelectorAll("[data-section-link]")
const navToggle = document.querySelector(".nav-toggle")
const navMenu = document.querySelector(".nav")
const sectionButtons = document.querySelectorAll("[data-go-to]")

const createEventForm = document.getElementById("createEventForm")
const createMessage = document.getElementById("createMessage")
const createEventButton = document.getElementById("createEventButton")
const registrationForm = document.getElementById("registrationForm")
const registerMessage = document.getElementById("registerMessage")
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

const titleInput = document.getElementById("title")
const descriptionInput = document.getElementById("description")
const dateInput = document.getElementById("date")
const locationInput = document.getElementById("location")
const registrationNameInput = document.getElementById("name")
const registrationEmailInput = document.getElementById("email")
const registrationEventIdInput = document.getElementById("eventId")

const apiBaseUrl =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://event-registration-app-8eei.onrender.com/api"

let allEvents = []
let editingEventId = null

if (!sections.length) {
  return
}

if (document.body.dataset.legacyAppInitialized === "true") {
  return
}

document.body.dataset.legacyAppInitialized = "true"

const getSectionIdFromHash = () => {
  const hashValue = window.location.hash.replace(/^#/, "")
  const sectionExists = Array.from(sections).some((section) => section.id === hashValue)

  return sectionExists ? hashValue : DEFAULT_SECTION
}

const resetCreateEventFormMode = () => {
  editingEventId = null

  if (createEventButton) {
    createEventButton.textContent = "Create Event"
  }
}

const resetMessages = (...elements) => {
  elements.forEach((element) => {
    if (!element) {
      return
    }

    element.textContent = ""
    element.className = element.className.split(" ")[0]
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

const setSelectedEvent = (event) => {
  if (!registrationEventIdInput || !selectedEventNotice) {
    return
  }

  registrationEventIdInput.value = event._id
  selectedEventNotice.hidden = false
  selectedEventNotice.textContent = `Selected event: ${event.title} (${formatDate(event.date)})`
  selectedEventNotice.className = "status success"
}

const startEditEvent = (eventId) => {
  const selectedEvent = allEvents.find((event) => event._id === eventId)

  if (!selectedEvent) {
    createMessage.textContent = "Could not find the selected event."
    createMessage.className = "message error"
    return
  }

  editingEventId = selectedEvent._id
  fillCreateEventForm(selectedEvent)

  if (createEventButton) {
    createEventButton.textContent = "Update Event"
  }

  createMessage.textContent = "Edit the event details and submit the form to update this event."
  createMessage.className = "message"
  showSection("create-event")
}

const startRegisterEvent = (eventId) => {
  const selectedEvent = allEvents.find((event) => event._id === eventId)

  if (!selectedEvent) {
    registerMessage.textContent = "Could not find the selected event."
    registerMessage.className = "message error"
    showSection("register-event")
    return
  }

  resetMessages(registerMessage)
  setSelectedEvent(selectedEvent)
  showSection("register-event")
  registrationNameInput?.focus()
}

const runSectionLoaders = async (sectionId) => {
  if (sectionId === "admin-dashboard") {
    await loadDashboard()
  }

  if (sectionId === "view-events") {
    await loadEvents()
  }
}

const showSection = (sectionId, options = {}) => {
  const { updateHash = true } = options

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

const formatDate = (value) => {
  if (!value) {
    return "Unknown date"
  }

  const date = new Date(value)

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatDateTime = (value) => {
  if (!value) {
    return "Unknown date"
  }

  const date = new Date(value)

  return date.toLocaleString("en-US", {
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

const renderEvents = (events) => {
  if (!eventsContainer || !statusMessage) {
    return
  }

  eventsContainer.innerHTML = ""

  if (events.length === 0) {
    statusMessage.textContent = "No events found."
    statusMessage.className = "status error"
    return
  }

  statusMessage.textContent = `${events.length} event${events.length === 1 ? "" : "s"} loaded successfully.`
  statusMessage.className = "status success"

  events.forEach((event) => {
    const card = document.createElement("article")
    card.className = "event-card"

    card.innerHTML = `
      <h3>${event.title}</h3>
      <p><span class="label">ID:</span> ${event._id}</p>
      <p><span class="label">Description:</span> ${event.description}</p>
      <p><span class="label">Date:</span> ${formatDate(event.date)}</p>
      <p><span class="label">Location:</span> ${event.location}</p>
      <div class="event-actions">
        <button class="register-btn" type="button" data-register-event="${event._id}">Register</button>
        <button class="edit-btn" type="button" data-edit-event="${event._id}">Edit Event</button>
        <button class="delete-btn" type="button" data-delete-event="${event._id}">Delete Event</button>
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

      const confirmed = window.confirm("Delete this event?")

      if (!confirmed) {
        return
      }

      try {
        const response = await fetch(`${apiBaseUrl}/events/${eventId}`, {
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
        statusMessage.textContent = error.message || "Could not delete the event."
        statusMessage.className = "status error"
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
    statusMessage.textContent = "Searching events..."
    statusMessage.className = "status"
    eventsContainer.innerHTML = ""

    const response = await fetch(`${apiBaseUrl}/events/search?title=${encodeURIComponent(searchTerm)}`)

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to search events."))
    }

    const matchingEvents = await response.json()
    allEvents = matchingEvents
    renderEvents(matchingEvents)
  } catch (error) {
    statusMessage.textContent = error.message || "Could not search events."
    statusMessage.className = "status error"
    console.error("Error searching events:", error)
  }
}

const loadEvents = async () => {
  if (!statusMessage || !eventsContainer) {
    return
  }

  statusMessage.textContent = "Loading events..."
  statusMessage.className = "status"
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
    statusMessage.textContent = error.message || "Could not load events."
    statusMessage.className = "status error"
    console.error("Error loading events:", error)
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

  dashboardMessage.textContent = "Loading dashboard..."
  dashboardMessage.className = "status"

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
    dashboardMessage.textContent = "Dashboard loaded successfully."
    dashboardMessage.className = "status success"
  } catch (error) {
    dashboardMessage.textContent =
      error.message ||
      "Could not load the dashboard. Please confirm the deployed backend is available and try again."
    dashboardMessage.className = "status error"
    console.error("Error loading dashboard:", error)
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

createEventForm?.addEventListener("submit", async (event) => {
  event.preventDefault()

  const title = titleInput?.value.trim() || ""
  const description = descriptionInput?.value.trim() || ""
  const date = dateInput?.value || ""
  const location = locationInput?.value.trim() || ""

  createMessage.textContent = ""
  createMessage.className = "message"

  try {
    const isEditingEvent = editingEventId !== null
    const requestUrl = isEditingEvent ? `${apiBaseUrl}/events/${editingEventId}` : `${apiBaseUrl}/events`
    const requestMethod = isEditingEvent ? "PUT" : "POST"

    const response = await fetch(requestUrl, {
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

    createMessage.textContent = isEditingEvent ? "Event updated successfully." : "Event created successfully."
    createMessage.classList.add("success")
    createEventForm.reset()
    resetCreateEventFormMode()
    await loadEvents()
    showSection("view-events")
  } catch (error) {
    console.error("Error saving event:", error)
    createMessage.textContent = error.message || "Could not save the event."
    createMessage.classList.add("error")
  }
})

loadEventsBtn?.addEventListener("click", async () => {
  await loadEvents()
})

loadDashboardBtn?.addEventListener("click", async () => {
  await loadDashboard()
})

eventSearch?.addEventListener("input", async () => {
  await filterEventsByTitle()
})

registrationForm?.addEventListener("submit", async (event) => {
  event.preventDefault()

  const name = registrationNameInput?.value.trim() || ""
  const email = registrationEmailInput?.value.trim() || ""
  const eventId = registrationEventIdInput?.value.trim() || ""

  registerMessage.textContent = ""
  registerMessage.className = "message"

  try {
    const response = await fetch(`${apiBaseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        eventId,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || "Registration failed.")
    }

    registerMessage.textContent = responseData.message || "Registration successful."
    registerMessage.classList.add(responseData.emailSent === false ? "error" : "success")
    registrationForm.reset()

    if (selectedEventNotice) {
      selectedEventNotice.hidden = true
      selectedEventNotice.textContent = ""
    }
  } catch (error) {
    console.error("Registration request failed:", error)
    registerMessage.textContent = error.message || "Registration failed."
    registerMessage.classList.add("error")
  }
})

window.addEventListener("hashchange", async () => {
  const sectionId = getSectionIdFromHash()
  showSection(sectionId, { updateHash: false })
  await runSectionLoaders(sectionId)
})

const initializeApp = async () => {
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
