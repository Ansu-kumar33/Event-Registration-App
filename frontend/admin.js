const dashboardUrl =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/dashboard"
    : `${window.location.origin.replace(/\/$/, "")}/api/dashboard`

const refreshButton = document.getElementById("refreshDashboardBtn")
const adminMessage = document.getElementById("adminMessage")
const adminTotalEvents = document.getElementById("adminTotalEvents")
const adminTotalRegistrations = document.getElementById("adminTotalRegistrations")
const adminRecentEvents = document.getElementById("adminRecentEvents")
const adminRecentRegistrations = document.getElementById("adminRecentRegistrations")

const formatDate = (value) => {
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

const renderList = (element, items, emptyText, renderItem) => {
  element.innerHTML = ""

  if (!Array.isArray(items) || items.length === 0) {
    const listItem = document.createElement("li")
    listItem.textContent = emptyText
    element.appendChild(listItem)
    return
  }

  items.forEach((item) => {
    const listItem = document.createElement("li")
    listItem.innerHTML = renderItem(item)
    element.appendChild(listItem)
  })
}

const getErrorMessage = async (response) => {
  try {
    const responseData = await response.json()
    return responseData.message || `Dashboard request failed with status ${response.status}`
  } catch {
    return `Dashboard request failed with status ${response.status}`
  }
}

const loadDashboard = async () => {
  adminMessage.textContent = "Loading dashboard data..."
  adminMessage.className = "status"

  try {
    const response = await fetch(dashboardUrl)

    if (!response.ok) {
      throw new Error(await getErrorMessage(response))
    }

    const dashboardData = await response.json()

    adminTotalEvents.textContent = String(dashboardData.totalEvents ?? 0)
    adminTotalRegistrations.textContent = String(dashboardData.totalRegistrations ?? 0)

    renderList(
      adminRecentEvents,
      dashboardData.recentEvents,
      "No recent events yet.",
      (event) =>
        `<strong>${event.title}</strong><span>${event.location} | ${formatDate(
          event.createdAt || event.date
        )}</span>`
    )

    renderList(
      adminRecentRegistrations,
      dashboardData.recentRegistrations,
      "No recent registrations yet.",
      (registration) =>
        `<strong>${registration.name}</strong><span>${registration.email} | Event ID: ${
          registration.eventId
        } | ${formatDate(registration.createdAt)}</span>`
    )

    adminMessage.textContent = "Dashboard loaded successfully."
    adminMessage.className = "status success"
  } catch (error) {
    console.error("Admin dashboard load failed:", error)
    adminMessage.textContent =
      error.message ||
      "We could not load the dashboard right now. Please make sure the backend is running on port 5000 and try again."
    adminMessage.className = "status error"
  }
}

refreshButton?.addEventListener("click", loadDashboard)

loadDashboard()
