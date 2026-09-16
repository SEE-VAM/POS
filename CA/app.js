/**
 * PREMIER CHARTERED ACCOUNTANT & ADVISORY FIRM
 * Core Interactive Platform Logic
 * Features: Tax Comparator, GST Engine, HRA Tool, Compliance Tracker, 
 *           Document Checklist, Service Modals & Consultation Booking.
 */

// ==========================================================================
// [USER PROFILE & FIRM CONFIGURATION]
// Real profile details of CA Piyush Kumar, FCA
// ==========================================================================
const firmConfig = {
  firmName: "Shiv Raj Sohan & Company",
  frnNumber: "028941C",
  caName: "CA Piyush Kumar",
  caQualifications: "FCA (Fellow Chartered Accountant)",
  caMembershipNo: "FCA-539821",
  caExperience: "13+ Years",
  phone: "+91 95341 37822",
  whatsapp: "+91 95341 37822",
  email: "Capiyushkr@gmail.com",
  address: "Purani Jail Road, Vishnu Tower 1st Floor",
  photoUrl: "assets/ca-piyush-portrait.png",
  posterUrl: "assets/ca-piyush-poster.png"
};

// ==========================================
// 1. STATUTORY COMPLIANCE DUE DATES DATA
// ==========================================
const complianceEvents = [
  {
    id: 1,
    title: "GSTR-3B Monthly Return",
    category: "gst",
    catLabel: "GST",
    day: "20",
    month: "SEP 2026",
    desc: "Summary return of outward supplies & input tax credit (ITC) for regular taxpayers (> ₹5 Cr turnover or monthly filers).",
    penalty: "Late fee ₹50/day (₹20 for NIL) + 18% p.a. interest",
    urgency: "urgent"
  },
  {
    id: 2,
    title: "TDS / TCS Deposit Challan (ITNS 281)",
    category: "tds",
    catLabel: "TDS",
    day: "07",
    month: "OCT 2026",
    desc: "Deposit of Tax Deducted at Source (TDS) and Tax Collected at Source (TCS) for the previous month under Income Tax Act.",
    penalty: "1.5% interest per month from date of deduction",
    urgency: "approaching"
  },
  {
    id: 3,
    title: "GSTR-1 Monthly Inward Outward",
    category: "gst",
    catLabel: "GST",
    day: "11",
    month: "OCT 2026",
    desc: "Details of outward supplies of goods and/or services made by registered regular taxable persons.",
    penalty: "Late fee ₹50/day up to maximum statutory cap",
    urgency: "routine"
  },
  {
    id: 4,
    title: "Advance Tax (2nd Installment - 45%)",
    category: "it",
    catLabel: "Income Tax",
    day: "15",
    month: "SEP 2026",
    desc: "Payment of second installment (cumulatively 45%) of estimated advance tax for individual and corporate assesses.",
    penalty: "Interest u/s 234C @ 1% per month for default",
    urgency: "urgent"
  },
  {
    id: 5,
    title: "Form AOC-4 (Annual Financial Filing)",
    category: "roc",
    catLabel: "MCA / ROC",
    day: "30",
    month: "OCT 2026",
    desc: "Filing of audited financial statements, Board Report and Auditor Report with Registrar of Companies (ROC).",
    penalty: "₹100/day ongoing penalty with no maximum ceiling",
    urgency: "approaching"
  },
  {
    id: 6,
    title: "Form MGT-7 / 7A (Annual Return)",
    category: "roc",
    catLabel: "MCA / ROC",
    day: "29",
    month: "NOV 2026",
    desc: "Annual Return containing shareholding pattern, indebtedness and governance records for companies & OPCs.",
    penalty: "₹100/day penalty for company and officers in default",
    urgency: "routine"
  },
  {
    id: 7,
    title: "Tax Audit Report u/s 44AB (Form 3CA/3CB-3CD)",
    category: "it",
    catLabel: "Income Tax",
    day: "30",
    month: "SEP 2026",
    desc: "Statutory filing of chartered accountant audit report for business turnover exceeding ₹10 Cr (cash < 5%) or ₹1 Cr.",
    penalty: "Penalty u/s 271B: 0.5% of turnover up to ₹1,50,000",
    urgency: "urgent"
  },
  {
    id: 8,
    title: "GSTR-9 & 9C Annual GST Reconciliation",
    category: "gst",
    catLabel: "GST",
    day: "31",
    month: "DEC 2026",
    desc: "Annual return and self-certified reconciliation statement for registered businesses with aggregate turnover > ₹2 Cr / ₹5 Cr.",
    penalty: "₹200/day up to 0.5% of state turnover",
    urgency: "routine"
  }
];

