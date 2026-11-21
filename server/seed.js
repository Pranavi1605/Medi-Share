import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import PatientProfile from "./models/PatientProfile.js";
import DoctorProfile from "./models/DoctorProfile.js";
import DiagnosticProfile from "./models/DiagnosticProfile.js";
import DoctorAppointment from "./models/DoctorAppointment.js";
import DiagnosticAppointment from "./models/DiagnosticAppointment.js";
import Prescription from "./models/Prescription.js";
import Report from "./models/Report.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medishare";

// Exact Verified Doctors Seed Data as requested
const SEED_DOCTORS = [
  // 1. Cardiology
  { name: "Dr. Sneha Rao", specialization: "Cardiology", hospital: "Apollo Hospitals", experience: "12 years", email: "drsneharao@gmail.com" },
  { name: "Dr. Karthik Varma", specialization: "Cardiology", hospital: "KIMS Hospitals", experience: "14 years", email: "drkarthikvarma@gmail.com" },
  { name: "Dr. Neha Sharma", specialization: "Cardiology", hospital: "AIG Hospitals", experience: "10 years", email: "drnehasharma@gmail.com" },
  { name: "Dr. Rahul Mehta", specialization: "Cardiology", hospital: "CARE Hospitals", experience: "15 years", email: "drrahulmehta@gmail.com" },
  { name: "Dr. Abhinav Reddy", specialization: "Cardiology", hospital: "Yashoda Hospitals", experience: "9 years", email: "drabhinavreddy@gmail.com" },

  // 2. Neurology
  { name: "Dr. Priya Nair", specialization: "Neurology", hospital: "Apollo Hospitals", experience: "11 years", email: "drpriyanair@gmail.com" },
  { name: "Dr. Vivek Kulkarni", specialization: "Neurology", hospital: "Yashoda Hospitals", experience: "13 years", email: "drvivekkulkarni@gmail.com" },
  { name: "Dr. Ananya Iyer", specialization: "Neurology", hospital: "KIMS Hospitals", experience: "8 years", email: "drananyaiyer@gmail.com" },
  { name: "Dr. Sandeep Rao", specialization: "Neurology", hospital: "Medicover Hospitals", experience: "16 years", email: "drsandeeprao@gmail.com" },
  { name: "Dr. Meera Kapoor", specialization: "Neurology", hospital: "CARE Hospitals", experience: "10 years", email: "drmeerakapoor@gmail.com" },

  // 3. Dermatology
  { name: "Dr. Kavya Reddy", specialization: "Dermatology", hospital: "Apollo Hospitals", experience: "7 years", email: "drkavyareddy@gmail.com" },
  { name: "Dr. Nikhil Verma", specialization: "Dermatology", hospital: "AIG Hospitals", experience: "12 years", email: "drnikhilverma@gmail.com" },
  { name: "Dr. Divya Menon", specialization: "Dermatology", hospital: "Yashoda Hospitals", experience: "9 years", email: "drdivyamenon@gmail.com" },
  { name: "Dr. Pooja Shah", specialization: "Dermatology", hospital: "KIMS Hospitals", experience: "11 years", email: "drpoojashah@gmail.com" },
  { name: "Dr. Aditya Rao", specialization: "Dermatology", hospital: "CARE Hospitals", experience: "14 years", email: "dradityarao@gmail.com" },

  // 4. Orthopedics
  { name: "Dr. Rohan Gupta", specialization: "Orthopedics", hospital: "Apollo Hospitals", experience: "15 years", email: "drrohangupta@gmail.com" },
  { name: "Dr. Akhil Reddy", specialization: "Orthopedics", hospital: "KIMS Hospitals", experience: "10 years", email: "drakhilreddy@gmail.com" },
  { name: "Dr. Swathi Krishna", specialization: "Orthopedics", hospital: "Yashoda Hospitals", experience: "8 years", email: "drswathikrishna@gmail.com" },
  { name: "Dr. Manish Patel", specialization: "Orthopedics", hospital: "CARE Hospitals", experience: "13 years", email: "drmanishpatel@gmail.com" },
  { name: "Dr. Tejas Kumar", specialization: "Orthopedics", hospital: "Medicover Hospitals", experience: "9 years", email: "drtejaskumar@gmail.com" },

  // 5. Pediatrics
  { name: "Dr. Ishita Sharma", specialization: "Pediatrics", hospital: "Apollo Hospitals", experience: "11 years", email: "drishitasharma@gmail.com" },
  { name: "Dr. Naveen Kumar", specialization: "Pediatrics", hospital: "Rainbow Children's Hospital", experience: "14 years", email: "drnaveenkumar@gmail.com" },
  { name: "Dr. Lakshmi Prasad", specialization: "Pediatrics", hospital: "KIMS Hospitals", experience: "16 years", email: "drlakshmiprasad@gmail.com" },
  { name: "Dr. Farah Khan", specialization: "Pediatrics", hospital: "Ankura Hospital", experience: "9 years", email: "drfarahkhan@gmail.com" },
  { name: "Dr. Sreeja Nair", specialization: "Pediatrics", hospital: "Yashoda Hospitals", experience: "12 years", email: "drsreejanair@gmail.com" },

  // 6. Gynecology
  { name: "Dr. Anjali Deshmukh", specialization: "Gynecology", hospital: "Apollo Hospitals", experience: "15 years", email: "dranjalideshmukh@gmail.com" },
  { name: "Dr. Monica Reddy", specialization: "Gynecology", hospital: "Yashoda Hospitals", experience: "10 years", email: "drmonicareddy@gmail.com" },
  { name: "Dr. Swetha Rao", specialization: "Gynecology", hospital: "CARE Hospitals", experience: "12 years", email: "drswetharao@gmail.com" },
  { name: "Dr. Harini Prakash", specialization: "Gynecology", hospital: "KIMS Hospitals", experience: "8 years", email: "drhariniprakash@gmail.com" },
  { name: "Dr. Nisha Thomas", specialization: "Gynecology", hospital: "Fernandez Hospital", experience: "14 years", email: "drnishathomas@gmail.com" },

  // 7. General Medicine
  { name: "Dr. Ajay Srinivas", specialization: "General Medicine", hospital: "Apollo Hospitals", experience: "18 years", email: "drajaysrinivas@gmail.com" },
  { name: "Dr. Sumanth Reddy", specialization: "General Medicine", hospital: "Medicover Hospitals", experience: "11 years", email: "drsumanthreddy@gmail.com" },
  { name: "Dr. Deepika Rao", specialization: "General Medicine", hospital: "Yashoda Hospitals", experience: "9 years", email: "drdeepikarao@gmail.com" },
  { name: "Dr. Varun Chawla", specialization: "General Medicine", hospital: "KIMS Hospitals", experience: "13 years", email: "drvarunchawla@gmail.com" },
];

