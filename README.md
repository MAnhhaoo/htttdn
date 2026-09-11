# Miva — Everything You Need 

Miva is a modern, premium e-commerce platform built with a robust **Next.js (Frontend)** and **Express.js (Backend)** architecture. This repository contains the complete source code for both the frontend and backend applications.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (Version 18.x or higher recommended)
* [Git](https://git-scm.com/)

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone https://github.com/MAnhhaoo/htttdn.git
cd htttdn
```

---

### 2. Setup the Backend (API Server) ⚙️

The backend is an Express.js server that provides the RESTful API and uses local JSON files for data storage (for testing purposes).

1. Open a new terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend server will start running on `http://localhost:5000`.*
   *You can view the Swagger API Documentation at `http://localhost:5000/api-docs`.*

---

### 3. Setup the Frontend (Web App)

The frontend is a Next.js 14 application that consumes the backend API to render the premium user interface.

1. Open a **second** terminal (keep the backend terminal running) and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend application will start running on `http://localhost:3000`.*

---

##  Viewing the Application

Once both servers are running:
* Open your browser and go to: **[http://localhost:3000](http://localhost:3000)** to see the Miva E-commerce website.
* Ensure the backend is running simultaneously on port 5000, otherwise, the frontend will not be able to load product data!

## Tech Stack

* **Frontend:** Next.js 14, React 19, Vanilla CSS (Custom Design System)
* **Backend:** Node.js, Express.js, Swagger UI (API Docs)
* **Data Storage:** In-memory JSON structures (located in `backend/src/data/`)

## Project Structure

```text
htttdn/
├── backend/          # Express.js REST API Server
│   ├── src/
│   │   ├── controllers/
│   │   ├── data/     # JSON database files
│   │   ├── models/
│   │   └── routes/
│   └── package.json
└── frontend/         # Next.js Web Application
    ├── src/
    │   ├── app/      # Pages and routing
    │   ├── components/
    │   ├── context/  # Global state management (Cart, Wishlist, Theme)
    │   └── lib/      # API client
    └── package.json
```
