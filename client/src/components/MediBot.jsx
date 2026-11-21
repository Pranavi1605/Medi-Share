import React, { useState, useEffect, useRef } from "react";
import { analyzeSymptoms } from "../data/symptomRules";
import { getAvailableDoctors } from "../data/doctorsData";
import { DIAGNOSTIC_CENTERS, DIAGNOSTIC_TESTS } from "../data/diagnosticData";

const INITIAL_GREETING = {
  sender: "bot",
  text: "Hello! I am MediBot, your AI Clinical Specialist & Triage Assistant. 🩺\n\nDescribe what health problems or symptoms you are experiencing, or ask for a specific doctor or diagnostic test. I will recommend the right specialist, provide verified hospital doctors across Apollo, KIMS, AIG, CARE, Yashoda, and Medicover, and automatically schedule appointments and diagnostic tests for you.",
};

const MediBot = ({
  isOpen = false,
  onClose,
  isFullScreen = false,
  onBookDoctor,
  onBookDiagnostic,
  initialQuery = "",
}) => {
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      handleUserSubmit(initialQuery);
    }
  }, [initialQuery]);

  // 1. Auto-schedule doctor appointment directly into allAppointments
  const handleAutoScheduleDoctor = (doc) => {
    const patientData = JSON.parse(localStorage.getItem("patientProfile")) || {};
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const timeStr = "10:00 AM";

    const newAppt = {
      id: Date.now(),
      type: "doctor",
      doctor: doc.name,
      hospital: doc.hospital,
      specialization: doc.specialization,
      date: dateStr,
      time: timeStr,
      patientName: patientData.name || "Patient",
      patientEmail: patientData.email || "",
      patientAge: patientData.age || "—",
      patientGender: patientData.gender || "—",
      note: `Auto-scheduled via MediBot for ${doc.specialization} consultation`,
      status: "Confirmed",
    };

    const existingAppts = JSON.parse(localStorage.getItem("allAppointments")) || [];
    localStorage.setItem("allAppointments", JSON.stringify([...existingAppts, newAppt]));
    window.dispatchEvent(new Event("dashboardUpdate"));

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `✅ **Appointment Confirmed!**\n\n• **Doctor:** ${doc.name}\n• **Specialty:** ${doc.specialization}\n• **Hospital:** ${doc.hospital}\n• **Scheduled Date:** ${dateStr} at ${timeStr}\n\n📅 This appointment is now automatically recorded on your **Patient Appointments** calendar and updated in **${doc.name}'s Doctor Dashboard** schedule!`,
      },
    ]);
  };

  // 2. Auto-schedule diagnostic test directly into diagnosticRequests and allAppointments
  const handleAutoScheduleDiagnostic = (testName, targetCenterName = null, referringDoctor = "Referring Physician") => {
    const patientData = JSON.parse(localStorage.getItem("patientProfile")) || {};
    const center = targetCenterName || DIAGNOSTIC_CENTERS[0].name;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    // A. Add to diagnosticRequests (for Diagnostic & Doctor Dashboards)
    const newReq = {
      id: Date.now(),
      patientName: patientData.name || "Patient",
      patientEmail: patientData.email || "",
      center: center,
      scanType: testName,
      notes: "Auto-scheduled via MediBot based on clinical triage",
      doctor: referringDoctor,
      date: new Date().toLocaleDateString(),
      status: "Pending",
    };

    const existRequests = JSON.parse(localStorage.getItem("diagnosticRequests")) || [];
    localStorage.setItem("diagnosticRequests", JSON.stringify([...existRequests, newReq]));

    // B. Add to allAppointments (so it shows in Patient Appointments Calendar!)
    const newCalAppt = {
      id: newReq.id,
      type: "diagnostic",
      doctor: center,
      hospital: center,
      specialization: "Diagnostic Test",
      testName: testName,
      date: dateStr,
      time: "11:30 AM",
      patientName: patientData.name || "Patient",
      patientEmail: patientData.email || "",
      patientAge: patientData.age || "—",
      patientGender: patientData.gender || "—",
      note: `Lab Test: ${testName} at ${center}`,
      status: "Confirmed",
    };

    const existingAppts = JSON.parse(localStorage.getItem("allAppointments")) || [];
    localStorage.setItem("allAppointments", JSON.stringify([...existingAppts, newCalAppt]));

    window.dispatchEvent(new Event("dashboardUpdate"));

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `✅ **Diagnostic Test Request Submitted!**\n\n• **Test Name:** ${testName}\n• **Diagnostic Center:** ${center}\n• **Scheduled Date:** ${dateStr} at 11:30 AM\n• **Referring Doctor:** ${referringDoctor}\n• **Status:** Confirmed / Pending Preparation\n\n🔬 This test request is now visible in your **Appointments Calendar**, synced to **${center}'s Diagnostic Dashboard** (Pending Scans Queue), and recorded in your **Doctor's Dashboard**!`,
      },
    ]);
  };

  const handleUserSubmit = (queryText) => {
    const text = (queryText || inputText).trim();
    if (!text) return;

    // Add user message
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    setTimeout(() => {
      const lower = text.toLowerCase();

      // Check if user is asking to schedule a specific test from the 15 seed tests
      const matchedTest = DIAGNOSTIC_TESTS.find((t) => lower.includes(t.name.toLowerCase()));
      const matchedCenter = DIAGNOSTIC_CENTERS.find((c) => lower.includes(c.name.toLowerCase()) || lower.includes(c.location.toLowerCase()));

      if (matchedTest && (lower.includes("schedule") || lower.includes("book") || lower.includes("test"))) {
        handleAutoScheduleDiagnostic(matchedTest.name, matchedCenter?.name);
        setIsThinking(false);
        return;
      }

      // Check if user is asking to schedule with one of the 34 doctors
      const allDocs = getAvailableDoctors();
      const mentionedDoctor = allDocs.find((d) => lower.includes(d.name.toLowerCase().replace("dr. ", "")));
      if (mentionedDoctor && (lower.includes("book") || lower.includes("schedule") || lower.includes("appointment"))) {
        handleAutoScheduleDoctor(mentionedDoctor);
        setIsThinking(false);
        return;
      }

      const analysis = analyzeSymptoms(text);

      if (!analysis) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I couldn't quite identify specific symptoms from your message. Please describe what discomfort you are experiencing (e.g. 'chest discomfort', 'knee pain', or 'severe migraine').",
          },
        ]);
        setIsThinking(false);
        return;
      }

      // Find available doctors matching this specialization from our 34 seed doctors
      let matchedDocs = allDocs.filter(
        (d) =>
          d.specialization?.toLowerCase().trim() ===
          analysis.specialization.toLowerCase().trim()
      );

      if (matchedDocs.length === 0) {
        matchedDocs = allDocs.filter(
          (d) => d.specialization?.toLowerCase() === "general medicine"
        );
      }

      const recommendedDoctors = matchedDocs.slice(0, 3);

      const botMsg = {
        sender: "bot",
        text: `Based on your symptoms, I recommend consulting a **${analysis.specialistTitle}**.`,
        analysis,
        doctors: recommendedDoctors,
        diagnosticCenter: DIAGNOSTIC_CENTERS[0],
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserSubmit();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    setInputText("");
  };

  const renderContent = () => (
    <>
      {/* Header */}
      <div className="medibot-header">
        <div className="medibot-header-info">
          <div className="medibot-avatar">🤖</div>
          <div>
            <h3 className="medibot-title">MediBot AI Health Assistant</h3>
            <span className="medibot-subtitle">
              <span className="medibot-status-dot" />
              Specialist Triage & Auto-Scheduler • Online
            </span>
          </div>
        </div>
        <div className="medibot-header-actions">
          <button
            className="medibot-icon-btn"
            title="Clear & Reset Chat"
            onClick={handleResetChat}
          >
            🔄
          </button>
          {!isFullScreen && onClose && (
            <button
              className="medibot-icon-btn"
              title="Close Assistant"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="medibot-chat-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg ${msg.sender}`}>
            {msg.sender === "bot" && (
              <div
                style={{
                  fontSize: 20,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#e0e7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                🩺
              </div>
            )}
            <div className="chat-bubble">
              <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>

              {/* Rich Recommendation Card */}
              {msg.analysis && (
                <div className="bot-rec-card">
                  {/* Urgency Alert Banner */}
                  <div className={`urgency-banner ${msg.analysis.urgencyBadgeClass}`}>
                    <span>
                      {msg.analysis.isEmergency ? "🚨" : msg.analysis.urgencyLevel === "URGENT" ? "⚠️" : "ℹ️"}
                    </span>
                    <span>{msg.analysis.urgencyTitle}</span>
                  </div>

                  {msg.analysis.isEmergency && (
                    <div
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #f87171",
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: "0.76rem",
                        color: "#991b1b",
                        marginBottom: "10px",
                        lineHeight: 1.45,
                      }}
                    >
                      <strong>Emergency Clinical Warning:</strong> {msg.analysis.emergencyReason} If you feel severe central chest pressure, left arm pain, face droop, or breathing crisis, please visit an emergency department immediately.
                    </div>
                  )}

                  {/* Specialist Spotlight */}
                  <div className="specialist-spotlight">
                    <div className="specialist-spotlight-title">
                      🎯 Recommended Specialist: {msg.analysis.specialistTitle}
                    </div>
                    <p className="specialist-spotlight-desc">
                      {msg.analysis.explanation}
                    </p>
                  </div>

                  {/* Available Doctors from 34 Seed List */}
                  <div className="bot-doctors-section">
                    <div className="bot-doctors-title">
                      👨‍⚕️ Verified Doctors in MediShare:
                    </div>
                    {msg.doctors && msg.doctors.length > 0 ? (
                      msg.doctors.map((doc, dIdx) => (
                        <div key={dIdx} className="bot-doctor-card">
                          <div className="bot-doctor-left">
                            <span className="bot-doctor-avatar">
                              {doc.avatar || "👨‍⚕️"}
                            </span>
                            <div>
                              <div className="bot-doctor-name">{doc.name}</div>
                              <div className="bot-doctor-meta">
                                {doc.specialization} · <strong>{doc.hospital}</strong> · {doc.experience}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="bot-book-btn"
                              style={{ background: "#059669" }}
                              title="Automatically schedules for Tomorrow at 10:00 AM"
                              onClick={() => handleAutoScheduleDoctor(doc)}
                            >
                              ⚡ Auto-Schedule
                            </button>
                            <button
                              className="bot-book-btn"
                              onClick={() => {
                                if (onBookDoctor) {
                                  onBookDoctor({
                                    hospital: doc.hospital,
                                    specialization: doc.specialization,
                                    doctor: doc.name,
                                  });
                                }
                              }}
                            >
                              Custom Slot
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: "0.76rem", color: "#64748b" }}>
                        No doctor currently registered for this specialty. You can consult a General Medicine physician.
                      </p>
                    )}
                  </div>

                  {/* Recommended Diagnostic Tests from the 15 Seed Tests */}
                  {msg.analysis.recommendedTests && (
                    <div style={{ marginTop: 14 }}>
                      <div className="bot-doctors-title">
                        🔬 Recommended Diagnostic Lab Tests:
                      </div>
                      <div className="bot-tests-row">
                        {msg.analysis.recommendedTests.map((t, tIdx) => (
                          <div key={tIdx} className="bot-test-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div className="bot-test-name">{t.name}</div>
                              <div style={{ fontSize: "0.72rem", color: "#3b82f6", marginTop: 2 }}>
                                {t.category} ({t.sampleType}) — {t.desc}
                              </div>
                            </div>
                            <button
                              style={{
                                background: "#2563eb",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                marginLeft: "8px",
                              }}
                              onClick={() =>
                                handleAutoScheduleDiagnostic(
                                  t.name,
                                  DIAGNOSTIC_CENTERS[tIdx % DIAGNOSTIC_CENTERS.length].name,
                                  msg.doctors?.[0]?.name || "Attending Physician"
                                )
                              }
                            >
                              ⚡ Auto-Request Test
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnostic Centers Network */}
                  <div style={{ marginTop: 14 }}>
                    <div className="bot-doctors-title">
                      🏥 Partner Diagnostic Centers:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                      {DIAGNOSTIC_CENTERS.map((dc, cIdx) => (
                        <span key={cIdx} style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", fontSize: "0.72rem", color: "#334155" }}>
                          {dc.avatar} {dc.name} ({dc.location})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="chat-msg bot">
            <div
              style={{
                fontSize: 20,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#e0e7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🩺
            </div>
            <div className="chat-bubble" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                MediBot is analyzing symptoms and searching verified doctors...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar (No suggestions chips as requested) */}
      <div className="medibot-input-bar">
        <input
          type="text"
          className="medibot-input"
          placeholder="Describe your symptoms or ask to schedule an appointment/diagnostic test..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="medibot-send-btn"
          onClick={() => handleUserSubmit()}
          disabled={!inputText.trim()}
          title="Send query"
        >
          ➤
        </button>
      </div>
    </>
  );

  if (isFullScreen) {
    return <div className="medibot-fullscreen-card">{renderContent()}</div>;
  }

  if (!isOpen) return null;

  return <div className="medibot-drawer">{renderContent()}</div>;
};

export default MediBot;
