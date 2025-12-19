# EventPulse - MERN Stack Event Management Platform

A full-stack Event Management Application built with the MERN stack (MongoDB, Express, React, Node.js). It features a modern, visually stunning UI and comprehensive event management capabilities.

## 📁 Project Structure

The project is separated into two main folders for easy deployment:

- **`client/`**: The React frontend application (Vite)
- **`server/`**: The Node.js/Express backend API

## 🚀 Quick Start

### 1. Backend Setup (`server/`)

```bash
cd server
npm install
# Create a .env file with your credentials (see server/.env.example)
npm run dev
```

### 2. Frontend Setup (`client/`)

```bash
cd client
npm install
npm run dev
```

## ✨ Features

- **Authentication**: Secure login/registration for Users, Organizers, and Admins.
- **Event Management**: Create, update, and delete events (Organizers).
- **Booking System**: Users can book, view, and cancel tickets. capacity constraints included.
- **Search & Filter**: Powerful search and category filtering for finding events.
- **Modern UI**: Visually appealing, responsive design with gradients and animations.
- **Admin Dashboard**: System-wide statistics and user/event management.
- **Real-time Updates**: Live seat availability and booking status.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (JSON Web Tokens)

## 📝 Deployment

This structure allows you to deploy the frontend and backend independently:

- **Frontend**: Deploy the `client` folder to Vercel, Netlify, or Amplify.
- **Backend**: Deploy the `server` folder to Render, Heroku, or Railway.

---

Built with ❤️ by EventPulse Team