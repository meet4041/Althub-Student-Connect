# 🧪 Althub Student Connect - Comprehensive Test Plan

This document summarizes the test coverage for the **Althub Student Connect** platform, spanning Backend, Student Portal, Institute Portal, and Admin Panel.

## 📂 Test Architecture

The testing strategy is divided into four main suites to ensure full stack reliability:

| Application | Test Type | Path | Focus |
| :--- | :--- | :--- | :--- |
| **Althub-Server** | Backend/Integration | `/Althub-Server/tests` | API Endpoints, Database Logic, Auth |
| **Althub-Main** | Frontend Unit | `/src/components/__tests__` | Student/Alumni User Experience |
| **Althub-Institute** | Frontend Unit | `/src/jsx/pages/__tests__` | Institutional Dashboard & Login |
| **Althub-Admin** | Frontend Unit | `/src/jsx/pages/__tests__` | Super Admin Security & Login |

---

## 🛡️ Backend Tests (Server)
**File:** `Althub-Server/tests/auth.test.js`

These tests verify the core security and data integrity of the platform using an in-memory MongoDB database to prevent polluting production data.

* **Registration Logic:**
    * ✅ Verifies that new students can register with valid data.
    * ✅ Ensures duplicate emails are rejected (Preventing duplicate accounts).
* **Authentication:**
    * ✅ Verifies login returns a valid JWT token on success.
    * ✅ Verifies login fails gracefully with incorrect passwords.

---

## 🖥️ Frontend Tests (React Clients)

### 1. Student Portal (`Althub-Main`)
**File:** `src/components/__tests__/Login.test.js`

* **User Interface:** Checks that the login form renders with all necessary fields (Email, Password).
* **Interaction:** Simulates user typing into fields to ensure state updates correctly.
* **API Integration:** Mocks `axios` to ensure the correct credentials are sent to `/api/userLogin`.
* **Navigation:** Verifies redirection to the `/home` dashboard upon successful login.

### 2. Institute Portal (`Althub-Institute`)
**File:** `src/jsx/pages/__tests__/Login.test.js`

* **Target Audience:** Institutional User (Registrars/Faculty).
* **Key Checks:**
    * ✅ Validates that the "Remember Me" functionality updates state correctly.
    * ✅ Ensures `localStorage` is populated with `AlmaPlus_institute_Id` upon login.
    * ✅ Verifies validation error messages appear for empty input fields.

### 3. Admin Portal (`Althub-Admin`)
**File:** `src/jsx/pages/__tests__/Login.test.js`

* **Target Audience:** Super Admins.
* **Key Checks:**
    * ✅ Verifies the specific `auth_code` is correctly appended to the API request for admin verification.
    * ✅ Checks that the **Authentication Token** is stored in `localStorage` for protected route access.
    * ✅ Mocks `axios.defaults.headers` to ensure subsequent requests include the Bearer token.

---

## 🚀 How to Execute Tests

To run the full test suite, navigate to each directory and run the test script:

```bash
# 1. Backend
cd Althub-Server
npm test

# 2. Student Portal
cd Althub-Main
npm test

# 3. Institute Portal
cd Althub-Institute
npm test

# 4. Admin Portal
cd Althub-admin
npm test