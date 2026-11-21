// Symptom Analysis Rules - Uses ONLY the 15 Seed Diagnostic Tests and 7 Specialties
import { DIAGNOSTIC_TESTS } from "./diagnosticData";

export const SPECIALIST_KNOWLEDGE_BASE = [
  {
    specialization: "Cardiology",
    specialistTitle: "Cardiologist (Heart Specialist)",
    keywords: ["chest pain", "chest tightness", "heart", "palpitation", "fluttering", "shortness of breath", "angina", "cardiac", "bp", "blood pressure", "hypertension", "left arm", "dizziness when standing", "irregular beat"],
    emergencyTriggers: ["crushing", "radiating to left arm", "radiating to jaw", "sweating cold", "passed out", "severe chest"],
    explanation: "Your symptoms point toward cardiovascular involvement. A Cardiologist specializes in heart rhythm, coronary health, and systemic blood pressure.",
    recommendedTests: [
      { name: "ECG", category: "Cardiology", sampleType: "Electrical Recording", desc: "Evaluates electrical rhythm and detects myocardial ischemia" },
      { name: "Lipid Profile", category: "Biochemistry", sampleType: "Blood", desc: "Assesses cholesterol fractions and cardiac lipid risks" },
      { name: "X-Ray Chest", category: "Radiology", sampleType: "Imaging", desc: "Screens cardiac silhouette and pulmonary congestion" },
    ],
    questionsToAsk: [
      "Do my symptoms suggest any coronary artery or rhythm condition?",
      "Should I start daily home blood pressure or pulse logging?",
      "Are there safe physical activity limits I should follow?"
    ],
    immediateCare: "If experiencing crushing central chest pain radiating to the jaw/arm or severe breathlessness, seek immediate Emergency care."
  },
  {
    specialization: "Neurology",
    specialistTitle: "Neurologist (Brain & Nervous System Specialist)",
    keywords: ["headache", "migraine", "dizziness", "vertigo", "seizure", "numbness", "tingling", "pins and needles", "tremor", "memory", "light sensitivity", "aura", "fainting", "nerve"],
    emergencyTriggers: ["face droop", "slurred speech", "arm weakness", "sudden worst headache", "thunderclap"],
    explanation: "Your symptoms suggest neurological involvement affecting brain pathways, cranial nerves, or peripheral sensations.",
    recommendedTests: [
      { name: "MRI Brain", category: "MRI", sampleType: "Imaging", desc: "High-resolution imaging to evaluate brain tissue and cranial structures" },
      { name: "Vitamin D Test", category: "Biochemistry", sampleType: "Blood", desc: "Assesses neuro-muscular and bone metabolism levels" },
      { name: "Complete Blood Count (CBC)", category: "Hematology", sampleType: "Blood", desc: "Excludes systemic infection or inflammatory triggers" },
    ],
    questionsToAsk: [
      "Is this primary migraine, tension, or secondary to another factor?",
      "What abortive vs preventative medications are right for me?",
      "Could my dizziness be vestibular (inner ear) or central nervous related?"
    ],
    immediateCare: "Rest in a quiet, dark room. Hydrate with electrolyte water. If experiencing sudden facial drooping, speech difficulty, or severe weakness (FAST stroke signs), call emergency services."
  },
  {
    specialization: "Dermatology",
    specialistTitle: "Dermatologist (Skin, Hair & Nail Specialist)",
    keywords: ["rash", "skin", "itch", "itching", "eczema", "hives", "acne", "mole", "scalp", "dandruff", "psoriasis", "blister", "bump", "spots", "hair loss", "flaking", "allergy"],
    emergencyTriggers: ["lips swelling", "throat closing", "anaphylaxis"],
    explanation: "These symptoms suggest an epidermal, allergic, or follicular condition requiring specialist dermatological treatment.",
    recommendedTests: [
      { name: "Complete Blood Count (CBC)", category: "Hematology", sampleType: "Blood", desc: "Evaluates eosinophils and allergic/infection markers" },
      { name: "Liver Function Test (LFT)", category: "Biochemistry", sampleType: "Blood", desc: "Evaluates hepatic function before dermatological medications" },
      { name: "Blood Glucose Test", category: "Biochemistry", sampleType: "Blood", desc: "Screens for diabetic dermatopathy or systemic glucose imbalance" },
    ],
    questionsToAsk: [
      "Is this rash infectious, allergic, or an autoimmune flare?",
      "What topical treatment or gentle barrier moisturizer is safest?",
      "Are there specific laundry detergents or foods I should avoid?"
    ],
    immediateCare: "Avoid scratching the area. Wash with lukewarm water and a fragrance-free gentle cleanser; do not apply harsh remedies."
  },
  {
    specialization: "Orthopedics",
    specialistTitle: "Orthopedic Surgeon (Bone & Joint Specialist)",
    keywords: ["bone", "joint", "knee", "back pain", "spine", "fracture", "sprain", "shoulder", "hip", "arthritis", "ligament", "swollen joint", "stiffness", "tendon", "neck pain", "muscle pain"],
    emergencyTriggers: ["open fracture", "cannot bear any weight", "loss of bladder control"],
    explanation: "Your symptoms involve the musculoskeletal system (bones, joints, ligaments, tendons, or spine).",
    recommendedTests: [
      { name: "X-Ray Chest", category: "Radiology", sampleType: "Imaging", desc: "Screens thoracic spine, rib alignment, and skeletal integrity" },
      { name: "Vitamin D Test", category: "Biochemistry", sampleType: "Blood", desc: "Checks bone mineral density and calcium absorption cofactor" },
      { name: "Complete Blood Count (CBC)", category: "Hematology", sampleType: "Blood", desc: "Screens for systemic inflammatory or infectious arthritis markers" },
    ],
    questionsToAsk: [
      "Is my joint discomfort related to wear-and-tear or soft-tissue injury?",
      "Will physical therapy exercises help restore full mobility?",
      "Do I need temporary knee/back bracing?"
    ],
    immediateCare: "Use the R.I.C.E protocol (Rest, Ice, Compression, Elevation) for acute sprains. Avoid high-impact pressure on the painful joint."
  },
  {
    specialization: "Pediatrics",
    specialistTitle: "Pediatrician (Child & Adolescent Specialist)",
    keywords: ["child", "baby", "infant", "toddler", "kid", "pediatric", "teething", "growth milestone", "vaccine", "vaccination", "children", "baby fever"],
    emergencyTriggers: ["unresponsive baby", "difficulty breathing child", "infant fever over 102"],
    explanation: "Your problem concerns an infant, child, or adolescent requiring pediatric-specialized examination and care.",
    recommendedTests: [
      { name: "Complete Blood Count (CBC)", category: "Hematology", sampleType: "Blood", desc: "Assesses pediatric white blood cells, platelets, and infection markers" },
      { name: "Hemoglobin Test", category: "Hematology", sampleType: "Blood", desc: "Checks for pediatric anemia and iron deficiency" },
      { name: "Urine Routine Examination", category: "Pathology", sampleType: "Urine", desc: "Screens for common childhood urinary tract infections" },
    ],
    questionsToAsk: [
      "What is the exact pediatric dosage for any fever medication?",
      "What dehydration signs should I monitor at home?",
      "Are my child's immunizations up to date?"
    ],
    immediateCare: "Keep your child hydrated with water or electrolyte fluids. Keep clothing light during fever and monitor temperature hourly."
  },
  {
    specialization: "Gynecology",
    specialistTitle: "Gynecologist (Women's Health Specialist)",
    keywords: ["period", "periods", "menstrual", "menstruation", "cramps", "pelvic", "pcod", "pcos", "pregnancy", "pregnant", "ovary", "uterus", "vaginal", "fertility", "bleeding", "discharge", "menopause"],
    emergencyTriggers: ["heavy sudden hemorrhaging", "ectopic pain", "severe acute pelvic pain"],
    explanation: "Your symptoms pertain to the female reproductive system and hormonal health.",
    recommendedTests: [
      { name: "Ultrasound Abdomen", category: "Ultrasound", sampleType: "Imaging", desc: "Detailed pelvic and abdominal scan for uterus, ovaries, and cysts" },
      { name: "Thyroid Profile (T3, T4, TSH)", category: "Hormone", sampleType: "Blood", desc: "Evaluates thyroid hormones linked to menstrual irregularities" },
      { name: "Complete Blood Count (CBC)", category: "Hematology", sampleType: "Blood", desc: "Checks for anemia caused by heavy menstrual bleeding" },
    ],
    questionsToAsk: [
      "Is my menstrual irregularity hormonal or structural?",
      "What nutritional changes or supplements are beneficial?",
      "Are there prescription therapies to alleviate painful cycles?"
    ],
    immediateCare: "Apply a warm heating pad to the lower abdomen. Stay hydrated and rest during acute cramping."
  },
  {
    specialization: "General Medicine",
    specialistTitle: "General Physician (Internal Medicine Specialist)",
    keywords: ["fever", "chills", "weakness", "tired", "fatigue", "body ache", "cold", "flu", "cough", "checkup", "unwell", "weight loss", "general", "blood test", "sugar", "diabetes", "stomach", "vomiting", "diarrhea", "acidity", "throat"],
    emergencyTriggers: ["confusion", "unconscious", "hallucination"],
    explanation: "Your symptoms represent general or systemic conditions requiring comprehensive evaluation.",
    recommendedTests: [
      { name: "Complete Blood Count (CBC)", category: "Hematology", sampleType: "Blood", desc: "Primary blood work measuring infection and cell levels" },
      { name: "Blood Glucose Test", category: "Biochemistry", sampleType: "Blood", desc: "Assesses blood sugar levels" },
      { name: "Kidney Function Test (KFT)", category: "Biochemistry", sampleType: "Blood", desc: "Checks creatinine, urea, and renal filtration" },
      { name: "Liver Function Test (LFT)", category: "Biochemistry", sampleType: "Blood", desc: "Assesses hepatic enzymes and bilirubin" },
      { name: "HbA1c", category: "Biochemistry", sampleType: "Blood", desc: "Measures 3-month average blood glucose control" },
    ],
    questionsToAsk: [
      "What baseline diagnostic blood tests are most appropriate for me?",
      "Do I have any nutritional deficiencies (Vitamin D, Iron)?",
      "When should I follow up if my symptoms persist?"
    ],
    immediateCare: "Get ample rest, drink plenty of water, and monitor your body temperature twice daily."
  }
];

