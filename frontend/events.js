const apiUrl =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/events"
    : `${window.location.origin.replace(/\/$/, "")}/api/events`

const loadEventsBtn = document.getElementById("loadEventsBtn")
const statusMessage = document.getElementById("statusMessage")
const eventsContainer = document.getElementById("eventsContainer")

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

const renderEvents = (events) => {
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
      <h2>${event.title}</h2>
      <p><span class="label">ID:</span> ${event._id}</p>
      <p><span class="label">Description:</span> ${event.description}</p>
      <p><span class="label">Date:</span> ${formatDate(event.date)}</p>
      <p><span class="label">Location:</span> ${event.location}</p>
    `

    eventsContainer.appendChild(card)
  })
}

const getErrorMessage = async (response) => {
  try {
    const responseData = await response.json()
    return responseData.message || "Failed to load events."
  } catch {
    return "Failed to load events."
  }
}

const loadEvents = async () => {
  statusMessage.textContent = "Loading events..."
  statusMessage.className = "status"
  eventsContainer.innerHTML = ""

  try {
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(await getErrorMessage(response))
    }

    const events = await response.json()
    renderEvents(events)
  } catch (error) {
    statusMessage.textContent = error.message || "Could not load events."
    statusMessage.className = "status error"
    console.error("Error loading events:", error)
  }
}

loadEventsBtn?.addEventListener("click", loadEvents)
