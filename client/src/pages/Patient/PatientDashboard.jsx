import React, { useEffect, useState } from "react";
import "../../styles/patientDashboard.css";
import "../../styles/doctorDashboard.css";
import "../../styles/mediBot.css";
import NewPatientWelcome from "../../components/NewPatientWelcome";
import MediBot from "../../components/MediBot";
import { getAvailableDoctors, addNewDoctor } from "../../data/doctorsData";
import { DIAGNOSTIC_CENTERS, DIAGNOSTIC_TESTS } from "../../data/diagnosticData";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* ─── Diagnostic Reports (functionality unchanged) ─── */
const DiagnosticReports = ({ patientEmail }) => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const files = JSON.parse(localStorage.getItem("diagnosticFiles")) || [];
    setReports(files.filter(f => f.patientEmail === patientEmail));
  }, [patientEmail]);

  const getFileIcon = (type = "") => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📁";
  };

  const filtered = reports.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const handleViewReport = (r) => {
    if (!r.content) {
      alert("File content not available for viewing. Please ask the diagnostic center to re-upload.");
      return;
    }
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<iframe src="${r.content}" style="border:none; width:100vw; height:100vh;"></iframe>`);
      newWindow.document.body.style.margin = "0";
      newWindow.document.title = r.name || "Report Viewer";
    } else {
      alert("Please allow popups to view the report.");
    }
  };

  return (
    <div className="card">
      <div className="reports-header">
        <div>
          <h2 className="card-title">Medical Reports</h2>
          <p className="card-sub">Reports from your diagnostic center</p>
        </div>
        <div className="reports-stats">
          <span className="report-stat-chip blue">{reports.length} Total</span>
          <span className="report-stat-chip green">{reports.filter(r => r.type?.includes("pdf")).length} PDFs</span>
          <span className="report-stat-chip purple">{reports.filter(r => r.type?.includes("image")).length} Images</span>
        </div>
      </div>
      <input
        className="reports-search"
        placeholder="🔍 Search reports by name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: "28px", marginBottom: "8px" }}>📭</p>
          <p>{search ? "No reports match your search" : "No diagnostic reports available yet"}</p>
          <span>Reports uploaded by your diagnostic center will appear here</span>
        </div>
      ) : (
        <div className="reports-grid">
          {filtered.map(r => (
            <div key={r.id} className="report-card" onClick={() => handleViewReport(r)} style={{ cursor: "pointer" }}>
              <div className="report-icon">{getFileIcon(r.type)}</div>
              <div className="report-info">
                <strong>{r.name}</strong>
                <p>{r.size} · {r.date}</p>
              </div>
              <span className="report-badge">Uploaded</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Appointment Calendar (Doctor & Diagnostic Integration) ─── */
const AppointmentCalendar = ({ initialBooking }) => {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [appointments, setAppointments] = useState({});
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    bookingCategory: "doctor",
    hospital: "",
    specialization: "",
    doctorName: "",
    diagnosticCenter: DIAGNOSTIC_CENTERS[0]?.name || "HealthPlus Diagnostics",
    testName: DIAGNOSTIC_TESTS[0]?.name || "Complete Blood Count (CBC)",
    time: "",
    note: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [registeredDoctors, setRegisteredDoctors] = useState([]);
  const [allAppts, setAllAppts] = useState([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    name: "",
    hospital: "Apollo Hospitals",
    specialization: "Cardiology",
    experience: "10 years",
  });

  const handleAddDoctorSubmit = (e) => {
    e.preventDefault();
    if (!newDocForm.name.trim()) return;
    const docName = newDocForm.name.startsWith("Dr.") ? newDocForm.name.trim() : `Dr. ${newDocForm.name.trim()}`;
    const success = addNewDoctor({ ...newDocForm, name: docName });
    if (success) {
      const updated = getAvailableDoctors();
      setRegisteredDoctors(updated);
      setShowAddDoctor(false);
      setNewDocForm({ name: "", hospital: "Apollo Hospitals", specialization: "Cardiology", experience: "10 years" });
      alert(`Doctor ${docName} added successfully!`);
    } else {
      alert("A doctor with this name is already registered.");
    }
  };

  const refreshAppointments = () => {
    const docs = getAvailableDoctors();
    setRegisteredDoctors(docs);
    const patientData = JSON.parse(localStorage.getItem("patientProfile")) || {};
    const saved = JSON.parse(localStorage.getItem("allAppointments")) || [];
    const mine = saved.filter(a =>
      !patientData.email || !a.patientEmail ||
      a.patientEmail.toLowerCase() === patientData.email.toLowerCase() ||
      a.patientName === patientData.name
    );
    setAllAppts(mine);
    const map = {};
    mine.forEach(a => {
      let key;
      if (typeof a.date === "string" && a.date.includes("-")) {
        const parts = a.date.split("-").map(Number);
        if (parts.length === 3) {
          key = `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
      }
      if (!key) {
        const d = new Date(a.date);
        key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      }
      if (!map[key]) map[key] = [];
      map[key].push({
        time: a.time,
        doctor: a.doctor || a.diagnosticCenter,
        testName: a.testName,
        type: a.type || (a.testName ? "diagnostic" : "doctor"),
        id: a.id,
        status: a.status
      });
    });
    setAppointments(map);
  };

  useEffect(() => {
    refreshAppointments();
    window.addEventListener("dashboardUpdate", refreshAppointments);
    window.addEventListener("appointmentsUpdate", refreshAppointments);
    return () => {
      window.removeEventListener("dashboardUpdate", refreshAppointments);
      window.removeEventListener("appointmentsUpdate", refreshAppointments);
    };
  }, []);

  // Pre-fill doctor or diagnostic test and open form if initialBooking was passed from MediBot
  useEffect(() => {
    if (initialBooking?.type === "diagnostic" || initialBooking?.diagnosticCenter || initialBooking?.testName) {
      setSelected(today.getDate());
      setShowForm(true);
      setForm(prev => ({
        ...prev,
        bookingCategory: "diagnostic",
        diagnosticCenter: initialBooking.diagnosticCenter || initialBooking.center || DIAGNOSTIC_CENTERS[0]?.name,
        testName: initialBooking.testName || initialBooking.scanType || DIAGNOSTIC_TESTS[0]?.name,
        time: initialBooking.time || "10:00 AM",
        note: initialBooking.note || "Booked via MediBot",
      }));
    } else if (initialBooking?.doctor) {
      setSelected(today.getDate());
      setShowForm(true);
      setForm(prev => ({
        ...prev,
        bookingCategory: "doctor",
        hospital: initialBooking.hospital || "",
        specialization: initialBooking.specialization || "",
        doctorName: initialBooking.doctor || "",
        time: "10:00 AM",
        note: initialBooking.note || "",
      }));
    }
  }, [initialBooking]);

  const hospitals = [...new Set(registeredDoctors.map(d => d.hospital).filter(Boolean))];
  const specializationsInHospital = [...new Set(
    registeredDoctors
      .filter(d => !form.hospital || d.hospital === form.hospital)
      .map(d => d.specialization || "General Medicine")
  )];
  const filteredDoctors = registeredDoctors.filter(d =>
    (!form.hospital || d.hospital === form.hospital) &&
    (!form.specialization || (d.specialization || "General Medicine") === form.specialization)
  );

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const firstDay = new Date(current.year, current.month, 1).getDay();

  const prevMonth = () => setCurrent(c => {
    const m = c.month === 0 ? 11 : c.month - 1;
    return { month: m, year: c.month === 0 ? c.year - 1 : c.year };
  });
  const nextMonth = () => setCurrent(c => {
    const m = c.month === 11 ? 0 : c.month + 1;
    return { month: m, year: c.month === 11 ? c.year + 1 : c.year };
  });

  const dateKey = (d) => `${current.year}-${current.month + 1}-${d}`;

  const handleDayClick = (d) => {
    setSelected(d);
    setShowForm(true);
    setForm({
      bookingCategory: "doctor",
      hospital: "",
      specialization: "",
      doctorName: "",
      diagnosticCenter: DIAGNOSTIC_CENTERS[0]?.name || "HealthPlus Diagnostics",
      testName: DIAGNOSTIC_TESTS[0]?.name || "Complete Blood Count (CBC)",
      time: "",
      note: ""
    });
  };

  const handleBook = () => {
    const key = dateKey(selected);
    const patientData = JSON.parse(localStorage.getItem("patientProfile")) || {};
    const dateStr = `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(selected).padStart(2, "0")}`;

    if (form.bookingCategory === "diagnostic") {
      if (!form.diagnosticCenter || !form.testName || !form.time) {
        alert("Please select a diagnostic center, test name, and appointment time.");
        return;
      }
      const newAppt = {
        type: "diagnostic",
        doctor: form.diagnosticCenter,
        diagnosticCenter: form.diagnosticCenter,
        testName: form.testName,
        time: form.time,
        note: form.note || "",
        date: dateStr,
        patientName: patientData.name || "Patient",
        patientAge: patientData.age || "—",
        patientGender: patientData.gender || "—",
        patientEmail: patientData.email || "",
        status: "Confirmed",
        id: Date.now(),
      };
      const newChip = {
        time: form.time,
        doctor: form.diagnosticCenter,
        testName: form.testName,
        type: "diagnostic",
        id: newAppt.id,
        status: newAppt.status
      };
      setAppointments(prev => ({ ...prev, [key]: [...(prev[key] || []), newChip] }));
      const existing = JSON.parse(localStorage.getItem("allAppointments")) || [];
      localStorage.setItem("allAppointments", JSON.stringify([...existing, newAppt]));
      setAllAppts(prev => [...prev, newAppt]);

      // Sync to diagnosticRequests so Doctor Dashboard & Diagnostic Dashboard see it immediately
      const diagReqs = JSON.parse(localStorage.getItem("diagnosticRequests")) || [];
      const newDiagReq = {
        id: Date.now(),
        patientName: patientData.name || "Patient",
        patientEmail: patientData.email || "",
        scanType: form.testName,
        center: form.diagnosticCenter,
        date: dateStr,
        time: form.time,
        notes: form.note || "Booked from Appointments Calendar",
        status: "Pending"
      };
      localStorage.setItem("diagnosticRequests", JSON.stringify([...diagReqs, newDiagReq]));
      window.dispatchEvent(new Event("dashboardUpdate"));
      window.dispatchEvent(new Event("appointmentsUpdate"));
      setShowForm(false);
    } else {
      if (!form.doctorName || !form.time) {
        alert("Please select a doctor and appointment time.");
        return;
      }
      const newAppt = {
        ...form,
        type: "doctor",
        doctor: form.doctorName,
        date: dateStr,
        patientName: patientData.name || "Patient",
        patientAge: patientData.age || "—",
        patientGender: patientData.gender || "—",
        patientEmail: patientData.email || "",
        status: "Confirmed",
        id: Date.now(),
      };
      const newChip = {
        time: form.time,
        doctor: form.doctorName,
        type: "doctor",
        id: newAppt.id,
        status: newAppt.status
      };
      setAppointments(prev => ({ ...prev, [key]: [...(prev[key] || []), newChip] }));
      const existing = JSON.parse(localStorage.getItem("allAppointments")) || [];
      localStorage.setItem("allAppointments", JSON.stringify([...existing, newAppt]));
      setAllAppts(prev => [...prev, newAppt]);
      window.dispatchEvent(new Event("dashboardUpdate"));
      window.dispatchEvent(new Event("appointmentsUpdate"));
      setShowForm(false);
    }
  };

  const handleDelete = (key, idx) => {
    const chip = (appointments[key] || [])[idx];
    setAppointments(prev => {
      const updated = [...(prev[key] || [])];
      updated.splice(idx, 1);
      return { ...prev, [key]: updated };
    });
    if (chip?.id) {
      const existing = JSON.parse(localStorage.getItem("allAppointments")) || [];
      localStorage.setItem("allAppointments", JSON.stringify(existing.filter(a => a.id !== chip.id)));
      setAllAppts(prev => prev.filter(a => a.id !== chip.id));
      window.dispatchEvent(new Event("dashboardUpdate"));
      window.dispatchEvent(new Event("appointmentsUpdate"));
    }
  };

  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const pastAppts = allAppts.filter(a => new Date(a.date) < todayMidnight && a.status !== "Completed").sort((a, b) => new Date(b.date) - new Date(a.date));
  const upcomingAppts = allAppts.filter(a => new Date(a.date) >= todayMidnight && a.status !== "Completed").sort((a, b) => new Date(a.date) - new Date(b.date));

  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card">
        <div className="cal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="cal-nav" onClick={prevMonth}>&#8249;</button>
            <h2>{MONTHS[current.month]} {current.year}</h2>
            <button className="cal-nav" onClick={nextMonth}>&#8250;</button>
          </div>
          <button
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            onClick={() => setShowAddDoctor(true)}
          >
            <span>➕</span> Add Doctor
          </button>
        </div>

        {/* Add Doctor Modal */}
        {showAddDoctor && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 28, 53, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            backdropFilter: "blur(4px)"
          }}>
            <div style={{
              background: "#0f1c35",
              borderRadius: "16px",
              padding: "26px 28px",
              width: "440px",
              maxWidth: "92vw",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              border: "1px solid #1e3357",
              color: "#ffffff"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>➕ Add New Doctor</h3>
                <button
                  style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}
                  onClick={() => setShowAddDoctor(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddDoctorSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Khanna"
                    value={newDocForm.name}
                    onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "#16284a", border: "1px solid #24416b", borderRadius: "8px", fontSize: "0.85rem", color: "#ffffff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
                    Hospital *
                  </label>
                  <select
                    value={newDocForm.hospital}
                    onChange={(e) => setNewDocForm({ ...newDocForm, hospital: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "#16284a", border: "1px solid #24416b", borderRadius: "8px", fontSize: "0.85rem", color: "#ffffff" }}
                  >
                    <option value="Apollo Hospitals">Apollo Hospitals</option>
                    <option value="KIMS Hospitals">KIMS Hospitals</option>
                    <option value="AIG Hospitals">AIG Hospitals</option>
                    <option value="CARE Hospitals">CARE Hospitals</option>
                    <option value="Yashoda Hospitals">Yashoda Hospitals</option>
                    <option value="Medicover Hospitals">Medicover Hospitals</option>
                    <option value="Rainbow Children's Hospital">Rainbow Children's Hospital</option>
                    <option value="Ankura Hospital">Ankura Hospital</option>
                    <option value="Fernandez Hospital">Fernandez Hospital</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
                    Specialization *
                  </label>
                  <select
                    value={newDocForm.specialization}
                    onChange={(e) => setNewDocForm({ ...newDocForm, specialization: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "#16284a", border: "1px solid #24416b", borderRadius: "8px", fontSize: "0.85rem", color: "#ffffff" }}
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
                    Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10 years"
                    value={newDocForm.experience}
                    onChange={(e) => setNewDocForm({ ...newDocForm, experience: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "#16284a", border: "1px solid #24416b", borderRadius: "8px", fontSize: "0.85rem", color: "#ffffff" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="submit"
                    style={{ flex: 1, background: "#2563eb", color: "white", padding: "10px", borderRadius: "8px", border: "none", fontWeight: 700, cursor: "pointer" }}
                  >
                    Save Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDoctor(false)}
                    style={{ background: "#1e3357", color: "#94a3b8", padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="cal-grid-days">
          {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        </div>
        <div className="cal-grid">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="cal-cell empty" />;
            const key = dateKey(d);
            const appts = appointments[key] || [];
            const isToday = d === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
            const cellDate = new Date(current.year, current.month, d);
            const isPast = cellDate < todayMidnight;
            return (
              <div key={i} className={`cal-cell ${isToday ? "today" : ""} ${appts.length ? "has-appt" : ""}`} onClick={() => handleDayClick(d)}>
                <span className="cal-date">{d}</span>
                {appts.map((a, idx) => {
                  const isPastAppt = isPast || a.status === "Completed";
                  const isDiag = a.type === "diagnostic" || !!a.testName;
                  const label = isDiag ? `🔬 ${a.time} · ${a.testName || a.doctor}` : `🩺 ${a.time} · ${a.doctor}`;
                  return (
                    <div
                      key={idx}
                      className={`appt-chip ${isPastAppt ? "appt-chip-past" : "appt-chip-upcoming"}`}
                      style={isDiag ? { borderLeft: "3px solid #0284c7" } : {}}
                      title={isDiag ? `Diagnostic Lab: ${a.doctor}` : `Doctor: ${a.doctor}`}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {label} {a.status === "Completed" && "✓"}
                      </span>
                      <button onClick={e => { e.stopPropagation(); handleDelete(key, idx); }}>×</button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {showForm && (
          <div className="appt-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="appt-modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Book Appointment — {MONTHS[current.month]} {selected}</h3>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              {/* Category Selector Tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                <button
                  type="button"
                  style={{
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: form.bookingCategory === "doctor" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    background: form.bookingCategory === "doctor" ? "#2563eb" : "#f8fafc",
                    color: form.bookingCategory === "doctor" ? "#ffffff" : "#475569",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                  onClick={() => setForm(f => ({ ...f, bookingCategory: "doctor" }))}
                >
                  🩺 Doctor Consultation
                </button>
                <button
                  type="button"
                  style={{
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: form.bookingCategory === "diagnostic" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                    background: form.bookingCategory === "diagnostic" ? "#0284c7" : "#f8fafc",
                    color: form.bookingCategory === "diagnostic" ? "#ffffff" : "#475569",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                  onClick={() => setForm(f => ({ ...f, bookingCategory: "diagnostic" }))}
                >
                  🔬 Diagnostic Test
                </button>
              </div>

              {form.bookingCategory === "doctor" ? (
                <>
                  <label>Select Hospital</label>
                  {hospitals.length === 0 ? (
                    <p className="no-doctors-msg">No hospitals available. Ask a doctor to register first.</p>
                  ) : (
                    <select className="appt-select" value={form.hospital}
                      onChange={e => setForm(f => ({ ...f, hospital: e.target.value, specialization: "", doctorName: "" }))}>
                      <option value="">-- Select Hospital --</option>
                      {hospitals.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  )}

                  {form.hospital && (
                    <>
                      <label>Select Specialization</label>
                      <select className="appt-select" value={form.specialization}
                        onChange={e => setForm(f => ({ ...f, specialization: e.target.value, doctorName: "" }))}>
                        <option value="">-- Select Specialization --</option>
                        {specializationsInHospital.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </>
                  )}

                  {form.specialization && (
                    <>
                      <label>Available Doctors</label>
                      {filteredDoctors.length === 0 ? (
                        <p className="no-doctors-msg">No doctors available for this selection</p>
                      ) : (
                        <select className="appt-select" value={form.doctorName}
                          onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))}>
                          <option value="">-- Select Doctor --</option>
                          {filteredDoctors.map((doc, i) => <option key={i} value={doc.name}>{doc.name}</option>)}
                        </select>
                      )}
                    </>
                  )}

                  {form.doctorName && (
                    <div className="selected-doctor-card">
                      <div className="doctor-option-avatar">{form.doctorName[0]}</div>
                      <div>
                        <strong>{form.doctorName}</strong>
                        <p>{form.specialization} · {form.hospital}</p>
                      </div>
                      <span className="doctor-check">✓</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label>Select Diagnostic Center</label>
                  <select
                    className="appt-select"
                    value={form.diagnosticCenter}
                    onChange={e => setForm(f => ({ ...f, diagnosticCenter: e.target.value }))}
                  >
                    {DIAGNOSTIC_CENTERS.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name} — {c.lab} ({c.location})
                      </option>
                    ))}
                  </select>

                  <label>Select Diagnostic Test</label>
                  <select
                    className="appt-select"
                    value={form.testName}
                    onChange={e => setForm(f => ({ ...f, testName: e.target.value }))}
                  >
                    <optgroup label="🩸 Blood Tests">
                      {DIAGNOSTIC_TESTS.filter(t => t.section === "Blood Tests").map(t => (
                        <option key={t.name} value={t.name}>{t.name} ({t.category})</option>
                      ))}
                    </optgroup>
                    <optgroup label="🩻 Imaging & Scans">
                      {DIAGNOSTIC_TESTS.filter(t => t.section === "Imaging & Scans").map(t => (
                        <option key={t.name} value={t.name}>{t.name} ({t.category})</option>
                      ))}
                    </optgroup>
                    <optgroup label="🔬 Other Diagnostic Tests">
                      {DIAGNOSTIC_TESTS.filter(t => t.section === "Other Diagnostic Tests").map(t => (
                        <option key={t.name} value={t.name}>{t.name} ({t.category})</option>
                      ))}
                    </optgroup>
                  </select>

                  <div className="selected-doctor-card" style={{ borderColor: "#bae6fd", background: "#f0f9ff" }}>
                    <div className="doctor-option-avatar" style={{ background: "#0284c7" }}>🔬</div>
                    <div>
                      <strong style={{ color: "#0369a1" }}>{form.testName}</strong>
                      <p style={{ color: "#0284c7" }}>{form.diagnosticCenter}</p>
                    </div>
                    <span className="doctor-check" style={{ color: "#0284c7" }}>✓</span>
                  </div>
                </>
              )}

              <label>Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              <label>Note (optional)</label>
              <input placeholder="e.g. Fasting required / Routine checkup" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />

              <div className="modal-actions">
                <button className="new-btn" style={{ flex: 1 }} onClick={handleBook}>Confirm Booking</button>
                <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Appointments List ── */}
      {allAppts.length > 0 && (
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h2 className="card-title">My Appointments</h2>
            <p className="card-sub">All your booked appointments at a glance</p>
          </div>

          {upcomingAppts.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="appt-list-section-label upcoming-label">
                <span className="appt-list-dot upcoming-dot" />
                Upcoming ({upcomingAppts.length})
              </div>
              <div className="appt-list">
                {upcomingAppts.map((a, i) => {
                  const isDiag = a.type === "diagnostic" || !!a.testName;
                  return (
                    <div key={i} className="appt-list-item appt-list-upcoming" style={isDiag ? { borderLeft: "4px solid #0284c7" } : {}}>
                      <div className="appt-list-date-badge upcoming-badge" style={isDiag ? { background: "rgba(2, 132, 199, 0.1)", color: "#0284c7", borderColor: "rgba(2, 132, 199, 0.25)" } : {}}>
                        <span className="appt-list-day">{new Date(a.date).getDate()}</span>
                        <span className="appt-list-mon">{MONTHS[new Date(a.date).getMonth()].slice(0, 3)}</span>
                      </div>
                      <div className="appt-list-info">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "0.72rem", padding: "1px 7px", borderRadius: "4px", background: isDiag ? "#e0f2fe" : "#dbeafe", color: isDiag ? "#0369a1" : "#1d4ed8", fontWeight: 700 }}>
                            {isDiag ? "🔬 Diagnostic Lab Test" : "🩺 Doctor Consultation"}
                          </span>
                        </div>
                        <strong>{isDiag ? a.testName : (a.doctor?.startsWith("Dr.") ? a.doctor : `Dr. ${a.doctor}`)}</strong>
                        <p>{isDiag ? `Lab: ${a.diagnosticCenter || a.doctor}` : `${a.specialization || "General Medicine"} · ${a.hospital || "Hospital"}`}</p>
                        {a.note && <p style={{ fontSize: "0.72rem", color: "#6b7a99", marginTop: 2 }}>{a.note}</p>}
                      </div>
                      <div className="appt-list-right">
                        <span className="appt-list-time">🕐 {a.time}</span>
                        <span className="appt-status-chip status-upcoming">{isDiag ? "Lab Booked" : "Upcoming"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pastAppts.length > 0 && (
            <div>
              <div className="appt-list-section-label past-label">
                <span className="appt-list-dot past-dot" />
                Past ({pastAppts.length})
              </div>
              <div className="appt-list">
                {pastAppts.map((a, i) => {
                  const isDiag = a.type === "diagnostic" || !!a.testName;
                  return (
                    <div key={i} className="appt-list-item appt-list-past" style={isDiag ? { borderLeft: "4px solid #64748b" } : {}}>
                      <div className="appt-list-date-badge past-badge">
                        <span className="appt-list-day">{new Date(a.date).getDate()}</span>
                        <span className="appt-list-mon">{MONTHS[new Date(a.date).getMonth()].slice(0, 3)}</span>
                      </div>
                      <div className="appt-list-info">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "0.72rem", padding: "1px 7px", borderRadius: "4px", background: "#f1f5f9", color: "#475569", fontWeight: 700 }}>
                            {isDiag ? "🔬 Diagnostic Lab Test" : "🩺 Doctor Consultation"}
                          </span>
                        </div>
                        <strong>{isDiag ? a.testName : (a.doctor?.startsWith("Dr.") ? a.doctor : `Dr. ${a.doctor}`)}</strong>
                        <p>{isDiag ? `Lab: ${a.diagnosticCenter || a.doctor}` : `${a.specialization || "General Medicine"} · ${a.hospital || "Hospital"}`}</p>
                        {a.note && <p style={{ fontSize: "0.72rem", color: "#6b7a99", marginTop: 2 }}>{a.note}</p>}
                      </div>
                      <div className="appt-list-right">
                        <span className="appt-list-time">🕐 {a.time}</span>
                        <span className="appt-status-chip status-past">Completed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Health Score SVG Circle ─── */
function HealthScoreCircle({ score = 92 }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="health-score-card card">
      <p className="score-label">Overall Health Score</p>
      <div className="score-circle">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle className="score-circle-bg" cx="70" cy="70" r={r} />
          <circle className="score-circle-fg" cx="70" cy="70" r={r}
            strokeDasharray={circ} strokeDashoffset={offset} />
        </svg>
        <div className="score-inner">
          <span className="score-number">{score}</span>
          <span className="score-denom">/100</span>
        </div>
      </div>
      <p className="score-grade">Excellent</p>
      <p className="score-desc">You're in the top 5% of users in your age group this week.</p>
    </div>
  );
}

/* ─── Main Dashboard ─── */
const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStandardOverview, setShowStandardOverview] = useState(false);
  const [isMediBotOpen, setIsMediBotOpen] = useState(false);
  const [botInitialQuery, setBotInitialQuery] = useState("");
  const [initialBooking, setInitialBooking] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("patientProfile");
    if (data) setPatient(JSON.parse(data));

    const handleDashboardUpdate = () => {
      // Re-trigger component updates when a doctor records vitals or prescriptions
      const freshData = localStorage.getItem("patientProfile");
      if (freshData) setPatient(JSON.parse(freshData));
    };
    window.addEventListener("dashboardUpdate", handleDashboardUpdate);
    return () => window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
  }, []);

  if (!patient) {
    return <div className="no-profile">Loading Patient Profile...</div>;
  }

  /* Greeting based on time */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  /* Prescriptions helper — match by name OR email */
  const allPrescriptions = JSON.parse(localStorage.getItem("allPrescriptions")) || [];
  const myPrescriptions = allPrescriptions.filter(p =>
    p.patientName === patient.name ||
    (patient.email && p.patientEmail && p.patientEmail.toLowerCase() === patient.email.toLowerCase())
  );

  /* History icon colour helper */
  const historyColors = ["red", "blue", "green"];
  const historyEmojis = ["🌡️", "💊", "🩺"];

  const navItems = [
    { id: "dashboard", label: "Overview", icon: "grid_view" },
    { id: "bot", label: "AI Health Bot", icon: "smart_toy" },
    { id: "appointments", label: "Appointments", icon: "calendar_month" },
    { id: "reports", label: "Reports", icon: "description" },
    { id: "history", label: "Medical History", icon: "history" },
    { id: "medications", label: "Medications", icon: "medical_services" },
    { id: "profile", label: "Profile", icon: "person" },
  ];

  return (
    <div className="app">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="logo">
          <h3>MediShare</h3>
          <span className="logo-sub">Clinical Curator</span>
        </div>

        <nav>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="sidebar-book-btn" onClick={() => setActiveTab("appointments")}>
          Book Appointment
        </button>

        <div className="sidebar-footer">
          <button className="sidebar-footer-btn">
            <span className="material-symbols-outlined">help_outline</span>
            Help Center
          </button>
          <button className="sidebar-footer-btn" onClick={() => {
            localStorage.removeItem("patientProfile");
            window.location.href = "/";
          }}>
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* TOP BAR */}
        <div className="topbar">
          <input className="search" placeholder="Search records, medications, or doctors..." />
          <div className="top-right">
            <div style={{ position: "relative" }}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
                <span className="bell-dot" />
              </button>
              {showNotifications && (
                <div style={{
                  position: "absolute", top: "50px", right: "0", width: "340px",
                  background: "white", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  padding: "16px", zIndex: 100, border: "1px solid #eee", textAlign: "left"
                }}>
                  <div className="section-title">
                    <span>Activity Log</span>
                    <span className="activity-live-badge"><span className="activity-live-dot" />Live</span>
                  </div>
                  <div className="activity-timeline" style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "4px" }}>
                    {myPrescriptions.length > 0 ? (
                      myPrescriptions.slice(-4).reverse().map((p, i) => {
                        const icons = ["💊", "🩺", "🌡️", "📋"];
                        const colors = ["activity-card-blue", "activity-card-green", "activity-card-amber", "activity-card-purple"];
                        const labels = ["Prescription", "Consultation", "Checkup", "Record"];
                        return (
                          <div key={i} className={`activity-card ${colors[i % 4]}`}>
                            <div className="activity-card-icon">{icons[i % 4]}</div>
                            <div className="activity-card-body">
                              <div className="activity-card-top">
                                <span className="activity-card-title">{p.medication} Prescribed</span>
                                <span className={`activity-card-tag tag-${colors[i % 4]}`}>{labels[i % 4]}</span>
                              </div>
                              <p className="activity-card-desc">For <strong>{p.problem}</strong> · Dr. {p.doctor}</p>
                              <span className="activity-card-time">🕐 {p.date}</span>
                            </div>
                            {i === 0 && <span className="activity-new-dot" />}
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="activity-card activity-card-blue">
                          <div className="activity-card-icon">👤</div>
                          <div className="activity-card-body">
                            <div className="activity-card-top">
                              <span className="activity-card-title">Profile Updated</span>
                              <span className="activity-card-tag tag-activity-card-blue">Account</span>
                            </div>
                            <p className="activity-card-desc">Patient profile saved successfully.</p>
                            <span className="activity-card-time">🕐 Today</span>
                          </div>
                          <span className="activity-new-dot" />
                        </div>
                        <div className="activity-card activity-card-green">
                          <div className="activity-card-icon">🎉</div>
                          <div className="activity-card-body">
                            <div className="activity-card-top">
                              <span className="activity-card-title">Welcome to MediShare</span>
                              <span className="activity-card-tag tag-activity-card-green">Onboarding</span>
                            </div>
                            <p className="activity-card-desc">Your patient portal is ready to use.</p>
                            <span className="activity-card-time">🕐 Account Created</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="icon-btn" onClick={() => setActiveTab("profile")}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>settings</span>
            </button>
            <div className="user-chip">
              <div className="user-chip-text">
                <strong>{patient.name}</strong>
                <span>Patient ID: {patient.id || "MS-8829"}</span>
              </div>
              <div className="avatar">{patient.name?.[0]?.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="content">
          <div className="center">

            {/* ── DASHBOARD TAB ── */}
            {activeTab === "dashboard" && (() => {
              const allVitals = JSON.parse(localStorage.getItem("allVitals")) || [];
              const myVitals = allVitals.filter(v =>
                v.patientName === patient.name ||
                (patient.email && v.patientEmail && v.patientEmail.toLowerCase() === patient.email.toLowerCase())
              );
              const hasDoctorVitals = myVitals.length > 0;

              // If new user and no doctor-recorded vitals yet: Show Welcome and 4 action cards only
              if (!hasDoctorVitals) {
                return (
                  <NewPatientWelcome
                    patient={patient}
                    onNavigate={(tab) => setActiveTab(tab)}
                    onOpenBrowse={() => setActiveTab("appointments")}
                  />
                );
              }

              // Otherwise: Existing user who consulted a doctor and has vitals -> NO WELCOME PAGE
              const latest = myVitals.length > 0 ? myVitals[myVitals.length - 1] : null;
              const bpValue = latest?.systolic && latest?.diastolic ? `${latest.systolic}/${latest.diastolic}` : "—";
              const vitalMeta = [
                { key: "bp", label: "Blood Pressure", icon: "💓", value: bpValue, unit: "mmHg", color: "#e63946", bg: "rgba(230,57,70,0.08)", border: "rgba(230,57,70,0.2)" },
                { key: "hr", label: "Heart Rate", icon: "❤️", value: latest?.heartRate || "—", unit: "bpm", color: "#2e6db4", bg: "rgba(46,109,180,0.08)", border: "rgba(46,109,180,0.22)" },
                { key: "temp", label: "Temperature", icon: "🌡️", value: latest?.temperature || "—", unit: "°F", color: "#d97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.22)" },
                { key: "spo2", label: "SpO₂", icon: "🫁", value: latest?.spo2 || "—", unit: "%", color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.22)" },
                { key: "rr", label: "Respiratory Rate", icon: "🌬️", value: latest?.respiratoryRate || "—", unit: "/min", color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.22)" },
              ];

              return (
                <>
                  {/* Page Header */}
                  <div className="page-header">
                    <div className="greeting">
                      <h2>{greeting}, {patient.name?.split(" ")[0] ?? "there"}.</h2>
                      <p>Your health trajectory is looking <em>excellent</em> this month.</p>
                    </div>
                    <div className="sync-badge">
                      <span className="sync-dot" />
                      Last Sync: Just Now
                    </div>
                  </div>

                  {/* Quick MediBot AI Banner on Top of Vitals */}
                  <div style={{
                    background: "linear-gradient(135deg, #1e293b, #0f172a)",
                    color: "white",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.12)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 26 }}>🤖</span>
                      <div>
                        <h4 style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0 }}>Feeling unwell or experiencing new symptoms?</h4>
                        <p style={{ fontSize: "0.76rem", color: "#94a3b8", margin: "2px 0 0 0" }}>
                          Ask MediBot to analyze what you feel and recommend which specialist to consult.
                        </p>
                      </div>
                    </div>
                    <button
                      style={{
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                      onClick={() => setIsMediBotOpen(true)}
                    >
                      Ask MediBot →
                    </button>
                  </div>

                  {/* ── Vitals Row (inline, no separate tab) ── */}
                  <div className="dash-vitals-section">
                    <div className="dash-vitals-header">
                      <div>
                        <span className="dash-vitals-label">Latest Vitals</span>
                        <span className="dash-vitals-sub">Recorded by your doctor</span>
                      </div>
                      {latest && (
                        <div className="vitals-sync-badge" style={{ fontSize: "0.68rem" }}>
                          <span className="vitals-sync-dot" />
                          {latest.date} · Dr. {latest.doctor}
                        </div>
                      )}
                    </div>
                    <div className="dash-vitals-grid">
                      {vitalMeta.map(v => (
                        <div key={v.key} className="dash-vital-card" style={{ '--vc': v.color }}>
                          <div className="dash-vital-icon-wrap" style={{ background: v.bg, border: `1px solid ${v.border}` }}>
                            <span style={{ fontSize: 18 }}>{v.icon}</span>
                          </div>
                          <div>
                            <p className="dash-vital-label">{v.label}</p>
                            <div className="dash-vital-value-row">
                              <span className="dash-vital-value" style={{ color: v.value === "—" ? "#c0c8d8" : v.color }}>{v.value}</span>
                              {v.value !== "—" && <span className="dash-vital-unit">{v.unit}</span>}
                            </div>
                          </div>
                          <div className="vitals-card-shimmer" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medical History — full width */}
                  <div className="card">
                    <div className="history-header">
                      <div>
                        <h3 className="card-title">Medical History</h3>
                        <p className="card-sub">Recent clinical logs and diagnoses</p>
                      </div>
                      <button className="link" onClick={() => setActiveTab("history")}>View All Records</button>
                    </div>

                    {myPrescriptions.length === 0 ? (
                      <div className="empty-state" style={{ padding: "28px 0" }}>
                        <p>No records yet.</p>
                        <span>Doctor visits will appear here.</span>
                      </div>
                    ) : (
                      myPrescriptions.slice(-3).reverse().map((p, i) => (
                        <div key={i} className="history-item">
                          <div className={`history-icon ${historyColors[i % 3]}`}>
                            <span>{historyEmojis[i % 3]}</span>
                          </div>
                          <div className="history-info">
                            <strong>{p.problem}</strong>
                            <p>{p.medication} · Dr. {p.doctor}</p>
                          </div>
                          <div className="history-meta">
                            <span className="history-date">{p.date}</span>
                            <span className="status-badge completed">Completed</span>
                          </div>
                        </div>
                      ))
                    )}

                    {patient.allergies && (
                      <div className="history-item" style={{ marginTop: 4 }}>
                        <div className="history-icon red"><span>⚠️</span></div>
                        <div className="history-info">
                          <strong>Critical Allergies</strong>
                          <p>{patient.allergies}</p>
                        </div>
                        <div className="history-meta">
                          <span className="status-badge" style={{ background: "#fff1f1", color: "#dc2626" }}>Alert</span>
                        </div>
                      </div>
                    )}
                  </div>

                </>
              );
            })()}

            {/* ── AI HEALTH BOT TAB ── */}
            {activeTab === "bot" && (
              <MediBot
                isFullScreen={true}
                onBookDoctor={(docInfo) => {
                  setInitialBooking(docInfo);
                  setActiveTab("appointments");
                }}
                onBookDiagnostic={() => {
                  setActiveTab("reports");
                }}
                initialQuery={botInitialQuery}
              />
            )}

            {/* ── APPOINTMENTS TAB ── */}
            {activeTab === "appointments" && <AppointmentCalendar initialBooking={initialBooking} />}

            {/* ── REPORTS TAB ── */}
            {activeTab === "reports" && <DiagnosticReports patientEmail={patient.email} />}

            {/* ── VITALS TAB (removed — vitals shown inline on dashboard) ── */}
            {activeTab === "__vitals_removed__" && (() => {
              const allVitals = JSON.parse(localStorage.getItem("allVitals")) || [];
              const myVitals = allVitals.filter(v => v.patientName === patient.name);
              const latest = myVitals.length > 0 ? myVitals[myVitals.length - 1] : null;

              const vitalMeta = [
                { key: "bp", label: "Blood Pressure", icon: "💓", value: latest ? `${latest.systolic}/${latest.diastolic}` : "—", unit: "mmHg", color: "#e63946", bg: "rgba(230,57,70,0.08)", border: "rgba(230,57,70,0.2)" },
                { key: "hr", label: "Heart Rate", icon: "❤️", value: latest?.heartRate || "—", unit: "bpm", color: "#2e6db4", bg: "rgba(46,109,180,0.08)", border: "rgba(46,109,180,0.22)" },
                { key: "temp", label: "Temperature", icon: "🌡️", value: latest?.temperature || "—", unit: "°F", color: "#d97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.22)" },
                { key: "spo2", label: "SpO₂", icon: "🫁", value: latest?.spo2 || "—", unit: "%", color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.22)" },
                { key: "rr", label: "Respiratory Rate", icon: "🌬️", value: latest?.respiratoryRate || "—", unit: "/min", color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.22)" },
              ];

              return (
                <div className="vitals-tab">
                  {/* Header */}
                  <div className="vitals-header">
                    <div>
                      <h2 className="vitals-title">My Vitals</h2>
                      <p className="vitals-sub">Latest readings recorded by your doctor</p>
                    </div>
                    {latest && (
                      <div className="vitals-sync-badge">
                        <span className="vitals-sync-dot" />
                        Last updated: {latest.date} by Dr. {latest.doctor}
                      </div>
                    )}
                  </div>

                  {/* Vitals Cards Grid */}
                  <div className="vitals-cards-grid">
                    {vitalMeta.map(v => (
                      <div key={v.key} className="vitals-card" style={{ '--vc': v.color, '--vbg': v.bg, '--vborder': v.border }}>
                        <div className="vitals-card-icon-wrap" style={{ background: v.bg, border: `1px solid ${v.border}` }}>
                          <span className="vitals-card-icon">{v.icon}</span>
                        </div>
                        <div className="vitals-card-body">
                          <p className="vitals-card-label">{v.label}</p>
                          <div className="vitals-card-value-row">
                            <span className="vitals-card-value" style={{ color: v.value === "—" ? "#a0aec0" : v.color }}>{v.value}</span>
                            {v.value !== "—" && <span className="vitals-card-unit">{v.unit}</span>}
                          </div>
                        </div>
                        <div className="vitals-card-shimmer" />
                      </div>
                    ))}
                  </div>

                  {/* History timeline */}
                  <div className="vitals-history-card">
                    <div className="vitals-history-header">
                      <h3 className="card-title">Vitals History</h3>
                      <p className="card-sub">All readings in reverse-chronological order</p>
                    </div>
                    {myVitals.length === 0 ? (
                      <div className="empty-state">
                        <p style={{ fontSize: "28px", marginBottom: "8px" }}>🩺</p>
                        <p>No vitals recorded yet</p>
                        <span>Your doctor will add them during your next visit</span>
                      </div>
                    ) : (
                      <div className="vitals-history-list">
                        {myVitals.slice().reverse().map((v, i) => (
                          <div key={i} className="vitals-history-row">
                            <div className="vitals-history-date">
                              <span className="vitals-history-date-num">{v.date}</span>
                              <span className="vitals-history-doc">Dr. {v.doctor}</span>
                            </div>
                            <div className="vitals-history-chips">
                              {v.systolic && <span className="vitals-chip vitals-chip-red">💓 {v.systolic}/{v.diastolic} mmHg</span>}
                              {v.heartRate && <span className="vitals-chip vitals-chip-blue">❤️ {v.heartRate} bpm</span>}
                              {v.temperature && <span className="vitals-chip vitals-chip-amber">🌡️ {v.temperature}°F</span>}
                              {v.spo2 && <span className="vitals-chip vitals-chip-green">🫁 {v.spo2}%</span>}
                              {v.respiratoryRate && <span className="vitals-chip vitals-chip-purple">🌬️ {v.respiratoryRate}/min</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── HISTORY TAB ── */}
            {activeTab === "history" && (
              <div className="card">
                <h2 className="card-title" style={{ marginBottom: 4 }}>Medical History</h2>
                <p className="card-sub" style={{ marginBottom: 20 }}>All clinical records and diagnoses</p>
                {myPrescriptions.length === 0 ? (
                  <div className="empty-state"><p>No doctor visits recorded yet.</p></div>
                ) : (
                  myPrescriptions.slice().reverse().map((p, i) => (
                    <div key={i} className="history-item">
                      <div className={`history-icon ${historyColors[i % 3]}`}>
                        <span>{historyEmojis[i % 3]}</span>
                      </div>
                      <div className="history-info">
                        <strong>{p.problem}</strong>
                        <p>{p.medication} · Dr. {p.doctor}</p>
                      </div>
                      <div className="history-meta">
                        <span className="history-date">{p.date}</span>
                        <span className="status-badge completed">Completed</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── MEDICATIONS TAB ── */}
            {activeTab === "medications" && (
              <div className="card">
                <h2 className="card-title" style={{ marginBottom: 4 }}>Current Medications</h2>
                <p className="card-sub" style={{ marginBottom: 20 }}>Prescriptions and self-reported medications</p>
                {myPrescriptions.length === 0 && !patient.medications ? (
                  <div className="empty-state"><p>No medications recorded.</p></div>
                ) : (
                  <div>
                    {patient.medications && (
                      <div className="medication-list" style={{ marginBottom: 14 }}>
                        <h3>Self-Reported</h3>
                        <p>{patient.medications}</p>
                      </div>
                    )}
                    {myPrescriptions.slice().reverse().map((p, i) => (
                      <div key={i} className="medication-list" style={{ marginTop: i > 0 ? 10 : 0 }}>
                        <h3>{p.medication}</h3>
                        <p><strong>Condition:</strong> {p.problem}</p>
                        <p style={{ fontSize: "0.78rem", color: "#8a96b0", marginTop: 4 }}>
                          Prescribed by Dr. {p.doctor} · {p.date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <div style={{ paddingBottom: '32px' }}>
                <div className="doc-settings-header" style={{ marginBottom: '24px' }}>
                  <div>
                    <h1 className="doc-page-title" style={{ margin: 0 }}>Settings</h1>
                    <p className="doc-page-subtitle">Manage your account preferences and personal information</p>
                  </div>
                  <div className="doc-settings-actions">
                    <button className="doc-btn-sec" onClick={() => setPatient(JSON.parse(localStorage.getItem('patientProfile')))}>Discard</button>
                    <button className="doc-btn-primary" onClick={() => {
                      const newProfile = {
                        ...patient,
                        name: document.getElementById('pf-name').value,
                        email: document.getElementById('pf-email').value,
                        weight: document.getElementById('pf-weight').value,
                        height: document.getElementById('pf-height').value,
                        allergies: document.getElementById('pf-allergies').value,
                        medications: document.getElementById('pf-meds').value,
                      };
                      setPatient(newProfile);
                      localStorage.setItem('patientProfile', JSON.stringify(newProfile));
                      // Keep registeredPatients in sync so login doesn't overwrite changes
                      const existing = JSON.parse(localStorage.getItem('registeredPatients')) || [];
                      const idx = existing.findIndex(p => p.email === patient.email);
                      if (idx >= 0) existing[idx] = { ...existing[idx], ...newProfile };
                      else existing.push(newProfile);
                      localStorage.setItem('registeredPatients', JSON.stringify(existing));
                      alert('Profile saved successfully!');
                    }}>Save Changes</button>
                  </div>
                </div>

                <div className="doc-settings-container" style={{ maxWidth: '100%' }}>
                  <div className="doc-profile-section">
                    <div className="doc-profile-lg-wrap">
                      <div className="doc-profile-avatar-lg" style={{ background: '#0f1c35', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 700 }}>
                        {patient.name?.[0]?.toUpperCase()}
                      </div>
                      <label className="doc-profile-cam-btn" style={{ cursor: 'pointer' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                          if (e.target.files[0]) alert('Image uploaded successfully: ' + e.target.files[0].name);
                        }} />
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                      </label>
                    </div>
                    <div className="doc-profile-info-lg">
                      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{patient.name}</h2>
                      <p style={{ fontSize: '13px', color: '#8a96b0', marginBottom: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>verified</span>
                        Patient ID: {patient.id || "MS-8829"}
                      </p>
                      <span className="doc-badge-senior" style={{ background: '#f4f6fb', color: '#6b7a99' }}>Standard Account</span>
                    </div>
                  </div>

                  <div className="doc-settings-section">
                    <h3 className="doc-settings-title" style={{ fontSize: '16px', fontWeight: 600, color: '#0f1c35', marginBottom: '16px' }}>Personal Information</h3>
                    <div className="doc-form-grid doc-form-group-outline">
                      <div className="doc-form-group">
                        <label className="doc-form-label">Full Name</label>
                        <input type="text" id="pf-name" className="doc-form-input" defaultValue={patient.name} />
                      </div>
                      <div className="doc-form-group">
                        <label className="doc-form-label">Email Address</label>
                        <input type="email" id="pf-email" className="doc-form-input" defaultValue={patient.email} />
                      </div>
                      <div className="doc-form-group">
                        <label className="doc-form-label">Weight (kg)</label>
                        <input type="number" id="pf-weight" className="doc-form-input" defaultValue={patient.weight || ""} />
                      </div>
                      <div className="doc-form-group">
                        <label className="doc-form-label">Height (cm)</label>
                        <input type="number" id="pf-height" className="doc-form-input" defaultValue={patient.height || ""} />
                      </div>
                      <div className="doc-form-group">
                        <label className="doc-form-label">Allergies</label>
                        <input type="text" id="pf-allergies" className="doc-form-input" defaultValue={patient.allergies || ""} />
                      </div>
                      <div className="doc-form-group">
                        <label className="doc-form-label">Current Medications</label>
                        <input type="text" id="pf-meds" className="doc-form-input" defaultValue={patient.medications || ""} />
                      </div>
                    </div>
                  </div>

                  <div className="doc-settings-section">
                    <h3 className="doc-settings-title" style={{ fontSize: '16px', fontWeight: 600, color: '#0f1c35', marginBottom: '16px' }}>Security</h3>
                    <p className="doc-settings-subtitle" style={{ fontSize: '13px', color: '#8a96b0', marginTop: '-12px', marginBottom: '16px' }}>Secure your account and manage authentication methods.</p>

                    <div className="doc-security-box">
                      <div className="doc-toggle-row">
                        <div className="doc-toggle-text">
                          <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, marginBottom: '4px' }}>Two-Factor Authentication</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: '#8a96b0' }}>Add an extra layer of security to your account.</p>
                        </div>
                        <div className="doc-toggle-switch">
                          <div className="doc-toggle-circle"></div>
                        </div>
                      </div>

                      <div className="doc-toggle-text" style={{ marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Change Password</h4>
                      </div>
                      <div className="doc-password-row doc-form-group-outline">
                        <input type="password" className="doc-form-input" placeholder="Current Password" />
                        <input type="password" className="doc-form-input" placeholder="New Password" />
                        <input type="password" className="doc-form-input" placeholder="Confirm New Password" />
                      </div>
                      <button className="doc-btn-sec" style={{ background: '#f4f6fb', padding: '8px 16px' }}>Update Password</button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL ── */}
          <aside className="right">

            {/* Upcoming Appointments */}
            <div className="section-title">
              <span>Upcoming Appointments</span>
              <button className="dots-btn">•••</button>
            </div>
            <div className="appt-featured-card" style={{ flexDirection: "column", gap: 12 }}>
              <div className="appt-tag">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
                Tomorrow
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 26 }}>🩺</div>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "white", margin: 0 }}>Book Your Next Visit</h3>
                  <p style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.6)", marginTop: 3 }}>Schedule with a specialist</p>
                </div>
              </div>
              <button className="appt-checkin-btn" style={{ width: "100%" }} onClick={() => setActiveTab("appointments")}>
                Schedule Now
              </button>
            </div>

            {/* MediBot AI Assistant Spotlight Card */}
            <div className="section-title" style={{ marginTop: 22 }}>
              <span>AI Health Guidance</span>
            </div>
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18
                }}>
                  🤖
                </div>
                <div>
                  <h4 style={{ fontSize: "0.86rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>MediBot Assistant</h4>
                  <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "2px 0 0 0" }}>Specialist Recommendations</p>
                </div>
              </div>
              <p style={{ fontSize: "0.76rem", color: "#475569", lineHeight: 1.45 }}>
                Describe any symptoms you're having to discover which specialist you should consult and see verified doctors.
              </p>
              <button
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.15s"
                }}
                onClick={() => setIsMediBotOpen(true)}
              >
                Launch MediBot →
              </button>
            </div>

          </aside>
        </div>
      </main>

      {/* ── FLOATING MEDIBOT LAUNCHER BUTTON ── */}
      <button
        className="medibot-fab"
        onClick={() => setIsMediBotOpen(!isMediBotOpen)}
        title="Ask MediBot: AI Specialist Recommendation"
      >
        <span className="medibot-fab-pulse" />
        <span>🤖 Ask MediBot</span>
      </button>

      {/* ── FLOATING MEDIBOT CHAT DRAWER ── */}
      <MediBot
        isOpen={isMediBotOpen}
        onClose={() => setIsMediBotOpen(false)}
        onBookDoctor={(docInfo) => {
          setInitialBooking(docInfo);
          setActiveTab("appointments");
          setIsMediBotOpen(false);
        }}
        onBookDiagnostic={() => {
          setActiveTab("reports");
          setIsMediBotOpen(false);
        }}
        initialQuery={botInitialQuery}
      />
    </div>
  );
};

export default PatientDashboard;