export const analyzeSymptoms = (inputText = "") => {
  const text = inputText.toLowerCase().trim();
  if (!text) return null;

  // 1. Check for emergency flags first
  let isEmergency = false;
  let emergencyReason = "";
  for (const item of SPECIALIST_KNOWLEDGE_BASE) {
    if (item.emergencyTriggers) {
      for (const trigger of item.emergencyTriggers) {
        if (text.includes(trigger.toLowerCase())) {
          isEmergency = true;
          emergencyReason = `Your description mentions "${trigger}", which may require immediate clinical attention.`;
          break;
        }
      }
    }
    if (isEmergency) break;
  }

  // 2. Score specialists based on keyword match
  let bestMatch = null;
  let highestScore = 0;

  for (const item of SPECIALIST_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 2 : 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Default to General Medicine
  if (!bestMatch || highestScore === 0) {
    bestMatch = SPECIALIST_KNOWLEDGE_BASE.find(s => s.specialization === "General Medicine");
  }

  let urgencyLevel = "ROUTINE";
  let urgencyTitle = "Standard Specialist Consultation";
  let urgencyBadgeClass = "urgency-routine";

  if (isEmergency) {
    urgencyLevel = "EMERGENCY";
    urgencyTitle = "🚨 Urgent / Emergency Consideration";
    urgencyBadgeClass = "urgency-emergency";
  } else if (highestScore >= 3 || text.includes("severe") || text.includes("high fever") || text.includes("acute")) {
    urgencyLevel = "URGENT";
    urgencyTitle = "⚠️ Prompt Consultation Advised (Within 24–48 Hours)";
    urgencyBadgeClass = "urgency-urgent";
  }

  return {
    specialization: bestMatch.specialization,
    specialistTitle: bestMatch.specialistTitle,
    explanation: bestMatch.explanation,
    recommendedTests: bestMatch.recommendedTests,
    questionsToAsk: bestMatch.questionsToAsk,
    immediateCare: bestMatch.immediateCare,
    urgencyLevel,
    urgencyTitle,
    urgencyBadgeClass,
    isEmergency,
    emergencyReason
  };
};
