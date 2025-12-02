# 🎓 Althub Student Connect - Server Portal

**For the Backend API**

```markdown
# 🖥️ Althub Student Connect - Backend Server

This is the **Centralized Backend API** for the Althub ecosystem. It serves data to the Student Portal, Institute Dashboard, and Admin Panel, and manages real-time communication via WebSockets.

## ⚡ Key Functionalities

* **RESTful API:** Endpoints for Users, Posts, Events, Institutes, and more.
* **Authentication:** JWT-based auth and secure password hashing with bcrypt.
* **Database Management:** Mongoose schemas for structured MongoDB interaction.
* **Real-time Engine:** Socket.IO server for instant messaging and live notifications.
* **File Storage:** GridFS / Multer storage for profile pictures and document uploads.
* **Email Services:** Nodemailer integration for password resets and alerts.

## 🛠️ Tech Stack

* **Runtime:** [Node.js](https://nodejs.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **Database:** MongoDB
* **Real-time:** Socket.IO
* **Security:** CORS, Cookie-Parser, JWT

## 🚀 Getting Started

### Prerequisites
* Node.js
* MongoDB (Local instance or Atlas URI)

### Installation

1.  **Navigate to the directory:**
    ```bash
    cd Althub-Server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory with the following variables:
    ```env
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    SECRET_KEY=your_jwt_secret
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASSWORD=your_email_app_password
    ```

4.  **Start the Server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:5001`.

### 🧪 Running Tests

To run backend integration tests:
```bash
npm test