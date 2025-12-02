# 🎓 Althub Student Connect - Admin Portal

**For the Super Admin Panel**

```markdown
# 🛡️ Althub Student Connect - Admin Panel

The **Super Admin Panel** is a restricted-access dashboard designed for platform administrators. It allows for the high-level management of the entire Althub ecosystem.

## ✨ Features

* **Dashboard Analytics:** Overview of total users, active institutes, and platform engagement.
* **User Management:** Ability to view, verify, or ban user accounts (Students/Alumni).
* **Institute Management:** Add, edit, or remove participating educational institutions.
* **Content Moderation:** Monitor posts and feedback to ensure community guidelines.
* **Company Management:** Manage partner companies and job listings.

## 🛠️ Tech Stack

* **Framework:** React.js (v17)
* **UI Framework:** Material UI, Bootstrap
* **Charts:** ApexCharts, Chart.js (for analytics)
* **Data Tables:** DataTables.net integration for managing large datasets.

## 🚀 Getting Started

### Installation

1.  **Navigate to the directory:**
    ```bash
    cd Althub-admin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: If you encounter legacy peer dependency issues, try `npm install --legacy-peer-deps`.*

3.  **Start the Dashboard:**
    ```bash
    npm start
    ```
    The admin panel usually runs on `http://localhost:3001` or `3002` (React will prompt to switch ports if 3000 is busy).

### 🧪 Running Tests

```bash
npm test