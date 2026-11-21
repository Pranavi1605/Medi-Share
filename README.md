# 🏥 MediShare — Integrated Healthcare & Diagnostic Management Platform

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**MediShare** is a full-stack digital healthcare ecosystem connecting **Patients**, **Doctors**, and **Diagnostic Centers** through a unified, collaborative workflow. It features intelligent symptom-based clinical triage, unified appointments for consultations and lab scans, digital prescription delivery, vital sign telemetry, and secure diagnostic report sharing.

---

## 📑 Table of Contents

- [🌟 System Architecture & Key Features](#-system-architecture--key-features)
  - [1. Patient Portal & Onboarding Experience](#1-patient-portal--onboarding-experience)
  - [2. Unified Appointment & Lab Booking Calendar](#2-unified-appointment--lab-booking-calendar)
  - [3. MediBot — Clinical Triage & Auto-Scheduler](#3-medibot--clinical-triage--auto-scheduler)
  - [4. Doctor Consultation Portal](#4-doctor-consultation-portal)
  - [5. Diagnostic Center Portal & Test Catalog](#5-diagnostic-center-portal--test-catalog)
- [🩺 Seed Data & Clinical Scope](#-seed-data--clinical-scope)
  - [Verified Specialists (34 Doctors across 7 Specialties)](#verified-specialists-34-doctors-across-7-specialties)
  - [Verified Diagnostic Centers (5 Centers)](#verified-diagnostic-centers-5-centers)
  - [Diagnostic Tests Catalog (15 Tests)](#diagnostic-tests-catalog-15-tests)
- [🔑 Default Credentials & Demo Accounts](#-default-credentials--demo-accounts)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Folder Structure](#-folder-structure)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [Setup Commands](#setup-commands)
  - [Environment Configuration](#environment-configuration)
  - [Database Seeding](#database-seeding)
- [📡 API Endpoints](#-api-endpoints)
- [📄 License](#-license)

---

## 🌟 System Architecture & Key Features

### 1. Patient Portal & Onboarding Experience
- **Conditional Dashboard Rendering**:
  - **New Patient Onboarding**: If a patient has not yet consulted a doctor and has no vitals recorded, they are welcomed by a modern, dark-navy onboarding hub featuring **4 pure white (`#ffffff`) quick-action cards** (*Book Appointment, Find Specialist, Lab Tests, MediBot Consultation*).
  - **Returning Patient Dashboard**: Once a doctor records vitals during consultation, the onboarding hub gracefully transitions into a clinical health dashboard displaying real-time biometric telemetry ($\text{BP}$, $\text{Heart Rate}$, $\text{Temperature}$, $\text{SpO}_2$, $\text{Respiratory Rate}$), recent prescriptions, and appointment histories.

### 2. Unified Appointment & Lab Booking Calendar
- **Interactive Monthly Calendar**:
  - Direct day-click scheduling for both **🩺 Doctor Consultations** and **🔬 Diagnostic Lab Tests**.
  - Form toggles instantly between hospital specialist selection and diagnostic center/test selection.
  - Distinct calendar chips and upcoming/past appointment badges differentiate between consultations and laboratory scans.
- **Cross-Dashboard Real-Time Synchronization**:
  - Booking a diagnostic test updates the patient's schedule and simultaneously transmits a pending requisition into the **Diagnostic Center Dashboard** and **Doctor Dashboard**.

### 3. MediBot — Clinical Triage & Auto-Scheduler
- **Context-Aware Triage**: Patients type health concerns in natural language; MediBot identifies symptoms, maps them to clinical specialties, recommends appropriate tests, and suggests verified doctors.
- **Direct Scheduling**: MediBot can automatically book appointments into the patient's calendar without tedious manual navigation.
- **Strict Clinical Boundary**: MediBot strictly recommends only the 34 verified doctors, 5 diagnostic centers, and 15 cataloged diagnostic tests.

### 4. Doctor Consultation Portal
- **Patient Queue & Review**: View booked patient consultations, clinical history, and symptoms.
- **Vital Sign Entry**: Input systolic/diastolic blood pressure, pulse, temperature, oxygen saturation, and respiratory rate that sync immediately to the patient's dashboard.
- **Digital Prescriptions**: Generate structured prescriptions specifying medication, dosage, duration, and instructions.
- **Requisition Diagnostic Scans**: Order specialized lab investigations directly for patients.

### 5. Diagnostic Center Portal & Test Catalog
- **Test Management**: Review inbound laboratory and scan requests from patients and consulting physicians.
- **15-Test Catalog Viewer**: Dedicated catalog displaying available tests categorized by *Blood Tests*, *Imaging & Scans*, and *Other Diagnostic Tests*.
- **Digital Report Upload**: Securely upload and dispatch PDF / image test reports viewable inside patient and doctor portals.

---

## 🩺 Seed Data & Clinical Scope

### Verified Specialists (34 Doctors across 7 Specialties)

| Specialty | Verified Doctors & Hospitals |
| :--- | :--- |
| **Cardiology** | • Dr. Sneha Rao (Apollo Hospitals)<br>• Dr. Karthik Varma (KIMS Hospitals)<br>• Dr. Neha Sharma (AIG Hospitals)<br>• Dr. Rahul Mehta (CARE Hospitals)<br>• Dr. Abhinav Reddy (Yashoda Hospitals) |
| **Neurology** | • Dr. Priya Nair (Apollo Hospitals)<br>• Dr. Vivek Kulkarni (Yashoda Hospitals)<br>• Dr. Ananya Iyer (KIMS Hospitals)<br>• Dr. Sandeep Rao (Medicover Hospitals)<br>• Dr. Meera Kapoor (CARE Hospitals) |
| **Dermatology** | • Dr. Kavya Reddy (Apollo Hospitals)<br>• Dr. Nikhil Verma (AIG Hospitals)<br>• Dr. Divya Menon (Yashoda Hospitals)<br>• Dr. Pooja Shah (KIMS Hospitals)<br>• Dr. Aditya Rao (CARE Hospitals) |
| **Orthopedics** | • Dr. Rohan Gupta (Apollo Hospitals)<br>• Dr. Akhil Reddy (KIMS Hospitals)<br>• Dr. Swathi Krishna (Yashoda Hospitals)<br>• Dr. Manish Patel (CARE Hospitals)<br>• Dr. Tejas Kumar (Medicover Hospitals) |
| **Pediatrics** | • Dr. Ishita Sharma (Apollo Hospitals)<br>• Dr. Naveen Kumar (Rainbow Children's Hospital)<br>• Dr. Lakshmi Prasad (KIMS Hospitals)<br>• Dr. Farah Khan (Ankura Hospital)<br>• Dr. Sreeja Nair (Yashoda Hospitals) |
| **Gynecology** | • Dr. Anjali Deshmukh (Apollo Hospitals)<br>• Dr. Monica Reddy (Yashoda Hospitals)<br>• Dr. Swetha Rao (CARE Hospitals)<br>• Dr. Harini Prakash (KIMS Hospitals)<br>• Dr. Nisha Thomas (Fernandez Hospital) |
| **General Medicine** | • Dr. Ajay Srinivas (Apollo Hospitals)<br>• Dr. Sumanth Reddy (Medicover Hospitals)<br>• Dr. Deepika Rao (Yashoda Hospitals)<br>• Dr. Varun Chawla (KIMS Hospitals) |

---

### Verified Diagnostic Centers (5 Centers)

1. **HealthPlus Diagnostics** — HealthPlus Labs — *Hyderabad*
2. **MedScan Imaging Center** — MedScan Diagnostics — *Kukatpally*
3. **Prime Diagnostics** — Prime Healthcare Labs — *Madhapur*
4. **CarePath Laboratories** — CarePath Diagnostics — *Gachibowli*
5. **CityMed Diagnostics** — CityMed Labs — *Secunderabad*

---

### Diagnostic Tests Catalog (15 Tests)

- **🩸 Blood Tests**: Complete Blood Count (CBC), Hemoglobin Test, Blood Glucose Test, Lipid Profile, Thyroid Profile (T3, T4, TSH)
- **🩻 Imaging & Scans**: X-Ray Chest, MRI Brain, CT Scan Chest, Ultrasound Abdomen, ECG
- **🔬 Other Diagnostic Tests**: Urine Routine Examination, Vitamin D Test, Liver Function Test (LFT), Kidney Function Test (KFT), HbA1c

---

## 🔑 Default Credentials & Demo Accounts

All accounts are pre-configured with a universal default password for seamless demonstration:

| Role | Username / Email | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Doctor (Specific)** | `drsneharao@gmail.com`<br>*(or any `<doctorname>@gmail.com`)* | `123456` | Full Doctor Consultation Portal |
| **Doctor (Universal)** | `doctor@gmail.com` | `123456` | Primary Doctor Demo Account |
| **Diagnostic Center** | `diagnosticcentre@gmail.com`<br>`healthplusdiagnostics@gmail.com` | `123456` | Diagnostic Center Lab & Reports Portal |
| **Returning Patient** | `patient@medishare.com` | `123456` | Live Vitals Dashboard & Medical Records |
| **New Patient** | `newpatient@medishare.com` | `123456` | Onboarding Welcome Hub (White Action Cards) |

---

## 🛠️ Tech Stack

- **Client**:
  - React 19 + Vite 7
  - React Router DOM v7
  - Axios HTTP Client
  - Vanilla CSS & Modern Liquid-Glass Design System
- **Server**:
  - Node.js & Express.js
  - MongoDB & Mongoose ODM
  - JSON Web Tokens (JWT) & Bcrypt.js Password Security
- **Tooling & Orchestration**:
  - Custom cross-platform process runner (`run-all.js`, `start-dev.bat`, `start-dev.ps1`)

---

## 📁 Folder Structure

```text
MediShare_WAD/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors
│   │   ├── components/         # MediBot, NewPatientWelcome, Navbar, Modals
│   │   ├── data/               # Seed datasets (doctorsData, diagnosticData, symptomRules)
│   │   ├── pages/
│   │   │   ├── Auth/           # Login & Registration interfaces
│   │   │   ├── Patient/        # Patient Dashboard & Unified Calendar
│   │   │   ├── Doctor/         # Doctor Dashboard, Vitals Entry, Prescriptions
│   │   │   └── Diagnostic/     # Diagnostic Dashboard & Test Catalog
│   │   ├── styles/             # Modular CSS stylesheets
│   │   ├── App.jsx             # Main Router & Route Guards
│   │   └── main.jsx            # Application entry point
│   ├── .env.example            # Client environment template
│   └── package.json
│
├── server/                     # Backend Application
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # Auth, Appointment, Doctor, Diagnostic controllers
│   ├── middleware/             # Role-based JWT authentication middleware
│   ├── models/                 # Mongoose schemas (User, Patient, Doctor, Diagnostic, etc.)
│   ├── routes/                 # Express API routes
│   ├── utils/                  # Token generation helpers
│   ├── seed.js                 # Database seed script for 34 doctors & 5 centers
│   ├── .env.example            # Server environment template
│   ├── server.js               # Express application entry point
│   └── package.json
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
1. **Node.js** (v18.0.0 or higher)
2. **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### Setup Commands

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Pranavi1605/Medi-Share.git
   cd Medi-Share
   ```

2. **Install all dependencies** (root, client, server):
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create `server/.env` based on `server/.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/medishare
   JWT_SECRET=medishare_super_secret_jwt_key_2026
   NODE_ENV=development
   ```

4. **Seed Database** (Populates doctors, diagnostics, demo patients):
   ```bash
   npm run seed
   ```

5. **Start Frontend & Backend Concurrently**:
   ```bash
   npm run dev
   ```
   *(Or on Windows, simply double-click `start-dev.bat` or run `./start-dev.ps1`)*

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register/:role` — Register new user (`patient`, `doctor`, `diagnostic`)
- `POST /api/auth/login/:role` — Authenticate and receive JWT

### Appointments (`/api/appointments`)
- `POST /api/appointments/doctor` — Book doctor consultation
- `POST /api/appointments/diagnostic` — Book diagnostic laboratory test
- `GET /api/appointments/patient/:patientId` — Fetch patient appointments

### Clinical Records (`/api/records`)
- `POST /api/prescriptions` — Create doctor prescription
- `POST /api/reports/upload` — Upload diagnostic scan/lab report
- `GET /api/reports/patient/:patientId` — Retrieve patient diagnostic reports

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
