# 📐 Project Design Commentary: Althub Student Connect

## 1. Software Design Improvements

In the development of **Althub Student Connect**, the software design evolved from a monolithic structure to a more robust **Service-Oriented Architecture**. This transition was driven by the need to handle distinct user roles (Students, Alumni, Institutes, Admins) effectively and to support real-time features.

### **Decoupled Frontend Architecture**
* **Change:** Instead of a single frontend application, the system is split into three distinct React applications:
    * `Althub-Main`: For Students and Alumni.
    * `Althub-Institute`: For Institutional management.
    * `Althub-Admin`: For Super Admin control.
* **Improvement:** This separation reduces bundle sizes, improves security by isolating admin features, and allows for independent deployment and scaling of different platform sectors.

### **Centralized API Layer**
* **Change:** A single Node.js/Express backend (`Althub-Server`) serves all three frontends.
* **Improvement:** This ensures data consistency across the platform. For example, a job posted by an alumni via `Althub-Main` is instantly accessible to the institute via `Althub-Institute` because they share the same database and API endpoints.

### **Real-Time Event Architecture**
* **Change:** We integrated `Socket.IO` directly into the HTTP server in `index.js`.
* **Improvement:** This shifted the communication model from purely Request-Response (polling) to **Event-Driven** for features like messaging and notifications. This significantly reduces server load and latency compared to traditional polling methods.

---

## 2. Application of Design Principles

We strictly adhered to several key software engineering principles to ensure maintainability and readability.

### **A. Separation of Concerns (SoC)**
We applied SoC by dividing the backend application into distinct layers, ensuring that no single file handles too many responsibilities.
* **Applied In:** The directory structure of `Althub-Server`.
* **Implementation:**
    * **Routes (`/routes`):** Define the entry points (API endpoints) and HTTP methods. They do not contain business logic.
        * *Example:* `userRoute.js` maps `/register` to the controller but doesn't process the registration itself.
    * **Controllers (`/controllers`):** Contain the business logic, database calls, and response formatting.
        * *Example:* `userController.js` handles the complexity of hashing passwords and saving user data.
    * **Models (`/models`):** Define the database schema and data validation rules.

### **B. Single Responsibility Principle (SRP)**
Each module or function should have one, and only one, reason to change.
* **Applied In:** `authMiddleware.js` and Controller helper functions.
* **Implementation:**
    * The `requireAuth` middleware has a single job: verifying JWT tokens. It does not handle user login or registration; it simply acts as a gatekeeper.
    * In `userController.js`, helper functions like `securePassword` and `createtoken` are separated from the main route handlers. This keeps the main logic clean and allows these helpers to be reused or tested independently.

### **C. Don't Repeat Yourself (DRY)**
We aimed to reduce code duplication to lower the risk of inconsistencies.
* **Applied In:** Middleware and Configuration.
* **Implementation:**
    * Instead of checking for authentication inside every single controller function (e.g., inside `getUsers`, `followUser`), we created a reusable `requireAuth` middleware. This is applied to routes that need protection, centralizing the security logic in one place.
    * Configuration variables (like DB connection strings and secrets) are stored in a central `config` file or environment variables (`dotenv`), rather than being hardcoded in multiple files.

---

## 3. Key Refactoring

To improve the design and stability of the application, several key refactoring steps were undertaken during development:

### **Refactoring Storage Logic**
* **Before:** File upload logic was mixed directly into route handlers.
* **After:** We abstracted file handling into a dedicated utility (`db/storage.js`) and imported `uploadSingle` in our routes. This makes changing storage providers (e.g., switching to cloud storage) easier in the future without breaking route logic.

### **Centralized Error Handling**
* **Before:** `try-catch` blocks inconsistent responses across different controllers.
* **After:** We implemented a global error handling middleware in `index.js`. This ensures that any unhandled error in the application results in a consistent JSON error response to the client, preventing the server from crashing silently.

### **Socket Connection Management**
* **Before:** Socket logic was scattered or initialized multiple times on the client side.
* **After:** We refactored the client-side socket connection into a `useMemo` hook in `App.js`. This prevents multiple socket connections from opening every time the component re-renders, which is a common source of memory leaks and performance issues in React applications.