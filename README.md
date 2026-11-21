# 🏥 MediShare — Integrated Healthcare & Diagnostic Management Platform

MediShare is a full-stack healthcare web application connecting **Patients**, **Doctors**, and **Diagnostic Centers** in a single platform. It streamlines the patient care journey from symptom triage to specialist consultation, laboratory investigation, and digital record management.

---

## 🌟 Key Features

- **Patient Portal & Smart Onboarding**:
  - **New Patient Experience**: Patients without prior consultation are greeted by an onboarding welcome hub featuring 4 clean white quick-action cards to book appointments, explore tests, or consult MediBot.
  - **Returning Patient Dashboard**: Once a doctor records vitals, the portal displays real-time biometric telemetry (Blood Pressure, Heart Rate, Temperature, SpO₂, Respiratory Rate), active prescriptions, and medical history.

- **Unified Appointments Calendar**:
  - Book both **Doctor Consultations** and **Diagnostic Lab Tests** in a single interactive calendar.
  - Booking a lab test automatically sends a pending request to the Diagnostic Center and Doctor dashboards.
  - Distinct calendar chips and status badges separate clinical consultations from lab tests.

- **Doctor Consultation Portal**:
  - Manage daily consultation queues and view patient history.
  - Record patient vital signs during consultations, which instantly reflect on the patient's dashboard.
  - Issue structured digital prescriptions and requisition diagnostic tests.

- **Diagnostic Center Portal**:
  - View and process test requests submitted by patients and doctors.
  - Browse a catalog of 15 diagnostic tests across Blood Tests (CBC, Hemoglobin, Lipid Profile, etc.), Imaging & Scans (X-Ray, MRI, CT, Ultrasound, ECG), and Pathology (Urine analysis, HbA1c, LFT, KFT).
  - Upload digital test reports directly accessible by patients and physicians.

---

## 🤖 How MediBot Works

MediBot is an integrated clinical triage assistant that guides patients to the right care without manual searching:

1. **Natural Language Symptom Input**: Patients describe symptoms or health problems in plain text.
2. **Clinical Specialty Triage**: An intelligent rule-based engine analyzes the described symptoms and maps them to the appropriate medical field (such as Cardiology, Neurology, Dermatology, Orthopedics, Pediatrics, Gynecology, or General Medicine).
3. **Specialist & Diagnostic Recommendations**: Suggests matching specialist doctors and recommends relevant diagnostic laboratory tests or imaging scans.
4. **Direct Auto-Scheduling**: MediBot can schedule the recommended consultation or diagnostic test directly into the patient's calendar, syncing it across all relevant dashboards.

---

## 🩺 Seed Data

The platform comes pre-configured with realistic seed data:
- **Verified Doctors**: Pre-populated specialists across 7 core specialties (Cardiology, Neurology, Dermatology, Orthopedics, Pediatrics, Gynecology, and General Medicine).
- **Diagnostic Centers & Test Catalog**: Pre-populated diagnostic centers supporting standard blood tests, radiology scans, and pathology evaluations.
- **Demo Patients**: Pre-configured accounts demonstrating both new onboarding and returning patient flows.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router DOM, Axios, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Role-based JWT (JSON Web Tokens) with Bcrypt password hashing
- **Development Tooling**: Custom cross-platform concurrent process runner (`run-all.js`, `start-dev.bat`, `start-dev.ps1`)

---

## 📁 Project Structure

```text
MediShare_WAD/
├── client/                     # Frontend Application (React 19 + Vite)
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors
│   │   ├── components/         # MediBot, NewPatientWelcome, Navbar, Modals
│   │   ├── data/               # Seed datasets (doctors, diagnostics, symptom rules)
│   │   ├── pages/              # Patient, Doctor, Diagnostic, Auth & Landing pages
│   │   └── styles/             # Modular CSS stylesheets
│   └── package.json
│
├── server/                     # Backend Application (Node.js + Express + MongoDB)
│   ├── config/                 # MongoDB database configuration
│   ├── controllers/            # Auth, Appointment, Doctor, Diagnostic controllers
│   ├── middleware/             # JWT authentication & role-based access middleware
│   ├── models/                 # Mongoose schemas (User, Patient, Doctor, Diagnostic, etc.)
│   ├── routes/                 # Express API routes
│   ├── seed.js                 # Database seed script
│   └── server.js               # Server entry point
│
├── run-all.js                  # Zero-dependency concurrent runner
├── start-dev.bat               # Windows batch launcher
├── start-dev.ps1               # Windows PowerShell launcher
├── package.json                # Root orchestration package
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Setup & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Pranavi1605/Medi-Share.git
   cd Medi-Share
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `server/.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/medishare
   JWT_SECRET=medishare_super_secret_jwt_key_2026
   NODE_ENV=development
   ```

4. **Seed Database** (Optional):
   ```bash
   npm run seed
   ```

5. **Start Client & Server Concurrently**:
   ```bash
   npm run dev
   ```
   *(Or on Windows, run `start-dev.bat` or `./start-dev.ps1`)*

- Frontend runs at: `http://localhost:5173`
- Backend runs at: `http://localhost:5000`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
