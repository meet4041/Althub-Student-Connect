# 🎓 Althub Student Connect - Main Portal

The **Student & Alumni Portal** is the core frontend application for **Althub Student Connect**. It provides the user interface for students and alumni to network, find mentorship, access job opportunities, and participate in events.

## ✨ Features

* **User Authentication:** Secure login and registration for Students and Alumni.
* **Networking Feed:** A social-media style feed to view posts, updates, and news.
* **Alumni Directory:** Search and filter to find alumni by industry, year, or location.
* **Real-time Messaging:** Chat directly with peers and mentors using Socket.IO.
* **Event Management:** View and register for upcoming reunions and workshops.
* **Job & Internship Board:** Access career opportunities posted by alumni and partners.
* **Scholarship & Financial Aid:** Dedicated section for browsing financial aid options.

## 🛠️ Tech Stack

* **Framework:** [React.js](https://reactjs.org/) (v18)
* **Styling:** CSS, [Material UI (@mui)](https://mui.com/)
* **Routing:** React Router v6
* **State/Network:** Axios for API requests
* **Real-time:** Socket.IO Client
* **Notifications:** React Toastify

## 🚀 Getting Started

### Prerequisites
* Node.js (v14 or higher)
* npm or yarn

### Installation

1.  **Navigate to the directory:**
    ```bash
    cd Althub-main
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    * Ensure the `Althub-Server` is running (default port 5001).
    * Check `src/baseURL.js` (or similar config) to confirm the API endpoint matches your local server.

4.  **Start the application:**
    ```bash
    npm start
    ```
    The app will launch at `http://localhost:3000`.

### 🧪 Running Tests

To run the unit tests for components:
```bash
npm test