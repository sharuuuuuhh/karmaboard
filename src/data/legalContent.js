// TODO: Review this legal text and confirm the contact email before official publishing.
// This is a draft written in plain language for the campus league community and does not constitute formal legal advice.

export const LEGAL_CONFIG = {
  lastUpdated: "November 6, 2026",
  contactEmail: "karmayodha.tly@gmail.com",
  leagueName: "MuLearn TLY Campus League",
  platformName: "Karmayodha",
};

export const TERMS_SECTIONS = [
  {
    id: "about",
    number: "1",
    title: "About Karmayodha",
    content: [
      "Karmayodha is an independent karma-tracking and gamified leaderboard platform created for students and participants in the MuLearn TLY Campus League.",
      "The platform aggregates, visualizes, and celebrates learning achievements, technical contributions, and community involvement across campus guilds and teams in real time.",
    ],
  },
  {
    id: "eligibility",
    number: "2",
    title: "Eligibility & Accounts",
    content: [
      "Karmayodha is intended for campus students, mentors, and community members participating in MuLearn activities.",
      "Authentication and account credentials rely on your official MuLearn account. You are responsible for maintaining the security of your account and ensuring that any profile information you provide is accurate and truthful.",
    ],
  },
  {
    id: "karma-points",
    number: "3",
    title: "Karma Points & Leaderboards",
    content: [
      "All karma points displayed on Karmayodha are earned through verified learning tasks, peer reviews, event participation, and technical milestones within the MuLearn ecosystem.",
      "Karma points, streaks, badges, and leaderboard rankings are intended strictly for educational motivation, peer recognition, and healthy campus camaraderie. They hold no monetary, cash, or commercial value.",
      "Platform administrators reserve the right to audit, correct, re-calculate, or reset scores if data sync discrepancies, technical errors, or unfair manipulation are identified.",
    ],
  },
  {
    id: "acceptable-use",
    number: "4",
    title: "Acceptable Use & Conduct",
    content: [
      "When using Karmayodha, you agree to uphold the spirit of learning and fair play. You must not:",
    ],
    list: [
      "Engage in academic dishonesty, fake activity submissions, or artificial karma manipulation.",
      "Scrape, harvest, or overload the platform's APIs and data feeds using automated bots or scrapers without prior authorization.",
      "Impersonate another student, campus lead, or organizer.",
      "Attempt to bypass access controls, probe platform vulnerabilities, or disrupt normal service operation.",
      "Post abusive, defamatory, discriminatory, or harassing content in team names, mottos, or public channels.",
    ],
  },
  {
    id: "public-display",
    number: "5",
    title: "Public Display of Data",
    content: [
      "By participating in the campus league, your display name, team membership, campus ranking, karma points, and public activity timestamps will appear on public leaderboards, group breakdown cards, and activity feeds.",
      "If you notice an error in how your name or karma is displayed, please contact the league coordinators or use the contact email below.",
    ],
  },
  {
    id: "intellectual-property",
    number: "6",
    title: "Intellectual Property",
    content: [
      "The Karmayodha name, original samurai/sumi-e visual branding, design system, illustrations, and codebase are protected intellectual property of the Karmayodha creators and contributors.",
      "All third-party trademarks, including the MuLearn name, emblem, and individual student guild crests, belong to their respective creators and owners.",
    ],
  },
  {
    id: "availability",
    number: "7",
    title: "Service Availability & 'As-Is' Disclaimer",
    content: [
      "Karmayodha is provided on an 'as-is' and 'as-available' basis without warranties of any kind, whether express or implied.",
      "While we make every effort to ensure accurate calculations and high uptime, the service is maintained as a campus community project. Features may change, and maintenance downtime or intermittent sync delays with upstream APIs may occur without notice.",
    ],
  },
  {
    id: "liability",
    number: "8",
    title: "Limitation of Liability",
    content: [
      "To the fullest extent permitted by law, the student creators, maintainers, and community volunteers shall not be held liable for any direct, indirect, incidental, or consequential damages arising from your access to or inability to access Karmayodha, or reliance on leaderboard rankings.",
    ],
  },
  {
    id: "termination",
    number: "9",
    title: "Suspension & Termination",
    content: [
      "We reserve the right to suspend or remove access to team leaderboards or platform features for any individual or team found violating these terms, university codes of conduct, or community guidelines.",
    ],
  },
  {
    id: "changes",
    number: "10",
    title: "Changes to These Terms",
    content: [
      "We may update these Terms & Conditions from time to time to reflect new platform capabilities or community policies. Continued use of Karmayodha after revisions are published constitutes acceptance of the updated terms.",
    ],
  },
  {
    id: "contact",
    number: "11",
    title: "Contact & Inquiries",
    content: [
      "For questions regarding these Terms, leaderboard disputes, or general platform inquiries, please reach out to our team at:",
    ],
    contactLink: true,
  },
];

