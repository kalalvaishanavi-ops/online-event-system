# Online Event System 🎟️

A full-stack, production-ready **Online Event System** built with **React (Vite), Node.js, Express, MongoDB (Mongoose), JWT Authentication, and Bootstrap 5**.

This application supports multi-role access control for **Customers**, **Organizers**, and **Admins**.

---

## 🚀 Features & Roles

### 1. 👤 Customer Role
- **Browse & Search Events**: Filter by category, location, date, and availability.
- **Book Tickets**: Secure online booking with instant confirmation.
- **Manage Bookings**: View ticket history and cancel upcoming bookings.
- **User Profile**: Update profile details and manage account settings.

### 2. 🎪 Organizer Role
- **Event Creation & Management**: Create, edit, and cancel events.
- **Ticket Inventory Control**: Set seat capacity, pricing, and ticket tiers.
- **Organizer Analytics**: View bookings, revenue breakdown, and attendance lists.

### 3. 🛡️ Admin Role
- **System Dashboard**: Global platform metrics, user management, and event approvals.
- **User Management**: Manage roles (Customer, Organizer, Admin), activate/suspend accounts.
- **Category & System Settings**: Create and manage event categories and site parameters.

---

## 📂 Project Architecture

```text
online-event-system/
├── client/                  # React + Vite Frontend (Bootstrap 5, Axios, React Router)
├── server/                  # Node.js + Express REST API Backend (MongoDB, Mongoose, JWT)
├── docs/                    # API Documentation & System Specifications
├── README.md                # Main documentation
└── .gitignore               # Ignored files and folders
```

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 18 with Vite
- **Styling**: Bootstrap 5 + Bootstrap Icons + Custom CSS
- **HTTP Client**: Axios with automatic JWT interceptors
- **Routing**: React Router DOM v6

### Backend (`/server`)
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs password hashing
- **Validation**: express-validator
- **Logging & Security**: Morgan, CORS, Helmet/Custom security middleware

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: Local instance running at `mongodb://localhost:27017` or MongoDB Atlas URI

### 2. Backend Setup (`server`)
```bash
cd server
npm install
# Create a .env file (see .env.example)
npm run dev
```
The server will start on `http://localhost:5000`.

### 3. Frontend Setup (`client`)
```bash
cd client
npm install
npm run dev
```
The Vite dev server will start on `http://localhost:5173`.

---

## 📄 License
ISC License
