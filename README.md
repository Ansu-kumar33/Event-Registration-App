# Event Registration System

<<<<<<< HEAD
Event Registration System is a full-stack web application for creating events, browsing upcoming events, registering attendees, and reviewing activity from an admin dashboard. The project combines a React frontend, a static multi-page interface, and a Node.js/Express API backed by MongoDB.

## Project Overview

This repository provides a simple event management workflow for small teams, campus events, workshops, and internal programs. Administrators can create and manage events, while users can view available events and submit registrations. The backend also supports registration confirmation emails and a dashboard summary of recent activity.

## Features

- Create new events with title, description, date, and location
- View all events sorted by date
- Search events by title
- Update and delete existing events
- Register attendees for an event
- Send confirmation emails after successful registration
- Register users through the authentication endpoint
- View dashboard metrics for total events and registrations
- See recent events and recent registrations from the admin dashboard

## Tech Stack

- Frontend: React 19, Vite, HTML, CSS, JavaScript
- Backend: Node.js, Express 5
- Database: MongoDB with Mongoose
- Email: Nodemailer with Gmail transport
- Tooling: ESLint, npm

## Installation Steps

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB Atlas or a MongoDB instance
- A Gmail account with an app password for email delivery

### Setup
=======
A full-stack web application that allows users to register for events through a simple and user-friendly interface.

## Features

- User Registration
- Event Registration
- Responsive Frontend
- REST API Backend
- MongoDB Database Integration
- Form Validation

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

## Project Structure

```
Event-Registration-App/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── server.js
│   ├── routes/
│   └── models/
│
├── package.json
└── README.md
```

## Installation
>>>>>>> 2dcf973c662b844a7ff6d2d975ba9ea200fbe4fb

1. Clone the repository:

```bash
<<<<<<< HEAD
git clone <repository-url>
cd Event-Registration-App
```

2. Install root dependencies:
=======
git clone https://github.com/Ansu-kumar33/Event-Registration-App.git
```

2. Navigate to the project directory:

```bash
cd Event-Registration-App
```

3. Install dependencies:
>>>>>>> 2dcf973c662b844a7ff6d2d975ba9ea200fbe4fb

```bash
npm install
```

<<<<<<< HEAD
3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

5. Create a backend environment file:

```bash
cd ../backend
copy .env.example .env
```

6. Start the backend server:
=======
4. Configure MongoDB connection in your backend.

5. Start the server:
>>>>>>> 2dcf973c662b844a7ff6d2d975ba9ea200fbe4fb

```bash
npm start
```

<<<<<<< HEAD
If `npm start` is not defined in your local setup, run:

```bash
node server.js
```

7. Start the frontend development server in a new terminal:

```bash
cd frontend
npm run dev
```

By default, the API runs on `http://localhost:5000` and the Vite frontend runs on `http://localhost:5173`.

## Environment Variables

Create `backend/.env` using `backend/.env.example` and configure the following values:

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string for your database |
| `EMAIL_USER` | Gmail address used to send registration emails |
| `EMAIL_PASS` | Gmail app password for the configured email account |
| `PORT` | Optional backend port, defaults to `5000` |

Example:

```env
MONGO_URI=your_mongodb_atlas_connection_string
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
PORT=5000
```

## API Endpoints

### Health and Diagnostics

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Confirms the backend server is running |
| `GET` | `/api/db-status` | Returns MongoDB and environment diagnostics |

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Registers a new user |

Expected payload:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword"
}
```

### Events

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/events` | Fetches all events |
| `GET` | `/api/events/search?title=workshop` | Searches events by title |
| `POST` | `/api/events` | Creates a new event |
| `PUT` | `/api/events/:id` | Updates an event |
| `DELETE` | `/api/events/:id` | Deletes an event |

Expected event payload:

```json
{
  "title": "Developer Workshop",
  "description": "Hands-on coding session",
  "date": "2026-07-15",
  "location": "Conference Hall A"
}
```

### Registrations

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/register` | Registers a user for an event and attempts to send a confirmation email |

Expected payload:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "eventId": "684f00000000000000000000"
}
```

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/dashboard` | Returns totals and recent activity for events and registrations |

## Screenshots

Add screenshots to this section to showcase the interface:

- Home page
- Admin dashboard
- Create event form
- Events listing
- Registration form

Example markdown:

```md
![Home Page](./screenshots/home.png)
![Admin Dashboard](./screenshots/dashboard.png)
```

## Author

**Ansu Kumar**  
Email: `ansu33524@gmail.com`
=======
## Usage

1. Open the application in your browser.
2. Fill out the registration form.
3. Submit the form to register for an event.
4. Registered data will be stored in MongoDB.

## Future Enhancements

- User Authentication
- Event Management Dashboard
- Email Notifications
- Admin Panel

## Author

**Ansu Kumar**

GitHub: https://github.com/Ansu-kumar33
>>>>>>> 2dcf973c662b844a7ff6d2d975ba9ea200fbe4fb
