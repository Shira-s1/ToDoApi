# Fullstack Todo-List with JWT Authentication 🚀

A modern, secure Todo application built with ASP.NET Core Minimal API and React. This project demonstrates the implementation of a full authentication flow, data isolation between users, and persistent storage.

## ✨ Key Features

* **Secure Authentication**: Implementation of JWT (JSON Web Tokens) for secure API access.
* **Password Security**: Passwords are never stored in plain text; they are hashed using BCrypt.Net.
* **Data Isolation**: Each user can only see, create, and manage their own tasks. Users' data is isolated via Foreign Keys in MySQL.
* **Automatic Login**: New users are automatically authenticated and logged in immediately after registration for a smooth UX.
* **Axios Interceptors**: Global handling of 401 Unauthorized errors to redirect users to the login page and automatic injection of Bearer tokens into request headers.
* **Protected Routes**: Frontend routes are guarded, ensuring only logged-in users can access the dashboard.

## 🛠️ Tech Stack

* **Backend**: .NET 8 (Minimal APIs), Entity Framework Core.
* **Database**: MySQL.
* **Frontend**: React, Axios, React Router.
* **Security**: JWT Bearer Authentication, BCrypt.

## 🚀 Getting Started

### Backend Setup
1. Update `appsettings.json` with your MySQL connection string and JWT Secret Key.
2. Run `dotnet restore`.
3. Run `dotnet run`.

### Frontend Setup
1. Navigate to the `ToDoListReact` folder.
2. Run `npm install`.
3. Run `npm start`.
