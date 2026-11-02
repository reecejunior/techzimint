/**
 * Zimbabwean regulations that affect startups, grouped by regulator, with the
 * sector tags used to match a founder's idea to the rules that apply to it.
 *
 * Compiled from regulator documents, law-firm notes and press reports by
 * Claude (web research), 31 Oct 2026. This is a point-in-time compilation,
 * not legal advice and not a live feed. Every rule carries a `status`:
 *
 *   official  read in the regulation text or on the regulator's own page
 *   reported  taken from news or a law-firm summary, not the text itself
 *   verify    unclear, undated, commercial-source or only partly confirmed
 *
 * When a fee or deadline is changed, update `CHECKED` too. Facts that could
 * not be confirmed belong in `note`, or in `GAPS` if nothing was found.
 */
import type { GroupKey, Regulator, Rule, Sector } from './regulations.ts';

export const CHECKED = '2 Nov 2026';

export const REGULATORS: Record<Regulator, { code: string; name: string }> = {
  "POTRAZ": {
    "code": "POTRAZ",
    "name": "Telecoms and data regulator"
  },
  "RBZ": {
    "code": "RBZ",
    "name": "Reserve Bank, payments"
  },
  "FIU": {
    "code": "FIU",
    "name": "Financial Intelligence Unit"
  },
  "SECZ": {
    "code": "SECZ",
    "name": "Securities regulator"
  },
  "IPEC": {
    "code": "IPEC",
    "name": "Insurance and pensions regulator"
  },
  "TRANSPORT": {
    "code": "Transport",
    "name": "Ministry and city councils"
  },
  "ZIMRA": {
    "code": "ZIMRA",
    "name": "Tax authority"
  },
  "CAAZ": {
    "code": "CAAZ",
    "name": "Civil aviation"
  },
  "CONSUMER": {
    "code": "Consumer",
    "name": "Consumer Protection Act"
  },
  "REGISTRAR": {
    "code": "Registrar",
    "name": "Companies registry"
  },
  "NSSA": {
    "code": "NSSA",
    "name": "Social security"
  },
  "LABOUR": {
    "code": "Labour",
    "name": "Labour Act"
  },
  "ZIDA": {
    "code": "ZIDA",
    "name": "Investment agency"
  },
  "BAZ": {
    "code": "BAZ",
    "name": "Broadcasting regulator"
  },
  "ZMC": {
    "code": "Media",
    "name": "Media regulation"
  },
  "IPO": {
    "code": "IP office",
    "name": "Trademarks, patents, copyright"
  },
  "HEALTH": {
    "code": "Health",
    "name": "MCAZ and health councils"
  },
  "EDU": {
    "code": "Education",
    "name": "Schools and higher education"
  },
  "EACZ": {
    "code": "EACZ",
    "name": "Estate Agents Council"
  },
  "AGRI": {
    "code": "Agri",
    "name": "Agricultural registrations"
  },
  "ZTA": {
    "code": "ZTA",
    "name": "Tourism authority"
  },
  "ZERA": {
    "code": "ZERA",
    "name": "Energy regulator"
  },
  "ICT": {
    "code": "ICT",
    "name": "Digital law reform"
  }
};

export const REGULATOR_ORDER: Regulator[] = [
  "POTRAZ",
  "RBZ",
  "FIU",
  "SECZ",
  "IPEC",
  "ZIMRA",
  "NSSA",
  "LABOUR",
  "REGISTRAR",
  "ZIDA",
  "TRANSPORT",
  "CAAZ",
  "CONSUMER",
  "BAZ",
  "ZMC",
  "IPO",
  "HEALTH",
  "EDU",
  "EACZ",
  "AGRI",
  "ZTA",
  "ZERA",
  "ICT"
];

export const SECTORS: Sector[] = [
  {
    "id": "isp",
    "label": "Internet access",
    "pattern": "\\b(isp|internet service|wi-?fi|broadband|fibre|fiber|hotspot|rural internet|bandwidth|internet provider|wireless internet)"
  },
  {
    "id": "mvno",
    "label": "Mobile network or SIMs",
    "pattern": "\\b(mvno|mvne|sim card|virtual network|mobile network|telecom operator)"
  },
  {
    "id": "vas",
    "label": "SMS, USSD and value-added services",
    "pattern": "\\b(sms|ussd|short ?code|bulk message|ivr|airtime|value[- ]added|voice service|call cent|mobile content)"
  },
  {
    "id": "payments",
    "label": "Payments and lending",
    "pattern": "\\b(wallet|mobile money|payment|pay\\b|payroll|remit|transfer|send money|fintech|bank|ecocash|card\\b|merchant|pos\\b|bill pay|forex|diaspora)"
  },
  {
    "id": "crypto",
    "label": "Crypto and digital assets",
    "pattern": "\\b(crypto|bitcoin|blockchain|token|stablecoin|digital asset|nft|web3|usdt|defi)"
  },
  {
    "id": "investment",
    "label": "Investment and crowdfunding",
    "pattern": "\\b(crowdfund|invest|securities|trading|stock|shares|tokeni[sz]|capital rais|brokerage|fundrais|fund rais)"
  },
  {
    "id": "insurtech",
    "label": "Insurance and pensions",
    "pattern": "\\b(insur|funeral|medical aid|pension|assurance|claims|cover plan)"
  },
  {
    "id": "ecommerce",
    "label": "Online selling",
    "pattern": "\\b(shop|store|e-?commerce|sell online|retail|online order|checkout|merchandise|clothes|goods)"
  },
  {
    "id": "platform",
    "label": "Platforms and marketplaces",
    "pattern": "\\b(marketplace|platform|streaming|subscription|saas|classifieds|gig)"
  },
  {
    "id": "ridehailing",
    "label": "Ride-hailing and transport",
    "pattern": "\\b(ride|taxi|e-?hailing|hailing|cab\\b|kombi|driver|commut|bus\\b)"
  },
  {
    "id": "drones",
    "label": "Drones",
    "pattern": "\\b(drone|uav|aerial|quadcopter)"
  },
  {
    "id": "courier",
    "label": "Courier and delivery",
    "pattern": "\\b(courier|deliver|parcel|logistics|package|dispatch|malaicha|shipping|freight)"
  },
  {
    "id": "hardware",
    "label": "Hardware and devices",
    "pattern": "\\b(hardware|iot|device|sensor|smart meter|router|radio|gadget|wearable|antenna|tracker|modem)"
  },
  {
    "id": "social",
    "label": "Social and user content",
    "pattern": "\\b(social|chat|community|forum|messaging|dating|creator|user[- ]generated|comments|whatsapp|telegram|video shar|influencer)"
  },
  {
    "id": "data",
    "label": "Personal data",
    "pattern": "\\b(app\\b|apps\\b|software|website|web app|online|users|customers|data|analytics|database|crm|biometric|kyc|face|ai\\b|patient|students|school|clinic)"
  },
  {
    "id": "lending",
    "label": "Lending and credit",
    "pattern": "\\b(lend|loan|credit|microfinance|micro-finance|bnpl|buy now pay later|moneylend|savings club|susu|credit score)"
  },
  {
    "id": "media",
    "label": "Streaming, podcasts and media",
    "pattern": "\\b(stream|podcast|web tv|webcast|internet radio|radio|tv\\b|television|video platform|news site|blog|publisher|newsletter|film)"
  },
  {
    "id": "foreign",
    "label": "Foreign money or investors",
    "pattern": "\\b(foreign|investor|offshore|abroad|international|non-resident|forex|dollar|usd|export|import|cloud|saas)"
  },
  {
    "id": "health",
    "label": "Health",
    "pattern": "\\b(health|clinic|patient|telemedicine|telehealth|pharmacy|medical|doctor|hospital|drug|diagnos|nurse)"
  },
  {
    "id": "education",
    "label": "Education and training",
    "pattern": "\\b(school|education|learn|course|student|tutor|training|universit|e-learning|edtech|exam)"
  },
  {
    "id": "property",
    "label": "Property and rentals",
    "pattern": "\\b(property|real estate|rent|estate agent|landlord|housing|tenant|listing)"
  },
  {
    "id": "agri",
    "label": "Agriculture",
    "pattern": "\\b(agri|farm|crop|produce|seed|fertili[sz]|livestock|commodity|harvest|warehouse receipt|agro)"
  },
  {
    "id": "tourism",
    "label": "Tourism and travel",
    "pattern": "\\b(tourism|travel|booking|hotel|lodge|accommodation|tour\\b|tours\\b|airbnb|safari)"
  },
  {
    "id": "energy",
    "label": "Energy and solar",
    "pattern": "\\b(energy|solar|power|electric|mini-?grid|battery|inverter|renewable|off-grid|fuel|generator)"
  },
  {
    "id": "ip",
    "label": "Brand, software and creative IP",
    "pattern": "\\b(brand|logo|trademark|patent|invent|copyright|music|software|game|creator|artist)"
  }
];