const SEED_DIAGNOSTICS = [
  { name: "HealthPlus Diagnostics", lab: "HealthPlus Labs", location: "Hyderabad", email: "healthplusdiagnostics@gmail.com" },
  { name: "MedScan Imaging Center", lab: "MedScan Diagnostics", location: "Kukatpally", email: "medscanimaging@gmail.com" },
  { name: "Prime Diagnostics", lab: "Prime Healthcare Labs", location: "Madhapur", email: "primediagnostics@gmail.com" },
  { name: "CarePath Laboratories", lab: "CarePath Diagnostics", location: "Gachibowli", email: "carepathlaboratories@gmail.com" },
  { name: "CityMed Diagnostics", lab: "CityMed Labs", location: "Secunderabad", email: "citymeddiagnostics@gmail.com" },
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected successfully.");

    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      PatientProfile.deleteMany({}),
      DoctorProfile.deleteMany({}),
      DiagnosticProfile.deleteMany({}),
      DoctorAppointment.deleteMany({}),
      DiagnosticAppointment.deleteMany({}),
      Prescription.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log("Hashing default passwords...");
    const defaultPassword = await bcrypt.hash("123456", 10);
    const doctorDefaultPassword = await bcrypt.hash("123456", 10);
    const diagnosticPassword = await bcrypt.hash("123456", 10);

    // 1. Create Existing Patient (Alex Morgan - has doctor consultation & vitals)
    const patientUser = await User.create({
      email: "patient@medishare.com",
      password: defaultPassword,
      role: "patient",
    });

    await PatientProfile.create({
      user: patientUser._id,
      fullName: "Alex Morgan",
      phone: "+91 98765 43210",
      age: 32,
      gender: "Male",
      bloodGroup: "O+",
      insurance: "Star Health Premier #SH-99201",
      emergencyName: "Sarah Morgan",
      emergencyPhone: "+91 98765 43211",
    });

    // 2. Create New Patient (Jordan Hayes - fresh new account without doctor vitals)
    const newPatientUser = await User.create({
      email: "newpatient@medishare.com",
      password: defaultPassword,
      role: "patient",
    });

    await PatientProfile.create({
      user: newPatientUser._id,
      fullName: "Jordan Hayes",
      phone: "+91 98765 11223",
      age: 26,
      gender: "Female",
      bloodGroup: "A+",
      insurance: "HDFC ERGO Health #HE-44321",
      emergencyName: "Taylor Hayes",
      emergencyPhone: "+91 98765 11224",
    });

    // 3. Create Diagnostic Centers (All 5 Seed Centers + Universal Logins)
    console.log("Seeding Diagnostic Centers...");
    let primaryDiagnosticUser = null;

    for (let i = 0; i < SEED_DIAGNOSTICS.length; i++) {
      const diag = SEED_DIAGNOSTICS[i];
      const dUser = await User.create({
        email: diag.email,
        password: diagnosticPassword,
        role: "diagnostic",
      });

      await DiagnosticProfile.create({
        user: dUser._id,
        centerName: diag.name,
        labId: `LAB-${String(7700 + i + 1)}`,
      });

      if (i === 0) primaryDiagnosticUser = dUser;
    }

    // Default universal diagnostic logins
    const universalDiag1 = await User.create({
      email: "diagnosticcentre@gmail.com",
      password: diagnosticPassword,
      role: "diagnostic",
    });
    await DiagnosticProfile.create({
      user: universalDiag1._id,
      centerName: "HealthPlus Diagnostics",
      labId: "LAB-7700",
    });

    const universalDiag2 = await User.create({
      email: "diagnostic@gmail.com",
      password: diagnosticPassword,
      role: "diagnostic",
    });
    await DiagnosticProfile.create({
      user: universalDiag2._id,
      centerName: "HealthPlus Diagnostics",
      labId: "LAB-7701",
    });

    // 4. Seed All 34 Verified Doctors + Universal Doctor Login
    console.log("Seeding 34 Doctors across 7 Specialties...");
    let primaryDoctorId = null;

    for (let i = 0; i < SEED_DOCTORS.length; i++) {
      const doc = SEED_DOCTORS[i];
      const docUser = await User.create({
        email: doc.email,
        password: doctorDefaultPassword,
        role: "doctor",
      });

      await DoctorProfile.create({
        user: docUser._id,
        fullName: doc.name,
        doctorId: `DOC-${String(i + 1).padStart(3, "0")}`,
        specialization: doc.specialization,
        hospital: doc.hospital,
        experience: doc.experience,
      });

      if (i === 0) {
        primaryDoctorId = docUser._id;
      }
    }

    // Universal doctor login: doctor@gmail.com / 123456
    const universalDoctor = await User.create({
      email: "doctor@gmail.com",
      password: doctorDefaultPassword,
      role: "doctor",
    });
    await DoctorProfile.create({
      user: universalDoctor._id,
      fullName: "Dr. Sneha Rao",
      doctorId: "DOC-000",
      specialization: "Cardiology",
      hospital: "Apollo Hospitals",
      experience: "12 years",
    });

    // 5. Sample Appointment for Existing Patient with Dr. Sneha Rao
    await DoctorAppointment.create({
      patient: patientUser._id,
      doctor: primaryDoctorId,
      date: "2026-11-25",
      time: "10:00 AM",
      note: "Cardiology follow-up and ECG review",
      status: "Confirmed",
    });

    // 6. Sample Prescription for Existing Patient
    await Prescription.create({
      patient: patientUser._id,
      doctor: primaryDoctorId,
      medicines: [
        { name: "Atorvastatin", dosage: "10mg once daily at bedtime", duration: "30 days" },
        { name: "Metoprolol", dosage: "25mg once daily in morning", duration: "30 days" }
      ],
      notes: "Follow low-sodium diet and check blood pressure weekly.",
    });

    // 7. Sample Diagnostic Report
    await Report.create({
      patient: patientUser._id,
      diagnostic: primaryDiagnosticUser._id,
      doctor: primaryDoctorId,
      fileName: "Comprehensive_Lipid_Panel_Report.pdf",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileType: "application/pdf",
      fileSize: "1.2 MB",
      notes: "Lipid panel values are within target range.",
    });

    console.log("\n========================================================");
    console.log("🎉 Database Successfully Seeded with 34 Verified Doctors & Diagnostics!");
    console.log("========================================================");
    console.log("Pre-configured Demo Accounts:");
    console.log("  👤 Returning Patient (has doctor vitals):");
    console.log("     Email:    patient@medishare.com");
    console.log("     Password: 123456");
    console.log("  👤 New Patient (fresh - shows dark-blue Welcome Hub):");
    console.log("     Email:    newpatient@medishare.com");
    console.log("     Password: 123456");
    console.log("  🩺 Doctors (e.g. Dr. Sneha Rao — Apollo Hospitals):");
    console.log("     Email:    drsneharao@gmail.com  (or doctor@gmail.com)");
    console.log("     Password: 123456");
    console.log("  🔬 Diagnostic Centers (e.g. HealthPlus Diagnostics):");
    console.log("     Email:    diagnosticcentre@gmail.com  (or healthplusdiagnostics@gmail.com)");
    console.log("     Password: 123456");
    console.log("========================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();
