// Demo question bank — will later be replaced by /api/questions.
// Every question belongs to a subjectId + topicId that exists in demoData.jsx.

export const demoQuestions = [
  /* ------------------ MATH ------------------ */
  {
    id: "q-math-percent-1",
    subjectId: "math",
    topicId: "math-percentage",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "If 25% of a number is 80, what is the number?",
    options: ["240", "280", "320", "360"],
    answer: 2,
    explanation: "Let the number be x. 25% of x = 80 → x = 80 / 0.25 = 320.",
  },
  {
    id: "q-math-percent-2",
    subjectId: "math",
    topicId: "math-percentage",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question:
      "The price of a shirt is increased by 20% and then decreased by 20%. What is the net change?",
    options: ["No change", "4% decrease", "4% increase", "2% decrease"],
    answer: 1,
    explanation:
      "Net change = 1.20 × 0.80 = 0.96, i.e. a 4% decrease compared to the original price.",
  },
  {
    id: "q-math-percent-3",
    subjectId: "math",
    topicId: "math-percentage",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question:
      "In an exam, a student got 35% marks and failed by 30 marks. If the pass mark is 40%, what is the total marks?",
    options: ["400", "500", "600", "700"],
    answer: 2,
    explanation:
      "Difference in percentage = 40% − 35% = 5%. 5% of total = 30 → total = 30 × 20 = 600.",
  },
  {
    id: "q-math-arith-1",
    subjectId: "math",
    topicId: "math-arithmetic",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "What is the value of (12 × 8) − (15 + 7)?",
    options: ["70", "74", "78", "82"],
    answer: 1,
    explanation: "(12 × 8) − (15 + 7) = 96 − 22 = 74.",
  },
  {
    id: "q-math-algebra-1",
    subjectId: "math",
    topicId: "math-algebra",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "If 3x + 5 = 20, what is the value of 6x + 7?",
    options: ["32", "35", "37", "40"],
    answer: 2,
    explanation: "3x = 15 → x = 5. So 6x + 7 = 30 + 7 = 37.",
  },
  {
    id: "q-math-geo-1",
    subjectId: "math",
    topicId: "math-geometry",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "The area of a circle with radius 7 cm is approximately:",
    options: ["44 cm²", "144 cm²", "154 cm²", "168 cm²"],
    answer: 2,
    explanation: "Area = πr² = (22/7) × 7 × 7 = 154 cm².",
  },

  /* ------------------ ENGLISH ------------------ */
  {
    id: "q-eng-gram-1",
    subjectId: "english",
    topicId: "english-grammar",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "Choose the correct sentence.",
    options: [
      "He does not know how to swim.",
      "He does not knows how to swim.",
      "He do not know how to swim.",
      "He not know how to swim.",
    ],
    answer: 0,
    explanation:
      'After "does not", the base form of the verb is used: "does not know".',
  },
  {
    id: "q-eng-gram-2",
    subjectId: "english",
    topicId: "english-grammar",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: 'Identify the passive form of "She wrote a letter."',
    options: [
      "A letter was written by her.",
      "A letter is written by her.",
      "A letter had written by her.",
      "A letter has been written by her.",
    ],
    answer: 0,
    explanation:
      'Simple past active → simple past passive: "A letter was written by her."',
  },
  {
    id: "q-eng-vocab-1",
    subjectId: "english",
    topicId: "english-vocabulary",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: 'Choose the synonym of "abundant".',
    options: ["Scarce", "Plentiful", "Rare", "Sparse"],
    answer: 1,
    explanation: "Abundant means existing in large quantities — plentiful.",
  },
  {
    id: "q-eng-vocab-2",
    subjectId: "english",
    topicId: "english-vocabulary",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: 'Choose the antonym of "candid".',
    options: ["Frank", "Honest", "Evasive", "Open"],
    answer: 2,
    explanation:
      "Candid means straightforward and honest; the opposite is evasive.",
  },
  {
    id: "q-eng-comp-1",
    subjectId: "english",
    topicId: "english-comprehension",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question:
      'Read: "The river, once a lifeline for the village, now lay silent and shallow." What does this imply?',
    options: [
      "The river has become deeper.",
      "The river no longer supports the village as before.",
      "The village has moved away.",
      "The river has become polluted.",
    ],
    answer: 1,
    explanation:
      '"Silent and shallow" suggests the river has lost its former vitality and no longer sustains the village.',
  },

  /* ------------------ BANGLADESH AFFAIRS ------------------ */
  {
    id: "q-bd-const-1",
    subjectId: "bd-affairs",
    topicId: "bd-constitution",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "When did the Constitution of Bangladesh come into effect?",
    options: [
      "26 March 1971",
      "16 December 1972",
      "4 November 1972",
      "17 April 1971",
    ],
    answer: 1,
    explanation:
      "The Constitution was adopted on 4 November 1972 and came into effect on 16 December 1972.",
  },
  {
    id: "q-bd-const-2",
    subjectId: "bd-affairs",
    topicId: "bd-constitution",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question:
      "How many fundamental rights are guaranteed in the Constitution of Bangladesh?",
    options: ["5", "6", "7", "18"],
    answer: 1,
    explanation:
      "Part III of the Constitution guarantees six fundamental rights (Articles 26–47A).",
  },
  {
    id: "q-bd-const-3",
    subjectId: "bd-affairs",
    topicId: "bd-constitution",
    difficulty: "hard",
    type: "mcq",
    sourceType: "demo",
    question:
      "Which article of the Constitution deals with the Directive Principles of State Policy?",
    options: ["Article 7", "Article 8", "Article 26", "Article 102"],
    answer: 1,
    explanation:
      "Article 8 of the Constitution lays down the Directive Principles of State Policy.",
  },
  {
    id: "q-bd-hist-1",
    subjectId: "bd-affairs",
    topicId: "bd-history",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "In which year did the Language Movement reach its peak?",
    options: ["1948", "1952", "1956", "1971"],
    answer: 1,
    explanation: "The Language Movement reached its peak on 21 February 1952.",
  },
  {
    id: "q-bd-hist-2",
    subjectId: "bd-affairs",
    topicId: "bd-history",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "Who was the first President of Bangladesh?",
    options: [
      "Sheikh Mujibur Rahman",
      "Syed Nazrul Islam",
      "Tajuddin Ahmad",
      "A. K. Fazlul Huq",
    ],
    answer: 0,
    explanation:
      "Sheikh Mujibur Rahman became the first President of Bangladesh in April 1971.",
  },
  {
    id: "q-bd-geo-1",
    subjectId: "bd-affairs",
    topicId: "bd-geography",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "What is the largest district of Bangladesh by area?",
    options: ["Rangamati", "Chattogram", "Khulna", "Sylhet"],
    answer: 0,
    explanation: "Rangamati is the largest district of Bangladesh by area.",
  },
  {
    id: "q-bd-econ-1",
    subjectId: "bd-affairs",
    topicId: "bd-economy",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "Which sector contributes the largest share to Bangladesh’s GDP?",
    options: ["Agriculture", "Industry", "Services", "Mining"],
    answer: 2,
    explanation:
      "The services sector contributes the largest share to Bangladesh’s GDP in recent years.",
  },
  {
    id: "q-bd-current-1",
    subjectId: "bd-affairs",
    topicId: "bd-current",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "Which organization publishes the Human Development Index (HDI)?",
    options: ["World Bank", "IMF", "UNDP", "WTO"],
    answer: 2,
    explanation:
      "The United Nations Development Programme (UNDP) publishes the HDI annually.",
  },

  /* ------------------ INTERNATIONAL AFFAIRS ------------------ */
  {
    id: "q-intl-orgs-1",
    subjectId: "intl-affairs",
    topicId: "intl-orgs",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "When was the United Nations founded?",
    options: ["1919", "1945", "1948", "1950"],
    answer: 1,
    explanation:
      "The United Nations was founded on 24 October 1945 after World War II.",
  },
  {
    id: "q-intl-orgs-2",
    subjectId: "intl-affairs",
    topicId: "intl-orgs",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question:
      "Where is the headquarters of the World Trade Organization (WTO)?",
    options: ["New York", "Geneva", "Paris", "Vienna"],
    answer: 1,
    explanation: "The WTO headquarters is in Geneva, Switzerland.",
  },
  {
    id: "q-intl-hist-1",
    subjectId: "intl-affairs",
    topicId: "intl-world-hist",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "The Treaty of Versailles was signed after which war?",
    options: ["World War I", "World War II", "Crimean War", "Napoleonic Wars"],
    answer: 0,
    explanation: "The Treaty of Versailles (1919) formally ended World War I.",
  },
  {
    id: "q-intl-treaties-1",
    subjectId: "intl-affairs",
    topicId: "intl-treaties",
    difficulty: "hard",
    type: "mcq",
    sourceType: "demo",
    question: "The Paris Agreement (2015) primarily deals with:",
    options: [
      "Trade regulations",
      "Climate change",
      "Nuclear disarmament",
      "Maritime boundaries",
    ],
    answer: 1,
    explanation:
      "The Paris Agreement is an international treaty on climate change adopted in 2015.",
  },

  /* ------------------ GENERAL SCIENCE ------------------ */
  {
    id: "q-sci-phys-1",
    subjectId: "science",
    topicId: "sci-physics",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "What is the SI unit of force?",
    options: ["Joule", "Newton", "Watt", "Pascal"],
    answer: 1,
    explanation: "The SI unit of force is the Newton (N).",
  },
  {
    id: "q-sci-phys-2",
    subjectId: "science",
    topicId: "sci-physics",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "The speed of light in vacuum is approximately:",
    options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10¹² m/s"],
    answer: 1,
    explanation: "The speed of light in vacuum is approximately 3 × 10⁸ m/s.",
  },
  {
    id: "q-sci-chem-1",
    subjectId: "science",
    topicId: "sci-chemistry",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "What is the chemical symbol of water?",
    options: ["WO", "H₂O", "HO₂", "H₂O₂"],
    answer: 1,
    explanation:
      "Water is composed of two hydrogen atoms and one oxygen atom, written as H₂O.",
  },
  {
    id: "q-sci-bio-1",
    subjectId: "science",
    topicId: "sci-biology",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "Which organ pumps blood throughout the human body?",
    options: ["Lungs", "Liver", "Heart", "Kidney"],
    answer: 2,
    explanation:
      "The heart is the muscular organ that pumps blood through the circulatory system.",
  },

  /* ------------------ ICT ------------------ */
  {
    id: "q-ict-fund-1",
    subjectId: "ict",
    topicId: "ict-fundamentals",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: 'What does "CPU" stand for?',
    options: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Program Utility",
      "Control Processing Unit",
    ],
    answer: 0,
    explanation:
      "CPU stands for Central Processing Unit — the primary component that executes instructions.",
  },
  {
    id: "q-ict-fund-2",
    subjectId: "ict",
    topicId: "ict-fundamentals",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "1 GB is equal to:",
    options: ["1000 MB", "1024 MB", "512 MB", "2048 MB"],
    answer: 1,
    explanation: "In binary, 1 GB = 1024 MB.",
  },
  {
    id: "q-ict-net-1",
    subjectId: "ict",
    topicId: "ict-networking",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "Which protocol is used to browse websites securely?",
    options: ["FTP", "HTTP", "HTTPS", "SMTP"],
    answer: 2,
    explanation:
      "HTTPS (HyperText Transfer Protocol Secure) encrypts web traffic.",
  },

  /* ------------------ GEOGRAPHY ------------------ */
  {
    id: "q-geo-bd-1",
    subjectId: "geography",
    topicId: "geo-bd",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "What is the total area of Bangladesh?",
    options: [
      "1,47,570 sq km",
      "1,44,000 sq km",
      "1,55,000 sq km",
      "1,60,000 sq km",
    ],
    answer: 0,
    explanation:
      "The total area of Bangladesh is approximately 1,47,570 square kilometers.",
  },
  {
    id: "q-geo-world-1",
    subjectId: "geography",
    topicId: "geo-world",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "Which is the longest river in the world?",
    options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    answer: 1,
    explanation:
      "The Nile is traditionally regarded as the longest river in the world.",
  },
  {
    id: "q-geo-dis-1",
    subjectId: "geography",
    topicId: "geo-disaster",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question:
      "Which cyclone is considered one of the deadliest in Bangladesh’s history?",
    options: [
      "Cyclone Sidr",
      "Cyclone Aila",
      "Cyclone Bhola",
      "Cyclone Amphan",
    ],
    answer: 2,
    explanation:
      "The 1970 Bhola Cyclone is considered the deadliest cyclone in Bangladesh’s history.",
  },

  /* ------------------ MENTAL ABILITY ------------------ */
  {
    id: "q-mental-logic-1",
    subjectId: "mental-ability",
    topicId: "mental-logic",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question:
      "If all roses are flowers and some flowers fade quickly, which conclusion is valid?",
    options: [
      "All roses fade quickly.",
      "Some roses fade quickly.",
      "Some flowers are roses.",
      "No roses fade quickly.",
    ],
    answer: 2,
    explanation:
      "Since all roses are flowers, it follows that some flowers are roses.",
  },
  {
    id: "q-mental-seq-1",
    subjectId: "mental-ability",
    topicId: "mental-sequence",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "Find the next number: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    answer: 1,
    explanation: "Differences are 4, 6, 8, 10, and next is 12 → 30 + 12 = 42.",
  },
  {
    id: "q-mental-analogy-1",
    subjectId: "mental-ability",
    topicId: "mental-analogy",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "Doctor : Hospital :: Teacher : ?",
    options: ["Student", "School", "Book", "Class"],
    answer: 1,
    explanation:
      "A doctor works in a hospital, so a teacher works in a school.",
  },

  /* ------------------ ETHICS ------------------ */
  {
    id: "q-ethics-values-1",
    subjectId: "ethics",
    topicId: "ethics-values",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: 'Which of the following best defines "integrity"?',
    options: [
      "Doing the right thing even when no one is watching",
      "Always following orders",
      "Being popular",
      "Winning at any cost",
    ],
    answer: 0,
    explanation:
      "Integrity means consistently adhering to moral and ethical principles, especially in private.",
  },
  {
    id: "q-ethics-gov-1",
    subjectId: "ethics",
    topicId: "ethics-governance",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "Good governance is primarily characterized by:",
    options: [
      "Centralization of power",
      "Transparency and accountability",
      "Strict secrecy",
      "Frequent policy changes",
    ],
    answer: 1,
    explanation:
      "Good governance emphasizes transparency, accountability, rule of law, and participation.",
  },

  /* ------------------ BANGLA ------------------ */
  {
    id: "q-bangla-gram-1",
    subjectId: "bangla",
    topicId: "bangla-grammar",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: '"সন্ধি" শব্দের অর্থ কী?',
    options: ["বিচ্ছেদ", "মিলন", "বিভক্তি", "সমাস"],
    answer: 1,
    explanation:
      '"সন্ধি" শব্দের অর্থ মিলন। পাশাপাশি দুটি ধ্বনির মিলনকে সন্ধি বলে।',
  },
  {
    id: "q-bangla-lit-1",
    subjectId: "bangla",
    topicId: "bangla-literature",
    difficulty: "medium",
    type: "mcq",
    sourceType: "demo",
    question: "“পদ্মা নদীর মাঝি” উপন্যাসের রচয়িতা কে?",
    options: [
      "রবীন্দ্রনাথ ঠাকুর",
      "মানিক বন্দ্যোপাধ্যায়",
      "বিভূতিভূষণ বন্দ্যোপাধ্যায়",
      "জীবনানন্দ দাশ",
    ],
    answer: 1,
    explanation:
      "“পদ্মা নদীর মাঝি” মানিক বন্দ্যোপাধ্যায়ের লেখা একটি বিখ্যাত উপন্যাস।",
  },
  {
    id: "q-bangla-usage-1",
    subjectId: "bangla",
    topicId: "bangla-usage",
    difficulty: "easy",
    type: "mcq",
    sourceType: "demo",
    question: "কোন বানানটি শুদ্ধ?",
    options: ["দূর্যোগ", "দুর্যোগ", "দুরযোগ", "দূরযোগ"],
    answer: 1,
    explanation: "শুদ্ধ বানান “দুর্যোগ”।",
  },
];

/* ---------------- Helper functions ---------------- */

export function getQuestionsByTopic(subjectId, topicId) {
  return demoQuestions.filter(
    (q) => q.subjectId === subjectId && q.topicId === topicId,
  );
}

export function getQuestionsBySubject(subjectId) {
  return demoQuestions.filter((q) => q.subjectId === subjectId);
}

export function getQuestionById(id) {
  return demoQuestions.find((q) => q.id === id) || null;
}

/**
 * Build a practice session from filters.
 * filters: { subjectId?, topicId?, difficulty?, limit? }
 */
export function buildSession({
  subjectId,
  topicId,
  difficulty,
  limit = 10,
} = {}) {
  let pool = demoQuestions.slice();

  if (subjectId) pool = pool.filter((q) => q.subjectId === subjectId);
  if (topicId) pool = pool.filter((q) => q.topicId === topicId);
  if (difficulty && difficulty !== "any") {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  // Shuffle for a fresh order each time.
  pool = pool.sort(() => Math.random() - 0.5);

  return pool.slice(0, limit);
}
