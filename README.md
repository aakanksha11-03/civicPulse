# 🏙️ CivicPulse – Smart Civic Issue Reporting & Resolution System

**Making Cities Smarter, Safer, and More Responsive.**

CivicPulse is a full-stack MERN-based civic issue reporting and management platform designed to bridge the communication gap between citizens and municipal authorities. It enables citizens to report public infrastructure problems, track complaint progress in real time, and provide feedback on resolutions.

The platform introduces a structured, transparent workflow where municipal administrators can manage complaints, assign department officers, monitor performance, and ensure that reported issues are resolved efficiently.

Rather than simply collecting complaints, CivicPulse focuses on **accountability, transparency, intelligent prioritization, and efficient public service delivery.**

---

## 🌟 Key Features

### 👤 1. Citizen Portal
- Secure citizen registration and login.
- Submit civic complaints with titles and detailed descriptions.
- Upload up to 4 complaint photographs.
- Provide location details and GPS coordinates.
- Automatically categorize complaints based on keywords.
- Automatically assign priority based on issue urgency.
- Track complaint status and complete activity history.
- Receive notifications about complaint updates.
- Submit ratings and feedback after verification.

### 🛠️ 2. Municipal Admin Dashboard
- View and manage all reported complaints.
- Assign complaints to appropriate department officers.
- Modify complaint categories and priorities.
- Manage officers, supervisors, and staff accounts.
- Create and manage complaint categories.
- Configure keywords for automatic categorization.
- Monitor department and officer performance.
- Track overdue complaints and resolution statistics.

### 👷 3. Department Officer Portal
- View assigned complaints.
- Accept or reject assignments with a reason.
- Update complaint progress.
- Upload progress photographs.
- Mark complaints as resolved with resolution notes.

### 📊 4. Supervisor Dashboard
- Monitor complaint resolution performance.
- Review completed work.
- Verify resolved complaints or send them back for correction.
- Escalate unresolved issues.
- Monitor departmental statistics and overdue complaints.

### 🤖 5. Intelligent Complaint Management
- **Automatic Categorization:** Identifies complaint categories using configurable keywords.
- **Smart Priority Detection:** Detects urgency-related keywords and assigns low, medium, high, or urgent priority.
- **Duplicate Detection:** Identifies potentially duplicate open complaints of the same category within 150 metres.
- **SLA Tracking:** Calculates complaint deadlines using category-specific service-level hours.
- **Notification System:** Generates in-app alerts during important complaint updates.

### 📈 6. Analytics & Performance Monitoring
- Total complaints overview.
- Resolved and pending complaint statistics.
- Category-wise complaint distribution.
- Priority-wise complaint analysis.
- Status-wise complaint monitoring.
- Department performance reports.
- Officer-wise assignment and resolution statistics.
- Average resolution time and citizen feedback ratings.

---

## 🔄 Complaint Resolution Workflow

CivicPulse follows a structured complaint management lifecycle:

1. **Complaint Submission:** A citizen reports an issue with its description, location, and photographs.
2. **Automatic Analysis:** The system identifies the category and priority using predefined keywords and checks for nearby duplicate complaints.
3. **Admin Assignment:** The municipal administrator assigns the complaint to the appropriate department officer.
4. **Officer Response:** The assigned officer accepts or rejects the complaint with a reason.
5. **Work in Progress:** The officer updates progress and uploads supporting photographs.
6. **Resolution:** The officer marks the issue as resolved and adds a resolution note.
7. **Supervisor Verification:** The supervisor verifies the work or sends it back for correction.
8. **Citizen Feedback:** The citizen rates the resolution and provides feedback.

**Workflow:**

Citizen → Complaint Submission → Automatic Classification → Admin Assignment → Officer Action → Resolution → Supervisor Verification → Citizen Feedback

---

## 🧰 Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, HTML5, CSS3, JavaScript |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT, bcryptjs |
| API Communication | Axios, REST API |
| File Upload | Multer |
| Email Service | Nodemailer |
| Routing | React Router DOM |
| Development | Git, GitHub, VS Code |

---

## 🏗️ System Architecture

```text
              CIVICPULSE PLATFORM
                       |
          +------------+------------+
          |                         |
     React Frontend             REST API
       (Vite)                  (Express.js)
          |                         |
          |                   Authentication
          |                   JWT Middleware
          |                   Role Permissions
          |                         |
          |              +----------+----------+
          |              |          |          |
          |           Auth      Complaints   Admin
          |           Routes      Routes     Routes
          |              |          |          |
          +--------------+----------+----------+
                                |
                           Mongoose ODM
                                |
                             MongoDB
```

