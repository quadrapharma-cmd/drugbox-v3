// ============================================================
// Seed data pools — realistic pharma/cosmetics/medical-device
// professionals across Egypt, GCC, and Africa.
// Used by scripts/seed.ts to generate 200+ accounts + listings.
// ============================================================

export const FIRST_NAMES_AR_EN = [
  'Haytham', 'Asmaa', 'Omar', 'Mona', 'Khaled', 'Nour', 'Ahmed', 'Salma',
  'Mahmoud', 'Yasmin', 'Tarek', 'Dina', 'Karim', 'Heba', 'Sherif', 'Rania',
  'Amr', 'Mariam', 'Hossam', 'Nada', 'Wael', 'Sara', 'Ayman', 'Laila',
  'Mostafa', 'Reem', 'Hany', 'Aya', 'Sameh', 'Engy', 'Bassem', 'Doaa',
  'Ramy', 'Hala', 'Ehab', 'Marwa', 'Adel', 'Ghada', 'Tamer', 'Shaimaa',
  'Allison', 'Wei', 'Rajesh', 'Priya', 'Chen', 'Anil', 'Li', 'Sunil',
  'Muhammed', 'Fatima', 'Abdullah', 'Aisha', 'Saeed', 'Mariam', 'Yusuf', 'Layla',
]

export const LAST_NAMES = [
  'Dweedar', 'Meabed', 'Khaled', 'Hassan', 'Ibrahim', 'Mansour', 'Fawzy', 'Saleh',
  'Abdelrahman', 'El-Sayed', 'Farouk', 'Naguib', 'Shafik', 'Zaki', 'Gamal', 'Lotfy',
  'Wang', 'Sharma', 'Patel', 'Chen', 'Kumar', 'Li', 'Reddy', 'Gupta',
  'Al-Maktoum', 'Al-Rashid', 'Hussain', 'Khan', 'Al-Sabah', 'Al-Thani', 'Mansoori', 'Qasimi',
]

export const COMPANIES = [
  'Quadra Pharm', 'Medsinia Industries', 'Shandong Hope Biotech', 'Aurobindo Pharma',
  'Epione Drug Store', 'NilePharma', 'Cairo Cosmetics Lab', 'Delta Med Devices',
  'Pharaoh Biologics', 'GCC Pharma Trading', 'Alexandria APIs', 'Giza Generics',
  'Sphinx Healthcare', 'Sina Pharmaceuticals', 'Levant Medical Supply', 'Gulf Bio Solutions',
  'Memphis Excipients', 'Luxor Life Sciences', 'Red Sea Pharma', 'Karnak Cosmetics',
]

export const HEADLINES = [
  'Chairman & CEO', 'Regulatory Affairs Manager', 'Production Manager', 'QA/QC Director',
  'Export Sales Director', 'Registration Lead', 'Procurement Manager', 'R&D Scientist',
  'Formulation Specialist', 'Business Development Manager', 'Supply Chain Manager',
  'Quality Control Analyst', 'Regulatory Specialist', 'Plant Manager', 'Technical Director',
  'Pharmacovigilance Officer', 'Validation Engineer', 'Microbiologist', 'Market Access Lead',
  'Medical Affairs Manager',
]

export const LOCATIONS = [
  { city: 'Giza, Egypt', country: 'EG' },
  { city: 'Cairo, Egypt', country: 'EG' },
  { city: '10th of Ramadan, Egypt', country: 'EG' },
  { city: 'Alexandria, Egypt', country: 'EG' },
  { city: 'Dubai, UAE', country: 'AE' },
  { city: 'Abu Dhabi, UAE', country: 'AE' },
  { city: 'Riyadh, Saudi Arabia', country: 'SA' },
  { city: 'Jeddah, Saudi Arabia', country: 'SA' },
  { city: 'Amman, Jordan', country: 'JO' },
  { city: 'Hyderabad, India', country: 'IN' },
  { city: 'Mumbai, India', country: 'IN' },
  { city: 'Shandong, China', country: 'CN' },
  { city: 'Casablanca, Morocco', country: 'MA' },
  { city: 'Lagos, Nigeria', country: 'NG' },
  { city: 'Nairobi, Kenya', country: 'KE' },
]