// ==========================================
// 2. DETAILED SERVICES DATA (BIG 4 SCOPE)
// ==========================================
const serviceDetails = {
  directTax: {
    title: "Direct Taxation, Cross-Border & NRI Advisory",
    subtitle: "Strategic tax planning, transfer pricing & representation before appellate authorities.",
    overview: "Our Direct Tax practice delivers forward-looking tax strategies that align corporate objectives with full regulatory compliance. Led by seasoned Fellows of ICAI with extensive litigation experience before CIT(Appeals) and ITAT.",
    deliverables: [
      "Corporate & High-Net-Worth Individual ITR filing (Forms ITR-1 through ITR-7)",
      "Comprehensive scrutiny assessments defense under Section 143(3), 147 & 148",
      "Transfer Pricing Documentation, 3CEB Certification & benchmarking studies",
      "Foreign Remittance certifications (Form 15CA & 15CB verification)",
      "Advance tax forecasting, MAT/AMT liability optimization & TDS quarterly filings",
      "NRI Taxation, Double Taxation Avoidance Agreement (DTAA) relief & TRC advisory"
    ],
    timeline: "Ongoing retainership / 3–7 business days for filings",
    teamLead: "CA Rajesh V. Mehta (FCA, DISA, Ex-Big 4 Tax Partner)",
    docs: [
      "PAN & Aadhaar Cards of assessee/directors",
      "Audited Financial Statements & 26AS/AIS/TIS reports",
      "Bank account statements for all operational accounts",
      "Foreign asset declarations & inward remittance advices (if applicable)"
    ]
  },
  indirectTax: {
    title: "Indirect Taxation, GST & Customs Practice",
    subtitle: "End-to-end GST management, refunds, litigation & supply-chain tax structuring.",
    overview: "We assist Fortune 500 corporations, export houses and high-growth SMEs navigate India's Goods and Services Tax framework with zero friction and maximum input tax credit (ITC) efficiency.",
    deliverables: [
      "Monthly/Quarterly compliance: GSTR-1, GSTR-3B & QRMP scheme execution",
      "Annual Return & Reconciliation: Form GSTR-9 and audited GSTR-9C certifications",
      "Export refund processing (with/without payment of IGST, LUT filing)",
      "Inverted duty structure refund applications & Departmental follow-ups",
      "GST audit representation under Section 65 & replies to Form DRC-01 notices",
      "E-invoicing integration & automated ITC 2B vs Purchase Register matching"
    ],
    timeline: "Monthly cycles / 10-14 days for refund sanction",
    teamLead: "CA Sunita Agarwal (FCA, Indirect Tax Specialist)",
    docs: [
      "GST Portal credentials & authorized signatory DSC",
      "Monthly Sales & Purchase Ledgers (Excel / ERP export)",
      "Input Tax Credit invoices & shipping bills for exporters",
      "Bank realization certificates (FIRC/e-BRC) for service exports"
    ]
  },
  corporateRoc: {
    title: "Corporate Law, ROC & Secretarial Governance",
    subtitle: "From incorporation to complex restructuring, M&A and regulatory approvals.",
    overview: "Ensuring ironclad compliance with the Companies Act 2013 and Ministry of Corporate Affairs (MCA). We guide enterprises through entity structuring, governance audits, and statutory filings.",
    deliverables: [
      "Incorporation of Private Limited, Public Limited, LLP, OPC & Section 8 NGO entities",
      "Annual ROC filing: Form AOC-4 (Financials), MGT-7 (Annual Return), DIR-3 KYC",
      "Board resolutions, statutory register maintenance & Secretarial Standards adherence",
      "Change in management: Director appointment/resignation, registered office shift",
      "Capital restructuring: Share allotments (PAS-3), rights issues, debenture issuance",
      "FDI compliances: RBI FIRMS portal filings, Form FC-GPR & FLA annual reporting"
    ],
    timeline: "Incorporation in 3–5 working days / Annual filings within statutory windows",
    teamLead: "CS & CA Ananya Sen (FCA, ACS)",
    docs: [
      "Digital Signature Certificate (Class 3 DSC) for all proposed directors",
      "PAN, Voter ID/Passport & Utility Bill of all promoters",
      "Registered Office proof (Electricity bill + NOC from property owner)",
      "Proposed company objectives & capital distribution table"
    ]
  },
  auditAssurance: {
    title: "Auditing, Assurance & Forensic Investigation",
    subtitle: "Unbiased, rigorous audit methodology delivering high stakeholder confidence.",
    overview: "Our audit procedures adhere strictly to the Standards on Auditing (SAs) issued by ICAI. We deliver clarity, identify governance vulnerabilities, and enhance internal control systems.",
    deliverables: [
      "Statutory Financial Statement Audits under Companies Act 2013",
      "Tax Audits under Section 44AB of the Income Tax Act (Forms 3CA/CB-3CD)",
      "Internal Audits, Enterprise Risk Assessment & SOP formulation",
      "Stock & Inventory Audits for banking consortiums & NBFCs",
      "Forensic Accounting & Fraud Investigation for dispute resolution",
      "Due Diligence reviews for venture capital funding and acquisitions"
    ],
    timeline: "2–4 weeks based on enterprise complexity",
    teamLead: "CA Vikramaditya Singhania (Senior Managing Partner, FCA)",
    docs: [
      "Complete Trial Balance & General Ledgers",
      "Prior year audited balance sheets and auditor notes",
      "Bank statements with month-end reconciliation statements",
      "Physical stock count sheets & fixed asset registers"
    ]
  },
  startupValuation: {
    title: "Startup India, Valuation & IP Protection",
    subtitle: "Empowering visionary founders with DPIIT recognition, 80-IAC tax holiday & DCF models.",
    overview: "We architect startup balance sheets for investor readiness. From early-stage entity structuring to Series funding compliance, angel tax exemptions, and registered valuation reports.",
    deliverables: [
      "DPIIT Recognition under Startup India Initiative for tax & patent benefits",
      "Section 80-IAC Tax Exemption filing for 3-year consecutive income tax holiday",
      "Valuation Reports by IBBI Registered Valuers (DCF, NAV & Market Multiple methods)",
      "Trademark search, filing & objection hearings for brand protection",
      "ESOP scheme structuring & grant agreement documentation",
      "Term Sheet review, Cap Table modeling & Seed Fund Scheme assistance"
    ],
    timeline: "5–10 business days for recognition & valuation",
    teamLead: "CA Rohit Nair (FCA, Registered Valuer - IBBI)",
    docs: [
      "Pitch deck & business model overview with 5-year revenue forecast",
      "Certificate of Incorporation, MOA & AOA",
      "Proof of innovation / product demo video / website link",
      "Existing cap table and latest unaudited balance sheet"
    ]
  },
  projectFinance: {
    title: "Project Financing, Bank CMA Data & Loan Syndication",
    subtitle: "Bankable project reports and debt syndication with top public & private sector lenders.",
    overview: "Transforming ambitious business proposals into bankable documentation. We prepare Credit Monitoring Arrangement (CMA) data, techno-economic feasibility studies, and negotiate with credit sanction committees.",
    deliverables: [
      "Comprehensive CMA Data preparation (Operating statement, Balance sheet, MPBF analysis)",
      "Detailed Project Reports (DPR) for industrial setups, commercial & infrastructure projects",
      "Working Capital limits sanction & enhancement (Cash Credit / Overdraft / Letter of Credit)",
      "Term Loan proposals for plant machinery & infrastructure expansion",
      "CGTMSE unsecured loan documentation for MSMEs up to ₹5 Crore",
      "Financial ratio stress testing (DSCR, Current Ratio, Debt-Equity benchmarking)"
    ],
    timeline: "4–7 working days for comprehensive CMA & DPR package",
    teamLead: "CA Arvind Nambiar (FCA, Ex-Credit Committee Advisor)",
    docs: [
      "Audited financial statements for the past 3 financial years",
      "Sanction letters of existing bank facilities",
      "Quotations / estimates for proposed plant, machinery, or construction",
      "12-month bank statements of all primary operating accounts"
    ]
  },
  virtualCfo: {
    title: "Virtual CFO & Enterprise Financial Management",
    subtitle: "High-caliber financial leadership without the cost of a full-time executive.",
    overview: "Designed for scaling mid-market enterprises. We sit alongside leadership to oversee cash flow, financial modeling, KPI tracking, and operational efficiency.",
    deliverables: [
      "Monthly Management Information Systems (MIS) with executive dashboards",
      "Rolling 13-week cash flow forecasting and working capital management",
      "Cloud ERP implementation & oversight (Zoho Books, Tally Prime, SAP Business One)",
      "Vendor payment approvals, payroll processing & statutory compliance oversight",
      "Budget vs Actual variance reporting and unit-economic margin analysis",
      "Board meeting representation and investor relations support"
    ],
    timeline: "Retainer-based ongoing partnership",
    teamLead: "CA & CIMA Preeti Roy (FCA, Strategic Finance Lead)",
    docs: [
      "Access to accounting software / ERP",
      "Current organizational chart & internal authority matrix",
      "Historic sales & cost breakdown by product line",
      "Vendor and customer master agreements"
    ]
  }
};

