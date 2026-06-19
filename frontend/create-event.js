const createEventForm = document.getElementById('createEventForm')
const message = document.getElementById('message')

createEventForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const title = document.getElementById('title').value.trim()
  const description = document.getElementById('description').value.trim()
  const date = document.getElementById('date').value
  const location = document.getElementById('location').value.trim()

  console.log('Creating event with data:', { title, description, date, location })

  message.textContent = ''
  message.className = 'message'

  try {
    console.log('Sending POST /api/events request')

    const response = await fetch('https://event-registration-app-8eei.onrender.com/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        description: description,
        date: date,
        location: location,
      }),
    })

    console.log('Create event response status:', response.status)
    console.log('Create event response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Create event error response:', errorText)
      throw new Error(errorText || 'Event creation failed')
    }

    const savedEvent = await response.json()
    console.log('Event created successfully:', savedEvent)

    message.textContent = 'Event Created Successfully'
    message.classList.add('success')
    createEventForm.reset()
  } catch (error) {
    console.error('Error creating event:', error)
    message.textContent = 'Event creation failed'
    message.classList.add('error')
  }
})