export const PRIVACY_SECTIONS = [
  {
    id: "data-collected",
    number: "1",
    title: "Information We Display & Collect",
    content: [
      "Karmayodha is designed with data minimization in mind. We collect and display only the information necessary to provide accurate campus karma tracking:",
    ],
    list: [
      "Public Profile Info: Your display name, public username/MUID, and affiliated campus team or guild as provided through MuLearn.",
      "Karma & Achievement Data: Points earned, task categories, completion dates, and streak metrics synchronized via official MuLearn tracking records.",
      "Technical Session Data: Basic browser preferences (e.g. active month filters, drawer open states) stored locally in your browser.",
    ],
  },
  {
    id: "how-we-use",
    number: "2",
    title: "How We Use Your Information",
    content: [
      "We use this information exclusively to:",
    ],
    list: [
      "Compute real-time campus leaderboards, team rankings, and individual standing.",
      "Power analytics such as weekly momentum, sleeping giant alerts, and group pace tracking.",
      "Celebrate campus milestones and motivate peer collaborative learning.",
    ],
  },
  {
    id: "public-visibility",
    number: "3",
    title: "Public Visibility & Leaderboards",
    content: [
      "Because Karmayodha is a public campus dashboard, your name, team, current rank, and karma tally are visible to other students, mentors, and visitors browsing the site.",
      "We do not display private phone numbers, physical addresses, passwords, or sensitive academic records.",
    ],
  },
  {
    id: "no-selling",
    number: "4",
    title: "No Selling of Personal Data",
    content: [
      "We do not sell, rent, monetize, or trade your personal data to third parties, advertisers, or commercial entities under any circumstances.",
    ],
  },
  {
    id: "cookies",
    number: "5",
    title: "Cookies & Local Storage",
    content: [
      "Karmayodha does not use intrusive third-party tracking cookies or behavioral advertising trackers.",
      "We use standard browser localStorage only for functional preferences, such as caching your selected month filter, dismissible UI notices, or offline resilience.",
    ],
  },
  {
    id: "retention",
    number: "6",
    title: "Data Retention & Sync",
    content: [
      "Karma records and leaderboards reflect active and historical periods within the campus league academic calendar.",
      "Historical data remains viewable for archival and portfolio recognition for past seasons, unless a student requests removal.",
    ],
  },
  {
    id: "your-rights",
    number: "7",
    title: "Your Rights & Data Requests",
    content: [
      "You have the right to request verification, correction of mistaken scoring, or suppression/anonymization of your name from public leaderboards.",
      "To submit a request, contact the campus league organizers or email our team directly.",
    ],
  },
  {
    id: "policy-updates",
    number: "8",
    title: "Policy Updates",
    content: [
      "This Privacy Policy may be updated periodically to align with platform enhancements. The latest revision date is always noted at the top of this document.",
    ],
  },
  {
    id: "contact-privacy",
    number: "9",
    title: "Contact Us",
    content: [
      "If you have questions about your data, privacy, or leaderboard visibility, please contact:",
    ],
    contactLink: true,
  },
];

