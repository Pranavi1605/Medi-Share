// MediShare Seed Data: Diagnostic Centers & Diagnostic Tests

export const DIAGNOSTIC_CENTERS = [
  {
    name: "HealthPlus Diagnostics",
    lab: "HealthPlus Labs",
    location: "Hyderabad",
    email: "healthplusdiagnostics@gmail.com",
    avatar: "🔬",
  },
  {
    name: "MedScan Imaging Center",
    lab: "MedScan Diagnostics",
    location: "Kukatpally",
    email: "medscanimaging@gmail.com",
    avatar: "🩻",
  },
  {
    name: "Prime Diagnostics",
    lab: "Prime Healthcare Labs",
    location: "Madhapur",
    email: "primediagnostics@gmail.com",
    avatar: "🧪",
  },
  {
    name: "CarePath Laboratories",
    lab: "CarePath Diagnostics",
    location: "Gachibowli",
    email: "carepathlaboratories@gmail.com",
    avatar: "🏥",
  },
  {
    name: "CityMed Diagnostics",
    lab: "CityMed Labs",
    location: "Secunderabad",
    email: "citymeddiagnostics@gmail.com",
    avatar: "🩺",
  },
];

export const DIAGNOSTIC_TESTS = [
  // 1. Blood Tests
  { name: "Complete Blood Count (CBC)", category: "Hematology", sampleType: "Blood", section: "Blood Tests" },
  { name: "Hemoglobin Test", category: "Hematology", sampleType: "Blood", section: "Blood Tests" },
  { name: "Blood Glucose Test", category: "Biochemistry", sampleType: "Blood", section: "Blood Tests" },
  { name: "Lipid Profile", category: "Biochemistry", sampleType: "Blood", section: "Blood Tests" },
  { name: "Thyroid Profile (T3, T4, TSH)", category: "Hormone", sampleType: "Blood", section: "Blood Tests" },

  // 2. Imaging & Scans
  { name: "X-Ray Chest", category: "Radiology", sampleType: "Imaging", section: "Imaging & Scans" },
  { name: "MRI Brain", category: "MRI", sampleType: "Imaging", section: "Imaging & Scans" },
  { name: "CT Scan Chest", category: "CT", sampleType: "Imaging", section: "Imaging & Scans" },
  { name: "Ultrasound Abdomen", category: "Ultrasound", sampleType: "Imaging", section: "Imaging & Scans" },
  { name: "ECG", category: "Cardiology", sampleType: "Electrical Recording", section: "Imaging & Scans" },

  // 3. Other Diagnostic Tests
  { name: "Urine Routine Examination", category: "Pathology", sampleType: "Urine", section: "Other Diagnostic Tests" },
  { name: "Vitamin D Test", category: "Biochemistry", sampleType: "Blood", section: "Other Diagnostic Tests" },
  { name: "Liver Function Test (LFT)", category: "Biochemistry", sampleType: "Blood", section: "Other Diagnostic Tests" },
  { name: "Kidney Function Test (KFT)", category: "Biochemistry", sampleType: "Blood", section: "Other Diagnostic Tests" },
  { name: "HbA1c", category: "Biochemistry", sampleType: "Blood", section: "Other Diagnostic Tests" },
];

export const getAvailableDiagnosticCenters = () => {
  const stored = JSON.parse(localStorage.getItem("registeredDiagnostics")) || [];
  const merged = [...stored];

  DIAGNOSTIC_CENTERS.forEach((dc) => {
    if (!merged.some((d) => (d.centerName || d.name)?.toLowerCase().trim() === dc.name.toLowerCase().trim())) {
      merged.push({
        name: dc.name,
        centerName: dc.name,
        lab: dc.lab,
        location: dc.location,
        email: dc.email,
        avatar: dc.avatar,
      });
    }
  });

  return merged;
};