export const CERTS_POOL = [
  'WHO-GMP', 'EDA', 'ISO 9001', 'ICH Q7', 'CEP', 'USFDA', 'EDQM', 'ISO 13485',
  'GMP', 'NFSA', 'MOH-UAE', 'SFDA',
]

export const BIOS = [
  'Pharmaceutical professional focused on solid/liquid dosage manufacturing and cross-border registration.',
  'Regulatory specialist — dossier submissions, stability studies, and compliance across MENA.',
  'Connecting global manufacturers with quality APIs and excipients.',
  'Facilitating pharmaceutical registration and GCC market access.',
  'Production and process optimization. Continuous manufacturing enthusiast.',
  'Quality assurance leader with a focus on GMP compliance and audits.',
  'Cosmetics formulation and product development specialist.',
  'Medical device sourcing and regulatory clearance across emerging markets.',
  '25+ years building pharmaceutical manufacturing capacity in the region.',
  'Bridging suppliers and buyers across the pharma value chain.',
]

// Listing content pools by category
export const SUPPLY_PRODUCTS = [
  { title: 'Amoxicillin Trihydrate', subtype: 'rawmaterial', unit: 'kg', price: 38.5, moq: '100 kg', certs: 'CEP', emoji: '🧪' },
  { title: 'Metformin HCl BP/USP', subtype: 'rawmaterial', unit: 'kg', price: 5.8, moq: '500 kg', certs: 'GMP', emoji: '⚗️' },
  { title: 'Paracetamol DC Grade', subtype: 'rawmaterial', unit: 'kg', price: 4.2, moq: '1000 kg', certs: 'USP', emoji: '💊' },
  { title: 'Neomycin Sulphate', subtype: 'rawmaterial', unit: 'kg', price: 42.0, moq: '100 kg', certs: 'CEP', emoji: '⚗️' },
  { title: 'Shaft Hair Growth Serum', subtype: 'cosmetic', unit: 'unit', price: 2.1, moq: '5,000', certs: '', emoji: '🧴' },
  { title: 'Vitamin C Effervescent', subtype: 'supplement', unit: 'tube', price: 0.95, moq: '10,000', certs: 'GMP', emoji: '💊' },
  { title: 'Microcrystalline Cellulose', subtype: 'rawmaterial', unit: 'kg', price: 3.1, moq: '500 kg', certs: 'USP-NF', emoji: '🧪' },
  { title: 'Hyaluronic Acid Serum Base', subtype: 'cosmetic', unit: 'L', price: 12.0, moq: '200 L', certs: '', emoji: '🧴' },
  { title: 'Omega-3 Softgels', subtype: 'supplement', unit: 'unit', price: 0.18, moq: '50,000', certs: 'GMP', emoji: '💊' },
  { title: 'Surgical Face Masks Type IIR', subtype: 'device', unit: 'box', price: 3.5, moq: '1,000 boxes', certs: 'CE, ISO 13485', emoji: '😷' },
]

export const DEMAND_PRODUCTS = [
  { title: 'Ciprofloxacin HCl', subtype: 'rawmaterial', unit: 'kg', moq: '2 MT/month', emoji: '🔍' },
  { title: 'Azithromycin Dihydrate', subtype: 'rawmaterial', unit: 'kg', moq: '500 kg', emoji: '🔍' },
  { title: 'Empty Hard Gelatin Capsules', subtype: 'rawmaterial', unit: 'box', moq: '1M units', emoji: '🔍' },
  { title: 'Cosmetic Grade Glycerin', subtype: 'cosmetic', unit: 'kg', moq: '5 MT', emoji: '🔍' },
  { title: 'Blister Packaging Film PVC/PVDC', subtype: 'rawmaterial', unit: 'roll', moq: '500 rolls', emoji: '🔍' },
]

export const SERVICES = [
  { title: 'EDA Registration — Pharma & Cosmetics', emoji: '📋' },
  { title: 'GCC Registration — All 6 States', emoji: '🌍' },
  { title: 'QA/QC Consulting & GMP Gap Analysis', emoji: '🔬' },
  { title: 'Stability Studies & Accelerated Testing', emoji: '🧪' },
  { title: 'CTD Dossier Preparation (ICH M4)', emoji: '📄' },
  { title: 'Formulation Development — Cosmetics', emoji: '🧴' },
]