---

## 📂 Project Structure

```text
CivicPulse/
│
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   │
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api.js
│       ├── auth.jsx
│       ├── styles.css
│       │
│       └── pages/
│           ├── AuthPages.jsx
│           ├── Complaints.jsx
│           └── Admin.jsx
│
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   └── admin.js
│   │
│   ├── uploads/
│   ├── middleware.js
│   ├── models.js
│   ├── utils.js
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Installation & Setup

Follow these steps to run CivicPulse locally.

### Prerequisites

Make sure you have installed:

- Node.js (18 or later)
- npm
- MongoDB (local installation or MongoDB Atlas)
- Git
- VS Code (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CivicPulse.git
```

```bash
cd CivicPulse
```

### Step 2: Configure the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Add the following configuration:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/civicpulse
JWT_SECRET=your_secure_secret_key
CLIENT_URL=http://localhost:5173

AUTO_VERIFY=true

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**Note:** For local development, `AUTO_VERIFY=true` allows users to log in without email verification. Configure SMTP to send actual verification and password-reset emails.

### Step 3: Seed the Database

Run the following command:

```bash
npm run seed
```

This creates initial demo accounts and predefined complaint categories.

### Step 4: Start the Backend Server

```bash
npm run dev
```

Backend API:

```text
http://localhost:5000
```

### Step 5: Configure the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend application:

```text
http://localhost:5173
```

### Step 6: Open CivicPulse

Visit:

http://localhost:5173

Your CivicPulse application is now ready to use!

---

## 🔐 Demo Login Credentials

After running the database seed command, use these accounts to explore the different dashboards.

**Default Password for All Accounts: `Password@123`**

| Role | Email |
|---|---|
| Citizen | citizen@civicpulse.test |
| Municipal Admin | admin@civicpulse.test |
| Supervisor | supervisor@civicpulse.test |
| Public Works Officer | works@civicpulse.test |
| Electricity Officer | power@civicpulse.test |
| Water Officer | water@civicpulse.test |
| Sanitation Officer | sanitation@civicpulse.test |

*These are development-only demo credentials. Do not use them in production.*

---

## 🔒 Security & Authentication

CivicPulse implements several security-related mechanisms:

- JWT-based authentication.
- Password hashing using bcryptjs.
- Role-based authorization.
- Protected application routes.
- Email verification support.
- Forgot-password and reset-password functionality.
- Protected complaint access.
- File upload size restrictions (5 MB per image).

---

## 🚀 Future Enhancements

The project can be extended with the following advanced features:

- [ ] AI-powered complaint classification using Machine Learning.
- [ ] AI-based duplicate complaint detection using semantic similarity.
- [ ] Real-time notifications using Socket.IO.
- [ ] Interactive GIS maps for complaint visualization.
- [ ] Predictive analytics for identifying high-risk civic areas.
- [ ] Multilingual support for regional languages.
- [ ] Mobile application for citizens and municipal officers.
- [ ] Public transparency dashboard showing city-wide resolution performance.
- [ ] Citizen chatbot for complaint registration and assistance.
- [ ] Integration with municipal government systems.

---

## 🎯 Project Objectives

1. Simplify the process of reporting civic infrastructure problems.
2. Improve communication between citizens and municipal authorities.
3. Automate complaint categorization and priority assignment.
4. Establish accountability through a role-based resolution workflow.
5. Reduce duplicate complaints and improve response efficiency.
6. Provide performance insights through analytical dashboards.
7. Promote transparency and citizen participation in urban governance.

---

## 💡 What Makes CivicPulse Different?

Traditional complaint systems often focus only on collecting complaints. CivicPulse takes a more comprehensive approach by connecting the entire complaint lifecycle.

| Traditional Systems | CivicPulse |
|---|---|
| Manual categorization | Keyword-based automatic categorization |
| Basic complaint submission | Photo and location-supported reporting |
| Limited tracking | Complete complaint timeline |
| Manual priority handling | Automatic urgency-based prioritization |
| No duplicate awareness | Nearby duplicate detection |
| Limited accountability | Admin, officer and supervisor workflow |
| Basic status updates | Notifications and performance analytics |

---

## 📌 Project Information

**Project Name:** CivicPulse – Smart Civic Issue Reporting & Resolution System

**Project Type:** Full-Stack Web Application

**Architecture:** MERN Stack

**Domain:**