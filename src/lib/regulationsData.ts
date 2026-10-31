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
import type { Regulator, Rule, Sector } from './regulations.ts';

export const CHECKED = '31 Oct 2026';

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
  }
};

export const REGULATOR_ORDER: Regulator[] = [
  "POTRAZ",
  "RBZ",
  "FIU",
  "SECZ",
  "IPEC",
  "TRANSPORT",
  "CAAZ",
  "CONSUMER",
  "ZIMRA",
  "REGISTRAR"
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
    "pattern": "\\b(wallet|mobile money|payment|pay\\b|payroll|remit|transfer|send money|fintech|lend|loan|credit|bank|ecocash|card\\b|merchant|pos\\b|bill pay|savings|microfinance|forex|diaspora)"
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
  }
];

export const RULES: Rule[] = [
  {
    "id": "dp-licence",
    "reg": "POTRAZ",
    "tags": [
      "data"
    ],
    "baseline": true,
    "general": false,
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
        "value": "Processing without a licence: a fine up to level 11, up to 7 years in prison, or both."
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
      }
    ]
  },
  {
    "id": "dp-dpo",
    "reg": "POTRAZ",
    "tags": [
      "data"
    ],
    "baseline": true,
    "general": false,
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
    ]
  },
  {
    "id": "dp-breach",
    "reg": "POTRAZ",
    "tags": [
      "data"
    ],
    "baseline": true,
    "general": false,
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
    "note": "A 2026 vendor guide mentions mandatory staff training and POTRAZ inspections from 1 September 2026. We could not confirm that against a POTRAZ notice.",
    "sources": [
      {
        "t": "S.I. 155 of 2024 on POTRAZ",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2025/02/sI-155-of-2024-Cyber-and-Data-Protection-Normal_240913_1250178.pdf"
      }
    ]
  },
  {
    "id": "cyber-offences",
    "reg": "POTRAZ",
    "tags": [
      "social"
    ],
    "baseline": false,
    "general": false,
    "status": "reported",
    "title": "Cyber-crime offences that touch platforms and user content",
    "headline": "Hacking, data interference, cyber-bullying and non-consensual explicit content are criminal offences.",
    "summary": "The Cyber and Data Protection Act amends sections 163 to 166 of the Criminal Law (Codification and Reform) Act [Chapter 9:23]. Platform builders should plan moderation and takedown accordingly.",
    "facts": [
      {
        "label": "Offences named",
        "value": "Unlawful acquisition, interference with and disclosure of data and data codes; hacking; spam; threatening messages; inciting violence through data messages; cyber-bullying and harassment; posting sexually explicit content without consent."
      },
      {
        "label": "Penalties",
        "value": "A law-firm note says fines and prison terms of up to fifteen years. The word is garbled in the source, so treat the figure as unconfirmed."
      }
    ],
    "note": "From a December 2021 law-firm summary. Read the Act for exact wording and sentences.",
    "sources": [
      {
        "t": "MMM Law: overview of the data protection law",
        "u": "https://www.mmmlawfirm.co.zw/general-overview-of-the-new-data-protection-law-in-zimbabwe/"
      }
    ]
  },
  {
    "id": "potraz-isp",
    "reg": "POTRAZ",
    "tags": [
      "isp"
    ],
    "baseline": false,
    "general": false,
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
    ]
  },
  {
    "id": "potraz-mvno",
    "reg": "POTRAZ",
    "tags": [
      "mvno"
    ],
    "baseline": false,
    "general": false,
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
    ]
  },
  {
    "id": "potraz-app",
    "reg": "POTRAZ",
    "tags": [
      "vas",
      "platform"
    ],
    "baseline": false,
    "general": false,
    "status": "verify",
    "title": "Application Services licence (category 1.4)",
    "headline": "A category called Application Services exists with a $525,000 initial fee. Whether your app needs it is not stated.",
    "summary": "POTRAZ's fee table has no category named value-added services and does not define who must hold Application Services. Do not assume you need it, and do not assume you are exempt.",
    "facts": [
      {
        "label": "Application",
        "value": "$800."
      },
      {
        "label": "Initial or renewal",
        "value": "$525,000."
      },
      {
        "label": "Levy",
        "value": "3.5% of gross turnover plus VAT."
      },
      {
        "label": "Term",
        "value": "20 years."
      }
    ],
    "note": "Ask POTRAZ in writing whether your product counts as an application service. Keep the reply on file.",
    "sources": [
      {
        "t": "POTRAZ licence categories and fees (PDF)",
        "u": "https://www.potraz.gov.zw/wp-content/uploads/2022/03/Licence-Categories-Including-Fees.pdf"
      }
    ]
  },
  {
    "id": "potraz-codes",
    "reg": "POTRAZ",
    "tags": [
      "vas"
    ],
    "baseline": false,
    "general": false,
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
    ]
  },
  {
    "id": "potraz-type",
    "reg": "POTRAZ",
    "tags": [
      "hardware",
      "isp",
      "drones"
    ],
    "baseline": false,
    "general": false,
    "status": "verify",
    "title": "Type approval for radio and telecom equipment",
    "headline": "A testing lab says POTRAZ approval is mandatory for radio equipment, taking about six weeks.",
    "summary": "Devices with radios such as WLAN, Bluetooth and Zigbee reportedly need POTRAZ homologation before they are sold or used. We could not find the regulation itself.",
    "facts": [
      {
        "label": "Authority",
        "value": "POTRAZ."
      },
      {
        "label": "Status",
        "value": "Mandatory, according to the lab."
      },
      {
        "label": "Local representative",
        "value": "Not required."
      },
      {
        "label": "In-country testing",
        "value": "Not required."
      },
      {
        "label": "Typical lead time",
        "value": "About 6 weeks for radio type approval."
      },
      {
        "label": "Validity",
        "value": "Listed as no expiry."
      }
    ],
    "note": "The only source is a commercial testing company's sales page. The governing regulation and POTRAZ's fees were not found. Confirm with POTRAZ.",
    "sources": [
      {
        "t": "IBL type approval page (commercial lab)",
        "u": "https://ib-lenhardt.com/type-approval/zimbabwe"
      }
    ]
  },
  {
    "id": "potraz-courier",
    "reg": "POTRAZ",
    "tags": [
      "courier"
    ],
    "baseline": false,
    "general": false,
    "status": "verify",
    "title": "Postal and courier operator licence",
    "headline": "POTRAZ licenses courier operators, and unlicensed runners have been arrested.",
    "summary": "Delivery startups that carry other people's parcels fall under POTRAZ's postal rules. Reporting from 2021 shows POTRAZ moving to bring informal runners into licensing.",
    "facts": [
      {
        "label": "What was reported",
        "value": "April 2021: a runner (malaicha) arrested for operating without a licence. May 2021: POTRAZ to give malaicha runners courier licences. Herald headline: Potraz to license courier operators."
      },
      {
        "label": "Categories and fees",
        "value": "Not confirmed. The pages with the detail could not be read."
      }
    ],
    "note": "We have headlines only. Ask POTRAZ for the current Postal Services Regulations and the licence fee schedule.",
    "sources": [
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
    ]
  },
  {
    "id": "rbz-mm",
    "reg": "RBZ",
    "tags": [
      "payments"
    ],
    "baseline": false,
    "general": false,
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
    ]
  },
  {
    "id": "fiu-vasp",
    "reg": "FIU",
    "tags": [
      "crypto"
    ],
    "baseline": false,
    "general": false,
    "status": "reported",
    "title": "Virtual asset service provider registration",
    "headline": "Crypto businesses must register with the Financial Intelligence Unit. Registration is not permission to operate.",
    "summary": "S.I. 99 of 2026 brought crypto exchanges, transfer services and custody providers under anti-money-laundering rules. Other regulators may still need to authorise your business.",
    "facts": [
      {
        "label": "Law",
        "value": "S.I. 99 of 2026: Money Laundering and Proceeds of Crime (Virtual Asset Service Providers Registration) Regulations, 2026."
      },
      {
        "label": "Who",
        "value": "Any person involved in activities related to virtual assets, including exchanging them for fiat money, transferring them and keeping them safe."
      },
      {
        "label": "Regulator",
        "value": "The Financial Intelligence Unit. One outlet says the central bank; the FIU's own public notice, quoted by the Herald, says the FIU."
      },
      {
        "label": "Still needed",
        "value": "The Reserve Bank, SECZ and others may need to authorise your business separately."
      },
      {
        "label": "Registration cycle",
        "value": "One outlet says annual registration. Fees, deadlines for existing operators and penalties were not found."
      }
    ],
    "note": "The regulation text and the FIU notice were not read. The effective date is unknown. Whether a fiat-only remittance service is covered is unclear.",
    "sources": [
      {
        "t": "Herald: FIU moves to regulate virtual asset service providers",
        "u": "https://www.heraldonline.co.zw/fiu-moves-to-regulate-virtual-asset-service/"
      },
      {
        "t": "Techbuild Africa on the crypto rulebook",
        "u": "https://techbuild.africa/regulatory-zimbabwes-crypto-industry-rulebook/"
      },
      {
        "t": "Sumsub on the SECZ sandbox",
        "u": "https://sumsub.com/media/news/zimbabwe-approves-seven-fintechs-for-regulatory-sandbox/"
      }
    ]
  },
  {
    "id": "secz-sandbox",
    "reg": "SECZ",
    "tags": [
      "investment",
      "crypto"
    ],
    "baseline": false,
    "general": false,
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
    ]
  },
  {
    "id": "ipec",
    "reg": "IPEC",
    "tags": [
      "insurtech"
    ],
    "baseline": false,
    "general": false,
    "status": "reported",
    "title": "IPEC sandbox and the 2026 amendments",
    "headline": "IPEC has a regulatory sandbox, and amendments widen who it registers.",
    "summary": "Insurance and pension startups deal with the Insurance and Pensions Commission. Business Times reported the sandbox launch in May 2026.",
    "facts": [
      {
        "label": "Sandbox",
        "value": "Described on 16 May 2026 as a controlled and supervised environment for innovation, financial inclusion and technology-driven solutions. Eligibility and activities were behind a paywall."
      },
      {
        "label": "Registration",
        "value": "A law-firm note on the Amendment Act says IPEC registers insurers, mutual insurance societies, brokers, medical aid societies and pension funds. Medical aid societies are regulated for the first time."
      },
      {
        "label": "Service providers",
        "value": "IPEC may approve actuaries, asset managers, credit rating agencies and other service providers."
      },
      {
        "label": "Ownership",
        "value": "A control threshold of 10% of shares or voting rights, or the power to appoint directors."
      },
      {
        "label": "Protection Fund",
        "value": "Insurers and pension funds contribute. Non-payment can draw a fine up to three times the unpaid contribution."
      }
    ],
    "note": "We could not confirm that the Amendment Act is in force. The sources do not discuss digital distribution or insurtech apps specifically.",
    "sources": [
      {
        "t": "MMM Law on the IPEC Amendment Act 2026",
        "u": "https://www.mmmlawfirm.co.zw/key-amendments-introduced-by-the-insurance-and-pensions-commission-amendment-act-2026/"
      },
      {
        "t": "Business Times on the IPEC sandbox",
        "u": "https://businesstimes.co.zw/ipec-launches-regulatory-sandbox-for-insurance-sector/"
      }
    ]
  },
  {
    "id": "ehailing",
    "reg": "TRANSPORT",
    "tags": [
      "ridehailing"
    ],
    "baseline": false,
    "general": false,
    "status": "reported",
    "title": "E-hailing: rules are being written",
    "headline": "Government says current law has no provision for e-hailing, and a five-month moratorium was reported on 8 Sep 2026.",
    "summary": "Ride-hailing sits in a gap. Expect new registration, safety standards and fees, and watch for the interim statutory instrument.",
    "facts": [
      {
        "label": "20 Aug 2026",
        "value": "The Transport Minister told Parliament there is no provision for e-hailing in the Road Motor Transportation Act, and that an interim statutory instrument is being prepared."
      },
      {
        "label": "8 Sep 2026",
        "value": "Cabinet was reported to have approved a five-month moratorium on regulating e-hailing, with an interim self-regulatory framework. The articles give no start or end dates."
      },
      {
        "label": "Platforms",
        "value": "Expected to register with ZIMRA. Operators already tax-registered must regularise that registration."
      },
      {
        "label": "Drivers",
        "value": "The head of the Passengers Association of Zimbabwe says vehicles need a certificate of fitness, a route permit and passenger liability cover. This is his statement, not a new rule."
      },
      {
        "label": "Enforcement",
        "value": "Harare City Council arrests reported on 13 Aug 2026. One driver said he was fined US$172."
      }
    ],
    "note": "No instrument has been seen. It is unclear whether the moratorium pauses enforcement. A commentator quoted by Nehanda Radio says there is no e-hailing permit category, and that reading has not been tested in court.",
    "sources": [
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
    ]
  },
  {
    "id": "dswt",
    "reg": "ZIMRA",
    "tags": [
      "ridehailing",
      "platform"
    ],
    "baseline": false,
    "general": false,
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
    ]
  },
  {
    "id": "drones",
    "reg": "CAAZ",
    "tags": [
      "drones"
    ],
    "baseline": false,
    "general": false,
    "status": "verify",
    "title": "Drones: CAAZ clearance and ZIMRA import rules",
    "headline": "Drones need CAAZ registration and clearance, and are cleared through ZIMRA on import.",
    "summary": "Commercial drone operators deal with the Civil Aviation Authority first, then customs. Broadcast drones need extra permits.",
    "facts": [
      {
        "label": "CAAZ",
        "value": "Registration and clearance using the make, model and serial number. A volunteer site says Zimbabweans always need a Letter of Approval for the remotely piloted aircraft, valid one year at first and then up to three."
      },
      {
        "label": "Insurance and airports",
        "value": "The same site says insurance is required and flights are banned within five kilometres of an airport."
      },
      {
        "label": "ZIMRA import",
        "value": "Bill of Entry Form 21 through a registered clearing agent. Form 49 may be used under US$1,000. A CAAZ clearance letter is required."
      },
      {
        "label": "Broadcasting drones",
        "value": "Permits from BAZ and POTRAZ are listed among the import documents."
      },
      {
        "label": "Fees",
        "value": "None stated in any source."
      }
    ],
    "note": "ZIMRA's page frames the CAAZ licence as a question, and the volunteer site is not official. CAAZ's site was reported as unreliable. Confirm with CAAZ directly.",
    "sources": [
      {
        "t": "ZIMRA on importing drones",
        "u": "https://zimra.co.zw/news/2207-importation-of-drones"
      },
      {
        "t": "drone-laws.com (volunteer site)",
        "u": "https://drone-laws.com/drone-laws-in-zimbabwe/"
      }
    ]
  },
  {
    "id": "cpa",
    "reg": "CONSUMER",
    "tags": [
      "ecommerce",
      "platform"
    ],
    "baseline": false,
    "general": false,
    "status": "reported",
    "title": "Consumer Protection Act duties for online sellers",
    "headline": "Seven-day cooling-off, and the advertised price binds you.",
    "summary": "The Consumer Protection Act, promulgated 10 December 2019, applies to online shops. Build the cooling-off and price display into your checkout.",
    "facts": [
      {
        "label": "Cooling-off",
        "value": "Sections 52 to 54: seven days to cancel without reason or penalty and return the goods."
      },
      {
        "label": "Advertised price",
        "value": "Section 26(5): a consumer shall not pay more than the advertised or displayed price, including taxes and levies. Exceptions: prices fixed by law, a price hidden behind a second price, or an erroneous price the supplier tried to correct."
      },
      {
        "label": "Marketing messages",
        "value": "Section 54: give an opt-out. Consumers may ask where you got their personal information."
      },
      {
        "label": "Conduct",
        "value": "Section 35(2) bars coercion, undue influence and harassment at marketing, supply, payment and return stages."
      }
    ],
    "note": "From January 2022 law-firm commentary. Refund timelines, the Consumer Protection Commission's powers and penalties were not covered. Check the Act text.",
    "sources": [
      {
        "t": "Mondaq: consumer protection guide for online shops (2022)",
        "u": "https://www.mondaq.com/dodd-frank-consumer-protection-act/1152768/consumer-protection-a-guide-for-online-shops-and-e-commerce-in-zimbabwe"
      }
    ]
  },
  {
    "id": "zimra-reg",
    "reg": "ZIMRA",
    "tags": [],
    "baseline": false,
    "general": true,
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
    ]
  },
  {
    "id": "company-reg",
    "reg": "REGISTRAR",
    "tags": [],
    "baseline": false,
    "general": true,
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
      }
    ],
    "note": "Sources are law-firm guides. They disagree on private business corporation member limits (under 20, or 1 to 20). Fees, online filing and the beneficial ownership register were not covered. NSSA registration is also not covered.",
    "sources": [
      {
        "t": "MMM Law on company registration (2022)",
        "u": "https://www.mmmlawfirm.co.zw/company-registrations-in-zimbabwe/"
      },
      {
        "t": "Cliffe Dekker Hofmeyr guide to setting up a company",
        "u": "https://www.cliffedekkerhofmeyr.com/guides/africa-corporate/zimbabwe/incorporation-process/what-is-the-process-of-setting-up-a-company.html"
      }
    ]
  }
];

export const GAPS: string[] = [
  "NSSA registration and contributions for employers.",
  "Lending and microfinance licensing (Microfinance Act) for credit startups.",
  "Which Reserve Bank route applies to payment aggregators and payment service providers, and current fees in ZiG or USD.",
  "Anti-money-laundering and KYC duties for fintechs that are not crypto businesses.",
  "Virtual asset provider fees, deadlines and the effective date of S.I. 99 of 2026.",
  "The text of the e-hailing interim statutory instrument, once gazetted.",
  "POTRAZ courier licence categories and fees, and the Postal Services Regulations.",
  "POTRAZ type approval regulation and fees.",
  "Broadcasting and streaming (BAZ), health, education and agri-tech regulation.",
  "Investment licences from ZIDA, and the beneficial ownership register."
];
