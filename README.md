# 🎫 HelpDesk Mini - Support Ticket Management System

A modern, full-stack helpdesk application built with **React.js**, **Node.js**, **Express**, and **MongoDB**.  
It features **role-based access control**, **real-time SLA monitoring**, and a comprehensive **ticket management system**.

---

## 🚀 Live Demo

- **🌐 Frontend:** [https://helpdesk-mini-frontend.vercel.app](https://helpdesk-mini-frontend.vercel.app)  
- **🔧 Backend API:** [https://helpdesk-mini-backend.onrender.com](https://helpdesk-mini-backend.onrender.com)

---

## 🔐 Demo Credentials

### 👤 Regular User
- **Email:** `rai.shashank321@gmail.com`  
- **Password:** `Password@1`  
- **Role:** User (Create and manage own tickets)

### 👨‍💼 Support Agent
- **Email:** `agent@helpdesk.com`  
- **Password:** `Agent123!`  
- **Role:** Agent (Manage all tickets)

### 👨‍💻 System Administrator
- **Email:** `admin@helpdesk.com`  
- **Password:** `Admin123!`  
- **Role:** Admin (Full system access)

---

## ✨ Features

### 🎯 Core Features
- ✅ User Registration & Authentication (JWT)
- ✅ Role-Based Access Control (User / Agent / Admin)
- ✅ Ticket CRUD Operations
- ✅ Real-time SLA Monitoring with breach detection
- ✅ Comment System for communication
- ✅ Advanced Filtering & Search
- ✅ Responsive UI for all devices
- ✅ Dashboard Analytics with ticket statistics

### 🔧 Technical Features
- RESTful API with structured error handling
- MongoDB integration using Mongoose
- Email Notifications for updates
- Rate Limiting for security
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Optimistic locking for concurrent updates

---

## 🏗️ Technology Stack

### 🖼️ Frontend
- React.js 18
- React Router
- Axios
- Context API
- CSS3 (No frameworks)
- JavaScript ES6+

### 🧠 Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT + bcryptjs for authentication
- Nodemailer for email service
- express-rate-limit + helmet for security

### ☁️ Infrastructure
- Vercel → Frontend Deployment  
- Render → Backend Deployment  
- MongoDB Atlas → Cloud Database  
- GitHub → Version Control

---

## 📊 User Roles & Permissions

| Role              | Permissions |
|--------------------|-------------|
| 👤 **User**         | Create/view own tickets, add comments, track SLA |
| 👨‍💼 **Agent**       | View all tickets, update statuses, assign tickets, add comments (public/internal), view SLA alerts |
| 👨‍💻 **Admin**       | Full access including user management, system configuration, analytics |

---

## 🎫 Ticket Management

### ⏱️ Priority Levels & SLA
| Priority | SLA Time  | Description |
|---------|------------|-------------|
| 🔴 Critical | 2 hours  | System down, security issues |
| 🟠 High     | 8 hours  | Major business impact |
| 🟡 Medium   | 24 hours | Standard issues (default) |
| 🟢 Low      | 72 hours | Non-urgent |

### 🧭 Categories
- 🔧 Technical Issue  
- 💰 Billing  
- ❓ General Inquiry  
- 💡 Feature Request

### 🪄 Status Workflow
# 🧰 Helpdesk Mini

A full-stack **MERN (MongoDB, Express, React, Node)** based Helpdesk Management System with Ticketing, SLA timers, Role-based access, and Real-time comments.

---

## 2️⃣ Backend Setup

```bash
cd server
npm install
Create a .env file inside the server folder:

env
Copy code
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-64-characters-long
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
Start the backend server:

bash
Copy code
npm run dev
3️⃣ Frontend Setup
Open a new terminal:

bash
Copy code
cd client
npm install
Create a .env file inside the client folder:

env
Copy code
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
GENERATE_SOURCEMAP=false
Start the frontend app:

bash
Copy code
npm start
4️⃣ Access the Application
🌐 Frontend: http://localhost:3000

🧠 Backend: http://localhost:5000

💓 API Health: http://localhost:5000/api/health

📡 API Documentation
🔐 Authentication
POST /api/auth/register → Register new user

POST /api/auth/login → User login

GET /api/auth/profile → Get user profile

🎟️ Tickets
GET /api/tickets → List tickets (based on role)

POST /api/tickets → Create new ticket

GET /api/tickets/:id → Get ticket by ID

PATCH /api/tickets/:id → Update ticket (Agent/Admin)

GET /api/tickets/breached → List SLA-breached tickets

💬 Comments
POST /api/tickets/:id/comments → Add comment

GET /api/tickets/:id/comments → List comments

🧪 System
GET /api/health → Health check

🗂️ Project Structure
bash
Copy code
helpdesk-mini/
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── .env
├── server/               # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── jobs/
│   ├── package.json
│   ├── server.js
│   └── .env
├── .gitignore
└── README.md
🔧 Configuration
🖥 Backend (server/.env)
env
Copy code
NODE_ENV=production|development
PORT=5000
MONGODB_URI=mongodb://connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
FRONTEND_URL=frontend-url
💻 Frontend (client/.env)
env
Copy code
REACT_APP_API_URL=backend-api-url
REACT_APP_SOCKET_URL=backend-socket-url
GENERATE_SOURCEMAP=false
🚀 Deployment
🌐 Frontend (Vercel)
Push code to GitHub

Connect repo to Vercel

Set root to client

Add environment variables

Deploy ✅

🧠 Backend (Render)
Connect GitHub repo

Set root to server

Build Command: npm install

Start Command: npm start

Add environment variables

Deploy ✅

🛡️ Security Features
JWT Authentication

Password Hashing with bcrypt

Rate Limiting

Input Validation & Sanitization

CORS Protection

Helmet.js for HTTP headers

Protected Environment Variables

📈 Performance Features
Optimistic Locking

Database Indexing

Pagination

Request Caching

Compressed Responses

Optimized Production Build

🤝 Contributing
Fork the repository

Create a new branch

bash
Copy code
git checkout -b feature/amazing-feature
Commit your changes

bash
Copy code
git commit -m 'Add amazing feature'
Push to the branch

bash
Copy code
git push origin feature/amazing-feature
Open a Pull Request

📝 License
This project is licensed under the MIT License – see the LICENSE file for details.

👨‍💻 Developer
Shashank Shekhar

GitHub: @yourusername

Email: rai.shashank321@gmail.com

🙏 Acknowledgments
React.js team for the amazing framework

MongoDB for the flexible database solution

Vercel & Render for seamless deployment

Open-source community for inspiration

🎯 Quick Start Guide
Try the Live Demo with credentials above


Create tickets as a User

Switch to Agent/Admin to explore management features

Explore Dashboard Analytics

Test SLA monitoring with various priority tickets