export const RULES: Rule[] = [
  {
    "id": "dp-licence",
    "scope": "general",
    "phase": "before",
    "reg": "POTRAZ",
    "tags": [
      "data"
    ],
    "status": "official",
    "title": "Data controller licence from POTRAZ",
    "headline": "Licence fee of $50 to $2,500 a year, set by how many people's data you hold.",
    "summary": "POTRAZ is the Data Protection Authority. If you decide why and how personal data is processed, or process it for commercial gain, you need a licence. That covers most apps, wallets, shops and platforms.",
    "facts": [
      {
        "label": "Law",
        "value": "Cyber and Data Protection (Licensing of Data Controllers and Appointment of Data Protection Officers) Regulations, 2024 (S.I. 155 of 2024), made under the Cyber and Data Protection Act [Chapter 12:07]."
      },
      {
        "label": "Tier 1",
        "value": "50 to 1,000 data subjects: $50 a year. No application fee listed."
      },
      {
        "label": "Tier 2",
        "value": "1,001 to 100,000: $300 a year plus a $30 application fee."
      },
      {
        "label": "Tier 3",
        "value": "100,001 to 500,000: $500 a year plus $30 application."
      },
      {
        "label": "Tier 4",
        "value": "More than 500,000: $2,500 a year plus $30 application."
      },
      {
        "label": "Payment",
        "value": "In USD, or in ZiG at the official exchange rate."
      },
      {
        "label": "Validity",
        "value": "12 months. Renew on Form DP1 at least 3 months before expiry. POTRAZ decides applications within 14 days."
      },
      {
        "label": "Exempt",
        "value": "Personal, family or household use. Law enforcement and journalistic, historical or archival work are exempt from the licence but must still register."
      },
      {
        "label": "Penalty",
        "value": "Processing without a licence: a fine up to level 11, up to 7 years in prison, or both. The standard scale of fines (S.I. 14A of 2023, reported) sets level 11 at US$1,000 and level 7 at US$400, payable in local currency at the interbank rate. A later revision was not checked."
      }
    ],
    "note": "The regulations do not say what applies below 50 data subjects. The PDF text has scanning artefacts, so check amounts against the Gazette. Existing controllers had to apply within 6 months of the September 2024 promulgation.",
    "sources": [
      {
        "t": "S.I. 155 of 2024 on POTRAZ",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2025/02/sI-155-of-2024-Cyber-and-Data-Protection-Normal_240913_1250178.pdf"
      },
      {
        "t": "MMM Law: overview of the data protection law",
        "u": "https://www.mmmlawfirm.co.zw/general-overview-of-the-new-data-protection-law-in-zimbabwe/"
      },
      {
        "t": "Fine scale reported by Zimbabwe Now (S.I. 14A of 2023)",
        "u": "https://zimbabwenow.co.zw/articles/2766/govt-sets-us-dollar-fines-scale"
      }
    ],
    "steps": [
      {
        "t": "Confirm you determine purposes and means of processing personal data",
        "d": "Controllers that decide why and how personal data is processed must be licensed (SI 155 of 2024, reg 4(1)); tier is set by number of data subjects."
      },
      {
        "t": "Download and complete Form DP1 from POTRAZ",
        "d": "DP1 asks for entity details, DPO, data categories, legal grounds, processors, transfers abroad, safeguards, and ticks a document checklist (certificate of incorporation listed)."
      },
      {
        "t": "Submit DP1 in writing to POTRAZ with the Second Schedule fee",
        "d": "Application fee is USD 30 for Tiers 2 to 4 and none for Tier 1; payable in USD or ZiG at the official rate."
      },
      {
        "t": "Pay the annual licence fee for your tier",
        "d": "Tier 1 (50 to 1,000 subjects) USD 50; Tier 2 USD 300; Tier 3 USD 500; Tier 4 (over 500,000) USD 2,500. Tier ranges per Techzim."
      },
      {
        "t": "Expect a decision within 14 days",
        "d": "POTRAZ may ask for more information, issue the licence (possibly with conditions) or reject with reasons (reg 4(3)-(4))."
      },
      {
        "t": "Renew on DP1 at least 3 months before expiry",
        "d": "Licence lasts 12 months; failing to renew without just cause is an offence (reg 5)."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2025/02/sI-155-of-2024-Cyber-and-Data-Protection-Normal_240913_1250178.pdf"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2840"
      },
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2025/02/DP1-Data-Controller-License-Application-Form__250218_085559.pdf"
      },
      {
        "t": "techzim.co.zw",
        "u": "https://techzim.co.zw/2024/11/zimbabwes-whatsapp-group-admin-license-fees-depend-on-the-group-sizes-from-50-to-2500"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2220"
      }
    ],
    "stepsCheck": "No submission channel, email or portal address found (DP1 points to a registration guide at www.potraz.zw). POTRAZ Guidelines on Licensing of Data Controllers 2025 PDF could not be read. Full document checklist beyond certificate of incorporation not found. Tier 2 to 3 ranges only from Techzim."
  },
  {
    "id": "dp-dpo",
    "scope": "general",
    "phase": "running",
    "reg": "POTRAZ",
    "tags": [
      "data"
    ],
    "status": "official",
    "title": "Appoint a certified data protection officer",
    "headline": "Every licensed controller names a DPO and tells POTRAZ on Form DP2.",
    "summary": "The DPO must hold an approved certification, so start early. The regulations state no minimum company size.",
    "facts": [
      {
        "label": "Form",
        "value": "Form DP2, in writing to POTRAZ. Appoint within 90 days of promulgation, or of a DPO contract ending."
      },
      {
        "label": "Changes",
        "value": "Tell POTRAZ within 14 days of a change in DPO contact details, or of the DPO resigning or being dismissed."
      },
      {
        "label": "Who qualifies",
        "value": "Skill or experience in data science, analytics, information security, systems audit, law, audit or similar, plus knowledge of the data protection law and of your operations. Must complete an Authority-approved certification course."
      },
      {
        "label": "Certification fee",
        "value": "$1,250 for Zimbabwean citizens, $1,450 for international candidates. Training application fee $30 or $50."
      },
      {
        "label": "Penalty",
        "value": "No DPO: a fine up to level 7, up to 2 years in prison, or both."
      }
    ],
    "note": "One compliance vendor says Tier 1 controllers only need a DPO when handling sensitive data. The regulation text read here sets no such threshold.",
    "sources": [
      {
        "t": "S.I. 155 of 2024 on POTRAZ",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2025/02/sI-155-of-2024-Cyber-and-Data-Protection-Normal_240913_1250178.pdf"
      }
    ],
    "steps": [
      {
        "t": "Choose a DPO with relevant skills",
        "d": "Skills such as data science, law, audit or information security, knowledge of data protection law, and understanding of your operations (SI 155 reg 13(1))."
      },
      {
        "t": "Get the DPO through a POTRAZ-approved certification course",
        "d": "DPOs must complete an Authority-approved course (reg 13(2)). POTRAZ lists a DPO Training Application Form and a DPO Certification Course document."
      },
      {
        "t": "Pay training and certification fees",
        "d": "Training application USD 30 (citizen) or USD 50 (international); certification USD 1,250 (citizen) or USD 1,450 (international)."
      },
      {
        "t": "Notify POTRAZ of the DPO on Form DP2",
        "d": "DP2 needs the DPO's registration number, contact details and qualifications, plus your licence number (reg 12(1)-(2))."
      },
      {
        "t": "Notify changes and replace a departing DPO",
        "d": "Report contact changes, dismissal or resignation within 14 days; appoint a replacement within 90 days (reg 12(3)-(5))."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2025/02/sI-155-of-2024-Cyber-and-Data-Protection-Normal_240913_1250178.pdf"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2840"
      },
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2025/02/DPO-NOTOFICATION-FORM-DP2.pdf"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?p=3338"
      },
      {
        "t": "dlapiperafrica.com",
        "u": "https://www.dlapiperafrica.com/en/zimbabwe/insights/2024/A-Quick-Start-Guide-to-Zimbabwes-Data-Protection-Regulations"
      }
    ],
    "stepsCheck": "2026 DPO training calendar is an image and could not be read; course eligibility, duration and where to submit forms not found. DPO Appointment Guidelines 2024 PDF could not be read. DP2 and DP3 give no submission channel."
  },
  {
    "id": "dp-breach",
    "scope": "general",
    "phase": "running",
    "reg": "POTRAZ",
    "tags": [
      "data"
    ],
    "status": "official",
    "title": "Breach reports, foreign data transfers and children's data",
    "headline": "Report a breach to POTRAZ within 24 hours, and tell POTRAZ before sending data abroad.",
    "summary": "These duties bite startups that use foreign cloud services, analytics tools or payment processors, and any product with users under 18.",
    "facts": [
      {
        "label": "Breach to POTRAZ",
        "value": "Within 24 hours of becoming aware, on Form DP3."
      },
      {
        "label": "Breach to users",
        "value": "Within 72 hours if the risk to them is high."
      },
      {
        "label": "Follow-up",
        "value": "Answer POTRAZ information requests within 14 days. Investigation report within 21 days."
      },
      {
        "label": "Notify POTRAZ",
        "value": "Your processing activities, intended transfers outside Zimbabwe, and any biometric or genetic processing."
      },
      {
        "label": "Children",
        "value": "Parental consent and reasonable verification for data of anyone under 18."
      },
      {
        "label": "Penalty",
        "value": "Breach-reporting failures carry a fine up to level 11, up to 7 years in prison, or both."
      }
    ],
    "note": "Reports say POTRAZ Regulatory Notice 2 of 2026 starts risk-based inspections from 1 September 2026, beginning with banks, insurers, hospitals, schools, churches, NGOs and mines, checking licensing, cybersecurity and data governance. Business Times earlier said audits would come in Q4 2026, so the date is not settled. A vendor says CDPG 1 of 2025 makes staff training mandatory; we found only that one source.",
    "sources": [
      {
        "t": "S.I. 155 of 2024 on POTRAZ",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2025/02/sI-155-of-2024-Cyber-and-Data-Protection-Normal_240913_1250178.pdf"
      },
      {
        "t": "Techpoint on the POTRAZ inspection notice",
        "u": "https://techpoint.africa/insight/techpoint-digest-1398/"
      },
      {
        "t": "CITE on POTRAZ data licence fees",
        "u": "https://cite.org.zw/potraz-data-licence-fees-slammed-as-costly-burden-on-businesses-and-consumers/"
      }
    ],
    "steps": [
      {
        "t": "Set up breach detection and an incident record",
        "d": "Keep a record of all breaches and internal reporting procedures (reg 17(4))."
      },
      {
        "t": "Report any breach to POTRAZ within 24 hours on Form DP3",
        "d": "DP3 asks for breach and discovery dates, systems hit, data types and record counts, likely impact and remedial measures (reg 17; Act s19)."
      },
      {
        "t": "Tell affected people within 72 hours if risk is high",
        "d": "Applies where the breach is likely to pose a high risk to individuals' rights and freedoms (reg 17(3))."
      },
      {
        "t": "Cooperate with the investigation",
        "d": "Answer POTRAZ information requests within 14 days and file an investigation report within 21 days of notification (reg 17(5))."
      },
      {
        "t": "Notify POTRAZ before sending data abroad; get parental consent for children",
        "d": "Transfers require adequate protection (Act ss28-29) and notice to POTRAZ (reg 10(2)(c)). Child data needs verified parent consent, regular DPIAs, and no automated decisions (reg 10(5))."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2025/02/sI-155-of-2024-Cyber-and-Data-Protection-Normal_240913_1250178.pdf"
      },
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2025/02/DATA-BREACH-NOTIFICATION-FORM-DP3.pdf"
      },
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2021/5/eng@2022-03-11/source"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2220"
      }
    ],
    "stepsCheck": "No submission email or portal for DP3; only POTRAZ postal and physical address (P.O. Box MP 843 Mt Pleasant; 1111 Performance Close, Mt Pleasant Business Park, Harare; 0242-333032). POTRAZ guidelines on breach, cross-border transfers and children's data PDFs could not be read, so the transfer authorisation process is not confirmed."
  },
  {
    "id": "cyber-offences",
    "scope": "specific",
    "phase": "running",
    "reg": "POTRAZ",
    "tags": [
      "social",
      "platform",
      "media"
    ],
    "status": "official",
    "title": "Cyber-crime offences and duties for platforms hosting user content",
    "headline": "Hosts must remove illegal content promptly once a court orders it or they become aware, or face an offence.",
    "summary": "The Cyber and Data Protection Act [Chapter 12:07] rewrote sections 163 to 166 of the Criminal Law Code and added intermediary rules. Platforms with user posts, comments or images should plan moderation and takedown around these.",
    "facts": [
      {
        "label": "Offences named",
        "value": "Inciting violence, threats, cyber-bullying (s164B), false data messages about an identifiable person, spam (s164D, level 5 or 1 year), intimate images shared without consent (s164E), racist or xenophobic material (s164F, level 14 or 10 years), child sexual abuse material (s165A) and exposing children to pornography (s165B)."
      },
      {
        "label": "Access providers",
        "value": "Immune if they did not start the transmission, choose the recipient or change the content (s379C, Criminal Procedure and Evidence Act)."
      },
      {
        "label": "Hosts",
        "value": "Not liable if they promptly remove content after a court order, or promptly tell the authority once they know it is illegal. Failing to remove is an offence (level 8 or 2 years). Knowingly facilitating unlawful content is level 14 or up to 10 years."
      },
      {
        "label": "Monitoring",
        "value": "No general duty to monitor appeared in the text read."
      }
    ],
    "note": "Read through a summarising tool, so check section numbers and penalty levels against the Act. The Censorship and Entertainments Control Act [Chapter 10:04] needs Board approval for films and a licence for video distributors; whether it reaches streaming, games or app stores is unclear.",
    "sources": [
      {
        "t": "Cyber and Data Protection Act (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/2021/5"
      },
      {
        "t": "Censorship and Entertainments Control Act (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/1967/37"
      },
      {
        "t": "MMM Law: overview of the data protection law",
        "u": "https://www.mmmlawfirm.co.zw/general-overview-of-the-new-data-protection-law-in-zimbabwe/"
      }
    ],
    "steps": [
      {
        "t": "Know the offences that apply to your product",
        "d": "Criminal Code ss163-165B, substituted by the Cyber and Data Protection Act s35, cover hacking, data interference, malware, harassment, false data messages, spam, intimate images, racist material and child abuse material."
      },
      {
        "t": "Set up a way to receive illegal-content notices and court orders",
        "d": "A hosting provider avoids criminal liability for user content only if it promptly removes or disables access on a court order, or promptly informs the appropriate authority on becoming aware (CPEA s379C(3))."
      },
      {
        "t": "Remove or disable access promptly when required",
        "d": "Failing to remove content as required is an offence: fine up to level 8 or 2 years (s379C(6)); similar duties apply to caching and linking providers."
      },
      {
        "t": "Never knowingly host, store or link unlawful content",
        "d": "Knowingly enabling access to unlawful content carries up to level 14 or 10 years (s379C(11))."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2021/5/eng@2022-03-11/source"
      }
    ],
    "stepsCheck": "The Act sets no formal takedown procedure, form, deadline in hours, or named reporting authority beyond 'the appropriate authority'. Last 10,000 characters of the Act text were not read. No regulator guidance found."
  },
  {
    "id": "potraz-isp",
    "scope": "specific",
    "phase": "before",
    "reg": "POTRAZ",
    "tags": [
      "isp"
    ],
    "status": "verify",
    "title": "Internet service provider (ISP) licence",
    "headline": "Five ISP tiers, from $50 for a community ISP to $50,000 for a national one.",
    "summary": "POTRAZ's fee table lists ISP categories by coverage area. Provincial, metropolitan, district and community tiers are listed as exempt from the annual levy.",
    "facts": [
      {
        "label": "Application",
        "value": "$50 for each ISP category."
      },
      {
        "label": "Initial or renewal",
        "value": "National $50,000. Provincial $2,500. Metropolitan $5,000. District $1,000. Community $50."
      },
      {
        "label": "Levy",
        "value": "National: 3.5% of gross turnover plus VAT. The other four tiers are listed as exempt."
      },
      {
        "label": "Term",
        "value": "20 years."
      },
      {
        "label": "Categories",
        "value": "1.4.5 National, 1.4.6 Provincial, 1.4.7 Metropolitan, 1.4.8 District, 1.4.9 Community."
      }
    ],
    "note": "The PDF carries no date (its upload path suggests March 2022) and does not say which tier fits which business. Confirm the current schedule with POTRAZ.",
    "sources": [
      {
        "t": "POTRAZ licence categories and fees (PDF)",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      },
      {
        "t": "Techzim on ISP and MVNO licensing (2017)",
        "u": "https://www.techzim.co.zw/2017/04/potraz-finally-moves-licensing-isps-mobile-virtual-network-operators-zimbabwe-mvnos/"
      }
    ],
    "steps": [
      {
        "t": "Pick ISP level and watch for POTRAZ application window",
        "d": "ISP licences (national, provincial, metropolitan, district, community) fall under Application Services 1.4. POTRAZ announces application deadlines from time to time."
      },
      {
        "t": "Download and complete Converged Licence Application Form PT1",
        "d": "Form must be signed by approved persons. Prepare a cover letter addressed to the Director General."
      },
      {
        "t": "Compile one project proposal document",
        "d": "Include CR14 and Certificate of Incorporation, market analysis, 5-year business plan, proof of financial capacity, services description, area of operation, and technical architecture with schematics."
      },
      {
        "t": "Pay application fee and submit",
        "d": "Application fee is US$50 for every ISP level. Attach the receipt. POTRAZ checks attachments and notifies you of any missing documents."
      },
      {
        "t": "Await evaluation, Board approval and Minister consultation",
        "d": "Evaluation goes to Management, then the Board, then the Minister. No processing time is published."
      },
      {
        "t": "Pay initial licence fee, then operate and pay turnover levy",
        "d": "Initial fee: National $50,000; Provincial $2,500; Metropolitan $5,000; District $1,000; Community $50. National ISPs also pay 3.5% of gross turnover (USF plus annual fee); other levels are exempt. Tenure is 20 years."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2274"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2279"
      },
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=577"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2284"
      },
      {
        "t": "fingaz.co.zw",
        "u": "https://fingaz.co.zw/potraz-finally-moves-on-licensing-of-isps-and-mobile-virtual-network-operators-in-zimbabwe-mvnos/"
      }
    ],
    "stepsCheck": "No online portal found; submission method not stated beyond Director General address (1110 Perfomance Close, Mt Pleasant Business Park, Harare; the.regulator@potraz.gov.zw; +263 242 333032). Application window status in 2026 unknown. No processing time or renewal procedure. Page notes a Nov 2021 moratorium on certain spectrum-dependent licences; I did not read it. A 2024 Fingaz article reports POTRAZ consulting on a new ISP/MVNO licence category, which may have changed things."
  },
  {
    "id": "potraz-mvno",
    "scope": "specific",
    "phase": "before",
    "reg": "POTRAZ",
    "tags": [
      "mvno"
    ],
    "status": "verify",
    "title": "Mobile virtual network (MVNO, MVNE) licences",
    "headline": "From $500 for a branded reseller to $50,000 for a full MVNO.",
    "summary": "POTRAZ lists four virtual-network categories under converged licensing. The role definitions come from a 2017 proposal article, so confirm them before you choose a category.",
    "facts": [
      {
        "label": "Application",
        "value": "$50 each."
      },
      {
        "label": "Initial or renewal",
        "value": "Full MVNO $50,000. Light MVNO $5,000. MVNE $500. Branded or reseller MVNO $500."
      },
      {
        "label": "Levy",
        "value": "3.5% of gross turnover plus VAT."
      },
      {
        "label": "Term",
        "value": "20 years."
      },
      {
        "label": "Roles (2017 proposal)",
        "value": "Full MVNO owns its core network. Light MVNO has none. Branded reseller handles branding and distribution only. MVNE hosts MVNOs and cannot sell to consumers directly."
      }
    ],
    "note": "Undated fee table. Role definitions are from a 2017 article, not from the fee schedule.",
    "sources": [
      {
        "t": "POTRAZ licence categories and fees (PDF)",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      },
      {
        "t": "Techzim on ISP and MVNO licensing (2017)",
        "u": "https://www.techzim.co.zw/2017/04/potraz-finally-moves-licensing-isps-mobile-virtual-network-operators-zimbabwe-mvnos/"
      }
    ],
    "steps": [
      {
        "t": "Choose MVNO variant",
        "d": "Variants are Full (1.4.1), Light (1.4.3), Branded/Reseller (1.4.4) and MVNE (1.4.2), all under Application Services."
      },
      {
        "t": "Complete PT1 form and cover letter to Director General",
        "d": "Use the Converged Licence Application Form PT1, signed by approved persons."
      },
      {
        "t": "Prepare proposal with company papers, business plan and technical description",
        "d": "Include CR14, Certificate of Incorporation, 5-year plan, proof of financial capacity, and service and technical descriptions."
      },
      {
        "t": "Pay US$50 application fee and submit when applications are open",
        "d": "Attach the receipt. POTRAZ announces deadlines from time to time and notifies you of missing documents."
      },
      {
        "t": "Pay initial licence fee after Board and Minister process",
        "d": "Full $50,000; Light $5,000; Branded/Reseller $500; MVNE $500. Licences issue only after fees are paid."
      },
      {
        "t": "Pay ongoing levy",
        "d": "3.5% of gross turnover plus VAT (USF plus annual licence fee). Tenure is 20 years. Numbering needs a separate application."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2274"
      },
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2279"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2284"
      }
    ],
    "stepsCheck": "No online portal, processing time or renewal steps found. Whether a full MVNO also needs host-network agreements or spectrum is not stated. The fee PDF is a 2022 schedule and may be outdated. Contact is the general POTRAZ address above."
  },
  {
    "id": "potraz-app",
    "scope": "specific",
    "phase": "before",
    "reg": "POTRAZ",
    "tags": [
      "vas",
      "platform"
    ],
    "status": "verify",
    "title": "Application Services licence (category 1.4)",
    "headline": "Bulk SMS and SMS gateway services likely need a POTRAZ licence. For ordinary apps, SaaS and content the position is not stated.",
    "summary": "POTRAZ's fee table has no category named value-added services and does not define who must hold Application Services. Do not assume you need it, and do not assume you are exempt.",
    "facts": [
      {
        "label": "Fee table",
        "value": "Application $800. Initial or renewal $525,000. Levy 3.5% of gross turnover plus VAT. Term 20 years. Sub-categories 1.4.1 to 1.4.9 are the MVNO, MVNE and ISP tiers."
      },
      {
        "label": "2015 draft definition",
        "value": "\"The Application Services Licence shall allow the provision of electronic communication services to end-users\", such as internet services, VoIP, messaging services, video conferences and mobile money."
      },
      {
        "label": "2015 draft classes",
        "value": "Category A: an individual licence of 10 years. Category B: a class licence of 5 years for firms without their own network. The draft names value-added service provision and SMS aggregation or SMS gateway operation."
      },
      {
        "label": "Not found",
        "value": "Nothing on whether USSD, OTT, apps, SaaS or content platforms need it."
      }
    ],
    "note": "The definitions come from a 2015 consultation draft, not the final framework, which we could not find. Ask POTRAZ in writing whether your product counts as an application service and keep the reply on file.",
    "sources": [
      {
        "t": "POTRAZ licence categories and fees (PDF)",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      },
      {
        "t": "POTRAZ 2015 converged licensing consultation paper",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2015/10/CONSULTATION_PAPER_CONVERGED_LICENSING_FRAMEWORK_2015.pdf"
      }
    ],
    "steps": [
      {
        "t": "Confirm you need Application Services licence 1.4",
        "d": "It covers end-user services without owning or operating a network."
      },
      {
        "t": "Download PT1 form and write cover letter to Director General",
        "d": "Form signed by approved persons."
      },
      {
        "t": "Assemble proposal document",
        "d": "Include CR14, Certificate of Incorporation, market analysis, 5-year plan, proof of financial capacity, services description, area of operation, and technical description."
      },
      {
        "t": "Pay US$800 application fee and submit",
        "d": "Include the receipt. Submit when POTRAZ opens applications; incomplete files are returned for missing documents."
      },
      {
        "t": "Wait for evaluation, Board and Minister approval",
        "d": "No processing time is published."
      },
      {
        "t": "Pay US$525,000 initial fee, then 3.5% of turnover",
        "d": "Licence issues after payment. Tenure 20 years. The levy is USF plus annual fee plus VAT."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2274"
      },
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2284"
      }
    ],
    "stepsCheck": "The fee schedule lists 1.4 Application Services at US$525,000, which looks like the full category; whether narrower app or content services get a cheaper licence is not stated. No portal, timeline or renewal process found."
  },
  {
    "id": "potraz-codes",
    "scope": "specific",
    "phase": "before",
    "reg": "POTRAZ",
    "tags": [
      "vas"
    ],
    "status": "verify",
    "title": "Short codes, USSD codes and numbering",
    "headline": "A five-digit premium short code costs $1,200 to apply and $1,200 a year.",
    "summary": "If your service runs on a short code or special number, POTRAZ charges for the number itself on top of any licence.",
    "facts": [
      {
        "label": "Five-digit premium code",
        "value": "$1,200 application and $1,200 annual."
      },
      {
        "label": "Three-digit code",
        "value": "$50 application and $50 annual."
      },
      {
        "label": "Other special codes",
        "value": "$500 application and $500 annual."
      },
      {
        "label": "Subscriber numbers",
        "value": "$0.05 per number for application and $0.05 per number a year."
      }
    ],
    "note": "From the same undated fee table. Mobile operators may charge separately for access.",
    "sources": [
      {
        "t": "POTRAZ licence categories and fees (PDF)",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      }
    ],
    "steps": [
      {
        "t": "Understand who applies",
        "d": "Only network operators apply to POTRAZ. A service provider approaches its network operator, not POTRAZ, to get a short code."
      },
      {
        "t": "Sign agreement with the network operator",
        "d": "It covers revenue sharing, technical issues, short code purpose, preferred codes, required dates and planned start date."
      },
      {
        "t": "Operator submits Number Application Form (PT1/PT2)",
        "d": "Form is endorsed by management, with a signed letterhead letter stating purpose, preferred block, dates and current usage."
      },
      {
        "t": "Pay annual code fees",
        "d": "USSD/non-premium 3-digit code US$50 per year; premium short code US$1,200 per year; before 15% VAT. The older fee PDF lists other special short codes at US$500."
      },
      {
        "t": "File signed agreement with POTRAZ before launch",
        "d": "The operator must file it before the service provider offers services to the public."
      },
      {
        "t": "Give 60 days' notice to change numbers",
        "d": "After authorisation, issue a public notice before the change takes effect."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=497"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=2279"
      },
      {
        "t": "potraz.gov.zw",
        "u": "http://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      }
    ],
    "stepsCheck": "No processing time or online portal. The numbering page and fee PDF disagree on subscriber-number fee (US$0.10 vs US$0.05). Short codes are assigned on demand, but no turnaround is given. Contact the.regulator@potraz.gov.zw."
  },
  {
    "id": "potraz-type",
    "scope": "specific",
    "phase": "before",
    "reg": "POTRAZ",
    "tags": [
      "hardware",
      "isp",
      "drones"
    ],
    "status": "verify",
    "title": "Type approval for radio and telecom equipment",
    "headline": "Radio equipment needs POTRAZ type approval (US$500 in the 2001 regulations) and a licence to import radio transmitters.",
    "summary": "Devices with radios such as WLAN, Bluetooth and Zigbee reportedly need POTRAZ homologation before they are sold or used. We could not find the regulation itself.",
    "facts": [
      {
        "label": "Radio equipment",
        "value": "S.I. 11A of 2001 (Licensing, Registration and Certification Regulations, as amended): type approval fee US$500 and dealer registration US$120. Regulation 34(2): \"No person shall import, possess or deliver any radio transmitting station without a licence.\""
      },
      {
        "label": "Process (lab)",
        "value": "A testing lab says approval is mandatory, takes about 6 weeks, and needs no local representative or in-country testing."
      },
      {
        "label": "Not found",
        "value": "Which devices need approval, the import-permit steps and current fees."
      }
    ],
    "note": "The US$500 and US$120 fees come from a 2001 instrument and may be out of date. The six-week lead time is from a commercial testing company's sales page. Confirm the device list and fees with POTRAZ.",
    "sources": [
      {
        "t": "S.I. 11A of 2001 (POTRAZ)",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2015/04/STATUTORY_INSTRUMENT_11A_of_2001-Licensing_Registration_and_Certification.pdf"
      },
      {
        "t": "IBL type approval page (commercial lab)",
        "u": "https://ib-lenhardt.com/type-approval/zimbabwe"
      }
    ],
    "steps": [
      {
        "t": "Check eligibility and dealer licence",
        "d": "Importers, manufacturers and agents may apply. Dealers need a Telecommunications or Radiocommunications Equipment Dealership Licence first. No approval is needed if the model is already approved."
      },
      {
        "t": "Complete the Type Approval Application Form",
        "d": "Download the PDF form from POTRAZ. Write to the Director General with it."
      },
      {
        "t": "Attach supporting documents",
        "d": "English specifications and manuals, manufacturer or accredited-lab test reports, dealership licence copy for dealers, and regional approval certificates if any."
      },
      {
        "t": "Pay US$500 per model",
        "d": "Fee is before 15% VAT. Approval is granted once per model."
      },
      {
        "t": "Provide sample if requested",
        "d": "A sample may be required and may not be returned. POTRAZ may test it in the lab."
      },
      {
        "t": "Receive certificate",
        "d": "If the evaluation passes, POTRAZ issues a certificate and the equipment can enter the market."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=495"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=577"
      }
    ],
    "stepsCheck": "No processing time, online portal or renewal rule stated. The page does not say exactly when the fee is paid. Dealer licence process not fetched."
  },
  {
    "id": "potraz-courier",
    "scope": "specific",
    "phase": "before",
    "reg": "POTRAZ",
    "tags": [
      "courier"
    ],
    "status": "official",
    "title": "Postal and courier operator licence",
    "headline": "Courier licences cost from US$50 to US$250 to apply and US$500 to US$100,000 to hold, set by how far you deliver.",
    "summary": "Section 32 of the Postal and Telecommunications Act [Chapter 12:05] bars anyone from operating a postal service without a licence. S.I. 110 of 2023 sets the fees by category. Whether delivery apps and runners are caught is not stated.",
    "facts": [
      {
        "label": "Law",
        "value": "Postal and Telecommunications (Postal Services) (Amendment) Regulations, 2023 (No. 3), S.I. 110 of 2023, gazetted 16 June 2023."
      },
      {
        "label": "Regional courier",
        "value": "US$250 application, US$5,000 licence."
      },
      {
        "label": "Inter-city courier",
        "value": "US$100 application, US$1,000 licence."
      },
      {
        "label": "Intra-city Class One",
        "value": "US$100 application, US$500 licence."
      },
      {
        "label": "Intra-city Class Two",
        "value": "US$50 registration (rural district)."
      },
      {
        "label": "Domestic / international / general postal",
        "value": "Domestic: US$100 and US$3,000. International: US$250 and US$50,000. General postal: US$250 and US$100,000."
      },
      {
        "label": "Term and levies",
        "value": "10 years. Each licence also pays 2% of turnover as an annual fee plus 2% to the Universal Service Fund."
      },
      {
        "label": "Enforcement",
        "value": "In 2021 a runner (malaicha) was arrested for operating without a licence, and POTRAZ said it planned regional, inter-city and intra-city courier licences."
      }
    ],
    "note": "Fees were read through a summarising tool; check them against the gazetted SI. The SI does not mention delivery apps or malaicha, so whether your model needs a licence is for POTRAZ to confirm.",
    "sources": [
      {
        "t": "S.I. 110 of 2023 (Veritas)",
        "u": "https://www.veritaszim.net/sites/veritas_d/files/SI%202023-110%20Postal%20and%20Telecommunications%20(Postal%20Services)%20(Amendment)%20Regulations,%202023%20(No.%203).pdf"
      },
      {
        "t": "Herald: Potraz to license courier operators",
        "u": "https://www.heraldonline.co.zw/just-in-potraz-to-license-courier-operators/"
      },
      {
        "t": "Techzim on malaicha courier licences (May 2021)",
        "u": "https://techzim.co.zw/2021/05/potraz-to-give-malaichas-runners-courier-licences"
      },
      {
        "t": "Techzim on a runner arrested without a licence (Apr 2021)",
        "u": "https://techzim.co.zw/2021/04/runner-malaicha-arrested-for-operating-without-a-licence"
      }
    ],
    "steps": [
      {
        "t": "Choose licence category",
        "d": "Options are Postal Services (General), International Commercial Courier, or Domestic Commercial Courier."
      },
      {
        "t": "Download application form and requirements list",
        "d": "Both are on the POTRAZ Postal and Courier page. I could not read the requirements list itself."
      },
      {
        "t": "Pay non-refundable application fee",
        "d": "US$250 for Postal General and International Courier; US$100 for Domestic Courier."
      },
      {
        "t": "Submit application to POTRAZ",
        "d": "A licensing procedure flowchart exists on the page but only as an image, so its steps are unconfirmed."
      },
      {
        "t": "Pay initial licence fee on award",
        "d": "Postal General $500,000; International Courier $50,000; Domestic Courier $10,000."
      },
      {
        "t": "Pay monthly turnover charges",
        "d": "2% annual licence fee plus 2% USF on gross turnover, due by the 10th of the following month. Indigenous firms pay in ZWL at the applicable rate."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=473"
      },
      {
        "t": "potraz.gov.zw",
        "u": "https://www.potraz.gov.zw/?page_id=577"
      }
    ],
    "stepsCheck": "The steps follow POTRAZ's current postal page (International courier US$50,000, Domestic US$10,000). The fees on this rule's card come from S.I. 110 of 2023 and use different categories. Ask POTRAZ which schedule applies before you pay anything. Requirements list and flowchart contents not read; no processing time, licence term or renewal info; no courier-specific contact."
  },
  {
    "id": "rbz-mm",
    "scope": "specific",
    "phase": "before",
    "reg": "RBZ",
    "tags": [
      "payments"
    ],
    "status": "official",
    "title": "Mobile money and money transmission",
    "headline": "Payment systems need recognition under the National Payment Systems Act. Mobile money providers count as financial institutions.",
    "summary": "If your product holds or moves customers' money, such as a wallet, remittance service or mobile banking, S.I. 80 of 2020 applies.",
    "facts": [
      {
        "label": "Law",
        "value": "Banking (Money Transmission, Mobile Banking and Mobile Money Interoperability) Regulations, 2020 (S.I. 80 of 2020), made under the Banking Act [Chapter 24:20]."
      },
      {
        "label": "Who must act",
        "value": "Mobile money providers are deemed financial institutions. Providers must obtain recognition of their payment system under section 3(1) of the National Payment Systems Act [Chapter 24:23]. Mobile network operators must also be licensed under the Postal and Telecommunication Act [Chapter 12:05]."
      },
      {
        "label": "Customer funds",
        "value": "Held in a bank account designated exclusively for mobile banking. No money may be transmitted without a matching correct bank balance."
      },
      {
        "label": "Interoperability",
        "value": "Connect to the national payment switch as the Reserve Bank directs in writing."
      },
      {
        "label": "Charges",
        "value": "No change to transaction charges without prior Reserve Bank approval."
      },
      {
        "label": "Reporting",
        "value": "Periodic returns. Audit report after six months of operation, then every year. The Reserve Bank gets read-only real-time access."
      },
      {
        "label": "Fees (2020)",
        "value": "ZWL 5,000 application and ZWL 300,000 annual."
      },
      {
        "label": "Penalty",
        "value": "A fine up to level 7, up to six months in prison, or both."
      }
    ],
    "note": "The fees are 2020 figures in ZWL and are probably out of date. Minimum capital is not in the regulation. Payment aggregators, payment service providers and agents are not named, so ask the Reserve Bank which route applies to you.",
    "sources": [
      {
        "t": "S.I. 80 of 2020 (RBZ copy)",
        "u": "https://www.rbz.co.zw/documents/nps/2021/SI-2020-080-Banking-Money-Transmission-Mobile-Banking-and-Mobile-Money-Interoperability-Regulations-2020.pdf"
      }
    ],
    "steps": [
      {
        "t": "Pick the RBZ licence type for your activity",
        "d": "Wallet and e-money issuers need a Mobile Money Provider licence; domestic transfers need a Money Transmission Provider licence, under the Banking (Money Transmission) Regulations 2020."
      },
      {
        "t": "Partner with a licensed Zimbabwean bank",
        "d": "RBZ requires a non-bank applicant to partner with a bank of its choice and submit the application through that bank."
      },
      {
        "t": "Compile the RBZ documents pack",
        "d": "Ownership structure, memorandum and articles, directors' net worth and police clearances, business plan, risk framework, AML/CFT policies, bank agreements, system architecture and pilot test results."
      },
      {
        "t": "Submit to RBZ and pay fees",
        "d": "Law-firm guides report a US$5,000 application fee and an annual fee of 2% of gross turnover capped at US$50,000. RBZ's own page gives no amounts."
      },
      {
        "t": "Do not pilot or launch before approval",
        "d": "RBZ says no pilot or live launch may happen without approval. One guide reports 3 to 6 months for approval, a segregated customer trust account, and connection to the national switch."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "afriwise.com",
        "u": "https://www.afriwise.com/blog/understanding-zimbabwes-new-licensing-regulations-for-money-transmission-mobile-banking-and-money-interoperability"
      },
      {
        "t": "regalert.today",
        "u": "https://regalert.today/guides/fintech/ZW"
      },
      {
        "t": "rbz.co.zw",
        "u": "https://www.rbz.co.zw/index.php/financial-markets/national-payment-system/approval-requirements"
      },
      {
        "t": "rbz.co.zw",
        "u": "https://www.rbz.co.zw/index.php/financial-markets/national-payment-system/legal-basis"
      }
    ],
    "stepsCheck": "RBZ has no mobile-money-specific page, form or fee schedule. Fees come from a law-firm blog. The US$5m capital figure on regalert is labelled for deposit-taking microfinance institutions and may not apply. The 3 to 6 month timeline is not tied to a licence type. I did not open S.I. 17 of 2025."
  },
  {
    "id": "fiu-vasp",
    "scope": "specific",
    "phase": "before",
    "reg": "FIU",
    "tags": [
      "crypto"
    ],
    "status": "official",
    "title": "Virtual asset service provider registration",
    "headline": "Crypto businesses must register with the FIU: US$500 for 12 months, and a Zimbabwe-incorporated entity is required.",
    "summary": "S.I. 99 of 2026 brought exchanges, transfer services and custody providers under anti-money-laundering rules. The FIU says registration is not permission to trade, so the Reserve Bank or SECZ may still need to authorise you.",
    "facts": [
      {
        "label": "Law",
        "value": "S.I. 99 of 2026: Money Laundering and Proceeds of Crime (Virtual Asset Service Providers Registration) Regulations, 2026, gazetted 10 June 2026."
      },
      {
        "label": "Who",
        "value": "Anyone providing services relating to virtual assets, including those who control a protocol or dApp. The applicant must be a Zimbabwe-incorporated entity; foreign groups need a local subsidiary (s4(3))."
      },
      {
        "label": "Fees",
        "value": "No application fee. Registration US$500 (covers 12 months). Renewal US$400. All non-refundable."
      },
      {
        "label": "Renewal",
        "value": "File within 90 days before expiry."
      },
      {
        "label": "Penalties in the SI",
        "value": "Up to US$50,000 for governance and residence breaches and for not reporting a material change. Up to US$10,000 for a knowingly false application, plus a 6-month bar on reapplying."
      },
      {
        "label": "Penalty in the Act",
        "value": "Operating unregistered: up to US$100,000 and/or 2 years (s3A(3), Money Laundering Act). Providers already operating could continue until 30 April 2026 (s3A(4)), which has passed."
      },
      {
        "label": "Still needed",
        "value": "The Reserve Bank, SECZ and others may need to authorise your business separately."
      }
    ],
    "note": "The SI has no commencement clause, so its effective date is not stated, and the text has drafting errors (a missing Third Schedule, wrong cross-references). The FIU's public notice could not be read. Fiat-only remittance does not clearly fall inside it.",
    "sources": [
      {
        "t": "S.I. 99 of 2026 (FIU)",
        "u": "https://www.fiu.co.zw/wp-content/uploads/2025/05/SI-99of2026MoneyLaundering.pdf"
      },
      {
        "t": "Money Laundering and Proceeds of Crime Act, consolidated (FIU)",
        "u": "https://www.fiu.co.zw/wp-content/uploads/2025/05/MLPCAct0924updated.pdf"
      },
      {
        "t": "GN Crypto on the FIU registration order",
        "u": "https://www.gncrypto.news/news/zimbabwe-fiu-orders-crypto-firms-register-aml-rules/"
      },
      {
        "t": "Herald: FIU moves to regulate virtual asset service providers",
        "u": "https://www.heraldonline.co.zw/fiu-moves-to-regulate-virtual-asset-service/"
      }
    ],
    "steps": [
      {
        "t": "Set up a Zimbabwean legal entity",
        "d": "The applicant must be incorporated in Zimbabwe, and foreign operators need a local subsidiary. Plan for two resident directors, a resident compliance officer and a registered place of business."
      },
      {
        "t": "Compile the FIU application pack",
        "d": "Incorporation documents, IDs and police clearances for owners and directors, ownership chart, tax clearance, risk assessment, AML/CFT policies, and cybersecurity and data protection policies."
      },
      {
        "t": "Submit to the FIU under s.4",
        "d": "There is no application fee. The FIU decides within 90 days of a complete application. False information can lead to a six-month bar on reapplying."
      },
      {
        "t": "Pay the registration fee on approval",
        "d": "Fee capped at US$500, non-refundable. You receive a registration number, a certificate and a public register entry. The FIU may attach conditions."
      },
      {
        "t": "Operate under the registration conditions",
        "d": "Display the certificate, with a QR code on digital platforms. Notify material changes within 48 hours. Renew within 90 days before the one-year expiry (US$400). Apply the Travel Rule."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "mmmlawfirm.co.zw",
        "u": "https://www.mmmlawfirm.co.zw/zimbabwe-regulates-virtual-asset-service-providers-key-implications-of-s-i-99-of-2026-for-businesses-investors-and-fintech-operators/"
      },
      {
        "t": "cryptoverselawyers.io",
        "u": "https://www.cryptoverselawyers.io/zimbabwe-crypto-regulation-si-99-2026-guide/"
      },
      {
        "t": "gncrypto.news",
        "u": "https://www.gncrypto.news/news/zimbabwe-fiu-orders-crypto-firms-register-aml-rules/"
      },
      {
        "t": "lexafrica.com",
        "u": "https://lexafrica.com/2026/09/virtual-assets-tokenised-securities-and-crypto-asset-service-providersexamining-zimbabwes-emerging-regulatory-framework/"
      }
    ],
    "stepsCheck": "I did not open the S.I. text. fiu.co.zw failed to load, so no portal, form or address was found. Reports say the FIU gave no compliance deadline. Registration is for AML/CFT only. SECZ licensing may also apply (Part VA, SI 63 of 2026)."
  },
  {
    "id": "secz-sandbox",
    "scope": "specific",
    "phase": "watch",
    "reg": "SECZ",
    "tags": [
      "investment",
      "crypto"
    ],
    "status": "reported",
    "title": "SECZ regulatory sandbox for investment and tokenization",
    "headline": "Seven firms were admitted on a public notice dated 27 July 2026.",
    "summary": "The sandbox lets approved solutions test within set limits. Admission does not promise a full licence.",
    "facts": [
      {
        "label": "Admitted",
        "value": "Zimbabwe Entrepreneurship Exchange (blockchain capital raising), Ndarama Standard (tokenization), Questview Brokers (synthetic trading), Crowdaxe Capital (crowdfunding), Procode Platforms, FINSEC and Colmin Resources (tokenization)."
      },
      {
        "label": "Limits",
        "value": "Participation is limited to testing approved solutions within defined parameters."
      },
      {
        "label": "Licence",
        "value": "Admission does not guarantee a path to a full operating licence."
      },
      {
        "label": "Guidelines",
        "value": "SECZ publishes sandbox guidelines on its website (seczim.co.zw)."
      }
    ],
    "note": "Outlets disagree on how many of the seven focus on tokenization. Eligibility rules and legal basis were not read. Check the SECZ notice.",
    "sources": [
      {
        "t": "Fintech Garden on the SECZ sandbox",
        "u": "https://fintech.garden/news/2026-07-28-zimbabwes-securities-regulator-admits-seven-fintechs-to-sandbox-with-tokenizatio/"
      },
      {
        "t": "Sumsub on the SECZ sandbox",
        "u": "https://sumsub.com/media/news/zimbabwe-approves-seven-fintechs-for-regulatory-sandbox/"
      }
    ],
    "steps": [
      {
        "t": "Check fit with SECZ Regulatory Sandbox Guidelines",
        "d": "The sandbox is a controlled, supervised, timed test of innovative products. Tokenisation, crowdfunding and synthetic trading firms were admitted in July 2026."
      },
      {
        "t": "Complete the online SECZ Regulatory Sandbox Form",
        "d": "Four sections: contact, company profile (turnover, staff, shareholders), the service and its risks, and any financial institution partner. Upload a PDF business plan."
      },
      {
        "t": "Query the fintech team if needed",
        "d": "The SECZ notice lists fintech@seczim.co.zw and +263 242 870042-6 for contact."
      },
      {
        "t": "Test only within approved parameters",
        "d": "Approved participants test under SECZ oversight and monitoring, and SECZ may issue further directives. Admission is announced in a public notice."
      },
      {
        "t": "Register before going commercial",
        "d": "A news report says participants must still meet SECZ registration requirements, and that passing the test does not guarantee registration."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "seczim.co.zw",
        "u": "https://seczim.co.zw/innovation-hub-form/"
      },
      {
        "t": "seczim.co.zw",
        "u": "https://seczim.co.zw/public-notice-on-regulatory-sandbox-approved-participants/"
      },
      {
        "t": "seczim.co.zw",
        "u": "https://seczim.co.zw/wp-content/uploads/2026/07/Public-Notice-on-Regulatory-Sandbox-Approved-Participants.pdf"
      },
      {
        "t": "cointelegraph.com",
        "u": "https://cointelegraph.com/news/zimbabwe-seven-fintech-projects-regulatory-sandbox"
      },
      {
        "t": "seczim.co.zw",
        "u": "https://www.seczim.co.zw"
      }
    ],
    "stepsCheck": "The Guidelines PDF was not found, so eligibility criteria, fees, decision time and test duration are unknown. The form page gives no post-submission steps. Whether this form is the sandbox entry point is inferred from the page title."
  },
  {
    "id": "ipec",
    "scope": "specific",
    "phase": "before",
    "reg": "IPEC",
    "tags": [
      "insurtech"
    ],
    "status": "official",
    "title": "Register with IPEC to sell insurance or run a pension scheme",
    "headline": "The IPEC Amendment Act, 2026 is in force (24 April 2026), and brokers must now be registered and supervised.",
    "summary": "IPEC's Circular 13 of 2026 says the Amendment Act (Act No. 2 of 2026) took effect on 24 April 2026. IPEC publishes licensing checklists for insurers, brokers and agents, an online portal and a regulatory sandbox you can apply to join.",
    "facts": [
      {
        "label": "In force",
        "value": "Insurance and Pensions Commission Amendment Act, 2026 (Act No. 2 of 2026): gazetted and effective 24 April 2026. IPEC says transition guidance is to follow."
      },
      {
        "label": "Who IPEC registers",
        "value": "Insurers, mutual insurance societies, brokers, medical aid societies (regulated for the first time) and pension and provident funds. It may approve actuaries, asset managers, credit rating agencies and other service providers."
      },
      {
        "label": "Your route",
        "value": "IPEC's 2026 licensing checklists cover insurers and brokers, with separate lists for individual and corporate agents. No insurtech-specific category was found."
      },
      {
        "label": "Sandbox",
        "value": "Business Times reported an IPEC regulatory sandbox on 16 May 2026, described as a controlled and supervised environment. Eligibility was behind a paywall."
      },
      {
        "label": "Ownership",
        "value": "A control threshold of 10% of shares or voting rights, or the power to appoint directors."
      },
      {
        "label": "Offences",
        "value": "Failing to give IPEC requested information: up to level 7 and/or 2 years. Brokers must give 14 days' notice before disposing of registered assets."
      },
      {
        "label": "Related",
        "value": "S.I. 44 of 2026 (effective 27 February 2026) amends the Insurance Regulations with new board rules for insurers and brokers (reported)."
      }
    ],
    "note": "The Act does not mention insurtech or digital distribution. IPEC fees and processing times were not checked because the checklist PDFs were not opened.",
    "sources": [
      {
        "t": "IPEC Circular 13 of 2026",
        "u": "https://ipec.co.zw/wp-content/uploads/2026/05/CIRCULAR-13-0F-2026-IPEC-AMENDMENT-ACT.pdf"
      },
      {
        "t": "IPEC Amendment Act No. 2 of 2026",
        "u": "https://ipec.co.zw/wp-content/uploads/2026/05/Act-No.-2-2026-Insurance-Pensions-Commission-Amendment.pdf"
      },
      {
        "t": "IPEC licensing requirements",
        "u": "https://ipec.co.zw/licensing-requirements/"
      },
      {
        "t": "MMM Law on the IPEC Amendment Act 2026",
        "u": "https://www.mmmlawfirm.co.zw/key-amendments-introduced-by-the-insurance-and-pensions-commission-amendment-act-2026/"
      },
      {
        "t": "Business Times on the IPEC sandbox",
        "u": "https://businesstimes.co.zw/ipec-launches-regulatory-sandbox-for-insurance-sector/"
      }
    ],
    "steps": [
      {
        "t": "Clear your company name with IPEC first",
        "d": "The checklist says to clear the name before registering the company with the Registrar of Companies."
      },
      {
        "t": "Pay the application fee, then apply online",
        "d": "US$ fees by class: broker 552, short-term insurer 600, microinsurer 230, life 522, multiple agent 322. Submit via IPEC's Online License Application portal."
      },
      {
        "t": "Submit the checklist pack",
        "d": "Incorporation documents, capital proof (broker or microinsurer US$100,000; short-term US$750,000; life US$2m), shareholder and director clearances, a business plan, and manuals. Any 'No' on the checklist means not ready."
      },
      {
        "t": "Pay the registration fee on approval",
        "d": "Brokers pay US$5,522 and microinsurers US$1,472. IPEC sets no processing time. Individual agents pay US$138 and need A-level or a diploma."
      },
      {
        "t": "For a pension fund, apply to the Commissioner",
        "d": "Use the prescribed form with two copies of the fund rules. Provisional registration lasts at most six months, and full registration brings a certificate and endorsed rules."
      },
      {
        "t": "Optionally apply to the IPEC sandbox",
        "d": "Apply through the portal on ipec.co.zw. Cohort Two ran 13 May to 30 June 2026, so wait for a new window."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "ipec.co.zw",
        "u": "https://www.ipec.co.zw"
      },
      {
        "t": "ipec.co.zw",
        "u": "https://ipec.co.zw/licensing-requirements/"
      },
      {
        "t": "ipec.co.zw",
        "u": "https://ipec.co.zw/wp-content/uploads/2023/11/2023-UPDATED-LICENCING-CHECKLIST-FOR-INSURERS-approved.pdf"
      },
      {
        "t": "ipec.co.zw",
        "u": "https://ipec.co.zw/licensing-requirements-2/"
      },
      {
        "t": "ipec.co.zw",
        "u": "https://ipec.co.zw/wp-content/uploads/2024/01/2024-INDIVIDUAL-AGENT-REGISTRATION-REQUIREMENTS-.pdf"
      },
      {
        "t": "fsdafrica.org",
        "u": "https://fsdafrica.org/fsd-africa-supports-insurance-and-pensions-commission-of-zimbamwe-launch-a-regulatory-sandbox/"
      }
    ],
    "stepsCheck": "The checklist opened is the 2023 version, and the page lists a 2026 one that I did not open, so fees and capital may have changed. Pension fund fees (S.I. 22 of 2016) were not stated. The sandbox guidelines were too long to fetch. Sandbox duration, fees and the portal steps are unknown. The sandbox timing comes from FSD Africa, which is not the regulator."
  },
  {
    "id": "ehailing",
    "scope": "specific",
    "phase": "watch",
    "reg": "TRANSPORT",
    "tags": [
      "ridehailing"
    ],
    "status": "reported",
    "title": "E-hailing: rules are being written",
    "headline": "Government says current law has no provision for e-hailing, and a five-month moratorium was reported on 8 Sep 2026.",
    "summary": "Ride-hailing sits in a gap. Expect new registration, safety standards and fees, and watch for the interim statutory instrument.",
    "facts": [
      {
        "label": "19 Aug 2026",
        "value": "The Transport Minister told Parliament there is no provision for e-hailing in the Road Motor Transportation Act and that the Ministry is preparing a statutory instrument (Hansard)."
      },
      {
        "label": "Early Sept 2026",
        "value": "Cabinet was reported to have approved \"Interim Transitional Measures\" including a five-month moratorium on regulating e-hailing. The reports give no start or end date and no fee amounts."
      },
      {
        "label": "Platforms",
        "value": "Expected to register with ZIMRA. Operators already tax-registered must regularise that registration. A self-regulatory safety framework is to be developed and the Transport Ministry is to draft regulations."
      },
      {
        "label": "Drivers",
        "value": "The head of the Passengers Association of Zimbabwe says vehicles need a certificate of fitness, a route permit and passenger liability cover. This is his statement, not a new rule."
      },
      {
        "label": "City councils",
        "value": "Harare says its by-laws do not cover e-hailing and is consulting on a framework (13 Aug 2026). Harare City Council arrests were reported the same day; one driver said he was fined US$172."
      }
    ],
    "note": "No instrument had been gazetted when we last looked (2 November 2026). It is unclear whether the moratorium pauses enforcement. A commentator quoted by Nehanda Radio says there is no e-hailing permit category, and that reading has not been tested in court.",
    "sources": [
      {
        "t": "Parliament Hansard, 19 Aug 2026",
        "u": "https://e-portal.parlzim.gov.zw/files/HAN-1787170543682.pdf"
      },
      {
        "t": "allAfrica on the Cabinet measures",
        "u": "https://allafrica.com/stories/202609090100.html"
      },
      {
        "t": "City of Harare consultation (Zimbabwe Situation)",
        "u": "https://www.zimbabwesituation.com/news/city-of-harare-starts-public-consultations-on-indrive-regulation/"
      },
      {
        "t": "CITE on e-hailing regulation (20 Aug 2026)",
        "u": "https://cite.org.zw/zimbabwe-moves-to-regulate-e-hailing-services-amid-revenue-concerns/"
      },
      {
        "t": "The Zimbabwean on the e-hailing moratorium (Sep 2026)",
        "u": "https://www.thezimbabwean.co/2026/09/govt-grants-e-hailing-sector-five-month-moratorium/"
      },
      {
        "t": "Nehanda Radio on taxes and arrests (13 Aug 2026)",
        "u": "https://nehandaradio.com/2026/08/13/zimbabwe-taxes-indrive-and-bolt-but-drivers-face-arrests-in-e-hailing-crackdown/"
      }
    ],
    "steps": [
      {
        "t": "Register the business with ZIMRA",
        "d": "Cabinet's 8 Sept 2026 decision requires e-hailing businesses to register with ZIMRA. Those already registered for tax must regularise their position."
      },
      {
        "t": "Operate under the five-month transition",
        "d": "Bolt, InDrive, Tap & Go and others get a five-month moratorium with a self-regulatory framework for operators and drivers. No dedicated e-hailing law exists yet."
      },
      {
        "t": "Join the Transport Ministry consultation",
        "d": "The ministry must draft e-hailing regulations with industry, covering platform registration, driver conduct, passenger safety and tax. Expect new rules after the five months."
      },
      {
        "t": "Check whether an operator licence is needed",
        "d": "The existing Road Motor Transportation framework was built for route-based transport. Reports do not say whether e-hailing needs the SI 6 of 2026 licence (US$125 for three years)."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "equityaxis.net",
        "u": "https://equityaxis.net/post/19447/2026/9/zimbabwe-gives-indrive-tap-go-and-bolt-five-months-to-build-a-sustainable-ride-hailing-model"
      },
      {
        "t": "cite.org.zw",
        "u": "https://cite.org.zw/?p=65075"
      }
    ],
    "stepsCheck": "No official Cabinet or Ministry text was opened. Moratorium start date, driver-level requirements and licence status are unconfirmed. The Herald and Innovation Village pages failed to load."
  },
  {
    "id": "dswt",
    "scope": "specific",
    "phase": "running",
    "reg": "ZIMRA",
    "tags": [
      "ridehailing",
      "platform"
    ],
    "status": "reported",
    "title": "Digital Services Withholding Tax",
    "headline": "15.5% where a foreign digital supplier is not VAT-registered in Zimbabwe, from 1 Jan 2026.",
    "summary": "ZIMRA guidance reportedly names platform-based transport hailing among covered services. It matters if your platform, or a platform you depend on, is foreign-operated.",
    "facts": [
      {
        "label": "Effective",
        "value": "1 January 2026."
      },
      {
        "label": "Rate",
        "value": "15.5% where the foreign supplier is not VAT-registered in Zimbabwe."
      },
      {
        "label": "Covered",
        "value": "ZIMRA guidance names platform-based transport hailing services."
      }
    ],
    "note": "Reported by one outlet. Read ZIMRA's guidance for what counts as a covered digital service.",
    "sources": [
      {
        "t": "Nehanda Radio on taxes and arrests (13 Aug 2026)",
        "u": "https://nehandaradio.com/2026/08/13/zimbabwe-taxes-indrive-and-bolt-but-drivers-face-arrests-in-e-hailing-crackdown/"
      }
    ],
    "steps": [
      {
        "t": "Work out whether you are a foreign digital seller, a local seller or an intermediary",
        "d": "From 1 Jan 2026 (Finance Act, VAT Act s13A) intermediaries such as banks and mobile money operators withhold on payments to foreign digital suppliers; payments to local providers are exempt."
      },
      {
        "t": "Non-resident sellers over USD 25,000 in 12 months register for VAT",
        "d": "Registration is on ZIMRA's TaRMS portal: Taxpayer profile, New Tax Type, VAT. It needs a TIN, sales schedule, bank statement and a public officer letter. Collect VAT at 15.5%."
      },
      {
        "t": "Get onboarded to fiscalisation and issue fiscalised invoices",
        "d": "VAT-registered non-resident suppliers must issue fiscalised tax invoices and join the Fiscalisation Data Management System."
      },
      {
        "t": "If not VAT-registered, expect 15.5% withheld at payment",
        "d": "Banks withhold 15.5% when the foreign seller is not VAT-registered, or 3/23 if registered. Registered sellers credit withheld amounts against VAT."
      },
      {
        "t": "Intermediaries remit to ZIMRA and issue withholding certificates",
        "d": "Intermediaries remit to the Commissioner-General, keep payment records and cooperate with verification; ZIMRA reconciles VAT returns against withholdings."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "kpmg.com",
        "u": "https://kpmg.com/us/en/taxnewsflash/news/2026/01/tnf-zimbabwe-digital-services-withholding-in-lieu-of-nonresident-vat-collection.html"
      },
      {
        "t": "fonoa.com",
        "u": "https://fonoa.com/resources/blog/zimbabwe-vat-dswt-non-resident-digital-services"
      },
      {
        "t": "zimra.co.zw",
        "u": "https://www.zimra.co.zw/domestic-taxes/vat/vat-registration"
      },
      {
        "t": "firstcapitalbank.co.zw",
        "u": "https://www.firstcapitalbank.co.zw/frequently-asked-questions-digital-services-withholding-tax/"
      },
      {
        "t": "businesstimes.co.zw",
        "u": "https://businesstimes.co.zw/digital-tax-in-zimbabwe-source-based-taxation-in-the-platform-economy/"
      }
    ],
    "stepsCheck": "Some figures come from press reports of ZIMRA Public Notice 05 of 2026, which was not found on zimra.co.zw. Treat deadlines as unconfirmed. ZIMRA Public Notice 05 of 2026 itself was not found on zimra.co.zw, so the withholding remittance deadline, intermediary registration process and VAT return due dates are unconfirmed. Business Times separately reports a 5% s12A tax on non-resident e-commerce operators with a representative taxpayer, payable quarterly; not verified officially."
  },
  {
    "id": "drones",
    "scope": "specific",
    "phase": "before",
    "reg": "CAAZ",
    "tags": [
      "drones"
    ],
    "status": "verify",
    "title": "Drones: CAAZ clearance and ZIMRA import rules",
    "headline": "Drones need CAAZ registration and clearance, and are cleared through ZIMRA on import.",
    "summary": "Commercial drone operators deal with the Civil Aviation Authority first, then customs. Broadcast drones need extra permits.",
    "facts": [
      {
        "label": "Law",
        "value": "Civil Aviation (Remotely Piloted Aircraft) Regulations, S.I. 271 of 2018. CAAZ's registration page says you apply for a letter of approval before registering. Fees are \"in the Second Schedule\" (CA Form 520 for the fee)."
      },
      {
        "label": "Scope",
        "value": "CAAZ's page limits use to personal, private, non-commercial purposes, so commercial operators should ask CAAZ what extra approval applies."
      },
      {
        "label": "Fee (2019 report)",
        "value": "Techzim reported a US$50 licence and renewal fee, 2-year validity and a minimum age of 18 in January 2019. This may be out of date."
      },
      {
        "label": "Also reported",
        "value": "A volunteer site says insurance is required and flights are banned within five kilometres of an airport."
      },
      {
        "label": "ZIMRA import",
        "value": "Bill of Entry Form 21 through a registered clearing agent. Form 49 may be used under US$1,000. A CAAZ clearance letter is required. Permits from BAZ and POTRAZ are listed for broadcasting drones."
      }
    ],
    "note": "The CAAZ regulation text was not read, so licence categories and current fees are unconfirmed, and CAAZ's site was reported as unreliable. ZIMRA's page frames the CAAZ licence as a question. Confirm with CAAZ directly.",
    "sources": [
      {
        "t": "CAAZ drone registration",
        "u": "https://www.caaz.co.zw/drone-registration/"
      },
      {
        "t": "CAAZ RPAS registration page",
        "u": "https://www.caaz.co.zw/?p=4212"
      },
      {
        "t": "ZIMRA on importing drones",
        "u": "https://zimra.co.zw/news/2207-importation-of-drones"
      },
      {
        "t": "drone-laws.com (volunteer site)",
        "u": "https://drone-laws.com/drone-laws-in-zimbabwe/"
      }
    ],
    "steps": [
      {
        "t": "Get CAAZ letter of approval before registering",
        "d": "CAAZ says no drone may be registered without a written approval application, with the SI 271 of 2018 fee. Documents: certified passport or ID, and proof of ownership, hire, lease or partnership."
      },
      {
        "t": "Register the drone using CA Form 520",
        "d": "Form 520 is for individuals. It limits use to private, non-commercial flying. Email pr@caaz.co.zw or post to P Bag CY 7716, Causeway, Harare. A drone must be registered before it flies."
      },
      {
        "t": "Commercial or BVLOS use: seek separate CAAZ approval",
        "d": "One reported delivery operator took six months: documentation and risk-assessment review, ATS engagement, demonstration flights, then an ops-spec amendment for BVLOS. No official checklist was found."
      },
      {
        "t": "Get a remote pilot licence",
        "d": "Reported 2019: about US$50 to issue or renew, valid two years, minimum age 18, flight logbook required. Check current fees with CAAZ."
      },
      {
        "t": "Clear imports with ZIMRA using the CAAZ clearance letter",
        "d": "Give CAAZ the make, model and serial number. Commercial imports use Bill of Entry Form 21 via a clearing agent (Form 49 if under US$1,000). Private imports clear at Customs counters. Invoice required."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "caaz.co.zw",
        "u": "https://www.caaz.co.zw/drone-registration/"
      },
      {
        "t": "caaz.co.zw",
        "u": "https://www.caaz.co.zw/?p=4212"
      },
      {
        "t": "zimra.co.zw",
        "u": "https://www.zimra.co.zw/news/2207:importation-of-drones"
      },
      {
        "t": "techzim.co.zw",
        "u": "https://techzim.co.zw/here-is-the-cost-of-a-drone-license-minimum-age-to-operate-one-and-other-rules-for-drones-in-zim/?amp=1"
      },
      {
        "t": "suasnews.com",
        "u": "https://www.suasnews.com/2026/09/drone-solutions-secures-caaz-approval-for-kite-drone-deliveries-in-zimbabwe/"
      }
    ],
    "stepsCheck": "CAAZ flight-permits page says 'Website coming soon'. Fee amounts, the applicant checklist, commercial operator permit steps and timelines are not published. Pilot licence details come from a 2019 article."
  },
  {
    "id": "cpa",
    "scope": "specific",
    "phase": "running",
    "reg": "CONSUMER",
    "tags": [
      "ecommerce",
      "platform"
    ],
    "status": "reported",
    "title": "Consumer Protection Act duties for online sellers",
    "headline": "Online sellers must disclose who they are and the full price, and buyers can cancel an electronic transaction and get a refund within 14 days.",
    "summary": "The Consumer Protection Act, 2019 [Chapter 14:44] applies to online shops. Build disclosure, a secure payment system, the cooling-off right and an unsubscribe option into your checkout and marketing.",
    "facts": [
      {
        "label": "Disclosure (s52)",
        "value": "Online sellers must disclose their identity and the full price and use a secure payment system. If they do not, the consumer can cancel within 7 days."
      },
      {
        "label": "Cooling-off (s53)",
        "value": "A right to cancel any electronic transaction, with a refund within 14 days."
      },
      {
        "label": "Advertised price (s26(5))",
        "value": "A consumer shall not pay more than the advertised or displayed price, including taxes and levies. Exceptions: prices fixed by law, a price hidden behind a second price, or an erroneous price the supplier tried to correct."
      },
      {
        "label": "Marketing (s54)",
        "value": "Unsolicited electronic commercial messages must offer an unsubscribe option and disclose where you got the recipient's data. Do not message anyone who has objected. Offence: up to level 5 or 6 months. It is an opt-out rule, not a prior opt-in."
      },
      {
        "label": "False claims (ss31, 36)",
        "value": "Misleading trade descriptions and false representations are prohibited; knowing misrepresentation carries up to level 14 or 6 months."
      },
      {
        "label": "Advertising",
        "value": "The Advertising Standards Authority of Zimbabwe is a self-regulatory body working from a 1994 code. No statutory online-ad or influencer rule was found."
      }
    ],
    "note": "An earlier 2022 law-firm note gave a flat 7-day cooling-off under sections 52 to 54; the Act text as summarised here splits it between ss52 and 53. Check the sections against the Act. Remedies and the Consumer Protection Commission's powers were not covered.",
    "sources": [
      {
        "t": "Consumer Protection Act, 2019 (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/2019/5/eng@2019-12-10"
      },
      {
        "t": "Mondaq: consumer protection guide for online shops (2022)",
        "u": "https://www.mondaq.com/dodd-frank-consumer-protection-act/1152768/consumer-protection-a-guide-for-online-shops-and-e-commerce-in-zimbabwe"
      }
    ],
    "steps": [
      {
        "t": "Confirm the Act covers you",
        "d": "Consumer Protection Act [Chapter 14:44] covers promotion and supply in Zimbabwe whether the supplier is local or foreign (s3). Online and electronic sellers are included."
      },
      {
        "t": "Show prices including all taxes and levies",
        "d": "Every item must display a price, you cannot charge more than displayed, and displayed prices must include taxes and levies (s26)."
      },
      {
        "t": "Describe goods accurately and give written terms",
        "d": "No misleading descriptions (ss31, 36); give a free copy or electronic access to terms and an itemised cost breakdown (s44(2)); sales records need your name, VAT number, address (s32)."
      },
      {
        "t": "Offer a cooling-off right on direct-marketing sales",
        "d": "Consumers may rescind within five business days without reason or penalty; refund within fifteen business days (s25(3)-(4)). Listed exclusions apply."
      },
      {
        "t": "Drop 'no refund' disclaimers; provide marketing opt-out",
        "d": "Disclaimers such as no refunds or no returns are unlawful (s42); consumers can stop direct marketing (ss49-50). Complaints go to the Consumer Protection Commission (s6)."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2019/5"
      },
      {
        "t": "mondaq.com",
        "u": "https://www.mondaq.com/dodd-frank-consumer-protection-act/1152768/consumer-protection-a-guide-for-online-shops-and-e-commerce-in-zimbabwe"
      }
    ],
    "stepsCheck": "The steps say a five business day cooling-off on direct-marketing sales (s25(3)). The card above says 14 days (s53), and one law-firm guide says 7. The Act's text and its later amendments disagree across sources, so check the current wording. ZimLII text was only read to s51, so enforcement, compliance notices and offences were not seen. No seller registration or fee found. A Mondaq guide cites a 7-day cooling-off under Chapter 14:14; the ZimLII Act text says five business days, so check the current text."
  },
  {
    "id": "zimra-reg",
    "scope": "general",
    "phase": "before",
    "reg": "ZIMRA",
    "tags": [],
    "status": "official",
    "title": "Register with ZIMRA and set up your tax calendar",
    "headline": "Get a Taxpayer Identification Number on the self-service portal before you trade.",
    "summary": "All individuals, companies, partnerships and cooperatives starting a business must register. VAT starts once turnover passes US$25,000.",
    "facts": [
      {
        "label": "Register",
        "value": "mytaxselfservice.zimra.co.zw. You receive a Taxpayer Identification Number (TIN)."
      },
      {
        "label": "Annual return",
        "value": "Self-assessment returns by 30 April of the following year."
      },
      {
        "label": "Provisional tax",
        "value": "25 March (10%), 25 June (25%), 25 September (30%), 20 December (35%)."
      },
      {
        "label": "VAT",
        "value": "Register if annual taxable turnover exceeds, or is likely to exceed, US$25,000 or the ZiG equivalent."
      },
      {
        "label": "PAYE",
        "value": "Apply within 14 days of becoming an employer."
      },
      {
        "label": "Records",
        "value": "Keep them for at least six years."
      }
    ],
    "note": "ZIMRA's page is undated and thresholds may have changed.",
    "sources": [
      {
        "t": "ZIMRA: requirements for new businesses",
        "u": "https://zimra.co.zw/domestic-taxes/corporate/new-businesses"
      }
    ],
    "steps": [
      {
        "t": "Sign up on ZIMRA's Self Service Portal",
        "d": "Go to mytaxselfservice.zimra.co.zw, click Sign Up, enter your details, activate via the emailed link, and log in with the verification code."
      },
      {
        "t": "Register as an Organisation and attach documents",
        "d": "Fill in the forms, upload the supporting documents and submit. A ZIMRA official reviews it. If approved, you receive your TIN."
      },
      {
        "t": "Select your ZIMRA Single Account bank",
        "d": "You must hold an account at the bank you choose. The TIN then unlocks e-filing, e-payments and automated tax clearance."
      },
      {
        "t": "Register for VAT and PAYE if they apply",
        "d": "VAT is required once taxable turnover is, or is likely to be, over US$25,000 (apply on TaRMS). Register as an employer for PAYE within 14 days of hiring."
      },
      {
        "t": "Diarise filing dates",
        "d": "Provisional tax (ITF 12B) is due 25 Mar, 25 Jun, 25 Sep and 20 Dec. The annual return is due 30 Apr. VAT is due the 25th of the following month. PAYE is due within 10 days of month-end. ITF 16 is due within 30 days of year-end."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimra.co.zw",
        "u": "https://www.zimra.co.zw/domestic-taxes/corporate/new-businesses"
      },
      {
        "t": "zimra.co.zw",
        "u": "https://zimra.co.zw/news/2346-taxpayer-registration"
      }
    ],
    "stepsCheck": "ZIMRA's pages do not list the documents to attach. No registration fee or approval timeline stated. The page says to keep records for 6 years."
  },
  {
    "id": "company-reg",
    "scope": "general",
    "phase": "before",
    "reg": "REGISTRAR",
    "tags": [],
    "status": "verify",
    "title": "Register your company",
    "headline": "Name search, then incorporation papers. Allow up to two weeks after the name is cleared.",
    "summary": "Most startups register a private limited company with the Registrar of Companies and Other Business Entities.",
    "facts": [
      {
        "label": "Entity types",
        "value": "Public limited, private limited, company limited by guarantee, co-operative, foreign company, private business corporation, and partnerships and similar groups."
      },
      {
        "label": "Private limited",
        "value": "One source gives a limit of 50 shareholders."
      },
      {
        "label": "Name",
        "value": "A name search costs a prescribed fee and takes three to six working days. A reserved name is held for up to one month."
      },
      {
        "label": "Papers",
        "value": "Memorandum and articles of association signed by the shareholders in handwriting, a list of directors and notice of the company's address."
      },
      {
        "label": "Result",
        "value": "Registration takes up to two weeks. You receive a certificate of incorporation."
      },
      {
        "label": "Beneficial owners",
        "value": "A 2024 opinion piece says companies must keep a beneficial ownership register at a 20% threshold, file Form CR16, keep it with a Zimbabwe-resident nominee, and report changes within 7 days. Failure: a fine up to level 14, up to 5 years in prison, or both."
      },
      {
        "label": "Registry name",
        "value": "A 2021 notice made the registry the Companies and Intellectual Property Office. Its current name was not confirmed."
      },
      {
        "label": "Online",
        "value": "The Registrar has an online portal (named in a May 2025 article, no URL). Current fees were not found; the only figures are 2019 old-Act fees (US$5 name reservation, US$140 incorporation)."
      }
    ],
    "note": "Sources are law-firm guides and opinion pieces. They disagree on private business corporation member limits (under 20, or 1 to 20), and on re-registration deadlines (31 Dec 2024, or 20 April 2026 under S.I. 108 of 2025). Current fees and online steps were not confirmed.",
    "sources": [
      {
        "t": "MMM Law on company registration (2022)",
        "u": "https://www.mmmlawfirm.co.zw/company-registrations-in-zimbabwe/"
      },
      {
        "t": "Cliffe Dekker Hofmeyr guide to setting up a company",
        "u": "https://www.cliffedekkerhofmeyr.com/guides/africa-corporate/zimbabwe/incorporation-process/what-is-the-process-of-setting-up-a-company.html"
      },
      {
        "t": "Business Times on beneficial ownership",
        "u": "https://businesstimes.co.zw/regulation-of-beneficial-ownership-in-zimbabwe/"
      },
      {
        "t": "Mondaq on the merged Companies and IP office",
        "u": "https://www.mondaq.com/trademark/1139954/zimbabwe-ip-office-joined-with-companies-office-becomes-autonomous"
      }
    ],
    "steps": [
      {
        "t": "Reserve a company name with the Registrar",
        "d": "Submit up to four names in order of preference (Form CR21 per Healy). The Registrar can hold a name for up to one month (COBE Act s.25)."
      },
      {
        "t": "Draft the Memorandum and Articles of Association",
        "d": "These set out the company's objects. The company needs a registered office at a physical address in Zimbabwe, plus a postal address (s.31)."
      },
      {
        "t": "File M&AA with Forms CR14 and CR6",
        "d": "CR14 lists directors and the secretary (ID, DOB, address). CR6 gives the physical address. Filing is electronic (registered user) or manual (s.18)."
      },
      {
        "t": "Collect the Certificate of Incorporation",
        "d": "The Registrar assigns the registration number. Incorporation takes effect on the certificate date (s.19). DLA Piper's 2019 guide quotes 3-5 days."
      },
      {
        "t": "Record and file beneficial owners",
        "d": "Keep a beneficial owner register (s.72) and file Form CR16. Per Business Times, report changes within 7 days. A Zimbabwe-resident person must maintain the register."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "dlapiperafrica.com",
        "u": "https://www.dlapiperafrica.com/en/zimbabwe/insights/2019/setting-up-a-company-in-zimbabwe.html"
      },
      {
        "t": "healyconsultants.com",
        "u": "https://www.healyconsultants.com/zimbabwe-company-registration/incorporation-steps/"
      },
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2019/4"
      },
      {
        "t": "businesstimes.co.zw",
        "u": "https://businesstimes.co.zw/regulation-of-beneficial-ownership-in-zimbabwe/"
      },
      {
        "t": "lexafrica.com",
        "u": "https://lexafrica.com/2024/09/zimbabwean-companies-obliged-to-re-register-under-new-electronic-filing-system/"
      }
    ],
    "stepsCheck": "Fees quoted online (US$5 reservation, US$140 incorporation) date from 2019. The beneficial-owner threshold appears as both 'more than 20%' and 'at least 20%'. No official registry page or portal URL found. Fees are from a 2019 article (US$5 reservation, US$140 incorporation) and may be outdated. CR16 and the 7-day deadline come from an opinion article, and ss.72-73 text was not read. Beneficial-owner threshold is stated as more than 20% (ZimLII) and at least 20% (Business Times). Re-registration of pre-2019 companies is mentioned, but its deadline was not found."
  },
  {
    "id": "nssa",
    "reg": "NSSA",
    "scope": "general",
    "phase": "running",
    "tags": [],
    "status": "official",
    "title": "Register with NSSA when you hire",
    "headline": "Registering as an employer brings your staff into both NSSA schemes. The pension rate is 4.5% from you and 4.5% from each employee.",
    "summary": "As soon as you take on an employee you register on the NSSA self-service portal and pay monthly. Domestic workers and non-resident foreign nationals are excluded from the pension scheme.",
    "facts": [
      {
        "label": "Register",
        "value": "Employers register through NSSA's self-service portal."
      },
      {
        "label": "Pension (POBS)",
        "value": "4.5% employer plus 4.5% employee, on insurable earnings, for workers aged 16 to under 65. Compulsory even if the employee has a private scheme."
      },
      {
        "label": "Earnings ceiling",
        "value": "US$700 a month, payable in ZiG at the interbank rate (S.I. 99 of 2024). NSSA says the figure is gazetted quarterly."
      },
      {
        "label": "Workers' compensation",
        "value": "Employer-only premium on the whole wage bill, covering workers over 16. The rate depends on the industry and is gazetted yearly (farming is shown at 1.38%)."
      },
      {
        "label": "Filing",
        "value": "The P4 is e-filed monthly. Contributions fall due in the month wages are paid."
      },
      {
        "label": "Penalties",
        "value": "NSSA says employers cannot recover penalties or interest from employees. No rates were found."
      }
    ],
    "note": "The ceiling may have changed in 2026; we could not confirm. The payment due date and late-payment rates were not found.",
    "sources": [
      {
        "t": "NSSA contributions",
        "u": "https://www.nssa.org.zw/contributions/"
      },
      {
        "t": "NSSA coverage",
        "u": "https://www.nssa.org.zw/coverage/"
      },
      {
        "t": "S.I. 99 of 2024 (NSSA)",
        "u": "https://www.nssa.org.zw/wp-content/uploads/2024/06/SI-2024-099-National-Social-Security-Authority-Pension-and-Other-Benefits-Scheme-Rates-and-Benefits-Amendment-Notice-2024-No.-33.pdf"
      }
    ],
    "steps": [
      {
        "t": "Create an employer account on the NSSA self-service portal",
        "d": "Use the Employer SignUp and Company Registration links on nssa.org.zw (selfservice.nssa.org.zw)."
      },
      {
        "t": "Complete the five-step employer registration form",
        "d": "Steps are main details (legal name, industry code, company type, first-employee start date, headcount, wage bill), contacts, banking, directors and contact person, then supporting documents."
      },
      {
        "t": "Register within 30 days of becoming an employer",
        "d": "CITE reports that registration gives the employer a Social Security Number. Then register each employee, who gets their own number."
      },
      {
        "t": "Pay and file by the 10th of each month",
        "d": "Submit the monthly NSSA P4 return on the portal and pay the pension (POBS) and workplace injury (APWCS, employer-paid) contributions."
      },
      {
        "t": "Notify NSSA of changes",
        "d": "Report employee address changes, terminations and deaths, and any business closure. Keep payroll records for inspectors."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "nssa.org.zw",
        "u": "https://www.nssa.org.zw"
      },
      {
        "t": "selfservice.nssa.org.zw",
        "u": "https://selfservice.nssa.org.zw/RegisterEmployer/MainDetails"
      },
      {
        "t": "cite.org.zw",
        "u": "https://cite.org.zw/nssa-membership-compulsory/"
      }
    ],
    "stepsCheck": "NSSA's Contributions page failed to load, so no official rates, insurable-earnings ceiling or penalty amounts. The documents list in step 5 is not visible. The 30-day and 10th-of-month rules come from CITE, not NSSA."
  },
  {
    "id": "labour-act",
    "reg": "LABOUR",
    "scope": "general",
    "phase": "running",
    "tags": [],
    "status": "reported",
    "title": "Labour Act basics for your first hires",
    "headline": "Give written particulars when you engage someone, and notice periods run from one day to three months by length of service.",
    "summary": "The Labour Act [Chapter 28:01] and industry employment council agreements set the floor for pay, leave and dismissal, even in a small team.",
    "facts": [
      {
        "label": "Contracts",
        "value": "Oral contracts are valid, but employers must give written particulars on engagement (s12(2)), including probation terms."
      },
      {
        "label": "Notice (s12(4))",
        "value": "2 years or more: 3 months. 1 to 2 years: 2 months. 6 to 12 months: 1 month. 3 to 6 months: 2 weeks. Under 3 months or casual: 1 day."
      },
      {
        "label": "Leave",
        "value": "Vacation leave 1 month a year after the first year. Sick leave 90 days full pay plus 90 days half pay. Maternity leave 98 days. Special leave up to 12 days."
      },
      {
        "label": "Minimum wages",
        "value": "Set by industry (S.I. 70 of 1996, reviewed by S.I. 186 of 2024). Employment council agreements bind all employers in the industry."
      },
      {
        "label": "Changes",
        "value": "Labour Amendment Act 11 of 2023 (gazetted 14 July 2023) added hourly contracts and set retrenchment packages. Retrenchment Regulations S.I. 191 of 2024: at least one month's pay per year of service."
      }
    ],
    "note": "From a 2026 law-firm practice guide. Probation length was not confirmed in any source read, and no 2025 or 2026 amendment was found.",
    "sources": [
      {
        "t": "Chambers Employment Practice Guide 2026: Zimbabwe",
        "u": "https://practiceguides.chambers.com/practice-guides/employment-2026/zimbabwe"
      },
      {
        "t": "Labour Amendment Act 11 of 2023 (Veritas)",
        "u": "https://veritaszim.net/node/6460"
      }
    ],
    "steps": [
      {
        "t": "Give each new hire written particulars on engagement",
        "d": "Labour Act s.12(2) requires employer name and address, pay and pay intervals, hours, and the terms of any employment code. Chambers adds contract period, probation, leave and benefits."
      },
      {
        "t": "Set any probation up front",
        "d": "A written contract may include one non-renewable probation of up to 3 months (s.12(5))."
      },
      {
        "t": "Apply the statutory notice periods",
        "d": "Notice runs from 1 day (under 3 months' service) to 3 months (2 years or more), with pay in lieu allowed (s.12(4))."
      },
      {
        "t": "Grant statutory leave",
        "d": "Chambers lists vacation leave (s.14A), 90 days of sick leave on full pay (s.14), and 98 days of maternity leave (s.18)."
      },
      {
        "t": "Check for a sector employment council agreement",
        "d": "If a National Employment Council agreement is gazetted for your industry, it binds all employers in that sector, including minimum wages (Chambers)."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/1985/16"
      },
      {
        "t": "practiceguides.chambers.com",
        "u": "https://practiceguides.chambers.com/practice-guides/employment-2026/zimbabwe"
      }
    ],
    "stepsCheck": "No source states a procedure for registering an employer with an employment council, and Chambers does not say registration is required. The ZimLII text ended before the sections on councils. Check with your sector NEC. Works councils (s.25A) apply only where a workers committee exists."
  },
  {
    "id": "tax-more",
    "reg": "ZIMRA",
    "scope": "general",
    "phase": "running",
    "tags": [],
    "status": "reported",
    "title": "Company tax, money transfer tax and tax breaks",
    "headline": "Corporate tax is 25% plus a 3% AIDS levy. Mobile and bank transfers carry IMTT, now 1.5% on ZiG and 2% on foreign currency.",
    "summary": "Beyond registering and filing returns, three taxes shape a startup's costs and pricing. A startup bill with tax incentives has been announced but is not law.",
    "facts": [
      {
        "label": "Corporate tax",
        "value": "25%, with a 3% AIDS levy on the tax charged (ZIMRA)."
      },
      {
        "label": "Investor rates",
        "value": "0% for five years then 25% for licensed investors, and 0% for five years then 15% for special economic zone investors (ZIMRA)."
      },
      {
        "label": "SME allowance",
        "value": "A Special Initial Allowance for SMEs: 100% in total (50% in year 1, 25% over each of the next two years) (ZIMRA)."
      },
      {
        "label": "IMTT",
        "value": "Intermediated Money Transfer Tax sits in the 30th Schedule to the Income Tax Act. The financial institution remits it and recovers it from customers by the 10th of the next month, with a 15% late penalty. Rate 1.5% on ZiG transactions and 2% on foreign currency, deductible for income tax from 2026. Salaries and ZIMRA payments are exempt."
      },
      {
        "label": "Presumptive tax",
        "value": "The 2026 budget adds a 10% withholding on rent paid to presumptive taxpayers. Small-business rates and thresholds were not confirmed."
      },
      {
        "label": "Startup bill",
        "value": "The Science, Technology, Innovation Start-up and Knowledge-based Economy Promotion Bill had its principles adopted by Cabinet (September 2024 report), with tax incentives and preferential procurement. No enacted startup law or fund was found."
      }
    ],
    "note": "ZIMRA's own pages were read for rates and incentives; IMTT figures are from press and EY summaries, and Treasury was reported to be considering a further cut. Sources disagree on whether VAT is 15.5%, so check that separately.",
    "sources": [
      {
        "t": "ZIMRA corporate tax rates",
        "u": "https://www.zimra.co.zw/domestic-taxes/corporate/tax-rates"
      },
      {
        "t": "ZIMRA fiscal incentives",
        "u": "https://www.zimra.co.zw/domestic-taxes/corporate/fiscal-incentives"
      },
      {
        "t": "Financial Gazette on IMTT",
        "u": "https://fingaz.co.zw/2026/05/06/unpacking-intermediated-money-transfer-tax/"
      },
      {
        "t": "allAfrica on IMTT, Oct 2026",
        "u": "https://allafrica.com/stories/202610200234.html"
      },
      {
        "t": "Startup bill (OpenParly)",
        "u": "https://openparly.com/bill-alert-science-technology-innovation-start-up-and-knowledge-based-economy-promotion-bill"
      }
    ],
    "steps": [
      {
        "t": "Confirm your company tax rate",
        "d": "ZIMRA lists company income at 25% plus a 3% AIDS levy on tax chargeable. Manufacturing exporters pay 15-20% depending on export share."
      },
      {
        "t": "Check for tax breaks",
        "d": "Licensed investors pay 0% for 5 years, then 25%. Special Economic Zone companies pay 0% for 5 years, then 15%. Conditions are on ZIMRA's incentives pages."
      },
      {
        "t": "Pay provisional tax and file the annual return",
        "d": "Pay quarterly on 25 Mar, 25 Jun, 25 Sep and 20 Dec, and file by 30 Apr. Withhold 30% on contracts of US$1,000 or more with payees who have no tax clearance (s.80)."
      },
      {
        "t": "Account for IMTT if you run a financial institution",
        "d": "Intermediated money transfer tax is withheld by the intermediating bank, mobile money or money transfer provider. Remit it with a return by the 10th of the next month."
      },
      {
        "t": "Note the current IMTT rate and deductibility",
        "d": "The rate is 1.5% on ZiG transactions and 2% on foreign currency. Further cuts are under consideration. IMTT is deductible from 2026."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimra.co.zw",
        "u": "https://www.zimra.co.zw/domestic-taxes/corporate/tax-rates"
      },
      {
        "t": "zimra.co.zw",
        "u": "https://www.zimra.co.zw/domestic-taxes/corporate/new-businesses"
      },
      {
        "t": "fingaz.co.zw",
        "u": "https://fingaz.co.zw/2026/05/06/unpacking-intermediated-money-transfer-tax/"
      },
      {
        "t": "allafrica.com",
        "u": "https://allafrica.com/stories/202610200234.html"
      },
      {
        "t": "ey.com",
        "u": "https://www.ey.com/content/dam/ey-unified-site/ey-com/en-zw/documents/ey-zw-post-budget-tax-spotlight-november-2025.pdf"
      }
    ],
    "stepsCheck": "ZIMRA's rates page did not cover capital gains or withholding on dividends to residents or non-residents. The incentive eligibility pages were not opened. Whether a payer must register separately for IMTT was not stated. Rates for 2026 are from an AllAfrica article dated 20 Oct 2026 and the EY post-budget note, so check the Finance Act."
  },
  {
    "id": "zida",
    "reg": "ZIDA",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "foreign"
    ],
    "status": "reported",
    "title": "Foreign investors, reserved sectors and ZIDA",
    "headline": "Foreign-owned startups need a ZIDA licence only in reserved sectors, and new thresholds apply there (S.I. 215 of 2025).",
    "summary": "A General Investment Licence is not compulsory unless your activity is reserved. Retail, haulage, grain milling, shipping and forwarding, advertising, employment agencies and estate agencies are reserved sectors.",
    "facts": [
      {
        "label": "Licence",
        "value": "General Investment Licence under the ZIDA Act [Chapter 14:38]. Valid two years, with the project to start within 12 months."
      },
      {
        "label": "S.I. 215 of 2025",
        "value": "Gazetted 11 December 2025. The regulator is the Ministry of Industry and Commerce."
      },
      {
        "label": "Thresholds",
        "value": "Retail US$20m and 200 jobs. Haulage US$10m and 100 jobs. Grain milling US$25m and 50 jobs. Shipping and forwarding US$1m and 20 jobs."
      },
      {
        "label": "Existing owners",
        "value": "Foreign owners in reserved sectors must divest 75% over three years."
      },
      {
        "label": "Not found",
        "value": "No general minimum investment threshold, and no ZIDA fees."
      }
    ],
    "note": "Taken from a law-firm guide and a newspaper report. ZIDA's own site could not be read, and whether any ICT restriction applies was not confirmed.",
    "sources": [
      {
        "t": "Chambers Investing in Zimbabwe 2026",
        "u": "https://gpg-pdf.chambers.com/investing-in-2026/768/"
      },
      {
        "t": "NewsDay on S.I. 215 of 2025",
        "u": "https://newsday.co.zw/hstv/business/article/200050210/new-rules-raise-bar-for-foreign-firms"
      },
      {
        "t": "Business Times on ZIDA",
        "u": "https://businesstimes.co.zw/zidas-role-on-foreign-investments/"
      }
    ],
    "steps": [
      {
        "t": "Check whether your sector is reserved",
        "d": "Reserved examples include passenger transport, retail and wholesale trade, estate agency, grain milling and artisanal mining. Retail and wholesale needs 200 employees and US$20m (Afriwise)."
      },
      {
        "t": "Incorporate locally and register with ZIMRA",
        "d": "Reserved-sector applicants must be registered in Zimbabwe, registered with ZIMRA, and hold a Bank Use Promotion Act-compliant account."
      },
      {
        "t": "Apply for the investment licence on the ZIDA DIY portal",
        "d": "Use zidainvest.com/zida-diy-investor-licensing-portal. Submit the completed ZIDA 1 form, a business plan, certified CR6/CR14/CR5, M&AA and the shareholder list."
      },
      {
        "t": "Pay the fees",
        "d": "A Zimbabwe embassy presentation states US$500 non-refundable on application and US$4,500 on approval, with about 4-5 days processing."
      },
      {
        "t": "For reserved sectors, seek ministerial approval",
        "d": "Lodge the application, business plan and proof of finances with the designated unit. The Minister decides within 60 days. Report a transfer of ownership to a foreign national within 7 days."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "afriwise.com",
        "u": "https://www.afriwise.com/blog/key-provisions-of-the-indigenisation-and-economic-empowerment-foreign-participation-in-reserved-sectors-regulations-2025"
      },
      {
        "t": "businesstimes.co.zw",
        "u": "https://businesstimes.co.zw/zidas-role-on-foreign-investments/"
      },
      {
        "t": "zimembassyberlin.gov.zw",
        "u": "https://www.zimembassyberlin.gov.zw/wp-content/uploads/v2_Zimbabwe_Foreign_Webinars_Engagement_Presentation_removed_removed.pdf"
      }
    ],
    "stepsCheck": "The ZIDA website itself was not opened, and the e-licensing news article was paywalled. Fees and timelines are from one embassy slide deck. Afriwise does not name ZIDA as the designated unit. The Regulations 2025 text was not read. A minimum investment amount for the general licence was not stated."
  },
  {
    "id": "exchange-control",
    "reg": "RBZ",
    "scope": "specific",
    "phase": "running",
    "tags": [
      "foreign",
      "payments"
    ],
    "status": "verify",
    "title": "Exchange control: foreign income, foreign vendors and dividends",
    "headline": "Exporters surrender 30% of foreign currency and keep 70%, and recurring foreign service fees need an RBZ-registered agreement.",
    "summary": "The Reserve Bank's Foreign Exchange Guidelines (FXD5 v2.0, March 2026) matter to startups that earn in dollars, pay foreign software or cloud vendors, or send dividends abroad.",
    "facts": [
      {
        "label": "Currency",
        "value": "Foreign currency is legal tender and may be used freely (1.1.1)."
      },
      {
        "label": "Exporters",
        "value": "Surrender 30% and keep 70% (3.2.3). New exporters of goods or services register on CEPECS (3.2.1). Service providers file Form GSD (3.2.15), and proceeds are due within 90 days (3.2.16)."
      },
      {
        "label": "Foreign service fees",
        "value": "Recurring fees need an RBZ-registered agreement valid for one year (3.1.5). Aggregate payments are capped at 3% of revenue (3.1.9). Once-off payments are allowed up to US$250,000 per company per year (3.1.10)."
      },
      {
        "label": "Dividends",
        "value": "Up to 100% of net after-tax profits, applied for within 12 months of year-end, with audit and board documents (3.1.13)."
      },
      {
        "label": "SaaS and cloud",
        "value": "Not named in the clauses read. They probably fall under the service-fee rules, but that is our inference."
      }
    ],
    "note": "Only the first part of a very long PDF was read, through a summarising tool. Check every clause number and figure against the guidelines, and the March 2026 directive FXD5/2026 itself, before relying on them.",
    "sources": [
      {
        "t": "RBZ Foreign Exchange Guidelines FXD5 v2.0, March 2026",
        "u": "https://www.rbz.co.zw/documents/Regulations_Acts/2026/Foreign_Exchange_Guidelines_FXD5_version_2._March_2026.pdf"
      },
      {
        "t": "ZB Bank notice on FXD5/2026",
        "u": "https://www.zb.co.zw/holding/media/insights/zb-customer-notice-foreign-exchange-directive-fxd52026-key-updates"
      }
    ],
    "steps": [
      {
        "t": "Register for CEPECS with the RBZ",
        "d": "Complete the RBZ user registration, and the Exports Department issues a login. You can then raise Form CD1 online (2017 RBZ statement via NewsDay)."
      },
      {
        "t": "Surrender 30% of export proceeds",
        "d": "You may keep 70% in foreign currency. Sell the 30% to the RBZ at the interbank rate, on receipt and/or within 24 hours (RBZ notices)."
      },
      {
        "t": "Acquit exports within 90 days of shipment",
        "d": "Declare the true export value on bank documents. The same 90-day rule applies to foreign payments."
      },
      {
        "t": "Register external loans, service agreements and foreign investments",
        "d": "Register them with the RBZ and get prior exchange control approval before payment. Apply through your bank branch and relationship manager (RBZ notice)."
      },
      {
        "t": "Use an authorised dealer for any remittance",
        "d": "Exchange control generally bars sending funds abroad except through an authorised bank. Penalties are the greater of 1% of the transaction or US$100,000."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "newsday.co.zw",
        "u": "https://newsday.co.zw/business/article/78362/rbz-introduces-direct-access-to-forms-cd1-disintermediates-banks"
      },
      {
        "t": "nmbz.co.zw",
        "u": "https://nmbz.co.zw/nmb/sites/default/files/2025-08/RBZ%20-%20FX%20Directive%20Notice%20-%2018%20August%202025.pdf"
      },
      {
        "t": "nmbz.co.zw",
        "u": "https://nmbz.co.zw/nmb/sites/default/files/2026-03/RBZ%20Notice%20-%203%20March%202026.pdf"
      },
      {
        "t": "businesstimes.co.zw",
        "u": "https://businesstimes.co.zw/unlocking-investment-opportunities-what-you-need-to-know-about-zimbabwes-offshore-remittance-framework/"
      }
    ],
    "stepsCheck": "Steps come from RBZ notices read through a bank's copy, not rbz.co.zw. Confirm with your bank's forex desk. No rbz.co.zw page was opened. The RBZ notices were read via a bank's copy. The March 2026 notice ties CEPECS to cross-border road freight (Form CD3), so check whether CEPECS registration is still how general exporters raise CD1. Nothing found on dividend remittance rules, foreign-vendor payments (CEPECS), or processing timelines."
  },
  {
    "id": "microfinance",
    "reg": "RBZ",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "lending"
    ],
    "status": "official",
    "title": "Lending and credit: register as a microfinance institution",
    "headline": "Lending without registration is an offence, and the loan carries no interest.",
    "summary": "Anyone conducting microfinance business, whether credit-only or deposit-taking, must be a company registered with the Registrar of Microfinance Institutions at the Reserve Bank. Whether app-based lenders and buy-now-pay-later are named was not confirmed.",
    "facts": [
      {
        "label": "Law",
        "value": "Microfinance Act, with Act 6 of 2019 folding moneylending into the same regime."
      },
      {
        "label": "Who",
        "value": "A company registered with the Registrar of Microfinance Institutions, appointed from RBZ staff (ss4 to 6). The Registrar decides within 60 days (s7(4)). Credit-only registrations need renewal."
      },
      {
        "label": "Offence",
        "value": "Unregistered lending: up to level 14 or 5 years, and the loan carries no interest (s6)."
      },
      {
        "label": "Capital",
        "value": "\"As prescribed by regulation\" (s33). One report puts deposit-taking institutions at US$5m core capital, another site says US$500,000; neither is confirmed. No credit-only figure or fees were found."
      },
      {
        "label": "Mobile loans",
        "value": "RBZ's April 2026 mobile-money directives reportedly require USSD nano-loans to be underwritten by commercial banks and sit on bank balance sheets. They are addressed to mobile network operators."
      }
    ],
    "note": "Chapter numbering differs between sources, so it is left out. The Money Lending and Rates of Interest Act text could not be read, and no interest-rate cap or digital-lending rule for 2024 to 2026 was found.",
    "sources": [
      {
        "t": "Microfinance Act (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/2013/3"
      },
      {
        "t": "allAfrica on the April 2026 RBZ directives",
        "u": "https://allafrica.com/stories/202604020353.html"
      },
      {
        "t": "Equity Axis on capitalised deposit-taking MFIs",
        "u": "https://equityaxis.net/post/19370/2026/8/getbucks-joins-four-other-capitalised-deposit-taking-microfinance-institutions-as-zimbabwe-s-sector-strengthens"
      }
    ],
    "steps": [
      {
        "t": "Choose entity type and incorporate",
        "d": "Credit-only applicants must be share-capital companies with a registered name. Partnerships, guarantee companies and trading-as names cannot apply, and NGOs need a separate company."
      },
      {
        "t": "Raise and evidence minimum capital",
        "d": "Credit-only needs US$25,000 paid-up (RBZ 2025 requirements). RBZ's moneylender form states US$20,000, evidenced by a bank statement and Form CR2."
      },
      {
        "t": "Assemble documents and vet people",
        "d": "Incorporation documents, CR11 and CR6, shareholder register, source of funds, tax registration, leases, a business plan, manuals, and fitness and probity affidavits, clearances and net worth statements."
      },
      {
        "t": "Apply in writing to the Registrar and pay US$300",
        "d": "Email licensing@rbz.co.zw. Pay into RBZ account PL52041. The paper form goes to the Director, Bank Supervision, 80 Samora Machel Avenue, Harare."
      },
      {
        "t": "Await the Registrar's decision",
        "d": "Under the Microfinance Act s7(4) the decision is due within 60 days of a complete application. A refusal needs 30 days' notice for representations. A certificate states the registration conditions."
      },
      {
        "t": "Meet post-registration conditions",
        "d": "Appoint an external auditor in year one, get prior approval for 5% shareholding changes and principal officers, keep capital, and run a visible complaints process."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "rbz.co.zw",
        "u": "https://www.rbz.co.zw/documents/bank_sup/LICENSING_REQUIREMENTS/Credit_only_Microfinance_Institutions_-_Minimum_Licensing_Requirements_2025.pdf"
      },
      {
        "t": "rbz.co.zw",
        "u": "https://www.rbz.co.zw/documents/BLSS/BANK%20SUPERVISION/Licensing%20requirements/Licencing%20Requirements%20-%20MFIs%20&%20MLIs/MFI%20MLI%20Application%20Form.pdf"
      },
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2013/3"
      },
      {
        "t": "faolex.fao.org",
        "u": "https://faolex.fao.org/docs/pdf/zim200424.pdf"
      }
    ],
    "stepsCheck": "RBZ does not state processing time, certificate validity or renewal steps. The 60-day limit is from the Act text. Deposit-taking requirements (reported US$5m capital) were not opened. The US$20,000 and US$25,000 figures differ between RBZ documents."
  },
  {
    "id": "psp",
    "reg": "RBZ",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "payments"
    ],
    "status": "official",
    "title": "Payment service providers and aggregators",
    "headline": "Non-banks go through a partner deposit-taking institution, and nothing may launch, even as a pilot, without Reserve Bank approval.",
    "summary": "The Reserve Bank's 2016 Recognition Framework still sets the route for a fintech that processes payments but is not a bank or mobile network operator. No separate aggregator or gateway licence category was found.",
    "facts": [
      {
        "label": "Route",
        "value": "Non-banks apply through a partner deposit-taking institution (2016 Recognition Framework). No pilots or live launches without approval."
      },
      {
        "label": "Capital and fees",
        "value": "\"Adequate capital\" with no figure, plus an application fee and an annual fee."
      },
      {
        "label": "Customer funds",
        "value": "S.I. 80 of 2020 requires a dedicated bank account, with wallet funds held in the provider's trust bank account."
      },
      {
        "label": "2026 circular",
        "value": "NPSD Circular 03/2026 (2 March 2026) requires payment service providers to align with the QR code guideline, with interoperability. Two further 2026 items (DFS Security Guidelines and Circular 02/2026) were listed but not read."
      },
      {
        "label": "Penalties",
        "value": "Civil penalty orders, a criminal fine up to level 7 and 6 months, or withdrawal of recognition."
      }
    ],
    "note": "Whether the RBZ fintech sandbox is open in 2026 is not shown on any RBZ page found; it was announced for 1 March 2021. Minimum capital and the S.I. 80 fees (ZWL, 2020) are not current figures.",
    "sources": [
      {
        "t": "RBZ Recognition of Payment Systems framework, April 2016",
        "u": "https://www.rbz.co.zw/documents/nps/framework-for-the-recognition-of-payment-systems-in-zimbabwe---april-2016.pdf"
      },
      {
        "t": "RBZ NPSD Circular, March 2026",
        "u": "https://www.rbz.co.zw/documents/Regulations_Acts/2026/NPS_CIRCULAR_MARCH_2026.pdf"
      },
      {
        "t": "S.I. 80 of 2020 (RBZ copy)",
        "u": "https://www.rbz.co.zw/documents/nps/2021/SI-2020-080-Banking-Money-Transmission-Mobile-Banking-and-Mobile-Money-Interoperability-Regulations-2020.pdf"
      }
    ],
    "steps": [
      {
        "t": "Partner with a licensed bank",
        "d": "Non-bank payment providers must partner with a bank of their choice, and the application is submitted through that bank."
      },
      {
        "t": "Prepare the RBZ Approval Requirements pack",
        "d": "Governance and capital, business plan, risk framework, signed third-party contracts, clearing and settlement rules, pricing and customer-protection policies, AML/CFT, systems integrity and pilot results."
      },
      {
        "t": "Add cross-border items if relevant",
        "d": "Cross-border payments need exchange control compliance. Foreign entities need a certificate of good standing from their home regulator."
      },
      {
        "t": "Submit to RBZ at 80 Samora Machel Avenue, Harare",
        "d": "RBZ states fees are set from time to time. A law-firm guide reports a US$5,000 application fee."
      },
      {
        "t": "Get approval before any pilot or go-live",
        "d": "RBZ prohibits pilot tests and live launch without approval. A guide adds connection to the national switch and the RBZ Cybersecurity Framework 2021."
      },
      {
        "t": "Alternative: apply to the RBZ fintech sandbox",
        "d": "Email fintech@rbz.co.zw, complete the eligibility checklist, apply, and expect a decision within 21 working days. Testing runs up to 24 months, and crypto is ineligible."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "rbz.co.zw",
        "u": "https://www.rbz.co.zw/index.php/financial-markets/national-payment-system/approval-requirements"
      },
      {
        "t": "rbz.co.zw",
        "u": "https://www.rbz.co.zw/documents/BLSS/Fintech/FINTECH-REGULATORY-SANDBOX-GUIDELINES.pdf"
      },
      {
        "t": "afriwise.com",
        "u": "https://www.afriwise.com/blog/understanding-zimbabwes-new-licensing-regulations-for-money-transmission-mobile-banking-and-money-interoperability"
      },
      {
        "t": "regalert.today",
        "u": "https://regalert.today/guides/fintech/ZW"
      },
      {
        "t": "rbz.co.zw",
        "u": "https://www.rbz.co.zw/index.php/fintech"
      }
    ],
    "stepsCheck": "No official fee, form or timeline for recognition. The RBZ page covers retail payment system providers and does not name aggregators. regalert says no sandbox is available, which conflicts with RBZ's 2021 sandbox guidelines, so confirm with RBZ."
  },
  {
    "id": "aml",
    "reg": "FIU",
    "scope": "specific",
    "phase": "running",
    "tags": [
      "payments",
      "lending",
      "crypto",
      "investment",
      "insurtech"
    ],
    "status": "official",
    "title": "Know your customer and anti-money-laundering duties",
    "headline": "Verify customers when a relationship opens, keep records for 5 years, and failing to identify a customer can cost up to US$100,000 and/or 3 years.",
    "summary": "The Money Laundering and Proceeds of Crime Act [Chapter 9:24], amended in 2025, binds financial institutions and a list of designated businesses. Design onboarding around it from day one.",
    "facts": [
      {
        "label": "Identify (s15)",
        "value": "Verify customers when a relationship opens, for transactions of US$5,000 or more by people without an account, for wire transfers of US$1,000 or more, and on suspicion. Beneficial owners must also be verified."
      },
      {
        "label": "Records (s24)",
        "value": "Keep records for 5 years."
      },
      {
        "label": "Penalty (s23)",
        "value": "Failure to identify: a fine up to US$100,000 and/or 3 years."
      },
      {
        "label": "Risk (s12B)",
        "value": "Institutions must run risk assessments (substituted by Act 7 of 2025)."
      },
      {
        "label": "Designated businesses (s13)",
        "value": "Gaming operators, estate agents, dealers in precious stones and metals, legal and accounting professionals, trust and company service providers, and motor vehicle dealers."
      },
      {
        "label": "Supervision",
        "value": "By supervisory authorities under the FIU (s3). No general FIU registration regime for non-crypto fintechs was seen."
      }
    ],
    "note": "Sections 26 to 30, which include the suspicious transaction reporting duty, were not read, so reporting thresholds and wording are unconfirmed. Read through a summarising tool; check the section numbers.",
    "sources": [
      {
        "t": "Money Laundering and Proceeds of Crime Act, consolidated (FIU)",
        "u": "https://www.fiu.co.zw/wp-content/uploads/2025/05/MLPCAct0924updated.pdf"
      }
    ],
    "steps": [
      {
        "t": "Identify which regime applies to you",
        "d": "The Money Laundering and Proceeds of Crime Act [Chapter 9:24] applies, with the Financial Intelligence Unit (FIU) at the RBZ. Virtual asset providers must register with the FIU under S.I. 99 of 2026."
      },
      {
        "t": "Set up customer due diligence",
        "d": "Verify identity at account opening, for occasional transactions of US$5,000 or more, and for wire transfers of US$1,000 or more. Identify beneficial owners and refuse to open an account if due diligence is incomplete (ss.15-22)."
      },
      {
        "t": "Add enhanced checks and ongoing monitoring",
        "d": "Get senior approval and establish source of wealth for politically exposed persons (s.20). Monitor transactions against each customer's profile (s.26)."
      },
      {
        "t": "Report suspicious transactions to the FIU",
        "d": "Report promptly, within 3 working days of forming the suspicion (s.30). Never tip off the customer."
      },
      {
        "t": "Keep records and appoint a compliance officer",
        "d": "Keep customer and transaction records for 5 years (s.24). The VASP rules require a resident compliance officer, written AML policies and independent audit."
      }
    ],
    "stepsBasis": "general",
    "stepsSources": [
      {
        "t": "learnsignal.com",
        "u": "https://www.learnsignal.com/blog/zimbabwe-aml-obligations-accountants-money-laundering-proceeds-of-crime-act-fiu-guide/"
      },
      {
        "t": "mmmlawfirm.co.zw",
        "u": "https://www.mmmlawfirm.co.zw/zimbabwe-regulates-virtual-asset-service-providers-key-implications-of-s-i-99-of-2026-for-businesses-investors-and-fintech-operators/"
      },
      {
        "t": "businesstimes.co.zw",
        "u": "https://businesstimes.co.zw/understanding-anti-money-laundering-aml-and-compliance-a-zimbabwean-perspective/"
      },
      {
        "t": "zimra.co.zw",
        "u": "https://www.zimra.co.zw/revenue-assurance-and-special-project/antimoney-laundering"
      }
    ],
    "stepsCheck": "No FIU or RBZ page and no published registration or reporting procedure for general reporting entities (such as a payments fintech licensed by the RBZ). The statute details come from a secondary article about accountants, and it did not read s.25 on compliance officers. VASP fees (up to US$500 registration, US$400 renewal, 90-day decision) apply only to virtual asset providers. Payment-provider licensing under the RBZ was not researched."
  },
  {
    "id": "subscriber-reg",
    "reg": "POTRAZ",
    "scope": "specific",
    "phase": "running",
    "tags": [
      "mvno",
      "vas"
    ],
    "status": "reported",
    "title": "Subscriber registration for SIMs",
    "headline": "Operators must collect a customer's name, addresses and national ID before contracting.",
    "summary": "The Postal and Telecommunications (Subscriber Registration) Regulations, S.I. 95 of 2014 (which repealed S.I. 142 of 2013) bind network operators. Whether airtime resellers and agents are bound was not confirmed.",
    "facts": [
      {
        "label": "Duty",
        "value": "Collect name, addresses and national ID before contracting."
      },
      {
        "label": "Access",
        "value": "Law enforcement needs a warrant or court order to access the data."
      },
      {
        "label": "Handset registration",
        "value": "POTRAZ was lobbying for handset registration in April 2025 (reported). Nothing was found showing it is law."
      }
    ],
    "note": "Penalties and the text of S.I. 95 of 2014 were not read.",
    "sources": [
      {
        "t": "S.I. 142 of 2013 and its repeal (Veritas)",
        "u": "https://veritaszim.net/node/639"
      },
      {
        "t": "MISA Zimbabwe on the regulations",
        "u": "https://zimbabwe.misa.org/2016/04/01/misa-zimbabwe-statement-on-the-postal-and-telecommunications-subscriber-registration-regulations/"
      }
    ],
    "steps": [
      {
        "t": "Register every subscriber before activating a SIM",
        "d": "Do not activate a SIM or start service until details are registered (SI 142 of 2013, s3)."
      },
      {
        "t": "Collect required ID details",
        "d": "Individuals: name, address, nationality, gender, SIM number, national ID or passport. Companies: registration certificate or licence, representative's ID and a letter of authority or affidavit."
      },
      {
        "t": "Verify identity and pass agent forms within 7 days",
        "d": "Verify names, ID and address. Agents, distributors and dealers hand completed forms to the provider within 7 days."
      },
      {
        "t": "Keep hard and electronic Subscriber Register for 5 years",
        "d": "Retain records for 5 years after the contract ends. Give POTRAZ extracts free on request and allow inspection."
      },
      {
        "t": "Transmit subscriber data to POTRAZ monthly",
        "d": "Send monthly or at the interval POTRAZ sets. Keep data in Zimbabwe and report breaches to POTRAZ."
      },
      {
        "t": "Handle lost SIMs, changes and police requests",
        "d": "Customers report loss to police and provider and report changes within 21 days. Staff report suspected false IDs to police within 24 hours. Law-enforcement requests go through POTRAZ."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "veritaszim.net",
        "u": "https://veritaszim.net/sites/veritas_d/files/SI%202013-142%20-%20Postal%20and%20Telecommunications%20%28Subscriber%20Registration%29%20Regulations%2C%202013.pdf"
      },
      {
        "t": "veritaszim.net",
        "u": "https://veritaszim.net/node/639"
      },
      {
        "t": "nehandaradio.com",
        "u": "https://nehandaradio.com/2013/09/28/30-day-ultimatum-for-cellphone-users/"
      }
    ],
    "stepsCheck": "The steps follow S.I. 142 of 2013. One source says those regulations were repealed and replaced (S.I. 95 of 2014), so confirm with POTRAZ which text is in force before you build your sign-up flow around it. Based on the 2013 SI 142 text; later amendments or new rules not checked. No fee or application, as this is a compliance duty. Penalties: fine up to level 7 per day for providers and agents. The Herald article on police-report SIM replacement could not be opened."
  },
  {
    "id": "interception",
    "reg": "POTRAZ",
    "scope": "specific",
    "phase": "running",
    "tags": [
      "isp",
      "mvno",
      "vas"
    ],
    "status": "official",
    "title": "Lawful interception duties for telecom and internet providers",
    "headline": "Providers must keep systems able to support lawful interception, at their own cost, or face a fine up to level 12 or 3 years.",
    "summary": "The Interception of Communications Act [Chapter 11:20] applies to providers of telecommunication services. No retention period is set in the Act.",
    "facts": [
      {
        "label": "Systems (s9)",
        "value": "Providers must keep systems able to support lawful interception. Failure: a fine up to level 12 or 3 years."
      },
      {
        "label": "Directives (s12)",
        "value": "Providers must offer interceptable services and store call-related information under a directive from the Authority, at their own cost."
      },
      {
        "label": "Customer records (s10)",
        "value": "Collect customer identity details and keep proper records."
      },
      {
        "label": "Disclosure (s16)",
        "value": "Disclosing intercepted information: level 14 or 5 years."
      }
    ],
    "note": "Whether a pure app or SaaS firm counts as a telecommunication provider was not examined.",
    "sources": [
      {
        "t": "Interception of Communications Act (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/2007/6/eng@2022-03-11"
      }
    ],
    "steps": [
      {
        "t": "Make services interception-capable",
        "d": "Under s12(1) of the Interception of Communications Act, a provider must offer a service that can be intercepted."
      },
      {
        "t": "Follow the POTRAZ technical directive",
        "d": "The Authority issues a directive on facilities, devices and compliance deadline (s12(2)-(3)). Providers acquire the specified equipment at their own expense."
      },
      {
        "t": "Connect to the interception centre",
        "d": "Provide interfaces and links to the Cyber Security and Monitoring of Interception of Communications Centre, with real-time monitoring and simultaneous interceptions (s9)."
      },
      {
        "t": "Collect and keep customer identity records",
        "d": "Before contracting, record the customer's name, addresses and ID number, and keep records of changes (s10)."
      },
      {
        "t": "Comply with warrants and keep them confidential",
        "d": "Supply call data in real time or soon after call end. Do not disclose information obtained under the Act (s16)."
      },
      {
        "t": "Claim compensation only for gazetted assistance",
        "d": "The Minister gazettes eligible assistance and tariffs; compensation covers direct personnel and administration costs only (s13)."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2007/6/eng@2022-03-11"
      }
    ],
    "stepsCheck": "There is no published application or certification process, so this outlines legal duties only. I did not find the current technical directive or compliance deadline, or any named contact. Penalties: failing to assist is a fine up to level 12 or 3 years' prison; unlawful disclosure up to level 14 or 5 years."
  },
  {
    "id": "broadcasting",
    "reg": "BAZ",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "media"
    ],
    "status": "verify",
    "title": "Streaming, podcasts and web radio fall under the BAZ licence regime",
    "headline": "A 2025 amendment brought internet-based broadcasting, webcasting and podcasts into the Broadcasting Services Act.",
    "summary": "The Broadcasting Services Amendment Act No. 2 of 2025 was gazetted on 23 May 2025 and commenced by S.I. 73 of 2025. A pre-launch licence is likely for streaming, web TV and internet radio, but the text read has no explicit licence sentence.",
    "facts": [
      {
        "label": "Law",
        "value": "Broadcasting Services Amendment Act No. 2 of 2025, amending the Broadcasting Services Act [Chapter 12:06]. Commenced by S.I. 73 of 2025 (dated 15 July 2025)."
      },
      {
        "label": "Scope",
        "value": "\"Internet-based broadcasting\" is a service transmitted over the internet, including radio, TV and podcasts. It adds internet-based broadcasting and webcasting to the licence classes in s7(2)."
      },
      {
        "label": "Terms (reported)",
        "value": "10 years for public, commercial, community and subscription licences. 3 years for narrowcasting, datacasting and satellite."
      },
      {
        "label": "Penalties",
        "value": "Only civil penalties through regulations (s46(2)), with amounts unstated."
      },
      {
        "label": "History",
        "value": "A 2018 BAZ notice already invited applications for video-on-demand, webcasting and content distribution licences."
      }
    ],
    "note": "The definitions are criticised as vague, with a risk to bloggers and citizen journalists. BAZ's Q1 2026 newsletter gives no fees or deadlines for online services. Confirm with BAZ before you launch.",
    "sources": [
      {
        "t": "Broadcasting Services Amendment Act (Veritas)",
        "u": "https://veritaszim.net/node/7462"
      },
      {
        "t": "S.I. 73 of 2025 (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/si/2025/73"
      },
      {
        "t": "BAZ newsletter, Q1 2026",
        "u": "https://www.baz.co.zw/downloads/newsletters/BAZ-Newsletter-Q1-2026.pdf"
      },
      {
        "t": "MMM Law on BAZ licence terms",
        "u": "https://www.mmmlawfirm.co.zw/?p=29640"
      }
    ],
    "steps": [
      {
        "t": "Identify your BAZ licence category",
        "d": "BAZ defines a webcasting service as a computer-mediated broadcasting service. Video on Demand covers on-demand streaming. The 2025 Amendment Act brought internet broadcasting under BAZ."
      },
      {
        "t": "Wait for or check BAZ's call for applications",
        "d": "One analysis says BAZ invites applications at least once a year, subject to spectrum availability, so a founder cannot apply on their own initiative. This is from an opinion piece."
      },
      {
        "t": "Apply on the BAZ portal or the BS1 form",
        "d": "Create an account at apply.baz.co.zw and upload supporting documents. Or use the paper BS1 form from 27 Boscobel Drive West, Highlands, Harare."
      },
      {
        "t": "Prepare and pay the fees",
        "d": "Under S.I. 103 of 2026, webcasting and on-demand services pay US$1,000 for application or renewal and US$3,450 annual regulatory fee. Subscription services pay more."
      },
      {
        "t": "Await evaluation, then comply with licence conditions",
        "d": "BAZ's newsletter says a submission goes to evaluation and a decision, and approval brings a licence with conditions. Licensees file compliance reports, pay annual fees and follow content standards."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "new.baz.co.zw",
        "u": "https://new.baz.co.zw/services/broadcasters/apply-license"
      },
      {
        "t": "new.baz.co.zw",
        "u": "https://new.baz.co.zw/services/broadcasters/license-types"
      },
      {
        "t": "new.baz.co.zw",
        "u": "https://new.baz.co.zw/services/broadcasters/licensing-fees"
      },
      {
        "t": "baz.co.zw",
        "u": "https://www.baz.co.zw/downloads/newsletters/BAZ-Newsletter-Q1-2026.pdf"
      },
      {
        "t": "baz.co.zw",
        "u": "https://www.baz.co.zw/resources/news/invitation-temporary-broadcasting-licences-2026"
      },
      {
        "t": "allafrica.com",
        "u": "https://allafrica.com/stories/202505300055.html"
      },
      {
        "t": "new.baz.co.zw",
        "u": "https://new.baz.co.zw/resources/faqs"
      }
    ],
    "stepsCheck": "BAZ pages give no document list or timeline for webcasting. The documents in the newsletter are written for radio broadcasters. BAZ's own pages do not say whether podcasts or individual creators need a licence, and the FAQ answers did not load. The call-for-applications point is from an opinion piece, not the Act."
  },
  {
    "id": "media-reform",
    "reg": "ZMC",
    "scope": "specific",
    "phase": "watch",
    "tags": [
      "media",
      "social"
    ],
    "status": "reported",
    "title": "Media and social media law reform",
    "headline": "A Media Practitioners Bill and a social media law are in preparation, and no registration rule for bloggers is confirmed.",
    "summary": "The Zimbabwe Media Commission Act has no registration or accreditation requirement for online publishers or bloggers, but mass media owners pay an annual levy. Reform is pending.",
    "facts": [
      {
        "label": "ZMC Act",
        "value": "Act 9 of 2020 treats media as including the internet. Every \"mass media owner\" pays a prescribed annual levy, doubled if paid more than 7 days late. \"Mass media owner\" is undefined and the amounts are in regulations not found."
      },
      {
        "label": "Registration fees",
        "value": "S.I. 22 of 2021 set registration and accreditation fees under a repealed Act; Veritas calls it almost certainly invalid but advises compliance (reported)."
      },
      {
        "label": "Pending",
        "value": "The Media Practitioners Bill was at technical consolidation on 15 April 2026. The Information Minister said in March 2025 that a social media law is being prepared; no text or timeline was given."
      },
      {
        "label": "Freedom of Information Act",
        "value": "Request duties apply to public entities and statutory office holders, so a private startup is unlikely to be a duty-bearer."
      }
    ],
    "note": "Whether bloggers or online news sites must register is not confirmed. Watch for the Bill.",
    "sources": [
      {
        "t": "Zimbabwe Media Commission Act 9 of 2020 (Veritas)",
        "u": "https://www.veritaszim.net/sites/veritas_d/files/Zimbabwe%20Media%20Commission%20Act%209%20of%202020.pdf"
      },
      {
        "t": "Zimbabwe Situation on the Media Practitioners Bill",
        "u": "https://www.zimbabwesituation.com/news/technical-consolidation-of-media-practitioners-bill-underway/"
      },
      {
        "t": "MISA Zimbabwe on the social media bill",
        "u": "https://zimbabwe.misa.org/2025/03/14/proposed-new-law-to-govern-social-media-platforms-will-over-regulate-the-digital-space/"
      }
    ],
    "steps": [
      {
        "t": "Check whether you run a mass media service",
        "d": "The ZMC Act 2020 defines media to include the internet but sets no registration process. Registration sits in the older AIPPA regulations."
      },
      {
        "t": "Apply to ZMC for mass media registration",
        "d": "S.I. 79 of 2020 lists mass media at US$2,000 application and US$15,000 registration, community media at US$1,000 and US$5,000, and news agencies at US$1,000 and US$8,000."
      },
      {
        "t": "Journalists apply for ZMC accreditation",
        "d": "S.I. 79 of 2020 sets local journalists at US$120 new and US$80 renewal. Online content creator categories were disputed in court in 2020."
      },
      {
        "t": "Pay the annual Media Fund levy",
        "d": "Every mass media owner must pay the prescribed levy (ZMC Act s24). Paying more than seven days late means double the levy."
      },
      {
        "t": "Renew on time",
        "d": "The fee schedule lists renewal and late-renewal fees, for example US$10,000 and US$5,000 for mass media. The renewal cycle is not confirmed."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2020/9/eng@2021-04-02"
      },
      {
        "t": "heraldonline.co.zw",
        "u": "https://www.heraldonline.co.zw/zmc-gazettes-new-reg-fees/"
      },
      {
        "t": "misa.org",
        "u": "https://misa.org/blog/misa-meets-media-commission-over-accreditation-categories/"
      },
      {
        "t": "misa.org",
        "u": "https://misa.org/blog/content-creators-file-court-application-against-zmc-accreditation/"
      }
    ],
    "stepsCheck": "The fee schedule found is from 2020 and later years were gazetted. Confirm the current figure with the commission. zmc.org.zw blocked my fetch, so no current forms, portal, address, documents or timeline. The fee schedule is from 2020 and later years were gazetted. The currency is unstated in the report. Whether startups or online creators must register is unclear. The AIPPA regulations were not read."
  },
  {
    "id": "ip",
    "reg": "IPO",
    "scope": "specific",
    "phase": "watch",
    "tags": [
      "ip"
    ],
    "status": "reported",
    "title": "Protecting your brand, software and content",
    "headline": "Software copyright is automatic and needs no registration. Trademarks and patents are registered at the IP office.",
    "summary": "Registration is optional, but a trademark is the only way to stop someone else registering your name. Fees below are from a 2022 guide and may have changed.",
    "facts": [
      {
        "label": "Copyright",
        "value": "Copyright and Neighbouring Rights Act [Chapter 26:05]: computer programs are literary works. Protection is automatic, with no registration, and lasts 50 years for programs."
      },
      {
        "label": "Trademark (USD per class)",
        "value": "Application $200, publication $40, certificate $80, renewal $200. Term 10 years, with a 2-month opposition period."
      },
      {
        "label": "Patent",
        "value": "National patent about $220 in total, 18 to 24 months, no substantive examination, 20-year term. ARIPO e-filing carries a 20% discount."
      },
      {
        "label": "2025 changes",
        "value": "Amended IP regulations published 18 April 2025 reduce fees for women, students and SMEs. The amounts were not seen."
      },
      {
        "label": "Collective licensing",
        "value": "A 2025 ZIMURA tariff of US$150 for cover bands was reported suspended; its status is unconfirmed."
      }
    ],
    "note": "The IP office's name is unconfirmed (a 2023 guide says CIPZ; another source says the merger was not yet operational). Online filing was reported as unreliable in 2021.",
    "sources": [
      {
        "t": "Copyright and Neighbouring Rights Act (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/2000/11"
      },
      {
        "t": "EU IP Helpdesk guide to Zimbabwe, 2022",
        "u": "https://intellectual-property-helpdesk.ec.europa.eu/system/files/2022-03/Zimbabwe_final.pdf"
      },
      {
        "t": "vLex on 2025 IP fee changes",
        "u": "https://vlex.com/vid/ip-fee-changes-to-1090424732"
      }
    ],
    "steps": [
      {
        "t": "Search the mark and classify goods under Nice",
        "d": "A trademark attorney can run a search and assess registrability before filing; goods and services are listed by Nice class."
      },
      {
        "t": "File the trade mark application at ZIPO",
        "d": "File via a licensed attorney with the Zimbabwe Intellectual Property Office, stating intention to use in Zimbabwe. Filing fee is USD 200 per Mondaq."
      },
      {
        "t": "Pass examination and publication",
        "d": "ZIPO examines for earlier conflicting marks and refusal grounds, then publishes in the Patent and Trade Mark Journal (about 6 to 8 months from filing; publication fee about USD 5 per word)."
      },
      {
        "t": "Wait out the two-month opposition window, then pay sealing fee",
        "d": "Opponents have two months from publication. If unopposed, pay the USD 80 sealing fee and receive the certificate."
      },
      {
        "t": "Renew every 10 years; keep evidence of software and content authorship",
        "d": "Renewal is USD 200 filed on time. Copyright is automatic; there is no compulsory registration, so keep dated deposits, source files and assignments."
      }
    ],
    "stepsBasis": "reported",
    "stepsSources": [
      {
        "t": "mondaq.com",
        "u": "https://www.mondaq.com/ip/795090/trademarks-comparative-guide"
      },
      {
        "t": "ksandk.com",
        "u": "https://ksandk.com/ipr/trademark-registration-in-zimbabwe/"
      },
      {
        "t": "globallawexperts.com",
        "u": "https://globallawexperts.com/copyright-registration-zimbabwe/"
      },
      {
        "t": "wipo.int",
        "u": "https://www.wipo.int/wipolex/en/text/216399"
      }
    ],
    "stepsCheck": "No official ZIPO page was found or opened, so trade mark forms, address, online portal and current fees (2025 amending regulations) are unconfirmed. Copyright fee schedule and Form CNR 2 to 7 amounts unreadable; the Registrar's copyright register mainly records assignments and licences, and a copyright application section (reg 3) was not visible."
  },
  {
    "id": "e-transactions",
    "reg": "ICT",
    "scope": "specific",
    "phase": "watch",
    "tags": [
      "ecommerce",
      "platform",
      "payments"
    ],
    "status": "reported",
    "title": "Electronic contracts and signatures: no general law yet",
    "headline": "No enacted e-transactions or e-signature statute was found. Cabinet only approved the bill's principles, in September 2021.",
    "summary": "Most contracts can be signed electronically in practice, but notarial and registered instruments under the Deeds Registries Act need originals.",
    "facts": [
      {
        "label": "Bill",
        "value": "Cabinet approved the principles of an Electronic Transactions and Electronic Commerce Bill on 21 September 2021. A 2016 draft exists."
      },
      {
        "label": "In practice",
        "value": "A 2025 contracts guide says most contracts can be executed electronically, but notarial and registered instruments need originals."
      }
    ],
    "note": "Passage in 2025 or 2026 was not found, but a newer bill may exist.",
    "sources": [
      {
        "t": "Techzim on the Cabinet approval",
        "u": "https://techzim.co.zw/2021/09/cabinet-approves-ecommerce-bill"
      },
      {
        "t": "Chambers Commercial Contracts 2025: Zimbabwe",
        "u": "https://practiceguides.chambers.com/practice-guides/commercial-contracts-2025/zimbabwe"
      }
    ],
    "steps": [
      {
        "t": "Do not assume a dedicated e-signature law applies",
        "d": "A 2025 academic article says Zimbabwe has no statute on electronic contracts or signatures, and the Electronic Transactions and Electronic Commerce Bill is not enacted. Veritas (Feb 2026) lists it as unpublished and still being drafted."
      },
      {
        "t": "Keep strong evidence of each online contract",
        "d": "Record the signatory's identity, intent, timestamps and an unaltered copy. This is a practical outline, not a published government process."
      },
      {
        "t": "Follow consumer rules for online terms",
        "d": "Under the Consumer Protection Act, give consumers free electronic access to the written terms (s44(2)); notices may be served by email (s2(2))."
      },
      {
        "t": "Use wet signatures where certainty matters",
        "d": "For high-value or formal documents, consider paper signing until the Bill is enacted, and take local legal advice."
      }
    ],
    "stepsBasis": "general",
    "stepsSources": [
      {
        "t": "scielo.org.za",
        "u": "https://www.scielo.org.za/scielo.php?pid=S2225-71602025000100011&script=sci_arttext&tlng=en"
      },
      {
        "t": "veritaszim.net",
        "u": "https://www.veritaszim.net/node/7858"
      },
      {
        "t": "techzim.co.zw",
        "u": "https://techzim.co.zw/cabinet-approves-ecommerce-bill"
      },
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2019/5"
      }
    ],
    "stepsCheck": "No official filing process exists. A vendor blog (blog.flowmono.com) claims an Electronic Transactions Act [Chapter 8:20] of 2022 with POTRAZ-accredited certification authorities; it contradicts Veritas and the journal article and could not be confirmed on ZimLII, so it was not used. No POTRAZ certification authority process found."
  },
  {
    "id": "health",
    "reg": "HEALTH",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "health"
    ],
    "status": "verify",
    "title": "Health platforms: clinician registration, telemedicine policy and device rules",
    "headline": "Telemedicine must link to registered premises, so a fully virtual clinic is not permitted under the 2022 doctors' policy.",
    "summary": "Only condoms and gloves are currently regulated as medical devices, and no MCAZ rule on health software was found. The clinicians you onboard must still be registered with their councils.",
    "facts": [
      {
        "label": "Devices",
        "value": "MCAZ's own submission says only condoms and gloves are regulated as devices. Draft device and diagnostic regulations exist, with basic controls planned for 2026. No rule on health software or apps was found."
      },
      {
        "label": "Telemedicine",
        "value": "The 2022 policy of the Medical and Dental Practitioners Council binds doctors, not tech firms: telemedicine must link to registered premises, with explicit consent and secure records, and the doctor carries the risk."
      },
      {
        "label": "Clinicians",
        "value": "The Health Professions Authority is an umbrella over eight councils. Each clinician registers with their own council (our inference, not confirmed)."
      },
      {
        "label": "Patient data",
        "value": "The Cyber and Data Protection Act applies, so see the POTRAZ licence rules above."
      },
      {
        "label": "Online pharmacy",
        "value": "No Zimbabwean rule was found."
      }
    ],
    "note": "Pharmacy, telemedicine and device points come from a regulator submission and an opinion piece. The Public Health Act and Medical Services Act duties on patient data were not found.",
    "sources": [
      {
        "t": "MCAZ submission to IMDRF",
        "u": "https://imdrf.org/sites/default/files/2025-04/MCAZ%20-%20Zimbabwe.pdf"
      },
      {
        "t": "Techzim on the MDPCZ telemedicine policy",
        "u": "https://techzim.co.zw/2022/10/what-you-should-know-about-the-recently-published-mdpcz-policy-on-telemedicine"
      },
      {
        "t": "Health Professions Authority",
        "u": "https://hpa.co.zw/"
      }
    ],
    "steps": [
      {
        "t": "Register practitioners with the professional council",
        "d": "Doctors use MDPCZ (8 Harvey Brown, Milton Park, Harare; mdpcz@mdpcz.co.zw). Annual fees are due 31 Dec and 50 CPD points by 30 Sept."
      },
      {
        "t": "Register health premises with HPA",
        "d": "Clinics, labs, consulting rooms and pharmacies must be registered. Get a local authority health report, apply via the professional council, then pay HPA. HPA inspects within two weeks."
      },
      {
        "t": "Display the HPA certificate and renew yearly",
        "d": "Certificates last one calendar year and renew by 1 January. Operating before inspection and approval is an offence."
      },
      {
        "t": "Follow the MDPCZ telemedicine policy",
        "d": "Reported: practitioners work from registered premises, protect privacy, document consultations, store records securely and avoid WhatsApp. The policy binds doctors, not platforms."
      },
      {
        "t": "Check medical device status with MCAZ",
        "d": "MCAZ's IMDRF paper says only condoms and gloves are regulated now. Draft regulations cover IVDs and device import, export and manufacture. Basic controls are planned for 2026."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "hpa.co.zw",
        "u": "https://hpa.co.zw/inspectorate-department/"
      },
      {
        "t": "mdpcz.co.zw",
        "u": "https://www.mdpcz.co.zw/faqs"
      },
      {
        "t": "techzim.co.zw",
        "u": "https://techzim.co.zw/2022/10/what-you-should-know-about-the-recently-published-mdpcz-policy-on-telemedicine"
      },
      {
        "t": "imdrf.org",
        "u": "https://imdrf.org/sites/default/files/2025-04/MCAZ%20-%20Zimbabwe.pdf"
      },
      {
        "t": "live.hpa.co.zw",
        "u": "https://live.hpa.co.zw/Register/register"
      }
    ],
    "stepsCheck": "No official telemedicine policy text or platform licence route found. Fee amounts (SI 78 of 2017), the HPA registration manual and the current MCAZ device regime were not opened. Whether the draft device rules are in force is unconfirmed."
  },
  {
    "id": "edtech",
    "reg": "EDU",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "education"
    ],
    "status": "verify",
    "title": "Education platforms: schools and higher education programmes",
    "headline": "Non-government schools must be registered, and every higher education programme needs ZIMCHE accreditation before it is offered.",
    "summary": "Nothing was found on online-only schools. The March 2026 online-degree standards cover conventional universities, not new providers.",
    "facts": [
      {
        "label": "Schools",
        "value": "Non-government schools must be registered under Education Act s15 [Chapter 25:04] and may operate only on specified premises (s20). The registering authority and penalties were not confirmed."
      },
      {
        "label": "Higher education",
        "value": "ZIMCHE accredits each programme before it is offered, and fees must be paid first (amounts not stated). Online-degree standards were approved on 25 March 2026 and cover conventional universities only."
      },
      {
        "label": "Training colleges",
        "value": "Government closed 368 colleges and training centres in September 2024 for lacking documents under the Manpower Planning and Development Act (reported). No TEVETA or HEXCO route for online providers was confirmed."
      }
    ],
    "note": "Treat all of this as leads to confirm with the Ministry or ZIMCHE.",
    "sources": [
      {
        "t": "Education Act (ZimLII)",
        "u": "https://www.zimlii.org/akn/zw/act/1987/5/eng@2016-12-31"
      },
      {
        "t": "ZIMCHE programme accreditation",
        "u": "https://www.zimche.ac.zw/accreditation/programme-accreditation"
      },
      {
        "t": "allAfrica on the 2024 college closures",
        "u": "https://allafrica.com/stories/202409090032.html"
      }
    ],
    "steps": [
      {
        "t": "Register a school under the Education Act s 15",
        "d": "Non-Government schools need registration or provisional registration, a certificate, and may operate only at the premises it names (ss 15, 19, 20). The Act's procedure text was not readable."
      },
      {
        "t": "Collect ZIMCHE forms PRC1 to PRC3 for a new institution",
        "d": "PRC1 gives the criteria. PRC2 is provisional registration for a private university and PRC3 for a foreign university's agent. An application fee applies."
      },
      {
        "t": "Submit charter, business plan, regulations and site plan",
        "d": "ZIMCHE reviews, asks for amendments, and visits the site. Foreign-university agents add proof of parent accreditation and the agreement."
      },
      {
        "t": "Submit the programme accreditation application",
        "d": "Provide a letter, programme regulations, entry requirements, course outlines, staffing, stakeholder evidence, registrar and bursar letters, enrolment, library and ICT details."
      },
      {
        "t": "Go through peer review and site visit to accreditation",
        "d": "Three peer reviewers assess it, the institution revises, ZIMCHE visits, and the Council chairperson issues the accreditation letter. Prescribed fees must be paid first."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimche.ac.zw",
        "u": "https://zimche.ac.zw/?p=27"
      },
      {
        "t": "zimche.ac.zw",
        "u": "https://www.zimche.ac.zw/accreditation/programme-accreditation"
      },
      {
        "t": "zimche.ac.zw",
        "u": "https://www.zimche.ac.zw/accreditation/"
      },
      {
        "t": "zimlii.org",
        "u": "https://www.zimlii.org/akn/zw/act/1987/5/eng@2016-12-31"
      }
    ],
    "stepsCheck": "Ministry of Primary and Secondary Education steps, forms and fees were not found (Herald articles failed to load). ZIMCHE fee amounts, timelines and address are not published. An app with no physical school may not need school registration, which sources do not address."
  },
  {
    "id": "proptech",
    "reg": "EACZ",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "property"
    ],
    "status": "verify",
    "title": "Property platforms: estate agent registration",
    "headline": "Practising as an estate agent without registration is an offence, and the definition includes collecting rent or deposits.",
    "summary": "Bringing parties together for payment, negotiating, valuing, and collecting rent or deposits count as practising. Advertising alone is not listed, so a pure listings portal may fall outside, but that is not confirmed.",
    "facts": [
      {
        "label": "Offence (s60)",
        "value": "An unregistered person who practises or holds themselves out as an agent: the greater of three times the commission or a level-8 fine, and/or up to 1 year in prison."
      },
      {
        "label": "Foreign ownership",
        "value": "Estate agencies are a reserved sector under S.I. 215 of 2025."
      },
      {
        "label": "Platform terms",
        "value": "One portal's terms mention a fidelity certificate and a trust account, which we could not verify."
      }
    ],
    "note": "No official statement on whether a listings portal must register was found. A commission-earning or rent-collecting model would likely be caught.",
    "sources": [
      {
        "t": "Estate Agents Act (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/1999/6/eng@2016-12-31/source"
      }
    ],
    "steps": [
      {
        "t": "Check you qualify under s 25",
        "d": "Age of majority, a passed exam or recognised qualification, Schedule experience, and no dishonesty conviction in the past five years."
      },
      {
        "t": "Apply to the Registrar with documents and fee",
        "d": "Section 27 requires prescribed documents, identity evidence and the fee. The Registrar refers it to the Council (s 28), which decides (s 29)."
      },
      {
        "t": "Agencies: appoint a principal agent and prepare company papers",
        "d": "Reported: a PREA who is a director, tax clearance, police clearance for directors, CR6 and CR11, EAC 3 form, trust-account bank letter, accountant letter."
      },
      {
        "t": "Open a trust account",
        "d": "Every practising agent must hold a separate trust account at a commercial bank and bank client money within six days (s 51)."
      },
      {
        "t": "Obtain a Compensation Fund certificate",
        "d": "Apply and pay the contribution before practising. It is valid to 31 December each year (s 41)."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/1999/6/eng@2016-12-31/source"
      },
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/1999/6"
      },
      {
        "t": "propertybook.co.zw",
        "u": "https://www.propertybook.co.zw/blog/essential-legal-requirements-for-estate-agents-in-zimbabwe"
      }
    ],
    "stepsCheck": "No Council site or form was opened. Fees (a blog says about US$200-500 initial, US$100-300 renewal) and agency checklist details are unofficial. The unread last 13,000 characters of the Act may hold the Schedule. Whether a listings platform itself needs registration is unaddressed."
  },
  {
    "id": "agritech",
    "reg": "AGRI",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "agri"
    ],
    "status": "verify",
    "title": "Agriculture platforms: input registration and warehouse receipts",
    "headline": "Fertilisers, feeds and remedies must be registered with the FFRI, and warehouses and managers need licences under the Warehouse Receipt Act.",
    "summary": "If your platform sells inputs or issues warehouse receipts, two registrations matter. Nothing specific was found on contract farming or digital marketplaces.",
    "facts": [
      {
        "label": "Inputs",
        "value": "Fertilisers, feeds and remedies must be registered with the Fertilizer, Farm Feeds and Remedies Institute: fertiliser US$100, feed US$75, renewed annually, with a late-renewal penalty equal to the fee."
      },
      {
        "label": "Warehouse receipts",
        "value": "The Warehouse Receipt Act [Chapter 18:25] requires warehouse registration and manager licensing, for the commodities in its Schedule. Penalty up to level 6 and/or 1 year."
      },
      {
        "label": "ZMX",
        "value": "The Reserve Bank gave ZMX's receipt system liquid asset status in June 2023 (reported)."
      }
    ],
    "note": "A September 2025 report says some agricultural levies and permits were cut, but not which ones.",
    "sources": [
      {
        "t": "Warehouse Receipt Act (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/2007/13"
      },
      {
        "t": "FFRI registration requirements",
        "u": "https://esw.gov.zw/content/documents/FFRI_RegistrationRequirements.pdf"
      }
    ],
    "steps": [
      {
        "t": "Fertilizers: submit sample and package to FFRI with Form F.F.1",
        "d": "Send about 500 g and the package, pay the nutrient-based analysis fee, and file F.F.1 in triplicate. Address: Research Services Dept, FFRI, Fifth St Extension, Causeway, Harare."
      },
      {
        "t": "Pay registration fee and receive certificate",
        "d": "After results are recommended, pay US$100 (fertilizer) or US$75 (feeds; analysis US$60). Renew annually with F.F.2. Late renewal is penalised."
      },
      {
        "t": "Pesticides: assemble manufacturer dossier and trials",
        "d": "Only a registered company with inspected warehouses can apply. Needs an experimental import permit, lab analysis and three seasons of efficacy trials, then Form P1 and labels. Valid three years."
      },
      {
        "t": "Warehouse operators: apply to the Registrar of Warehouses",
        "d": "Only bodies corporate can apply. Include articles, warehouseperson qualifications, financial capacity, warehouse plans, insurance and fee. The Registrar decides within 15 days (s 4)."
      },
      {
        "t": "Get warehousepersons licensed before issuing receipts",
        "d": "Only a licensed warehouseperson may issue warehouse receipts (ss 10, 15). Pay annual fees per warehouse and per warehouseperson. The Registrar inspects yearly."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "esw.gov.zw",
        "u": "https://esw.gov.zw/content/documents/FFRI_RegistrationRequirements.pdf"
      },
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/2007/13"
      }
    ],
    "stepsCheck": "FFRI processing times and seed-registration steps were not found. Warehouse registration and licence fee amounts are prescribed elsewhere and not found. Fertilizer imports also need a Control of Goods certificate. The 2007 Act text was not checked for later amendments."
  },
  {
    "id": "tourism",
    "reg": "ZTA",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "tourism"
    ],
    "status": "reported",
    "title": "Tourism and booking platforms: ZTA registration",
    "headline": "Tourism Act No. 5 of 2026 will make platforms ensure their hosts are registered, once it commences.",
    "summary": "Registering designated tourism facilities with the Zimbabwe Tourism Authority is already mandatory, and a new Act published on 18 September 2026 widens it to online hosts and platforms.",
    "facts": [
      {
        "label": "Current law",
        "value": "Registration is mandatory under s36 of the Tourism Act [Chapter 14:20]. A 2026 compliance drive had a deadline of 28 February 2026, with a new blitz announced on 7 October 2026. Fees were \"significantly reduced\" (no amounts given)."
      },
      {
        "label": "New Act",
        "value": "Tourism Act No. 5 of 2026 was published on 18 September 2026 and takes effect on a date to be fixed by statutory instrument."
      },
      {
        "label": "Platforms and hosts",
        "value": "Hosts must register before listing. Platforms must ensure their hosts are registered. Existing platforms get 90 days to comply."
      },
      {
        "label": "Penalty",
        "value": "Operating without registration: a level-12 fine and/or 1 year (s23)."
      }
    ],
    "note": "The commencement date and ZTA fee amounts are not confirmed, and the new Act's details come from a law-firm blog.",
    "sources": [
      {
        "t": "ZTA on registering tourism facilities",
        "u": "https://zimbabwetourism.net/registration-of-tourism-facilities-with-the-zimbabwe-tourism-authority-zta/"
      },
      {
        "t": "Afriwise on the Tourism Act No. 5 of 2026",
        "u": "https://www.afriwise.com/blog/the-tourism-act-no-5-of-2026-a-closer-look-at-what-is-new-in-the-regulation-of-zimbabwes-tourism-industry"
      }
    ],
    "steps": [
      {
        "t": "Confirm you are a designated tourist facility",
        "d": "Section 36 of the Tourism Act [Chapter 14:20] requires registration of tourism-related businesses. The ZTA notice gave a 28 Feb 2026 deadline, with inspections from 1 March."
      },
      {
        "t": "Get the registration form",
        "d": "ZTA's site has a Registration Form page (zimbabwetourism.net/registration-forms/). Its downloads did not display when opened. Ask ZTA for the form."
      },
      {
        "t": "Submit by email or in person",
        "d": "Email registration@ztazim.co.zw or visit any ZTA office. Government says fees were cut across all categories, but no amounts are given."
      },
      {
        "t": "Prepare for inspection and grading",
        "d": "ZTA inspects for registration and grading. Accommodation grading is reported to occur every two years or after major refurbishment."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimbabwetourism.net",
        "u": "https://zimbabwetourism.net/registration-of-tourism-facilities-with-the-zimbabwe-tourism-authority-zta/"
      },
      {
        "t": "zimbabwetourism.net",
        "u": "https://zimbabwetourism.net/registration-forms/"
      },
      {
        "t": "atta.travel",
        "u": "https://atta.travel/resource/zimbabwe-tourism-authority-rolls-out-nationwide-compliance-crackdown.html"
      }
    ],
    "stepsCheck": "Document list, fee amounts, categories, timelines and any online portal were not found. Whether an online booking platform that owns no facility must register is not stated. Renewal terms were not found."
  },
  {
    "id": "energy",
    "reg": "ZERA",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "energy"
    ],
    "status": "verify",
    "title": "Solar and energy startups: ZERA licensing and registration",
    "headline": "Generation above 10 MW needs a licence, and 100 kW to 10 MW for own use needs registration before construction.",
    "summary": "S.I. 126 of 2026 (31 July 2026) sets the capacity rules for own-consumption plants. ZERA's June 2026 guidelines say undertakings above 100 kW must be licensed, which conflicts, so ask ZERA which prevails.",
    "facts": [
      {
        "label": "Licence categories",
        "value": "Generation, transmission, bulk supply, distribution and retail supply (ZERA Licensing Guidelines, revised June 2026)."
      },
      {
        "label": "Fees (US$, excl. VAT)",
        "value": "Application US$20 per licence. Own-consumption and non-commercial off-grid generation: no licence fee. Retail supply 40,000. Bulk supply 50,000. Renewable commercial plants under 10 MW: no licence fee. Above 10 MW, solar PV 2,875 fixed plus 1,437.50 per 25 MW. Amendment, transfer or renewal 2,000."
      },
      {
        "label": "S.I. 126 of 2026",
        "value": "Above 10 MW: a licence. 100 kW to 10 MW: register on Form GFOC1 before construction, with a grid impact report, proof of land and an EIA or EMA exemption letter; Form GFOC2 with a commissioning certificate. The registration fee is printed \"US$10,00\"."
      },
      {
        "label": "Solar products",
        "value": "ZERA's product registration portal covers modules, batteries, inverters, charge controllers, pico-solar and home system kits, citing IEC standards. It is aimed at importers and dealers. No fees or dates were stated."
      },
      {
        "label": "Environment",
        "value": "EMA requires an environmental impact assessment for thermal and hydro power stations and high-voltage lines; solar and e-waste are not mentioned. Hazardous Waste Regulations allow disposal only at licensed sites."
      }
    ],
    "note": "Net-metering and surplus-sale rules, mini-grid classification, installer licensing and fuel retail were not found. The EMA review fee is printed unclearly (\"1, 5%\").",
    "sources": [
      {
        "t": "ZERA Electricity Licensing Guidelines",
        "u": "https://www.zera.co.zw/wp-content/uploads/simple-file-list/Electricity-Guidelines-and-Regulations/Electricity-Licencing-Guidelines-.pdf"
      },
      {
        "t": "S.I. 126 of 2026 (ZERA)",
        "u": "https://www.zera.co.zw/wp-content/uploads/simple-file-list/Electricity-Guidelines-and-Regulations/S_I_-126-of-2026-Electricity-Own-Consumption-Undertakings-Licensing-Norm.pdf"
      },
      {
        "t": "ZERA solar product registration",
        "u": "https://solarprs.zera.co.zw/"
      },
      {
        "t": "EMA EIA FAQ",
        "u": "https://ema.co.zw/wp-content/uploads/2022/12/Environmental-Impact-Assessment-Frequently-Asked-Questions.pdf"
      }
    ],
    "steps": [
      {
        "t": "Pick your route by size and purpose",
        "d": "Reported on S.I. 126 of 2026: own-use generation of 100 kW to 10 MW registers; above 10 MW needs a full licence. ZERA's generation form says licences are needed above 100 kW, so confirm with ZERA."
      },
      {
        "t": "Register before building with Form GFOC1",
        "d": "Reported attachments: grid impact assessment, company papers, land access proof, EIA or exemption letter, US$10 fee. ZERA lists the form under Guidelines & Regulations."
      },
      {
        "t": "Build, then file GFOC2 before switching on",
        "d": "GFOC2 is the notification to operate, with a commissioning certificate. ZERA reportedly publishes a quarterly list of registered facilities."
      },
      {
        "t": "Generation licence route: email ZERA the application",
        "d": "Form revised 10 July 2026 (application fee US$20 plus VAT). Email electricitylicensing@zera.co.zw, or deliver to Mount Pleasant Business Park, Harare. Needs business plan, tax clearance, grid assessment, EIA."
      },
      {
        "t": "Importers: register each solar product on the ZERA portal",
        "d": "Companies that import and sell solar products create a profile at solarprs.zera.co.zw and submit standard-compliance evidence. After approval, download the certificate; it is listed publicly."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zera.co.zw",
        "u": "https://www.zera.co.zw/?p=464"
      },
      {
        "t": "zela.org",
        "u": "https://zela.org/how-zimbabwe-has-changed-the-rules-of-energy-investment/"
      },
      {
        "t": "zera.co.zw",
        "u": "https://www.zera.co.zw/wp-content/uploads/simple-file-list/Electricity-Applications/Generation-Licence-Application-Form-Revised-10-July-2026.pdf"
      },
      {
        "t": "solarprs.zera.co.zw",
        "u": "https://solarprs.zera.co.zw/"
      }
    ],
    "stepsCheck": "The GFOC1 and GFOC2 forms and S.I. 126 were not opened. Their steps come from a ZELA article. Sub-100 kW rules, installer licensing, solar product fees, test-report lists and timelines are not published. S.I. 121 of 2026 (renewable energy engineer category) was not checked."
  },
  {
    "id": "transport-ops",
    "reg": "TRANSPORT",
    "scope": "specific",
    "phase": "before",
    "tags": [
      "courier",
      "ridehailing"
    ],
    "status": "official",
    "title": "Operator licences for freight, passenger and delivery vehicles",
    "headline": "Goods vehicles over 10 tonnes, omnibuses, taxicabs and tours need an operator licence. Motorbikes and small vans are not addressed.",
    "summary": "The Road Motor Transportation Act sets who needs an operator licence. Delivery startups on motorbikes need the right driver's licence class, but no operator licence rule for them was found.",
    "facts": [
      {
        "label": "Who needs a licence",
        "value": "Goods vehicles over 10 t (or 10 t or less towing over 15 t combined), omnibuses, taxicabs and tours."
      },
      {
        "label": "Also needed",
        "value": "Vehicle registration under the Vehicle Act and a certificate of fitness."
      },
      {
        "label": "Term and issuer",
        "value": "Up to 3 years, issued by the Commissioner of Road Transport."
      },
      {
        "label": "Penalty",
        "value": "Operating without a licence: up to level 9 and/or 6 months."
      },
      {
        "label": "Motorbike couriers",
        "value": "Business Times (11 June 2026) reports that commercial delivery needs a Class A or A1 licence; a provisional licence does not permit it. It cites S.I. 119 of 2023 for the classes."
      }
    ],
    "note": "Licence fees, ZINARA fees and Harare or Bulawayo delivery permits were not found.",
    "sources": [
      {
        "t": "Road Motor Transportation Act (ZimLII)",
        "u": "https://zimlii.org/akn/zw/act/1997/1/eng@2016-12-31"
      },
      {
        "t": "Business Times on motorcycle licensing",
        "u": "https://businesstimes.co.zw/motorcycle-boom-raises-questions-over-licensing-and-road-safety/"
      }
    ],
    "steps": [
      {
        "t": "Confirm your vehicles need a licence",
        "d": "Goods vehicles above 10 tonnes (or combinations above 15 t), omnibuses seating over 7, hire taxis and organised tours or safaris need an operator's licence (s 2, s 7)."
      },
      {
        "t": "Get a certificate of fitness, insurance and vehicle licence",
        "d": "The application must include a valid certificate of fitness, Road Traffic Act insurance and the fee (s 8(3)). Stage-carriage services also need a route authority."
      },
      {
        "t": "Apply to the Commissioner of Road Transport",
        "d": "Use the prescribed form, state the type of operation and whether it is wholly in Zimbabwe or partly abroad (s 8). A company still being formed may apply."
      },
      {
        "t": "Respond to any refusal notice",
        "d": "Before refusing, the Commissioner must allow representations and give written reasons on request. Appeal to the Administrative Court within 30 days (ss 9, 34)."
      },
      {
        "t": "After approval, display and renew",
        "d": "The licence lasts up to three years, expiring on 31 Jan, 31 May or 30 Sept. It is not transferable. Keep the fitness certificate and route authority displayed, and apply to renew (ss 10, 11, 14, 18)."
      }
    ],
    "stepsBasis": "official",
    "stepsSources": [
      {
        "t": "zimlii.org",
        "u": "https://zimlii.org/akn/zw/act/1997/1/eng@2016-12-31"
      },
      {
        "t": "equityaxis.net",
        "u": "https://equityaxis.net/post/19447/2026/9/zimbabwe-gives-indrive-tap-go-and-bolt-five-months-to-build-a-sustainable-ride-hailing-model"
      }
    ],
    "stepsCheck": "The prescribed form, office address and processing time were not found. The US$125 three-year fee comes from a news report of SI 6 of 2026. Whether small delivery vans fall under the Act is not addressed (the 10 t threshold suggests not)."
  }
];