// ==========================================
// 3. DOCUMENT CHECKLIST ENGINE DATA
// ==========================================
const checklistData = {
  pvtLtd: {
    name: "Private Limited Company Incorporation",
    category: "Corporate Registration",
    items: [
      "PAN Card copy of all proposed Directors and Shareholders",
      "Identity Proof: Passport / Voter ID / Driving License (Self-attested)",
      "Address Proof: Latest Bank Statement / Electricity Bill / Mobile Bill (< 2 months old)",
      "Passport-sized photograph of all directors",
      "Registered Office proof: Latest Electricity Bill / Gas Bill of premises",
      "NOC (No Objection Certificate) signed by property owner",
      "Specimen signature card on blank white paper for DSC",
      "Proposed company name options (1-2 unique preferences) & main business activity"
    ]
  },
  llp: {
    name: "Limited Liability Partnership (LLP) Formation",
    category: "Corporate Registration",
    items: [
      "PAN Card copy of all designated partners",
      "Identity Proof: Passport / Voter ID / Driving License of each partner",
      "Latest utility bill or bank statement as address proof (< 2 months)",
      "Registered office premises ownership proof & Rent agreement + NOC",
      "Digital Signature Certificate (Class 3 DSC) for minimum 2 partners",
      "Draft Profit Sharing Ratio & Capital Contribution schedule for LLP Agreement"
    ]
  },
  itrIndividual: {
    name: "Individual & Salaried ITR Filing (ITR-1 / ITR-2)",
    category: "Income Tax",
    items: [
      "Form 16 (Part A & Part B) issued by employer(s)",
      "Annual Information Statement (AIS) & Taxpayer Information Summary (TIS)",
      "Form 26AS downloaded from TRACES portal",
      "Bank statements for all active bank accounts held during the FY",
      "Interest certificates from banks/post offices on Savings accounts & FDs",
      "Proof of tax-saving investments: ELSS mutual funds, PPF, LIC, NPS (80CCD)",
      "Health insurance premium receipts (Section 80D for self & parents)",
      "Housing loan interest & principal certificate (Section 24b & 80C)",
      "Capital gains statements from Zerodha, Groww, CAMS, KFintech (if shares traded)"
    ]
  },
  itrBusiness: {
    name: "Business / Professional ITR Filing (ITR-3 / ITR-4 Presumptive)",
    category: "Income Tax",
    items: [
      "PAN & Aadhaar of the business owner / proprietor",
      "Audited or provisional Balance Sheet and Profit & Loss statement",
      "Bank statements of all current and business savings accounts",
      "GST returns summary (GSTR-1 and GSTR-3B annual figures)",
      "Sundry debtors and sundry creditors ledger balances",
      "Fixed asset purchase invoices for depreciation claim",
      "TDS certificates received (Form 16A) for contract or professional receipts",
      "Advance tax challan receipts deposited during the financial year"
    ]
  },
  gstReg: {
    name: "New GST Registration",
    category: "Indirect Tax",
    items: [
      "PAN Card of the applicant entity / proprietor",
      "Aadhaar card of authorized signatory & promoters (linked with mobile)",
      "Proof of business constitution (Partnership deed / Certificate of Incorporation)",
      "Proof of principal place of business (Electricity Bill + Rent Deed + NOC)",
      "Bank details: Cancelled cheque or first page of bank passbook / statement",
      "Digital Signature Certificate (for companies & LLPs)",
      "Authorized signatory resolution on company letterhead"
    ]
  },
  startupIndia: {
    name: "Startup India (DPIIT) & 80-IAC Recognition",
    category: "Startup Advisory",
    items: [
      "Certificate of Incorporation or Registration of entity (< 10 years old)",
      "Memorandum of Association (MOA) and Articles of Association (AOA)",
      "Letter of Authorization / Board resolution for applicant director",
      "Detailed pitch deck highlighting innovation, scalability & employment generation",
      "Brief video link (2-3 mins) demonstrating working product/prototype",
      "Audited financial statements for preceding financial years (if incorporated)",
      "Patent / Trademark registration certificate (optional but advantageous)"
    ]
  },
  bankLoanCma: {
    name: "Bank CMA Data & Project Report for Loans",
    category: "Banking & Finance",
    items: [
      "Audited financial statements (Balance Sheet, P&L, Audit Report) for past 3 years",
      "Provisional / estimated financials for current running financial year",
      "Projected financial statements for next 5 to 7 years",
      "Sanction letters of all existing term loans & working capital facilities",
      "Bank account statements of all consortium lenders for past 12 months",
      "Quotations / Proforma invoices of proposed machinery/civil construction",
      "Promoter net worth statements (CA certified Form 16 / Wealth reports)",
      "GST returns matching sales data for the current running year"
    ]
  }
};

