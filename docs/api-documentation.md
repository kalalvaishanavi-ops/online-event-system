# API Documentation - Online Event System

Base URL: `http://localhost:5000/api/v1`

---

## 🔐 Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user (Customer / Organizer) | Public |
| `POST` | `/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/auth/me` | Fetch currently logged-in user profile | Protected (All Roles) |

---

## 🎟️ Event Endpoints (`/api/v1/events`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/events` | List all active/approved events with pagination & search | Public |
| `GET` | `/events/:id` | Get detailed information for a single event | Public |
| `POST` | `/events` | Create a new event | Organizer / Admin |
| `PUT` | `/events/:id` | Update an existing event | Organizer (Owner) / Admin |
| `DELETE` | `/events/:id` | Cancel/Delete an event | Organizer (Owner) / Admin |

---

## 📑 Booking Endpoints (`/api/v1/bookings`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/bookings` | Book tickets for an event | Customer |
| `GET` | `/bookings/my-bookings` | Retrieve logged-in customer's booking history | Customer |
| `GET` | `/bookings/event/:eventId` | Retrieve attendee list for an event | Organizer / Admin |
| `PUT` | `/bookings/:id/cancel` | Cancel a ticket booking | Customer (Owner) / Admin |

---

## 🛡️ Admin Endpoints (`/api/v1/admin`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | System overview stats (Users, Events, Revenue) | Admin |
| `GET` | `/admin/users` | List all users with role filter | Admin |
| `PUT` | `/admin/users/:id/role` | Update user role or status | Admin |
| `POST` | `/admin/categories` | Create new event category | Admin |
