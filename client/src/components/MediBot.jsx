import React, { useState, useEffect, useRef } from "react";
import { analyzeSymptoms } from "../data/symptomRules";
import { getAvailableDoctors } from "../data/doctorsData";
import { DIAGNOSTIC_CENTERS, DIAGNOSTIC_TESTS } from "../data/diagnosticData";

const INITIAL_GREETING = {
  sender: "bot",
  text: "Hello! I am MediBot, your AI Clinical Specialist & Triage Assistant. 🩺\n\nDescribe what health problems or symptoms you are experiencing, or ask for a specific doctor or diagnostic test. I will recommend the right specialist, provide verified hospital doctors, ask for your preferred time, and update your appointment directly in your calendar.",
};

const DOCTOR_TIME_SLOTS = [
  "09:30 AM",
  "10:30 AM",
  "11:30 AM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
];

const DIAGNOSTIC_TIME_SLOTS = [
  "08:30 AM",
  "09:30 AM",
  "10:30 AM",
  "11:30 AM",
  "02:00 PM",
  "04:00 PM",
];

// Helper to extract and normalize time from natural language input (e.g. "10:30 AM", "4pm", "2:30", "11am", "at 3:00 PM")
const extractTime = (text) => {
  if (!text) return null;
  const regex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\b/i;
  const match = text.match(regex);
  if (!match) return null;

  let [_, hoursStr, minsStr, meridiem] = match;
  let hours = parseInt(hoursStr, 10);
  let mins = minsStr ? parseInt(minsStr, 10) : 0;

  if (hours < 1 || hours > 24) return null;
  if (mins < 0 || mins > 59) return null;

  if (meridiem) {
    meridiem = meridiem.toLowerCase().replace(/\./g, "");
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  } else {
    // If no am/pm specified, assume standard daytime clinic hours (1-7 means 1 PM - 7 PM)
    if (hours >= 1 && hours <= 7) hours += 12;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = String(mins).padStart(2, "0");
  return `${String(displayHours).padStart(2, "0")}:${displayMins} ${period}`;
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
  const [pendingBooking, setPendingBooking] = useState(null);
  const [lastRecommendedDoctor, setLastRecommendedDoctor] = useState(null);
  const [lastRecommendedTest, setLastRecommendedTest] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      handleUserSubmit(initialQuery);
    }
  }, [initialQuery]);

  // 1. Initiate booking a Doctor appointment: asks for time if not provided
  const initiateDoctorBooking = (doc, userRequestedTime = null, customDateStr = null) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = customDateStr || `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const dateDisplay = customDateStr || `Tomorrow (${tomorrow.toLocaleDateString(undefined, { month: "short", day: "numeric" })})`;

    const booking = {
      type: "doctor",
      doctor: doc,
      dateStr,
      dateDisplay,
    };

    if (userRequestedTime) {
      finalizeBooking(booking, userRequestedTime);
      return;
    }

    setPendingBooking(booking);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `🕒 **Please select a convenient time for your consultation with ${doc.name}:**\n\n• **Doctor:** ${doc.name} (${doc.specialization})\n• **Hospital:** ${doc.hospital}\n• **Date:** ${dateDisplay}\n\nSelect a time slot below, or type your preferred time (e.g., *10:30 AM*, *03:15 PM*):`,
        isTimePrompt: true,
        bookingData: booking,
        timeSlots: DOCTOR_TIME_SLOTS,
      },
    ]);
  };

  // 2. Initiate booking a Diagnostic Test: asks for time if not provided
  const initiateDiagnosticBooking = (testName, targetCenterName = null, referringDoctor = "Attending Physician", userRequestedTime = null, customDateStr = null) => {
    const center = targetCenterName || DIAGNOSTIC_CENTERS[0].name;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = customDateStr || `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const dateDisplay = customDateStr || `Tomorrow (${tomorrow.toLocaleDateString(undefined, { month: "short", day: "numeric" })})`;

    const booking = {
      type: "diagnostic",
      testName,
      center,
      referringDoctor,
      dateStr,
      dateDisplay,
    };

    if (userRequestedTime) {
      finalizeBooking(booking, userRequestedTime);
      return;
    }

    setPendingBooking(booking);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `🕒 **Please select a convenient time for your ${testName} lab test:**\n\n• **Test Name:** ${testName}\n• **Diagnostic Center:** ${center}\n• **Date:** ${dateDisplay}\n\nSelect a time slot below, or type your preferred time (e.g., *09:30 AM*, *02:00 PM*):`,
        isTimePrompt: true,
        bookingData: booking,
        timeSlots: DIAGNOSTIC_TIME_SLOTS,
      },
    ]);
  };

  // 3. Finalize and record appointment in calendar and dashboards with the exact chosen time
  const finalizeBooking = (booking, chosenTime) => {
    const patientData = JSON.parse(localStorage.getItem("patientProfile")) || {};
    const normalizedTime = extractTime(chosenTime) || chosenTime || "10:00 AM";

    if (booking.type === "doctor") {
      const newAppt = {
        id: Date.now(),
        type: "doctor",
        doctor: booking.doctor.name,
        hospital: booking.doctor.hospital,
        specialization: booking.doctor.specialization,
        date: booking.dateStr,
        time: normalizedTime,
        patientName: patientData.name || "Patient",
        patientEmail: patientData.email || "",
        patientAge: patientData.age || "—",
        patientGender: patientData.gender || "—",
        note: `Scheduled via MediBot for ${booking.doctor.specialization} consultation`,
        status: "Confirmed",
      };

      const existingAppts = JSON.parse(localStorage.getItem("allAppointments")) || [];
      localStorage.setItem("allAppointments", JSON.stringify([...existingAppts, newAppt]));

      window.dispatchEvent(new Event("dashboardUpdate"));
      window.dispatchEvent(new Event("appointmentsUpdate"));

      setPendingBooking(null);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `✅ **Appointment Confirmed & Added to Calendar!**\n\n• **Doctor:** ${booking.doctor.name}\n• **Specialty:** ${booking.doctor.specialization}\n• **Hospital:** ${booking.doctor.hospital}\n• **Scheduled Date:** ${booking.dateStr} (${booking.dateDisplay})\n• **Scheduled Time:** ⏰ **${normalizedTime}**\n• **Status:** Confirmed\n\n📅 This appointment is now automatically recorded on your **Patient Appointments Calendar** and updated in **${booking.doctor.name}'s Doctor Dashboard**!`,
        },
      ]);
    } else {
      // Diagnostic test booking
      const newReq = {
        id: Date.now(),
        patientName: patientData.name || "Patient",
        patientEmail: patientData.email || "",
        center: booking.center,
        scanType: booking.testName,
        notes: `Scheduled via MediBot at ${normalizedTime}`,
        doctor: booking.referringDoctor || "Attending Physician",
        date: booking.dateStr,
        time: normalizedTime,
        status: "Pending",
      };

      const existRequests = JSON.parse(localStorage.getItem("diagnosticRequests")) || [];
      localStorage.setItem("diagnosticRequests", JSON.stringify([...existRequests, newReq]));

      const newCalAppt = {
        id: newReq.id,
        type: "diagnostic",
        doctor: booking.center,
        diagnosticCenter: booking.center,
        hospital: booking.center,
        specialization: "Diagnostic Test",
        testName: booking.testName,
        date: booking.dateStr,
        time: normalizedTime,
        patientName: patientData.name || "Patient",
        patientEmail: patientData.email || "",
        patientAge: patientData.age || "—",
        patientGender: patientData.gender || "—",
        note: `Lab Test: ${booking.testName} at ${booking.center}`,
        status: "Confirmed",
      };

      const existingAppts = JSON.parse(localStorage.getItem("allAppointments")) || [];
      localStorage.setItem("allAppointments", JSON.stringify([...existingAppts, newCalAppt]));

      window.dispatchEvent(new Event("dashboardUpdate"));
      window.dispatchEvent(new Event("appointmentsUpdate"));

      setPendingBooking(null);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `✅ **Diagnostic Test Confirmed & Added to Calendar!**\n\n• **Test Name:** ${booking.testName}\n• **Diagnostic Center:** ${booking.center}\n• **Scheduled Date:** ${booking.dateStr} (${booking.dateDisplay})\n• **Scheduled Time:** ⏰ **${normalizedTime}**\n• **Referring Doctor:** ${booking.referringDoctor || "Attending Physician"}\n• **Status:** Confirmed\n\n🔬 This test request is now visible in your **Appointments Calendar**, synced to **${booking.center}'s Diagnostic Dashboard**, and recorded in your Doctor's Dashboard!`,
        },
      ]);
    }
  };

  const handleUserSubmit = (queryText) => {
    const text = (queryText || inputText).trim();
    if (!text) return;

    // Add user message to conversation
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    setTimeout(() => {
      const lower = text.toLowerCase();

      // CASE A: User is currently answering a time prompt
      if (pendingBooking) {
        if (lower === "cancel" || lower === "no" || lower === "stop" || lower === "exit") {
          setPendingBooking(null);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Appointment scheduling cancelled. Please describe any other symptoms or let me know what else you need!",
            },
          ]);
          setIsThinking(false);
          return;
        }

        const extracted = extractTime(text);
        if (extracted) {
          finalizeBooking(pendingBooking, extracted);
          setIsThinking(false);
          return;
        }

        // Could not extract a clear time
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `Please select one of the time buttons above or type a specific time (e.g., **10:30 AM** or **03:00 PM**) to schedule your appointment with **${pendingBooking.type === "diagnostic" ? pendingBooking.testName : pendingBooking.doctor?.name}**, or type **cancel** to abort.`,
            isTimePrompt: true,
            bookingData: pendingBooking,
            timeSlots: pendingBooking.type === "diagnostic" ? DIAGNOSTIC_TIME_SLOTS : DOCTOR_TIME_SLOTS,
          },
        ]);
        setIsThinking(false);
        return;
      }

      // CASE B: User explicitly asks to schedule a diagnostic test
      const matchedTest = DIAGNOSTIC_TESTS.find((t) => lower.includes(t.name.toLowerCase()));
      const matchedCenter = DIAGNOSTIC_CENTERS.find(
        (c) => lower.includes(c.name.toLowerCase()) || lower.includes(c.location.toLowerCase())
      );

      if (matchedTest && (lower.includes("schedule") || lower.includes("book") || lower.includes("test") || lower.includes("appoint"))) {
        const userTime = extractTime(text);
        initiateDiagnosticBooking(matchedTest.name, matchedCenter?.name, lastRecommendedDoctor?.name || "Attending Physician", userTime);
        setIsThinking(false);
        return;
      }

      // CASE C: User explicitly asks to schedule with a doctor
      const allDocs = getAvailableDoctors();
      const mentionedDoctor = allDocs.find((d) => lower.includes(d.name.toLowerCase().replace("dr. ", "")));

      if (mentionedDoctor && (lower.includes("book") || lower.includes("schedule") || lower.includes("appointment") || lower.includes("consult"))) {
        const userTime = extractTime(text);
        initiateDoctorBooking(mentionedDoctor, userTime);
        setIsThinking(false);
        return;
      }

      // CASE D: User says "book appointment" or "schedule appointment" referring to the previously recommended specialist
      if ((lower.includes("book appointment") || lower.includes("schedule appointment") || lower.includes("book it") || lower.includes("schedule it")) && lastRecommendedDoctor) {
        const userTime = extractTime(text);
        initiateDoctorBooking(lastRecommendedDoctor, userTime);
        setIsThinking(false);
        return;
      }

      // CASE E: Standard Clinical Symptom Triage
      const analysis = analyzeSymptoms(text);

      if (!analysis) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I couldn't quite identify specific symptoms from your message. Please describe what discomfort you are experiencing (e.g. 'chest discomfort', 'knee pain', 'skin rash', or 'severe migraine'). You can also ask to schedule an appointment with a doctor or book a lab test.",
          },
        ]);
        setIsThinking(false);
        return;
      }

      // Find available doctors matching this specialization from our verified doctors
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
      if (recommendedDoctors.length > 0) {
        setLastRecommendedDoctor(recommendedDoctors[0]);
      }
      if (analysis.recommendedTests?.length > 0) {
        setLastRecommendedTest(analysis.recommendedTests[0]);
      }

      const botMsg = {
        sender: "bot",
        text: `Based on your symptoms, I recommend consulting a **${analysis.specialistTitle}**.`,
        analysis,
        doctors: recommendedDoctors,
        diagnosticCenter: DIAGNOSTIC_CENTERS[0],
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 500);
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
    setPendingBooking(null);
    setLastRecommendedDoctor(null);
    setLastRecommendedTest(null);
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
              Specialist Triage & Calendar Scheduler • Online
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

              {/* Interactive Time Selector Prompt */}
              {msg.isTimePrompt && msg.bookingData && (
                <div className="time-picker-prompt-box">
                  <div className="time-slots-header">
                    <span>⏰ Choose a Preferred Time Slot:</span>
                  </div>
                  <div className="time-slots-grid">
                    {msg.timeSlots.map((slot, sIdx) => (
                      <button
                        key={sIdx}
                        className="time-slot-btn"
                        onClick={() => finalizeBooking(msg.bookingData, slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <div className="custom-time-picker-row">
                    <span style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>Custom Time:</span>
                    <input
                      type="time"
                      className="custom-time-input"
                      defaultValue="10:00"
                      id={`custom-time-input-${idx}`}
                    />
                    <button
                      className="custom-time-confirm-btn"
                      onClick={() => {
                        const val = document.getElementById(`custom-time-input-${idx}`)?.value;
                        if (val) {
                          const formatted = extractTime(val) || val;
                          finalizeBooking(msg.bookingData, formatted);
                        }
                      }}
                    >
                      Confirm Slot
                    </button>
                    <button
                      className="custom-time-cancel-btn"
                      onClick={() => {
                        setPendingBooking(null);
                        setMessages((prev) => [
                          ...prev,
                          { sender: "bot", text: "Appointment scheduling cancelled." },
                        ]);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

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

                  {/* Available Doctors List */}
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
                              title="Asks for your preferred time and schedules appointment"
                              onClick={() => initiateDoctorBooking(doc)}
                            >
                              📅 Schedule (Pick Time)
                            </button>
                            <button
                              className="bot-book-btn"
                              style={{ background: "#1e3a8a" }}
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
                              Open Calendar
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

                  {/* Recommended Diagnostic Tests */}
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
                                padding: "6px 12px",
                                fontSize: "0.74rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                marginLeft: "8px",
                              }}
                              onClick={() =>
                                initiateDiagnosticBooking(
                                  t.name,
                                  DIAGNOSTIC_CENTERS[tIdx % DIAGNOSTIC_CENTERS.length].name,
                                  msg.doctors?.[0]?.name || "Attending Physician"
                                )
                              }
                            >
                              🔬 Schedule Test
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
                MediBot is processing your request...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div className="medibot-input-bar">
        <input
          type="text"
          className="medibot-input"
          placeholder={
            pendingBooking
              ? "Type your preferred time (e.g. 10:30 AM or 03:00 PM) or click a slot above..."
              : "Describe symptoms or ask to schedule an appointment (e.g. 'Book Dr. Sneha Rao')..."
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="medibot-send-btn"
          onClick={() => handleUserSubmit()}
          disabled={!inputText.trim()}
          title="Send message"
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