export const CMO_SERVICES = [
  { title: 'Contract Manufacturing — Tablets & Capsules', emoji: '🏭' },
  { title: 'Contract Manufacturing — Liquids & Syrups', emoji: '🏭' },
  { title: 'Cosmetic Contract Filling & Packaging', emoji: '🏭' },
  { title: 'Softgel Encapsulation Services', emoji: '🏭' },
]

export const JOBS = [
  { title: 'Senior Regulatory Affairs Specialist', dept: 'Regulatory Affairs', level: 'senior', type: 'fulltime' },
  { title: 'API Quality Control Analyst', dept: 'Quality Control', level: 'mid', type: 'fulltime' },
  { title: 'GCC Registration Coordinator', dept: 'Regulatory Affairs', level: 'mid', type: 'contract' },
  { title: 'Production Supervisor', dept: 'Production', level: 'mid', type: 'fulltime' },
  { title: 'QC Analyst (HPLC)', dept: 'Quality Control', level: 'junior', type: 'fulltime' },
  { title: 'Formulation Scientist', dept: 'R&D', level: 'senior', type: 'fulltime' },
  { title: 'Pharmacovigilance Officer', dept: 'Medical Affairs', level: 'mid', type: 'fulltime' },
  { title: 'Plant Manager', dept: 'Production', level: 'exec', type: 'fulltime' },
  { title: 'Validation Engineer', dept: 'Engineering', level: 'mid', type: 'fulltime' },
  { title: 'Export Sales Executive', dept: 'Sales', level: 'mid', type: 'fulltime' },
]

export const POSTS = [
  { body: 'Excited to announce we completed validation on our new hair growth serum line. EDA notification submitted. Proud of the team! 🧪', category: 'general' },
  { body: 'Reminder for regulatory colleagues: EDA has streamlined the stability submission pathway for locally manufactured generics. Review cycle times are dropping. Happy to share notes.', category: 'regulatory' },
  { body: 'New GMP-grade Metformin HCl batch available with CEP documentation. MOQ 500kg. DM for spec sheets. We ship worldwide. 🌍', category: 'market' },
  { body: 'Anyone else moving toward continuous manufacturing? Seeing real gains in yield consistency and batch-release times. Curious what challenges others hit on validation.', category: 'innovation' },
  { body: 'Dubai market update: registration timelines for imported pharmaceuticals are tightening. Planning GCC entry in 2026? Start your dossier early.', category: 'regulatory' },
  { body: 'We are hiring a Senior Regulatory Affairs Specialist in Giza. EDA dossier experience required. Apply through our company page.', category: 'job' },
  { body: 'Great discussions at the Cairo Pharma Summit this week. The appetite for local API manufacturing has never been higher.', category: 'general' },
  { body: 'Stability chamber maintenance tip: calibrate your sensors quarterly. Drift caught us early last year and saved a batch.', category: 'innovation' },
  { body: 'Looking for a reliable supplier of empty hard gelatin capsules, 1M units/month. CEP preferred. Comment or DM.', category: 'market' },
  { body: 'NFSA cosmetic notification process has improved significantly. Turnaround down to weeks for compliant dossiers.', category: 'regulatory' },
]

export const GROUPS = [
  { name: 'Regulatory Affairs — Egypt', desc: 'EDA & NFSA submissions, stability, and compliance discussion.', emoji: '📋' },
  { name: 'API Sourcing & Supply', desc: 'Connect buyers and suppliers of active pharmaceutical ingredients.', emoji: '⚗️' },
  { name: 'GCC Market Access', desc: 'Registration and distribution across Gulf markets.', emoji: '🌍' },
  { name: 'Cosmetics Formulation', desc: 'Formulation science, ingredients, and product development.', emoji: '🧴' },
  { name: 'Pharma Manufacturing', desc: 'Production, GMP, validation, and continuous manufacturing.', emoji: '🏭' },
  { name: 'Medical Devices MENA', desc: 'Device registration, CE marking, and distribution.', emoji: '🩺' },
]