// ==========================================
// 4. TAX CALCULATOR ENGINES
// ==========================================

/**
 * Calculates Income Tax under Old vs New Tax Regime (AY 2025-26 / FY 2024-25 onwards)
 */
function calculateRegimeTax(income, sec80c, sec80d, hra, otherDeductions, isSalaried = true) {
  // 1. OLD REGIME CALCULATION
  const stdDedOld = isSalaried ? 50000 : 0;
  const capped80c = Math.min(sec80c, 150000);
  const capped80d = Math.min(sec80d, 75000); // 25k self + 50k parents max
  const totalDeductionsOld = stdDedOld + capped80c + capped80d + hra + otherDeductions;
  
  const taxableIncomeOld = Math.max(0, income - totalDeductionsOld);
  let taxOld = 0;

  // Old Slabs: 0-2.5L: Nil, 2.5-5L: 5%, 5-10L: 20%, >10L: 30%
  if (taxableIncomeOld > 1000000) {
    taxOld += (taxableIncomeOld - 1000000) * 0.30 + 100000 + 12500;
  } else if (taxableIncomeOld > 500000) {
    taxOld += (taxableIncomeOld - 500000) * 0.20 + 12500;
  } else if (taxableIncomeOld > 250000) {
    taxOld += (taxableIncomeOld - 250000) * 0.05;
  }

  // Section 87A rebate for Old Regime: Taxable income <= 5L gets rebate up to ₹12,500
  if (taxableIncomeOld <= 500000) {
    taxOld = 0;
  }

  const cessOld = taxOld > 0 ? Math.round(taxOld * 0.04) : 0;
  const totalTaxOld = Math.round(taxOld + cessOld);

  // 2. NEW REGIME CALCULATION (Budget updated slabs)
  // Standard deduction increased to ₹75,000 for salaried under New Regime
  const stdDedNew = isSalaried ? 75000 : 0;
  const taxableIncomeNew = Math.max(0, income - stdDedNew);
  let taxNew = 0;

  // New Slabs:
  // 0 to 3,00,000: Nil
  // 3,00,001 to 7,00,000: 5%
  // 7,00,001 to 10,00,000: 10%
  // 10,00,001 to 12,00,000: 15%
  // 12,00,001 to 15,00,000: 20%
  // Above 15,00,000: 30%

  if (taxableIncomeNew > 1500000) {
    taxNew += (taxableIncomeNew - 1500000) * 0.30 + (300000 * 0.20) + (200000 * 0.15) + (300000 * 0.10) + (400000 * 0.05);
  } else if (taxableIncomeNew > 1200000) {
    taxNew += (taxableIncomeNew - 1200000) * 0.20 + (200000 * 0.15) + (300000 * 0.10) + (400000 * 0.05);
  } else if (taxableIncomeNew > 1000000) {
    taxNew += (taxableIncomeNew - 1000000) * 0.15 + (300000 * 0.10) + (400000 * 0.05);
  } else if (taxableIncomeNew > 700000) {
    taxNew += (taxableIncomeNew - 700000) * 0.10 + (400000 * 0.05);
  } else if (taxableIncomeNew > 300000) {
    taxNew += (taxableIncomeNew - 300000) * 0.05;
  }

  // Section 87A rebate for New Regime: full rebate if taxable income <= 7,00,000 (Tax = 0)
  if (taxableIncomeNew <= 700000) {
    taxNew = 0;
  }

  const cessNew = taxNew > 0 ? Math.round(taxNew * 0.04) : 0;
  const totalTaxNew = Math.round(taxNew + cessNew);

  return {
    grossIncome: income,
    oldRegime: {
      deductions: totalDeductionsOld,
      taxableIncome: taxableIncomeOld,
      baseTax: Math.round(taxOld),
      cess: cessOld,
      totalTax: totalTaxOld
    },
    newRegime: {
      deductions: stdDedNew,
      taxableIncome: taxableIncomeNew,
      baseTax: Math.round(taxNew),
      cess: cessNew,
      totalTax: totalTaxNew
    },
    difference: Math.abs(totalTaxOld - totalTaxNew),
    recommended: totalTaxNew <= totalTaxOld ? 'NEW' : 'OLD'
  };
}

