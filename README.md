# 🔧 TeknisyanKo

### Your Trusted Platform for Finding Skilled Technicians

**TeknisyanKo** is a Filipino-based technician service marketplace designed to connect customers with skilled, reliable, and qualified technicians for various repair, maintenance, and technical services.

The platform provides a convenient digital environment where customers can discover technicians, request services, manage bookings, and monitor their service transactions. Technicians can manage their professional profiles, showcase their expertise, receive service requests, and handle their assigned jobs.

TeknisyanKo aims to simplify the process of finding trusted technical services while providing administrators with tools to manage and monitor the entire platform.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Project Objectives](#-project-objectives)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Backend Overview](#-backend-overview)
- [Database Overview](#-database-overview)
- [Authentication and Security](#-authentication-and-security)
- [Installation and Setup](#-installation-and-setup)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [Development Roadmap](#-development-roadmap)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Project Overview

TeknisyanKo is a service marketplace that bridges the gap between customers who need technical assistance and technicians who provide professional repair and maintenance services.

Finding a reliable technician can be difficult, particularly when customers have limited access to verified service providers. TeknisyanKo addresses this problem by providing a centralized platform where customers can explore available services and connect with technicians.

The system is designed around three primary user roles:

1. **Customers** – Individuals looking for technical services.
2. **Technicians** – Professionals offering repair and maintenance services.
3. **Administrators** – Personnel responsible for managing and monitoring the platform.

TeknisyanKo is designed as a cross-platform ecosystem consisting of a web application, a mobile application, a backend REST API, and a centralized MySQL database.

---

## 🎯 Project Objectives

The primary objectives of TeknisyanKo are:

- Provide customers with an accessible platform for finding skilled technicians.
- Simplify the process of requesting and booking technical services.
- Provide technicians with tools to manage their professional profiles and service requests.
- Establish a centralized system for managing customers, technicians, services, and bookings.
- Improve transparency and organization in service transactions.
- Implement secure authentication and role-based access control.
- Provide administrators with centralized management capabilities.
- Support both web and mobile platforms through a shared backend API.

---

## ✨ Key Features

### Customer Features

- Customer registration and login.
- Customer profile management.
- Browse available technical services.
- Discover and view technician profiles.
- Submit service requests.
- Manage service bookings.
- Monitor booking progress.
- Review and rate completed services.
- Receive service-related notifications.

### Technician Features

- Technician registration and login.
- Professional profile management.
- Technician information and credentials.
- Service specialization management.
- Receive customer service requests.
- Manage assigned bookings and jobs.
- Update service progress.
- Maintain professional service history.

### Administrator Features

- Secure administrator authentication.
- Dashboard and platform monitoring.
- Customer account management.
- Technician account management.
- Technician verification and approval.
- Service category management.
- Service management.
- Booking management.
- Payment and transaction monitoring.
- Review and rating management.
- Platform activity monitoring.

_Features are part of the system's intended functionality and are being implemented progressively._

---

## 👥 User Roles

| Role          | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| Customer      | Searches for technicians and requests services.             |
| Technician    | Provides technical services and manages assigned jobs.      |
| Administrator | Manages platform users, services, bookings, and operations. |

The backend uses authentication and authorization mechanisms to restrict access to protected resources based on user permissions and account status.

---

## 🛠 Technology Stack

### Frontend

| Technology   | Purpose                                |
| ------------ | -------------------------------------- |
| React.js     | Web application interface              |
| Vite         | Frontend development and build tooling |
| React Native | Cross-platform mobile development      |
| Expo         | Mobile development and deployment      |

### Backend

| Technology           | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| Node.js              | JavaScript runtime                                  |
| Express.js 5         | REST API framework                                  |
| MySQL2               | MySQL database connectivity                         |
| bcrypt               | Password hashing                                    |
| JSON Web Token (JWT) | Authentication and token verification               |
| dotenv               | Environment variable management                     |
| CORS                 | Cross-origin resource sharing                       |
| Nodemon              | Backend development and automatic server restarting |

### Database

| Technology | Purpose                               |
| ---------- | ------------------------------------- |
| MySQL      | Relational database management system |

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- MySQL Workbench
- Node.js
- npm

---

## 🏗 System Architecture

TeknisyanKo follows a client-server architecture with a centralized REST API.

The web and mobile applications communicate with the backend through HTTP requests. The backend processes requests, performs authentication and authorization checks, interacts with the MySQL database, and returns structured responses.

### Architecture Components

**1. Web Application**

Built using React and Vite. Provides browser-based access to the platform.

**2. Mobile Application**

Built using React Native and Expo. Provides mobile access for Android and iOS users.

**3. Backend REST API**

Built using Node.js and Express.js. Handles business logic, authentication, authorization, and database operations.

**4. Database**

Uses MySQL for centralized storage of platform information.

### Architecture Diagram

```text
             TEKNISYANKO ECOSYSTEM

       ┌──────────────────────────┐
       │      WEB APPLICATION     │
       │       React + Vite       │
       └────────────┬─────────────┘
                    │
                    │
       ┌────────────▼─────────────┐
       │     MOBILE APPLICATION   │
       │  React Native + Expo     │
       └────────────┬─────────────┘
                    │
                    │ HTTP / REST API
                    │
       ┌────────────▼─────────────┐
       │       BACKEND API        │
       │     Node.js + Express    │
       │                          │
       │  Authentication          │
       │  Authorization           │
       │  Business Logic          │
       │  API Controllers         │
       │  Middleware              │
       └────────────┬─────────────┘
                    │
                    │
       ┌────────────▼─────────────┐
       │       MYSQL DATABASE     │
       │                          │
       │  Users                   │
       │  Customers               │
       │  Technicians             │
       │  Services                │
       │  Bookings                │
       │  Transactions            │
       └──────────────────────────┘
```

---

## 📁 Project Structure

The project follows a modular monorepo structure.

```text
TeknisyanKo/
│
├── apps/
│   │
│   ├── web/
│   │   └── React + Vite Application
│   │
│   └── mobile/
│       └── React Native + Expo Application
│
├── server/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   └── Database Configuration
│   │   │
│   │   ├── controllers/
│   │   │   └── Request Controllers
│   │   │
│   │   ├── middleware/
│   │   │   └── Authentication and Authorization
│   │   │
│   │   ├── models/
│   │   │   └── Database Models
│   │   │
│   │   ├── routes/
│   │   │   └── API Routes
│   │   │
│   │   ├── services/
│   │   │   └── Business Logic
│   │   │
│   │   ├── utils/
│   │   │   └── Helper Utilities
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── Database Scripts and SQL Files
│
├── docs/
│   └── Project Documentation
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## ⚙ Backend Overview

The TeknisyanKo backend is developed using Node.js and Express.js 5.

It serves as the central processing layer for the web and mobile applications.

### Backend Responsibilities

- Handle incoming HTTP requests.
- Process customer, technician, and administrator operations.
- Authenticate users through JWT.
- Authorize protected API requests.
- Manage user account statuses.
- Communicate with the MySQL database.
- Process service-related operations.
- Return standardized API responses.

### Backend Architecture

The backend follows a modular architecture:

| Directory      | Responsibility                         |
| -------------- | -------------------------------------- |
| `config/`      | Database and application configuration |
| `controllers/` | Handles incoming API requests          |
| `middleware/`  | Authentication and request validation  |
| `models/`      | Database interactions                  |
| `routes/`      | API endpoint definitions               |
| `services/`    | Business logic                         |
| `utils/`       | Reusable helper functions              |

This structure improves maintainability, scalability, and code organization.

---

## 🗄 Database Overview

TeknisyanKo uses MySQL as its primary relational database.

The database is designed to support the platform's core operations.

### Planned Database Domains

| Domain                  | Description                                      |
| ----------------------- | ------------------------------------------------ |
| Users                   | Account credentials, roles, and account status   |
| Customers               | Customer-related information                     |
| Technicians             | Technician profiles and professional information |
| Technician Verification | Verification and approval records                |
| Service Categories      | Classification of technical services             |
| Services                | Services offered by technicians                  |
| Bookings                | Customer service requests and appointments       |
| Payments                | Payment and transaction records                  |
| Reviews                 | Customer ratings and feedback                    |
| Notifications           | System and service-related notifications         |

The database uses relational structures to maintain consistency and relationships between platform entities.

---

## 🔐 Authentication and Security

Security is an important component of TeknisyanKo.

The backend implements JWT-based authentication and bcrypt password hashing.

### Authentication

The authentication process includes:

1. User submits login credentials.
2. Backend retrieves the corresponding account.
3. Password is verified using bcrypt.
4. Backend generates a JWT upon successful authentication.
5. Client includes the token in protected API requests.
6. Authentication middleware validates the token.

### Account Status Validation

The backend also incorporates account-status validation.

Protected requests must check the user's current account status against the MySQL database.

This prevents users with suspended or inactive accounts from accessing protected resources using previously issued, unexpired JWTs.

### Security Measures

- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API routes.
- Role-based authorization.
- Database-backed account status validation.
- Environment-based configuration.
- Separation of authentication and authorization middleware.

Security improvements and validation testing are ongoing.

---

## 🚀 Installation and Setup

### Prerequisites

Before running the project, ensure that the following are installed:

- Node.js (v22 or later recommended)
- npm
- MySQL Server
- MySQL Workbench (optional)
- Git
- Visual Studio Code (recommended)
- Postman (for API testing)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project directory:

```bash
cd TeknisyanKo
```

### 2. Install Dependencies

Install the project dependencies:

```bash
npm install
```

### 3. Configure the Backend

Navigate to the server directory:

```bash
cd server
```

Install backend dependencies if necessary:

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Use the environment configuration described below.

### 5. Configure MySQL

Start your MySQL server.

Create the database using the database name configured in your environment variables.

Import or execute the project's SQL schema and database scripts.

### 6. Start the Backend

From the `server` directory, execute:

```bash
npx nodemon src/server.js
```

The backend should start and establish a connection to MySQL.

---

## 🔑 Environment Configuration

The backend uses environment variables through dotenv.

Example `.env.example`:

```env
PORT=5000

CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=teknisyanko

JWT_SECRET=YOUR_SECURE_JWT_SECRET
```

**Important Security Notes:**

- Never upload your actual `.env` file to GitHub.
- Never expose your database password.
- Never expose your JWT secret.
- Use strong, unique secrets in production.
- Keep `.env.example` updated without including actual credentials.

---

## 🌐 API Documentation

TeknisyanKo uses RESTful API conventions.

The backend exposes endpoints for authentication, account management, technicians, services, bookings, and other platform operations.

### Health Check

| Method | Endpoint      | Description                 |
| ------ | ------------- | --------------------------- |
| GET    | `/api/health` | Checks backend availability |

Example response:

```json
{
  "success": true,
  "message": "API is running",
  "application": "TeknisyanKo",
  "timestamp": "..."
}
```

### API Modules

The backend is organized around the following API modules:

- Authentication
- User Management
- Customer Management
- Technician Management
- Technician Verification
- Service Categories
- Services
- Bookings
- Payments
- Reviews and Ratings
- Notifications
- Administrator Dashboard

_Refer to the backend route files for the currently implemented endpoint paths and request requirements._

---

## 🧪 API Testing

Postman is used to test and validate backend functionality.

Testing includes:

- API health checks.
- Authentication and login.
- JWT token validation.
- Protected route access.
- Role-based access restrictions.
- Account status validation.
- Customer and technician operations.
- Administrator operations.
- Database connectivity.
- HTTP response validation.

Expected HTTP response codes include:

| Status Code | Description                   |
| ----------- | ----------------------------- |
| 200         | Successful request            |
| 201         | Resource successfully created |
| 400         | Bad request                   |
| 401         | Unauthorized                  |
| 403         | Forbidden                     |
| 404         | Resource not found            |
| 500         | Internal server error         |

---

## 🗺 Development Roadmap

TeknisyanKo is being developed through incremental development phases.

The roadmap covers the following major development areas:

| Development Area          | Objective                                               |
| ------------------------- | ------------------------------------------------------- |
| Project Foundation        | Establish project structure and development environment |
| Backend Foundation        | Configure Express and MySQL connectivity                |
| Database Development      | Establish core database structures                      |
| Authentication            | Implement registration, login, and JWT authentication   |
| User Management           | Develop customer and technician management              |
| Technician Management     | Implement technician profiles and verification          |
| Service Management        | Manage technical service categories and offerings       |
| Booking Management        | Handle customer requests and service appointments       |
| Administrative Management | Implement administrator operations                      |
| API Validation            | Test and verify backend endpoints                       |
| Dashboard Integration     | Connect dashboard functionality with backend services   |
| Security Improvements     | Strengthen authentication and authorization             |
| Platform Integration      | Connect web and mobile applications                     |
| Testing and Deployment    | Perform system testing and production preparation       |

### Current Development Focus

**Phase 13 – Authentication and Security Improvements**

Current focus:

- Improve the `authenticateToken` middleware.
- Validate current user account status against MySQL on every protected request.
- Reject inactive accounts.
- Reject suspended accounts.
- Reject nonexistent accounts.
- Prevent previously issued, unexpired JWTs from bypassing account restrictions.
- Verify that active accounts retain access.
- Test existing JWTs against different account statuses.

---

## 🔮 Future Improvements

Potential future enhancements include:

- Real-time booking notifications.
- Technician location tracking.
- Advanced technician search and filtering.
- Improved service recommendation features.
- Online payment integration.
- Enhanced administrator analytics.
- In-app messaging between customers and technicians.
- Push notifications.
- Technician performance analytics.
- Production deployment and infrastructure optimization.

---

## 🤝 Contributing

Contributions and suggestions are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Implement your changes.
4. Test your changes.
5. Submit a pull request.

Please ensure that changes follow the project's existing architecture and coding conventions.

---

## 📄 License

The licensing terms for TeknisyanKo have not yet been finalized.

---

## 👨‍💻 Project Information

**Project Name:** TeknisyanKo

**Project Type:** Technician Service Marketplace

**Platform:** Web and Mobile

**Backend:** Node.js and Express.js

**Database:** MySQL

**Web Framework:** React + Vite

**Mobile Framework:** React Native + Expo

**API Architecture:** REST API

---

### TeknisyanKo

**Connecting Customers. Empowering Technicians. Simplifying Services.**

A platform built to make finding reliable technical services easier and more accessible.
