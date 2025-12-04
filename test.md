# Althub Student Connect - Full Stack Test Strategy

This document outlines the comprehensive testing strategy employed to ensure the reliability of "Althub Student Connect". We utilize a mix of **Integration Tests** for the backend API and **Unit Tests** for the frontend interfaces.

## Test Coverage Overview

| Component | Type | Key Features Tested | Status |
| :--- | :--- | :--- | :--- |
| **Althub-Server** | Integration | Auth, Post CRUD, Database Integrity | 
| **Althub-Main** | Unit (React) | Login, Registration, Feed Rendering | 
| **Althub-Institute** | Unit (React) | Login, Event Management | 
| **Althub-Admin** | Unit (React) | Admin Login, Route Protection | 

---

## 1. Backend API Tests (`Althub-Server`)
**Tool:** Jest + Supertest + MongoDB Memory Server

### Authentication (`auth.test.js`)
* **POST /register:** Verifies user creation and handles duplicate emails.
* **POST /login:** Verifies JWT token generation and credential validation.

### Post Management (`post.test.js`)
* **POST /createPost:** Checks if a logged-in user can create a text/image post.
* **GET /getPosts:** Ensures the feed retrieves data correctly.
* **PUT /like:** Verifies the "Like" functionality updates the database.

---

## 2. Student Portal Tests (`Althub-Main`)
**Tool:** React Testing Library

### User Access
* **Login.test.js:** Validates email/password inputs and redirection to Home.
* **Register.test.js:** * Checks form validation (e.g., password mismatch).
    * Verifies successful API call triggers navigation to Login.

### Component Logic
* **Mocks:** We mock `axios` to prevent real network calls during testing.
* **Routing:** We test navigation paths using `react-router-dom` mocks.

---

## 3. Institute Dashboard Tests (`Althub-Institute`)

### Access Control
* **Login.test.js:** Ensures only valid institute credentials grant access to the dashboard.
* **LocalStorage:** Verifies that the Institute ID is securely stored for session management.

### Feature: Event Management
* **AddEvent.test.js:**
    * Simulates an institute admin typing event details.
    * Verifies that the form data is correctly formatted and sent to the `/api/addEvent` endpoint.

---

## 4. Admin Panel Tests (`Althub-Admin`)

### Security
* **Login.test.js:** * Verifies the `auth_code` mechanism (Security Layer).
    * Ensures the Admin JWT token is received and stored.
* **Protected Routes:** Tests that unauthorized users are redirected back to login.

---

## How to Run All Tests

To execute the full suite of tests, run these commands in separate terminals:

### Testing
```bash
# Backend
cd Althub-Server
npm test

# Student App
cd Althub-Main
npm test

# Institute App
cd Althub-Institute
npm test

# Admin App
cd Althub-Admin
npm test