/**
 * Smart GST Calculator
 */
function calculateGST(amount, rate, isInclusive, isInterState) {
  let baseAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (isInclusive) {
    baseAmount = (amount * 100) / (100 + rate);
    gstAmount = amount - baseAmount;
    totalAmount = amount;
  } else {
    baseAmount = amount;
    gstAmount = (amount * rate) / 100;
    totalAmount = baseAmount + gstAmount;
  }

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = gstAmount;
  } else {
    cgst = gstAmount / 2;
    sgst = gstAmount / 2;
  }

  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

/**
 * HRA Exemption Calculator
 */
function calculateHRA(basicSalary, hraReceived, rentPaid, isMetro) {
  // Rule 1: Actual HRA received
  const rule1 = hraReceived;

  // Rule 2: Rent paid minus 10% of basic salary
  const tenPercentSalary = basicSalary * 0.10;
  const rule2 = Math.max(0, rentPaid - tenPercentSalary);

  // Rule 3: 50% for metro (Delhi, Mumbai, Kolkata, Chennai), 40% for non-metro
  const metroPercentage = isMetro ? 0.50 : 0.40;
  const rule3 = basicSalary * metroPercentage;

  // Exempt amount is minimum of the three
  const exemptHRA = Math.min(rule1, rule2, rule3);
  const taxableHRA = Math.max(0, hraReceived - exemptHRA);

  return {
    exemptHRA: Math.round(exemptHRA),
    taxableHRA: Math.round(taxableHRA),
    rule1: Math.round(rule1),
    rule2: Math.round(rule2),
    rule3: Math.round(rule3)
  };
}