export const GAPS: string[] = [
  "Payment aggregator or gateway minimum capital, and whether the RBZ fintech sandbox is open.",
  "Suspicious transaction reporting duties and thresholds (Money Laundering Act sections 26 to 30).",
  "Digital lending, buy-now-pay-later and interest-rate cap rules, and the Money Lending and Rates of Interest Act.",
  "Text of S.I. 95 of 2014 on subscriber registration, and whether airtime agents are bound.",
  "The final POTRAZ converged licensing framework: what Application Services covers for apps, SaaS and content.",
  "The final text of POTRAZ Regulatory Notice 2 of 2026 and CDPG 1 of 2025, and inspection dates.",
  "Whether delivery apps need a POTRAZ courier licence, and the current type-approval device list and fees.",
  "The e-hailing statutory instrument, the moratorium dates and any fees, once published.",
  "BAZ fees and penalties for online broadcasting, and any registration rule for online news sites.",
  "Current Companies Registry name, fees and online steps, and current ZIPO or CIPZ fees.",
  "ZTA fees and the Tourism Act 2026 commencement date; Estate Agents Council position on listings portals.",
  "MCAZ rules for health software, ZERA net-metering and mini-grid rules, and ZINARA and council delivery permits.",
  "Startup Bill status, small-business presumptive tax rates, and whether VAT is 15.5%."
];

/**
 * The four buckets a founder reads the results in. Which bucket a rule falls
 * in comes from its scope (does it depend on what you build?) and phase (is it
 * a gate before you start, a duty once you run, or still moving?).
 */
export const GROUP_INFO: Record<GroupKey, { title: string; caption: string; note: string }> = {
  before: {
    title: "Can't start without",
    caption: 'Licences and registrations for your idea',
    note: 'Get these in place before you launch or take your first customer. POTRAZ rules come first.',
  },
  general: {
    title: 'General',
    caption: 'Every business',
    note: 'These apply to almost every startup, whatever you build.',
  },
  running: {
    title: "Once you're running",
    caption: 'Ongoing duties for your idea',
    note: "You can launch first, but these apply as soon as you operate.",
  },
  watch: {
    title: 'Still changing or optional',
    caption: 'Moving targets and optional routes',
    note: 'Rules still being written, and optional routes. Check these before you commit.',
  },
};

export const PHASE_LABEL: Record<Rule['phase'], string> = {
  before: 'Needed before you start',
  running: 'Ongoing duty',
  watch: 'Changing or optional',
};
