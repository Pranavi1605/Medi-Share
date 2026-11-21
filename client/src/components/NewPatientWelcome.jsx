import React from "react";

const NewPatientWelcome = ({ patient, onNavigate, onOpenBrowse }) => {
  const firstName = patient?.name?.split(" ")[0] || "there";

  const actionCards = [
    {
      id: "book-appointment",
      icon: "📅",
      iconBg: "#eff6ff",
      border: "#bfdbfe",
      title: "Book Doctor Appointment",
      desc: "Schedule a consultation with top specialists across Cardiology, Neurology, Dermatology, Orthopedics, Pediatrics, Gynecology, and General Medicine.",
      btnText: "Book Appointment →",
      btnBg: "#2563eb",
      onClick: () => onNavigate && onNavigate("appointments")
    },
    {
      id: "browse-doctors",
      icon: "🩺",
      iconBg: "#ecfdf5",
      border: "#a7f3d0",
      title: "Browse Doctors & Specialists",
      desc: "Explore verified doctors across Apollo, KIMS, Yashoda, CARE, AIG, and Medicover Hospitals by department and experience.",
      btnText: "Browse Doctors →",
      btnBg: "#059669",
      onClick: () => onOpenBrowse ? onOpenBrowse() : (onNavigate && onNavigate("appointments"))
    },
    {
      id: "diagnostic-tests",
      icon: "🔬",
      iconBg: "#fffbeb",
      border: "#fde68a",
      title: "Diagnostic & Lab Tests",
      desc: "Book certified pathology tests, ECG, 2D Echo, MRI, X-Ray scans, and blood panels with digital report delivery.",
      btnText: "View Diagnostics →",
      btnBg: "#d97706",
      onClick: () => onNavigate && onNavigate("reports")
    },
    {
      id: "health-profile",
      icon: "👤",
      iconBg: "#f5f3ff",
      border: "#ddd6fe",
      title: "Complete Health Profile",
      desc: "Update your blood group, emergency contact numbers, medical allergies, and insurance policy for seamless consultations.",
      btnText: "Update Profile →",
      btnBg: "#7c3aed",
      onClick: () => onNavigate && onNavigate("profile")
    }
  ];

  return (
    <div className="new-patient-welcome-container">
      {/* Dark Blue Welcome Header Card */}
      <div className="welcome-dark-card">
        <div className="welcome-dark-tag">
          🏥 MediShare Healthcare Portal
        </div>
        <h1 className="welcome-dark-title">
          Welcome to MediShare, {firstName}!
        </h1>
        <p className="welcome-dark-desc">
          Your personal healthcare companion. Get started by booking a doctor consultation, browsing verified hospital specialists, or scheduling diagnostic tests.
        </p>
      </div>

      {/* Exactly 4 Pure White Action Cards */}
      <div className="welcome-four-cards-grid">
        {actionCards.map(c => (
          <div key={c.id} className="welcome-white-action-card">
            <div className="welcome-action-top">
              <div className="welcome-action-icon-wrap" style={{ background: c.iconBg, border: `1px solid ${c.border}` }}>
                {c.icon}
              </div>
              <h4>{c.title}</h4>
            </div>
            <p>{c.desc}</p>
            <button
              className="welcome-card-btn"
              style={{ background: c.btnBg, color: "white" }}
              onClick={c.onClick}
            >
              {c.btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewPatientWelcome;