// ==========================================
// 5. DOM INITIALIZATION & EVENT HANDLERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle: Executive Midnight Navy vs Platinum Corporate Light
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleIcon = document.getElementById('themeToggleIcon');
  const themeToggleText = document.getElementById('themeToggleText');

  const savedTheme = localStorage.getItem('ca-theme-style');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (themeToggleIcon) themeToggleIcon.textContent = '🌙';
    if (themeToggleText) themeToggleText.textContent = 'Navy Dark';
  }

  themeToggleBtn?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    if (isLight) {
      if (themeToggleIcon) themeToggleIcon.textContent = '🌙';
      if (themeToggleText) themeToggleText.textContent = 'Navy Dark';
      localStorage.setItem('ca-theme-style', 'light');
    } else {
      if (themeToggleIcon) themeToggleIcon.textContent = '☀️';
      if (themeToggleText) themeToggleText.textContent = 'Platinum Light';
      localStorage.setItem('ca-theme-style', 'dark');
    }
  });

  // Header scroll detection
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const desktopNav = document.getElementById('desktopNav');
  mobileToggle?.addEventListener('click', () => {
    if (desktopNav.style.display === 'flex') {
      desktopNav.style.display = 'none';
    } else {
      desktopNav.style.display = 'flex';
      desktopNav.style.flexDirection = 'column';
      desktopNav.style.position = 'absolute';
      desktopNav.style.top = '84px';
      desktopNav.style.left = '0';
      desktopNav.style.right = '0';
      desktopNav.style.background = '#070d19';
      desktopNav.style.padding = '1.5rem';
      desktopNav.style.borderBottom = '1px solid var(--border-color)';
    }
  });

  // ------------------------------------------
  // Render Compliance Calendar Cards
  // ------------------------------------------
  const calendarContainer = document.getElementById('complianceCalendarGrid');
  const filterTabs = document.querySelectorAll('.filter-tab');

  function renderCalendar(filter = 'all') {
    if (!calendarContainer) return;
    calendarContainer.innerHTML = '';

    const filtered = filter === 'all' 
      ? complianceEvents 
      : complianceEvents.filter(ev => ev.category === filter);

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = `due-date-card ${item.urgency}`;
      card.innerHTML = `
        <div class="due-header">
          <span class="due-category cat-${item.category}">${item.catLabel}</span>
          <div>
            <div class="due-day">${item.day}</div>
            <div class="due-month">${item.month}</div>
          </div>
        </div>
        <h4 class="due-title">${item.title}</h4>
        <p class="due-desc">${item.desc}</p>
        <div class="due-footer">
          <span class="due-penalty">⚠️ ${item.penalty}</span>
        </div>
      `;
      calendarContainer.appendChild(card);
    });
  }

  renderCalendar('all');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-filter');
      renderCalendar(cat);
    });
  });

  // ------------------------------------------
  // Calculator Tab Switching
  // ------------------------------------------
  const calcNavBtns = document.querySelectorAll('.calc-nav-btn');
  const calcBoxes = document.querySelectorAll('.calc-box');

  calcNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcNavBtns.forEach(b => b.classList.remove('active'));
      calcBoxes.forEach(box => box.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-calc');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // ------------------------------------------
  // Income Tax Comparator Logic
  // ------------------------------------------
  const taxIncomeInput = document.getElementById('taxIncome');
  const taxRangeInput = document.getElementById('taxRange');
  const sec80cInput = document.getElementById('sec80c');
  const sec80dInput = document.getElementById('sec80d');
  const hraInput = document.getElementById('hraExempt');
  const otherDedInput = document.getElementById('otherDed');

  function updateTaxComparator() {
    const income = parseFloat(taxIncomeInput?.value) || 0;
    const sec80c = parseFloat(sec80cInput?.value) || 0;
    const sec80d = parseFloat(sec80dInput?.value) || 0;
    const hra = parseFloat(hraInput?.value) || 0;
    const other = parseFloat(otherDedInput?.value) || 0;

    const res = calculateRegimeTax(income, sec80c, sec80d, hra, other, true);

    // Format utility
    const fmt = (num) => '₹ ' + num.toLocaleString('en-IN');

    // Update Old table
    document.getElementById('resOldGross').textContent = fmt(res.grossIncome);
    document.getElementById('resOldDed').textContent = fmt(res.oldRegime.deductions);
    document.getElementById('resOldTaxable').textContent = fmt(res.oldRegime.taxableIncome);
    document.getElementById('resOldTax').textContent = fmt(res.oldRegime.baseTax);
    document.getElementById('resOldCess').textContent = fmt(res.oldRegime.cess);
    document.getElementById('resOldTotal').textContent = fmt(res.oldRegime.totalTax);

    // Update New table
    document.getElementById('resNewGross').textContent = fmt(res.grossIncome);
    document.getElementById('resNewDed').textContent = fmt(res.newRegime.deductions);
    document.getElementById('resNewTaxable').textContent = fmt(res.newRegime.taxableIncome);
    document.getElementById('resNewTax').textContent = fmt(res.newRegime.baseTax);
    document.getElementById('resNewCess').textContent = fmt(res.newRegime.cess);
    document.getElementById('resNewTotal').textContent = fmt(res.newRegime.totalTax);

    // Savings verdict badge
    const badge = document.getElementById('savingsVerdictBadge');
    if (badge) {
      if (res.difference === 0) {
        badge.innerHTML = `💡 Both regimes yield identical tax liability of <strong>${fmt(res.newRegime.totalTax)}</strong>`;
      } else if (res.recommended === 'NEW') {
        badge.innerHTML = `🎉 <strong>New Tax Regime</strong> saves you <span style="color:#10b981;">${fmt(res.difference)}</span> in tax!`;
      } else {
        badge.innerHTML = `🌟 <strong>Old Tax Regime</strong> saves you <span style="color:#dfba73;">${fmt(res.difference)}</span> due to deductions!`;
      }
    }
  }

  taxIncomeInput?.addEventListener('input', (e) => {
    if (taxRangeInput) taxRangeInput.value = e.target.value;
    updateTaxComparator();
  });

  taxRangeInput?.addEventListener('input', (e) => {
    if (taxIncomeInput) taxIncomeInput.value = e.target.value;
    updateTaxComparator();
  });

  [sec80cInput, sec80dInput, hraInput, otherDedInput].forEach(inp => {
    inp?.addEventListener('input', updateTaxComparator);
  });

  updateTaxComparator();

  // ------------------------------------------
  // GST Calculator Logic
  // ------------------------------------------
  const gstAmountInp = document.getElementById('gstAmount');
  const gstRateSelect = document.getElementById('gstRate');
  const gstTypeSelect = document.getElementById('gstType');
  const gstSupplySelect = document.getElementById('gstSupply');

  function updateGSTCalc() {
    const amt = parseFloat(gstAmountInp?.value) || 0;
    const rate = parseFloat(gstRateSelect?.value) || 18;
    const isInc = gstTypeSelect?.value === 'inclusive';
    const isInter = gstSupplySelect?.value === 'inter';

    const res = calculateGST(amt, rate, isInc, isInter);
    const fmt = (num) => '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById('gstBaseOut').textContent = fmt(res.baseAmount);
    document.getElementById('gstTaxOut').textContent = fmt(res.gstAmount);
    document.getElementById('gstCgstOut').textContent = fmt(res.cgst);
    document.getElementById('gstSgstOut').textContent = fmt(res.sgst);
    document.getElementById('gstIgstOut').textContent = fmt(res.igst);
    document.getElementById('gstTotalOut').textContent = fmt(res.totalAmount);
  }

  [gstAmountInp, gstRateSelect, gstTypeSelect, gstSupplySelect].forEach(el => {
    el?.addEventListener('input', updateGSTCalc);
  });

  updateGSTCalc();

  // ------------------------------------------
  // HRA Calculator Logic
  // ------------------------------------------
  const hraSalaryInp = document.getElementById('hraSalary');
  const hraReceivedInp = document.getElementById('hraReceived');
  const hraRentInp = document.getElementById('hraRent');
  const hraCitySelect = document.getElementById('hraCity');

  function updateHRACalc() {
    const sal = parseFloat(hraSalaryInp?.value) || 0;
    const rec = parseFloat(hraReceivedInp?.value) || 0;
    const rent = parseFloat(hraRentInp?.value) || 0;
    const isMetro = hraCitySelect?.value === 'metro';

    const res = calculateHRA(sal, rec, rent, isMetro);
    const fmt = (num) => '₹ ' + num.toLocaleString('en-IN');

    document.getElementById('hraExemptOut').textContent = fmt(res.exemptHRA);
    document.getElementById('hraTaxableOut').textContent = fmt(res.taxableHRA);
    document.getElementById('hraRule1Out').textContent = fmt(res.rule1);
    document.getElementById('hraRule2Out').textContent = fmt(res.rule2);
    document.getElementById('hraRule3Out').textContent = fmt(res.rule3);
  }

  [hraSalaryInp, hraReceivedInp, hraRentInp, hraCitySelect].forEach(el => {
    el?.addEventListener('input', updateHRACalc);
  });

  updateHRACalc();

  // ------------------------------------------
  // Document Checklist Assistant
  // ------------------------------------------
  const docServiceSelect = document.getElementById('docServiceSelect');
  const checklistItemsGrid = document.getElementById('checklistItemsGrid');
  const checklistCategoryBadge = document.getElementById('checklistCategoryBadge');
  const printChecklistBtn = document.getElementById('printChecklistBtn');

  function renderChecklist(key = 'pvtLtd') {
    const data = checklistData[key];
    if (!data || !checklistItemsGrid) return;

    if (checklistCategoryBadge) {
      checklistCategoryBadge.textContent = `${data.category} • ${data.items.length} Required Documents`;
    }

    checklistItemsGrid.innerHTML = '';
    data.items.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'doc-check-item';
      div.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        <span>${item}</span>
      `;
      checklistItemsGrid.appendChild(div);
    });
  }

  docServiceSelect?.addEventListener('change', (e) => {
    renderChecklist(e.target.value);
  });

  renderChecklist('pvtLtd');

  printChecklistBtn?.addEventListener('click', () => {
    window.print();
  });

  // ------------------------------------------
  // Service Detail Modals
  // ------------------------------------------
  const serviceModal = document.getElementById('serviceDetailModal');
  const modalCloseBtn = document.getElementById('closeServiceModalBtn');
  const serviceDetailButtons = document.querySelectorAll('.open-service-modal');

  serviceDetailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = btn.getAttribute('data-service-key');
      const s = serviceDetails[key];
      if (!s) return;

      document.getElementById('modalServiceTitle').textContent = s.title;
      document.getElementById('modalServiceSubtitle').textContent = s.subtitle;
      document.getElementById('modalServiceOverview').textContent = s.overview;
      document.getElementById('modalServiceTimeline').textContent = s.timeline;
      document.getElementById('modalServiceLead').textContent = s.teamLead;

      const delivList = document.getElementById('modalServiceDeliverables');
      delivList.innerHTML = '';
      s.deliverables.forEach(d => {
        const li = document.createElement('li');
        li.textContent = d;
        delivList.appendChild(li);
      });

      const docsList = document.getElementById('modalServiceDocs');
      docsList.innerHTML = '';
      s.docs.forEach(d => {
        const li = document.createElement('li');
        li.textContent = d;
        docsList.appendChild(li);
      });

      serviceModal?.classList.add('active');
    });
  });

  modalCloseBtn?.addEventListener('click', () => {
    serviceModal?.classList.remove('active');
  });

  serviceModal?.addEventListener('click', (e) => {
    if (e.target === serviceModal) {
      serviceModal.classList.remove('active');
    }
  });

  // ------------------------------------------
  // Consultation Booking System
  // ------------------------------------------
  const timeSlots = document.querySelectorAll('.time-slot');
  let selectedSlot = '11:00 AM';

  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedSlot = slot.getAttribute('data-slot') || slot.textContent.trim();
    });
  });

  const consultationForm = document.getElementById('consultationForm');
  const bookingSuccessModal = document.getElementById('bookingSuccessModal');
  const closeSuccessModalBtn = document.getElementById('closeSuccessModalBtn');

  consultationForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('bookName')?.value;
    const phone = document.getElementById('bookPhone')?.value;
    const email = document.getElementById('bookEmail')?.value;
    const date = document.getElementById('bookDate')?.value;
    const mode = document.getElementById('bookMode')?.value;

    const refNum = 'CA-VIP-' + Math.floor(100000 + Math.random() * 900000);

    const refEl = document.getElementById('confRefNum');
    if (refEl) refEl.textContent = refNum;
    const nameEl = document.getElementById('confName');
    if (nameEl) nameEl.textContent = name;
    const dateEl = document.getElementById('confDateTime');
    if (dateEl) dateEl.textContent = `${date} at ${selectedSlot}`;
    const modeEl = document.getElementById('confMode');
    if (modeEl) modeEl.textContent = mode;

    bookingSuccessModal?.classList.add('active');
    consultationForm.reset();
  });

  closeSuccessModalBtn?.addEventListener('click', () => {
    bookingSuccessModal?.classList.remove('active');
  });

  bookingSuccessModal?.addEventListener('click', (e) => {
    if (e.target === bookingSuccessModal) {
      bookingSuccessModal.classList.remove('active');
    }
  });

  // Quick WhatsApp Consultation Trigger
  const whatsappTriggers = document.querySelectorAll('.trigger-whatsapp');
  whatsappTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = encodeURIComponent("Hello CA Piyush Kumar Sir, I would like to schedule a corporate financial and tax consultation.");
      window.open(`https://wa.me/919534137822?text=${text}`, '_blank');
    });
  });

  // ------------------------------------------
  // 6. ANIMATED COUNTERS FOR KEY METRICS
  // ------------------------------------------
  function initCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (!counterElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-counter')) || 0;
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
          const duration = 2200;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = target * easeProgress;

            el.textContent = prefix + (decimals > 0 ? currentVal.toFixed(decimals) : Math.round(currentVal).toLocaleString('en-IN')) + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString('en-IN')) + suffix;
            }
          }

          requestAnimationFrame(updateCounter);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counterElements.forEach(el => observer.observe(el));
  }

  initCounters();

  // ------------------------------------------
  // 7. SCROLL-DRIVEN ENTRANCE ANIMATIONS
  // ------------------------------------------
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.service-card, .due-date-card, .partner-card, .calc-box, .checklist-wrapper');
    if (!reveals.length) return;

    reveals.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      const staggerIndex = (index % 4) + 1;
      el.classList.add(`stagger-${staggerIndex}`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  initScrollReveal();
});
